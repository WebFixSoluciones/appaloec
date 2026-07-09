import 'dart:async';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/gateway_repository.dart';
import '../../data/memberships_repository.dart';

class CheckoutScreen extends StatefulWidget {
  final MembershipEntity? membership;

  const CheckoutScreen({super.key, this.membership});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _gatewayRepo = GatewayRepository();

  bool _loading = true;
  String? _error;
  String? _checkoutUrl;
  late final WebViewController _webViewController;
  StreamSubscription<DocumentSnapshot>? _userListener;

  @override
  void initState() {
    super.initState();
    _initializeCheckout();
  }

  @override
  void dispose() {
    _userListener?.cancel();
    super.dispose();
  }

  String _buildToken(String userId, String planId, String secret) {
    final ts = DateTime.now().millisecondsSinceEpoch.toString();
    final payload = '$userId:$planId:$ts';
    final sig = Hmac(sha256, utf8.encode(secret))
        .convert(utf8.encode(payload))
        .toString();
    final raw = '$payload:$sig';
    // base64url sin padding
    return base64Url.encode(utf8.encode(raw)).replaceAll('=', '');
  }

  Future<void> _initializeCheckout() async {
    final membership = widget.membership;
    if (membership == null) {
      setState(() {
        _error = 'No se ha seleccionado ninguna membresía';
        _loading = false;
      });
      return;
    }

    final config = await _gatewayRepo.getPayphoneConfig();
    if (config == null || config.checkoutUrl.isEmpty || config.checkoutSecret.isEmpty) {
      setState(() {
        _error = 'Pasarela de pago no configurada. Contacta al administrador.';
        _loading = false;
      });
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _error = 'Debes iniciar sesión para continuar';
        _loading = false;
      });
      return;
    }

    final token = _buildToken(user.uid, membership.id, config.checkoutSecret);
    final url = '${config.checkoutUrl}/checkout?t=$token';

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) => debugPrint('[checkout] navigating: $url'),
        onWebResourceError: (e) =>
            debugPrint('[checkout] web error: ${e.description}'),
        onNavigationRequest: (req) => NavigationDecision.navigate,
      ))
      ..loadRequest(Uri.parse(url));

    // Escuchar isPremium en Firestore — se activa cuando el webhook lo confirma
    _userListener = FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((snap) {
      if (!mounted) return;
      final data = snap.data();
      if (data != null && data['isPremium'] == true) {
        _userListener?.cancel();
        _showSuccessDialog();
      }
    });

    setState(() {
      _checkoutUrl = url;
      _loading = false;
    });
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
            const Text('¡Pago Confirmado!',
                style:
                    TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Tu membresía ${widget.membership?.name ?? "Premium"} ha sido activada.',
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
    final price = widget.membership?.price ?? 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          'Pagar \$${price.toStringAsFixed(2)}',
          style:
              const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppColors.primaryGreen),
            SizedBox(height: 20),
            Text('Preparando pasarela de pagos...',
                style: TextStyle(color: Colors.grey, fontSize: 14)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 56),
              const SizedBox(height: 16),
              Text(_error!,
                  textAlign: TextAlign.center,
                  style:
                      const TextStyle(fontSize: 15, color: Colors.black87)),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 32, vertical: 12),
                ),
                onPressed: () {
                  setState(() {
                    _loading = true;
                    _error = null;
                  });
                  _initializeCheckout();
                },
                child: const Text('Reintentar',
                    style: TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      );
    }

    if (_checkoutUrl != null) {
      return WebViewWidget(controller: _webViewController);
    }

    return const Center(child: Text('Preparando pasarela...'));
  }
}
