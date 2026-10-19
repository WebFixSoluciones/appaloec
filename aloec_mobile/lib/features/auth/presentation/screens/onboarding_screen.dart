import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/aloec_logo.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(flex: 2),
              const Center(child: AloecLogo(size: 190)),
              const SizedBox(height: 12),
              const Text(
                'revitaliza tu vida',
                style: TextStyle(
                  color: AppColors.primaryGreen,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              Text(
                'Jugoterapia viva, protocolos personalizados y nutrición consciente para renovar tu salud.',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                  height: 1.45,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // Feature Badges
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 8,
                runSpacing: 8,
                children: const [
                  _FeatureChip(icon: Icons.eco_outlined, label: 'Jugoterapia'),
                  _FeatureChip(icon: Icons.calendar_today_outlined, label: 'Protocolos'),
                  _FeatureChip(icon: Icons.school_outlined, label: 'Videocursos'),
                ],
              ),

              const Spacer(flex: 3),

              // Botón Principal: Registrarme
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: () => context.push('/auth/register'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Crear una cuenta',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Botón Secundario: Iniciar Sesión
              SizedBox(
                height: 52,
                child: OutlinedButton(
                  onPressed: () => context.push('/auth/login'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.textDark,
                    side: BorderSide(color: Colors.grey.shade300, width: 1.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Ya tengo cuenta • Iniciar sesión',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _FeatureChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFC8E6C9)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primaryGreen),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1B5E20),
            ),
          ),
        ],
      ),
    );
  }
}
