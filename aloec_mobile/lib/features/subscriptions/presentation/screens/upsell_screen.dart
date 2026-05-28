import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

class UpsellScreen extends StatelessWidget {
  const UpsellScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Versión Premium')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.star, size: 80, color: AppColors.primaryGreen),
              const SizedBox(height: 24),
              const Text(
                'Obtenga la versión premium',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Acceso completo a todos los videocursos, dietas personalizadas y seguimiento avanzado.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () => context.push('/premium-checkout'),
                child: const Text('Comprar Premium'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
