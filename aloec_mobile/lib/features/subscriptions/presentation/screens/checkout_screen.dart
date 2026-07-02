import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/aloec_button.dart';
import '../../data/gateway_repository.dart';
import '../../data/payphone_service.dart';
import '../../data/orders_repository.dart';
import '../../data/memberships_repository.dart';

class CheckoutScreen extends StatefulWidget {
  final MembershipEntity? membership;

  const CheckoutScreen({super.key, this.membership});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();

  bool _isLoading = false;
  bool _isWaitingApproval = false;
  String? _errorMessage;
  String _statusMessage = '';
  int? _currentTransactionId;
  Timer? _pollingTimer;
  int _pollingCount = 0;
  static const int _maxPollingAttempts = 60; // 5 min (cada 5s)

  final _gatewayRepo = GatewayRepository();
  final _ordersRepo = OrdersRepository();

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _processPayment() async {
    if (!_formKey.currentState!.validate()) return;

    final membership = widget.membership;
    if (membership == null) {
      setState(() => _errorMessage = 'No se seleccionó un plan.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // 1. Obtener config de Payphone desde Firestore
    final config = await _gatewayRepo.getPayphoneConfig();
    if (config == null) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Payphone no está configurado o está desactivado. Contacta al soporte.';
      });
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Debes iniciar sesión para continuar.';
      });
      return;
    }

    final payphoneService = PayphoneService(
      token: config.token,
      storeId: config.storeId,
      isSandbox: config.environment == 'sandbox',
    );

    final clientTxId = 'ALOEC-${user.uid.substring(0, 8)}-${DateTime.now().millisecondsSinceEpoch}';

    // 2. Crear orden pendiente en Firestore
    final orderId = 'order_${DateTime.now().millisecondsSinceEpoch}';
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
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Error al crear la orden: $e';
      });
      return;
    }

    // 3. Crear transacción en Payphone
    String phoneNumber = _phoneCtrl.text.trim().replaceAll(RegExp(r'[^0-9]'), '');
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }

    final result = await payphoneService.createSale(
      phoneNumber: phoneNumber,
      amountCents: membership.priceCents,
      clientTransactionId: clientTxId,
      reference: 'Membresía ${membership.name} - ALOEC',
    );

    if (!result.success || result.transactionId == null) {
      await _ordersRepo.updateOrderStatus(orderId: orderId, status: 'failed');
      setState(() {
        _isLoading = false;
        _errorMessage = result.errorMessage ?? 'Error al crear la transacción en Payphone.';
      });
      return;
    }

    // 4. Iniciar polling de estado
    _currentTransactionId = result.transactionId;
    setState(() {
      _isLoading = false;
      _isWaitingApproval = true;
      _statusMessage = 'Solicitud enviada. Aprueba el pago en tu app Payphone.';
      _pollingCount = 0;
    });

    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
      _pollingCount++;

      if (_pollingCount >= _maxPollingAttempts) {
        timer.cancel();
        await _ordersRepo.updateOrderStatus(orderId: orderId, status: 'failed');
        if (!mounted) return;
        setState(() {
          _isWaitingApproval = false;
          _errorMessage = 'El tiempo de espera ha expirado. Intenta nuevamente.';
        });
        return;
      }

      final status = await payphoneService.checkTransactionStatus(_currentTransactionId!);
      if (status == null) return;

      if (status.isApproved) {
        timer.cancel();
        // Actualizar orden como pagada
        await _ordersRepo.updateOrderStatus(
          orderId: orderId,
          status: 'paid',
          transactionId: _currentTransactionId.toString(),
        );
        // Activar membresía del usuario
        await _ordersRepo.activateUserMembership(
          userId: user.uid,
          membershipId: membership.id,
        );
        if (!mounted) return;
        setState(() => _isWaitingApproval = false);
        _showSuccessDialog();
      } else if (status.isCanceled) {
        timer.cancel();
        await _ordersRepo.updateOrderStatus(orderId: orderId, status: 'failed');
        if (!mounted) return;
        setState(() {
          _isWaitingApproval = false;
          _errorMessage = 'El pago fue rechazado o cancelado. Intenta nuevamente.';
        });
      }
    });
  }

  Future<void> _openWhatsApp(MembershipEntity membership) async {
    const phone = '593999504321';
    final message =
        'Hola ALOEC, quiero comprar el plan ${membership.name} (\$${membership.price.toStringAsFixed(2)}) en efectivo. Me pueden ayudar?';
    final encoded = Uri.encodeComponent(message);
    final uris = [
      Uri.parse('whatsapp://send?phone=$phone&text=$encoded'),
      Uri.parse('https://wa.me/$phone?text=$encoded'),
    ];
    for (final uri in uris) {
      try {
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          return;
        }
      } catch (_) {}
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
            const Text(
              '¡Pago Exitoso!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Tu membresía ${widget.membership?.name ?? "Premium"} ha sido activada. ¡Disfruta todos los beneficios!',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.go('/home');
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Pagar con Tarjeta',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    final membership = widget.membership;

    if (membership == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.shopping_cart_outlined,
                  color: AppColors.textLight, size: 56),
              const SizedBox(height: 16),
              const Text('No se selecciono un plan',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark)),
              const SizedBox(height: 8),
              const Text(
                  'Regresa y elige un plan premium para continuar.',
                  textAlign: TextAlign.center,
                  style:
                      TextStyle(fontSize: 13, color: AppColors.textLight)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => context.pop(),
                icon: const Icon(Icons.arrow_back),
                label: const Text('Elegir un plan'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24, vertical: 14),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_isWaitingApproval) return _buildWaitingView();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Payphone
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                    colors: [Color(0xFF1B5E20), Color(0xFF67B539)]),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.4),
                      blurRadius: 15,
                      offset: const Offset(0, 10))
                ],
              ),
              child: const Column(
                children: [
                  Icon(Icons.credit_card, color: Colors.white, size: 48),
                  SizedBox(height: 12),
                  Text('Pago con Tarjeta',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1)),
                  SizedBox(height: 8),
                  Text(
                    'Paga de forma segura via Payphone',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Resumen del plan
            const Text('Resumen de tu plan',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.primaryGreen.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Plan:',
                          style: TextStyle(color: Colors.grey, fontSize: 14)),
                      Text(membership.name,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Duracion:',
                          style: TextStyle(color: Colors.grey, fontSize: 14)),
                      Text('${membership.durationDays} dias',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total a pagar:',
                          style: TextStyle(color: Colors.grey, fontSize: 14)),
                      Text(
                        '\$${membership.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                            color: AppColors.primaryGreen),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Campo de telefono
            const Text('Tu numero de telefono Payphone',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            const Text(
              'Ingresa el numero registrado en tu cuenta Payphone. Recibiras una notificacion para aprobar el pago.',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(10),
              ],
              decoration: InputDecoration(
                labelText: 'Numero celular',
                hintText: '0999999999',
                prefixIcon: const Icon(Icons.phone_outlined,
                    color: Colors.grey, size: 20),
                prefixText: '+593 ',
                prefixStyle: const TextStyle(
                    color: Colors.black87, fontWeight: FontWeight.bold),
                filled: true,
                fillColor: Colors.grey[50],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                      color: AppColors.primaryGreen, width: 1.5),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.error),
                ),
              ),
              validator: (v) {
                if (v == null ||
                    v.replaceAll(RegExp(r'[^0-9]'), '').length < 9) {
                  return 'Ingresa un numero de telefono valido';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Error message
            if (_errorMessage != null)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline,
                        color: Colors.red.shade700, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_errorMessage!,
                          style: TextStyle(
                              color: Colors.red.shade700, fontSize: 13)),
                    ),
                  ],
                ),
              ),

            // Boton pagar
            AloecButton(
              text: 'Pagar \$${membership.price.toStringAsFixed(2)} con Payphone',
              isLoading: _isLoading,
              onPressed: _processPayment,
            ),
            const SizedBox(height: 12),

            // Boton comprar en efectivo
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: () => _openWhatsApp(membership),
                icon: const Icon(Icons.chat, color: Color(0xFF25D366)),
                label: const Text('Comprar en Efectivo',
                    style: TextStyle(
                        color: Color(0xFF25D366),
                        fontWeight: FontWeight.bold,
                        fontSize: 15)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF25D366), width: 2),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Center(
              child: Text(
                'Un asesor te atendera por WhatsApp',
                style: TextStyle(fontSize: 11, color: AppColors.textLight),
              ),
            ),
            const SizedBox(height: 16),

            // Como funciona
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Como funciona?',
                      style: TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  _stepRow('1', 'Ingresa tu numero de Payphone'),
                  _stepRow('2',
                      'Recibiras una notificacion en tu app Payphone'),
                  _stepRow('3',
                      'Aprueba el pago con tu huella o contrasena'),
                  _stepRow('4',
                      'Listo! Tu membresia se activa al instante'),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Center(
              child: Text(
                'Transaccion segura procesada por Payphone',
                style: TextStyle(color: Colors.grey, fontSize: 11),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _stepRow(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.circular(11),
            ),
            child: Center(
              child: Text(number,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text,
                style: const TextStyle(fontSize: 12, color: Colors.black87)),
          ),
        ],
      ),
    );
  }

  Widget _buildWaitingView() {
    final remaining = ((_maxPollingAttempts - _pollingCount) * 5);
    final minutes = remaining ~/ 60;
    final seconds = remaining % 60;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Animación de espera
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: SizedBox(
                  width: 60,
                  height: 60,
                  child: CircularProgressIndicator(
                    color: AppColors.primaryGreen,
                    strokeWidth: 4,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Esperando aprobación',
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark),
            ),
            const SizedBox(height: 12),
            Text(
              _statusMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'Tiempo restante: ${minutes}m ${seconds.toString().padLeft(2, '0')}s',
                style: TextStyle(
                    color: Colors.orange.shade800,
                    fontWeight: FontWeight.bold,
                    fontSize: 13),
              ),
            ),
            const SizedBox(height: 32),
            const Icon(Icons.phone_android, size: 40, color: Colors.grey),
            const SizedBox(height: 8),
            const Text(
              'Abre tu app Payphone y aprueba\nel cobro pendiente',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: () {
                _pollingTimer?.cancel();
                setState(() {
                  _isWaitingApproval = false;
                  _errorMessage = 'Pago cancelado por el usuario.';
                });
              },
              child: const Text('Cancelar',
                  style: TextStyle(color: Colors.red, fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }
}
