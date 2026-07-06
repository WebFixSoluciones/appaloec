import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
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
  final _cardNumberCtrl = TextEditingController();
  final _expiryCtrl = TextEditingController();
  final _cvcCtrl = TextEditingController();
  final _holderCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  bool _processingPayment = false;
  String? _error;
  String? _statusMessage;

  @override
  void dispose() {
    _cardNumberCtrl.dispose();
    _expiryCtrl.dispose();
    _cvcCtrl.dispose();
    _holderCtrl.dispose();
    super.dispose();
  }

  Future<void> _pay() async {
    if (!_formKey.currentState!.validate()) return;

    final membership = widget.membership;
    if (membership == null) return;

    setState(() {
      _processingPayment = true;
      _error = null;
      _statusMessage = 'Obteniendo configuracion de pago...';
    });

    final config = await _gatewayRepo.getPayphoneConfig();
    if (config == null) {
      setState(() {
        _error = 'Payphone no esta configurado';
        _processingPayment = false;
        _statusMessage = null;
      });
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _error = 'Debes iniciar sesion';
        _processingPayment = false;
        _statusMessage = null;
      });
      return;
    }

    final clientTxId =
        'ALOEC-${user.uid.substring(0, 8)}-${DateTime.now().millisecondsSinceEpoch}';
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
        _error = 'Error al crear orden: $e';
        _processingPayment = false;
        _statusMessage = null;
      });
      return;
    }

    final isSandbox = config.environment == 'sandbox';
    final service = PayphoneService(
      token: config.token,
      storeId: config.storeId,
      isSandbox: isSandbox,
    );

    final parts = _expiryCtrl.text.trim().split('/');
    final expMonth = int.parse(parts[0].trim());
    final expYear = 2000 + int.parse(parts[1].trim());

    setState(() => _statusMessage = 'Procesando pago...');

    final result = await service.createCardSale(
      cardNumber: _cardNumberCtrl.text.trim(),
      expMonth: expMonth,
      expYear: expYear,
      cvc: _cvcCtrl.text.trim(),
      holderName: _holderCtrl.text.trim(),
      amountCents: membership.priceCents,
      clientTransactionId: clientTxId,
      reference: 'Membresia ${membership.name} - ALOEC',
    );

    if (!mounted) return;

    if (!result.success) {
      setState(() {
        _error = result.errorMessage ?? 'Error al procesar el pago';
        _processingPayment = false;
        _statusMessage = null;
      });
      return;
    }

    final txId = result.transactionId;
    if (txId == null) {
      setState(() {
        _error = 'No se recibio ID de transaccion';
        _processingPayment = false;
        _statusMessage = null;
      });
      return;
    }

    setState(() => _statusMessage = 'Verificando pago...');

    PayphoneStatusResult? statusResult;
    for (int i = 0; i < 10; i++) {
      await Future.delayed(const Duration(seconds: 2));
      if (!mounted) return;
      statusResult = await service.checkTransactionStatus(txId);
      if (statusResult != null) break;
    }

    if (!mounted) return;

    if (statusResult == null) {
      setState(() {
        _error = 'No se pudo verificar el estado del pago. Verifica tu plan en Mi Suscripcion.';
        _processingPayment = false;
        _statusMessage = null;
      });
      return;
    }

    if (statusResult.isApproved) {
      await _ordersRepo.updateOrderStatus(
        orderId: orderId,
        status: 'paid',
        transactionId: txId.toString(),
      );
      await _ordersRepo.activateUserMembership(
        userId: user.uid,
        membershipId: membership.id,
      );
      if (mounted) {
        setState(() {
          _processingPayment = false;
          _statusMessage = null;
        });
        _showSuccessDialog();
      }
    } else if (statusResult.isCanceled) {
      setState(() {
        _error = 'El pago fue cancelado o rechazado. Intenta de nuevo.';
        _processingPayment = false;
        _statusMessage = null;
      });
    } else {
      setState(() {
        _error = 'El pago esta pendiente. Verifica tu plan en Mi Suscripcion.';
        _processingPayment = false;
        _statusMessage = null;
      });
    }
  }

  void _showSuccessDialog() {
    Navigator.of(context).popUntil((route) => route.isFirst);
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
            const Text('Pago Exitoso!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Tu membresia ${widget.membership?.name ?? "Premium"} ha sido activada.',
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
    final membership = widget.membership;
    final price = membership?.price ?? 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
            'Pagar \$${price.toStringAsFixed(2)}',
            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: _processingPayment ? _buildProcessingView() : _buildForm(),
    );
  }

  Widget _buildProcessingView() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: AppColors.primaryGreen),
          const SizedBox(height: 24),
          Text(_statusMessage ?? 'Procesando...',
              style: const TextStyle(color: Colors.grey, fontSize: 15)),
        ],
      ),
    );
  }

  Widget _buildForm() {
    final membership = widget.membership;
    final price = membership?.price ?? 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  const Text('Plan seleccionado',
                      style: TextStyle(fontSize: 12, color: AppColors.textLight)),
                  const SizedBox(height: 4),
                  Text(membership?.name ?? 'Premium',
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark)),
                  const SizedBox(height: 2),
                  Text('\$${price.toStringAsFixed(2)} USD',
                      style: const TextStyle(
                          fontSize: 16, color: AppColors.primaryGreen, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            const SizedBox(height: 28),
            const Text('Datos de la tarjeta',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark)),
            const SizedBox(height: 16),
            TextFormField(
              controller: _cardNumberCtrl,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(16),
                _CardNumberFormatter(),
              ],
              decoration: const InputDecoration(
                labelText: 'Numero de tarjeta',
                hintText: '0000 0000 0000 0000',
                prefixIcon: Icon(Icons.credit_card),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
              validator: (v) {
                if (v == null || v.replaceAll(' ', '').length < 13) return 'Numero de tarjeta invalido';
                return null;
              },
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _expiryCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(4),
                      _ExpiryFormatter(),
                    ],
                    decoration: const InputDecoration(
                      labelText: 'Vencimiento',
                      hintText: 'MM/AA',
                      prefixIcon: Icon(Icons.calendar_today),
                      border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                    ),
                    validator: (v) {
                      if (v == null || v.length < 5) return 'Invalido';
                      final parts = v.split('/');
                      final m = int.tryParse(parts[0]);
                      if (m == null || m < 1 || m > 12) return 'Mes invalido';
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: TextFormField(
                    controller: _cvcCtrl,
                    keyboardType: TextInputType.number,
                    obscureText: true,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(4),
                    ],
                    decoration: const InputDecoration(
                      labelText: 'CVC',
                      hintText: '123',
                      prefixIcon: Icon(Icons.lock_outline),
                      border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
                    ),
                    validator: (v) {
                      if (v == null || v.length < 3) return 'CVC invalido';
                      return null;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _holderCtrl,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Nombre del titular',
                hintText: 'Como aparece en la tarjeta',
                prefixIcon: Icon(Icons.person_outline),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12))),
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Ingresa el nombre del titular';
                return null;
              },
            ),
            if (_error != null) ...[
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_error!,
                          style: const TextStyle(color: Colors.red, fontSize: 13)),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _loading ? null : _pay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: AppColors.primaryGreen.withValues(alpha: 0.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _loading
                    ? const SizedBox(
                        width: 22, height: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Text('Pagar ahora',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock, size: 14, color: AppColors.textLight),
                  const SizedBox(width: 6),
                  const Text('Pago seguro procesado por PayPhone',
                      style: TextStyle(fontSize: 11, color: AppColors.textLight)),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll(' ', '');
    final buffer = StringBuffer();
    for (int i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(digits[i]);
    }
    return TextEditingValue(
      text: buffer.toString(),
      selection: TextSelection.collapsed(offset: buffer.length),
    );
  }
}

class _ExpiryFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll('/', '');
    if (digits.length <= 2) {
      return TextEditingValue(
        text: digits,
        selection: TextSelection.collapsed(offset: digits.length),
      );
    }
    final month = digits.substring(0, 2);
    final year = digits.substring(2);
    final text = '$month/$year';
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
