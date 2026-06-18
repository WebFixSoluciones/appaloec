import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../../../core/widgets/aloec_logo.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    // Escucha cambios de estado de auth y navega cuando el estado sea definitivo
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      _checkAndNavigate();
    });
  }

  void _checkAndNavigate() {
    if (_navigated) return;
    final authState = ref.read(authNotifierProvider);
    // Solo navegar cuando el estado sea definitivo (no initial/loading)
    if (authState.status == AuthStateStatus.authenticated) {
      _navigated = true;
      context.go('/home');
    } else if (authState.status == AuthStateStatus.unauthenticated ||
        authState.status == AuthStateStatus.error) {
      _navigated = true;
      context.go('/onboarding');
    } else {
      // Aún en estado initial o loading: esperar a que cambie
      ref.listenManual<AuthState>(authNotifierProvider, (previous, next) {
        if (_navigated || !mounted) return;
        if (next.status == AuthStateStatus.authenticated) {
          _navigated = true;
          context.go('/home');
        } else if (next.status == AuthStateStatus.unauthenticated ||
            next.status == AuthStateStatus.error) {
          _navigated = true;
          context.go('/onboarding');
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AloecLogo(size: 180),
            const SizedBox(height: 8),
            const Text(
              'revitaliza tu vida',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 48),
            const SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                color: Color(0xFF67B539),
                strokeWidth: 2.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
