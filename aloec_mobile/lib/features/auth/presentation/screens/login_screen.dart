import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../../../core/widgets/aloec_button.dart';
import '../../../../core/widgets/aloec_text_field.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    ref.listen<AuthState>(authNotifierProvider, (previous, next) {
      if (next.status == AuthStateStatus.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.errorMessage ?? 'Error de autenticación')),
        );
      } else if (next.status == AuthStateStatus.authenticated) {
        context.go('/home');
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Placeholder for Logo
                const Text(
                  'ALOEC',
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF67B539),
                    letterSpacing: 2.0,
                  ),
                ),
                const Text('revitaliza tu vida', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 48),
                const Text(
                  'Hola,\nBienvenido de nuevo',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                AloecTextField(
                  controller: _emailCtrl,
                  hintText: 'Correo electrónico',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                AloecTextField(
                  controller: _passCtrl,
                  hintText: 'Contraseña',
                  prefixIcon: Icons.lock_outline,
                  obscureText: true,
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.center,
                  child: TextButton(
                    onPressed: () => context.push('/auth/forgot-password'),
                    child: const Text('¿Olvidaste tu contraseña?', style: TextStyle(color: Colors.grey)),
                  ),
                ),
                const SizedBox(height: 24),
                AloecButton(
                  text: 'Acceso',
                  isLoading: authState.status == AuthStateStatus.loading,
                  onPressed: () {
                    ref.read(authNotifierProvider.notifier).signIn(
                      _emailCtrl.text,
                      _passCtrl.text,
                    );
                  },
                ),
                const SizedBox(height: 24),
                const Text('O', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.g_mobiledata, size: 40, color: Colors.blue),
                      onPressed: () {
                        ref.read(authNotifierProvider.notifier).signInWithGoogle();
                      },
                    ),
                    const SizedBox(width: 16),
                    IconButton(
                      icon: const Icon(Icons.facebook, size: 36, color: Colors.blueAccent),
                      onPressed: () {
                        ref.read(authNotifierProvider.notifier).signInWithFacebook();
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => context.push('/auth/register'),
                  child: const Text(
                    '¿Aún no tienes una cuenta? Registro',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
