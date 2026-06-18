import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../../../core/widgets/aloec_button.dart';
import '../../../../core/widgets/aloec_text_field.dart';
import '../../../../core/widgets/aloec_logo.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _acceptedTerms = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  void _register() {
    final name = _nameCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text.trim();

    final phone = _phoneCtrl.text.trim();

    if (name.isEmpty) {
      _showError('Ingresa tu nombre completo.');
      return;
    }
    if (name.trim().split(' ').length < 2) {
      _showError('Ingresa tu nombre y apellido.');
      return;
    }
    if (phone.isNotEmpty &&
        !RegExp(r'^\+?[0-9]{7,15}$').hasMatch(phone.replaceAll(' ', ''))) {
      _showError('El número de teléfono no es válido.');
      return;
    }
    if (email.isEmpty) {
      _showError('Ingresa tu correo electrónico.');
      return;
    }
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      _showError('El formato del correo no es válido.');
      return;
    }
    if (pass.isEmpty) {
      _showError('Ingresa una contraseña.');
      return;
    }
    if (pass.length < 6) {
      _showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d).+$').hasMatch(pass)) {
      _showError('La contraseña debe contener letras y números.');
      return;
    }
    if (!_acceptedTerms) {
      _showError('Debes aceptar los términos y condiciones.');
      return;
    }

    ref.read(authNotifierProvider.notifier).register(email, pass, name);
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    ref.listen<AuthState>(authNotifierProvider, (previous, next) {
      if (next.status == AuthStateStatus.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.errorMessage ?? 'Error de registro')),
        );
      } else if (next.status == AuthStateStatus.authenticated) {
        context.go('/home');
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Center(child: AloecLogo(size: 130)),
                const SizedBox(height: 16),
                const Text(
                  'Hola,\nCrea una cuenta',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                AloecTextField(
                  controller: _nameCtrl,
                  hintText: 'Nombre completo',
                  prefixIcon: Icons.person_outline,
                ),
                const SizedBox(height: 16),
                AloecTextField(
                  controller: _phoneCtrl,
                  hintText: 'Número de teléfono',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
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
                const SizedBox(height: 16),
                Row(
                  children: [
                    Checkbox(
                      value: _acceptedTerms,
                      activeColor: const Color(0xFF67B539),
                      onChanged: (value) {
                        setState(() {
                          _acceptedTerms = value ?? false;
                        });
                      },
                    ),
                    const Expanded(
                      child: Text(
                        'Al continuar, acepta nuestra Política de privacidad y Términos de uso',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                AloecButton(
                  text: 'Crear cuenta',
                  isLoading: authState.status == AuthStateStatus.loading,
                  onPressed: _register,
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
                  onPressed: () => context.pop(),
                  child: RichText(
                    text: const TextSpan(
                      children: [
                        TextSpan(
                          text: '¿Ya tienes una cuenta? ',
                          style: TextStyle(color: Colors.grey),
                        ),
                        TextSpan(
                          text: 'Iniciar sesión',
                          style: TextStyle(
                            color: Color(0xFF67B539),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
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
