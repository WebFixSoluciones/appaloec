import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

class UpsellScreen extends StatefulWidget {
  const UpsellScreen({super.key});

  @override
  State<UpsellScreen> createState() => _UpsellScreenState();
}

class _UpsellScreenState extends State<UpsellScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnim;
  int _selectedPlan = 1; // 0 = monthly, 1 = annual

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnim = CurvedAnimation(parent: _animController, curve: Curves.elasticOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // ─── Hero Header ─────────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 40, 24, 32),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF67B539)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  children: [
                    // Close button
                    Align(
                      alignment: Alignment.topRight,
                      child: GestureDetector(
                        onTap: () => context.pop(),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, color: Colors.white, size: 18),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Animated crown icon
                    ScaleTransition(
                      scale: _scaleAnim,
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: Colors.white.withOpacity(0.4), width: 2),
                        ),
                        child: const Center(
                          child: Text('🌟', style: TextStyle(fontSize: 44)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    const Text(
                      'ALOEC Premium',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Transforma tu salud con el programa completo de jugos verdes y protocolos médicos personalizados.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),

              // ─── Features ────────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '¿Qué incluye Premium?',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark),
                    ),
                    const SizedBox(height: 16),

                    _FeatureCard(
                      icon: '📋',
                      title: 'Protocolos Médicos Personalizados',
                      description:
                          'Protocolo de 4 niveles según tu IMC: bajo peso, sobrepeso, obesidad I y obesidad severa.',
                      color: const Color(0xFF388E3C),
                    ),
                    _FeatureCard(
                      icon: '🔔',
                      title: 'Recordatorios Diarios Automáticos',
                      description:
                          'Notificaciones a la hora exacta de cada comida, jugo y actividad de tu protocolo.',
                      color: const Color(0xFF1976D2),
                    ),
                    _FeatureCard(
                      icon: '🎓',
                      title: 'Videocurso de Terapia Gerson',
                      description:
                          'Acceso completo al videocurso de la terapia más reconocida del mundo para desintoxicación y pérdida de peso.',
                      color: const Color(0xFF7B1FA2),
                    ),
                    _FeatureCard(
                      icon: '🥤',
                      title: 'Recetas Exclusivas de Jugos Verdes',
                      description:
                          'Más de 50 recetas de jugos verdes categorized for all protocols, each with benefits and step-by-step preparation.',
                      color: const Color(0xFF00838F),
                    ),
                    _FeatureCard(
                      icon: '📊',
                      title: 'Seguimiento de Progreso',
                      description:
                          'Historial de IMC, peso semanal, racha de jugos y logros desbloqueados.',
                      color: const Color(0xFFF57C00),
                    ),
                    _FeatureCard(
                      icon: '☕',
                      title: 'Guía de Terapia de Enemas',
                      description:
                          'Instrucciones detalladas para enemas de café según la Terapia Gerson (para protocolos avanzados).',
                      color: const Color(0xFF795548),
                    ),
                    const SizedBox(height: 28),

                    // ─── Plan Selector ────────────────────────────────────
                    const Text(
                      'Elige tu plan:',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark),
                    ),
                    const SizedBox(height: 14),

                    Row(
                      children: [
                        Expanded(
                          child: _PlanOption(
                            title: 'Mensual',
                            price: '\$9.99',
                            period: '/mes',
                            isSelected: _selectedPlan == 0,
                            badge: null,
                            onTap: () => setState(() => _selectedPlan = 0),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _PlanOption(
                            title: 'Anual',
                            price: '\$79.99',
                            period: '/año',
                            isSelected: _selectedPlan == 1,
                            badge: '🎉 Ahorra 33%',
                            onTap: () => setState(() => _selectedPlan = 1),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // ─── CTA Button ───────────────────────────────────────
                    GestureDetector(
                      onTap: () => context.push('/premium-checkout'),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1B5E20), Color(0xFF67B539)],
                          ),
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryGreen.withOpacity(0.45),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Text(
                              _selectedPlan == 0
                                  ? 'Comenzar por \$9.99/mes'
                                  : 'Comenzar por \$79.99/año',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              '✓ Cancela cuando quieras',
                              style: TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Restore purchases
                    Center(
                      child: TextButton(
                        onPressed: () {},
                        child: const Text(
                          'Restaurar compra anterior',
                          style: TextStyle(
                              color: AppColors.textLight, fontSize: 12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Legal
                    const Center(
                      child: Text(
                        'Al continuar aceptas nuestros Términos y Política de Privacidad.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.textLight, fontSize: 10),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Widgets privados ─────────────────────────────────────────────────────────

class _FeatureCard extends StatelessWidget {
  final String icon;
  final String title;
  final String description;
  final Color color;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.15)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 22)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.textDark),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                      fontSize: 12, color: AppColors.textLight, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanOption extends StatelessWidget {
  final String title;
  final String price;
  final String period;
  final bool isSelected;
  final String? badge;
  final VoidCallback onTap;

  const _PlanOption({
    required this.title,
    required this.price,
    required this.period,
    required this.isSelected,
    required this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen.withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge!,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold),
                ),
              ),
            Text(
              title,
              style: const TextStyle(
                  fontWeight: FontWeight.bold, color: AppColors.textDark),
            ),
            const SizedBox(height: 4),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: price,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? AppColors.primaryGreen : AppColors.textDark,
                    ),
                  ),
                  TextSpan(
                    text: period,
                    style: TextStyle(
                        fontSize: 12, color: AppColors.textLight),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
