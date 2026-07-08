import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/gateway_repository.dart';
import '../../data/orders_repository.dart';
import '../../data/memberships_repository.dart';
import '../../data/payphone_service.dart';

class CheckoutScreen extends StatefulWidget {
  final MembershipEntity? membership;

  const CheckoutScreen({super.key, this.membership});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _gatewayRepo = GatewayRepository();
  final _ordersRepo = OrdersRepository();
  
  bool _loading = true;
  String? _error;
  String? _payUrl;
  int? _paymentId;
  String? _orderId;
  late final WebViewController _webViewController;
  bool _checkingPayment = false;

  @override
  void initState() {
    super.initState();
    _initializePayment();
  }

  Future<void> _initializePayment() async {
    final membership = widget.membership;
    if (membership == null) {
      setState(() {
        _error = 'No se ha seleccionado ninguna membresia';
        _loading = false;
      });
      return;
    }

    final config = await _gatewayRepo.getPayphoneConfig();
    if (config == null) {
      setState(() {
        _error = 'Payphone no esta configurado. Contacta al administrador.';
        _loading = false;
      });
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _error = 'Debes iniciar sesion para continuar';
        _loading = false;
      });
      return;
    }

    String? phoneNumber;
    try {
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();
      final data = userDoc.data();
      if (data != null) {
        phoneNumber = data['phoneNumber'] as String?;
      }
    } catch (_) {}

    final clientTxId = 'ALOEC-${user.uid.substring(0, 8)}-${DateTime.now().millisecondsSinceEpoch}';
    final orderId = 'order_${DateTime.now().millisecondsSinceEpoch}';
    _orderId = orderId;

    try {
      await _ordersRepo.createPendingOrder(
        orderId: orderId,
        userId: user.uid,
        userEmail: user.email ?? '',
        membershipId: membership.id,
        membershipName: membership.name,
        amount: membership.price,
        clientTransactionId: clientTxId,
      );

      final isSandbox = config.environment == 'sandbox';
      final service = PayphoneService(
        token: config.token,
        storeId: config.storeId,
        isSandbox: isSandbox,
      );

      final result = await service.createPaymentLink(
        amountCents: membership.priceCents,
        clientTransactionId: clientTxId,
        email: user.email ?? 'cliente@aloec.com',
        reference: 'Suscripcion ${membership.name} - ALOEC',
        phoneNumber: phoneNumber,
      );

      debugPrint('PayPhone result => success=${result.success}, url=${result.paymentUrl}, error=${result.errorMessage}');
      debugPrint('priceCents enviado => ${membership.priceCents}');

      if (!result.success || result.paymentUrl == null) {
        setState(() {
          _error = result.errorMessage ?? 'No se pudo generar la pasarela de pagos';
          _loading = false;
        });
        return;
      }

      _paymentId = result.transactionId;
      _payUrl = result.paymentUrl;

      _webViewController = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (url) {
              debugPrint('Checkout WebView onPageStarted: $url');
              try {
                final uri = Uri.parse(url);
                final idParam = uri.queryParameters['id'] ?? uri.queryParameters['transactionId'];
                if (idParam != null) {
                  final parsedId = int.tryParse(idParam);
                  if (parsedId != null && parsedId != 0) {
                    _paymentId = parsedId;
                    debugPrint('Parsed paymentId from redirect URL: $_paymentId');
                  }
                }
              } catch (e) {
                debugPrint('Error parsing URL query parameters: $e');
              }

              if (url.contains('payphone.redirect') ||
                  url.contains('payphone.cancel') ||
                  url.contains('confirm') ||
                  url.contains('Approved')) {
                _verifyAndFinishPayment();
              }
            },
            onWebResourceError: (error) {
              debugPrint('Error de carga web: ${error.description}');
            },
            onNavigationRequest: (request) {
              debugPrint('Navegando a: ${request.url}');
              return NavigationDecision.navigate;
            },
          ),
        )
        ..loadRequest(Uri.parse(_payUrl!));

      setState(() {
        _loading = false;
      });

    } catch (e, stack) {
      debugPrint('CheckoutScreen error: $e\n$stack');
      setState(() {
        _error = 'Ocurrio un error al procesar el pago. Intenta nuevamente.';
        _loading = false;
      });
    }
  }

  Future<void> _verifyAndFinishPayment() async {
    if (_checkingPayment || _paymentId == null || _paymentId == 0 || _orderId == null) return;

    setState(() {
      _checkingPayment = true;
      _loading = true;
    });

    final config = await _gatewayRepo.getPayphoneConfig();
    if (config == null) return;

    final service = PayphoneService(
      token: config.token,
      storeId: config.storeId,
      isSandbox: config.environment == 'sandbox',
    );

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    PayphoneStatusResult? statusResult;
    // Hacemos 5 reintentos rápidos de consulta en la API de Payphone
    for (int i = 0; i < 5; i++) {
      statusResult = await service.checkTransactionStatus(_paymentId!);
      if (statusResult != null && (statusResult.isApproved || statusResult.isCanceled)) {
        break;
      }
      await Future.delayed(const Duration(seconds: 2));
    }

    if (!mounted) return;

    if (statusResult != null && statusResult.isApproved) {
      // Registrar el éxito en Firestore y activar membresía
      await _ordersRepo.updateOrderStatus(
        orderId: _orderId!,
        status: 'paid',
        transactionId: _paymentId.toString(),
      );
      await _ordersRepo.activateUserMembership(
        userId: user.uid,
        membershipId: widget.membership!.id,
      );

      _showSuccessDialog();
    } else {
      setState(() {
        _error = 'El pago no pudo ser confirmado o fue cancelado. Intenta de nuevo.';
        _loading = false;
        _checkingPayment = false;
      });
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_outline_rounded,
                color: AppColors.primaryGreen, size: 64),
            const SizedBox(height: 16),
            const Text('Pago Confirmado!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Tu membresia ${widget.membership?.name ?? "Premium"} ha sido activada con exito.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Cerrar dialog
              context.go('/home'); // Ir al inicio
            },
            child: const Text('Ir al inicio',
                style: TextStyle(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.bold,
                    fontSize: 16)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final membership = widget.membership;
    final price = membership?.price ?? 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          'Pagar \$${price.toStringAsFixed(2)}',
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
        actions: [
          if (_payUrl != null && !_loading)
            IconButton(
              icon: const Icon(Icons.refresh, color: AppColors.primaryGreen),
              onPressed: _verifyAndFinishPayment,
              tooltip: 'Verificar Pago',
            )
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: AppColors.primaryGreen),
            const SizedBox(height: 20),
            Text(
              _checkingPayment ? 'Confirmando la transaccion...' : 'Generando pasarela de pagos...',
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
      );
    }

    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 56),
              const SizedBox(height: 16),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 15, color: Colors.black87),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                ),
                onPressed: () {
                  setState(() {
                    _loading = true;
                    _error = null;
                  });
                  _initializePayment();
                },
                child: const Text('Reintentar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      );
    }

    // Si tenemos la URL de pago, renderizar la cajita oficial de Payphone
    if (_payUrl != null) {
      return WebViewWidget(controller: _webViewController);
    }

    return const Center(child: Text('Preparando pasarela...'));
  }
}
