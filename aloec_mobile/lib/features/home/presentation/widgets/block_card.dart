import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/protocol_day_provider.dart';

class BlockCard extends StatelessWidget {
  final ProtocolBlock block;
  final int index;
  final VoidCallback onComplete;
  final VoidCallback? onToggle;

  const BlockCard({
    super.key,
    required this.block,
    required this.index,
    required this.onComplete,
    this.onToggle,
  });

  IconData _getMealIcon(String mealType, String label) {
    final l = '$label $mealType'.toLowerCase();
    if (l.contains('desayuno') || l.contains('breakfast')) {
      return Icons.wb_sunny_rounded;
    } else if (l.contains('almuerzo') || l.contains('lunch') || l.contains('comida')) {
      return Icons.restaurant_rounded;
    } else if (l.contains('cena') || l.contains('dinner')) {
      return Icons.nightlight_round;
    } else if (l.contains('manana') || l.contains('mañana')) {
      return Icons.eco_rounded;
    } else if (l.contains('tarde') || l.contains('snack')) {
      return Icons.apple_rounded;
    }
    return Icons.local_dining_rounded;
  }

  Color _getMealColor(String mealType, String label) {
    final l = '$label $mealType'.toLowerCase();
    if (l.contains('desayuno')) return const Color(0xFFD97706); // Amber
    if (l.contains('almuerzo')) return const Color(0xFF059669); // Emerald
    if (l.contains('cena')) return const Color(0xFF4F46E5); // Indigo
    if (l.contains('manana') || l.contains('mañana')) return const Color(0xFF10B981); // Mint
    if (l.contains('tarde')) return const Color(0xFFEA580C); // Warm orange
    return AppColors.primaryGreen;
  }

  void _showMealDetailModal(BuildContext context) {
    final meal = block.meal;
    final mealIcon = _getMealIcon(meal.mealType, meal.label);
    final mealColor = _getMealColor(meal.mealType, meal.label);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.fromLTRB(
            20,
            12,
            20,
            MediaQuery.of(ctx).padding.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle superior
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Cabecera con ícono, título y horario
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: mealColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(mealIcon, color: mealColor, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              meal.label,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textDark,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F5E9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                meal.time,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF166534),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              block.isCompleted
                                  ? Icons.check_circle_rounded
                                  : Icons.access_time_rounded,
                              size: 14,
                              color: block.isCompleted
                                  ? AppColors.primaryGreen
                                  : const Color(0xFF64748B),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              block.isCompleted
                                  ? 'Completado hoy'
                                  : 'Pendiente de realizar',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: block.isCompleted
                                  ? AppColors.primaryGreen
                                  : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Sección 1: Pautas y Alimentos recomendados
              if (meal.items.isNotEmpty) ...[
                const Text(
                  'Pautas y Alimentos Indicados',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 10),
                ...meal.items.map((item) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAF8),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.only(top: 2),
                            child: Icon(
                              Icons.check_circle_outline,
                              size: 16,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              item,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textDark,
                                height: 1.35,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 14),
              ],

              // Sección 2: Receta / Jugo Verde Recomendado
              if (meal.recipeName != null ||
                  meal.items.any((i) => i.toLowerCase().contains('jugo'))) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFBBF7D0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.eco, color: AppColors.primaryGreen, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            meal.recipeName ?? 'Jugo Verde Recomendado',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF166534),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Rico en clorofila y antioxidantes para potenciar la desintoxicación celular.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF15803D),
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        height: 38,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            if (meal.recipeId != null && meal.recipeId!.isNotEmpty) {
                              context.push('/juice-detail/${meal.recipeId}');
                            } else {
                              context.go('/home');
                            }
                          },
                          icon: const Icon(Icons.menu_book, size: 16),
                          label: const Text(
                            'Ver en Catálogo de Recetas',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF166534),
                            side: const BorderSide(color: Color(0xFF166534)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Sección 3: Notas / Instrucciones específicas
              if (meal.notes != null && meal.notes!.trim().isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.lightbulb_outline,
                          color: Color(0xFFD97706), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Nota del Protocolo',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF92400E),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              meal.notes!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFFB45309),
                                height: 1.35,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
              ],

              // Botón de Acción Principal (Marcar / Desmarcar)
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    Navigator.pop(ctx);
                    if (onToggle != null) {
                      onToggle!();
                    } else {
                      onComplete();
                    }
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          block.isCompleted
                              ? '${meal.label} desmarcado'
                              : '✓ ¡${meal.label} completado!',
                        ),
                        backgroundColor: AppColors.primaryGreen,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  icon: Icon(
                    block.isCompleted
                        ? Icons.replay_rounded
                        : Icons.check_circle_rounded,
                    size: 20,
                  ),
                  label: Text(
                    block.isCompleted
                        ? 'Desmarcar este horario'
                        : 'Marcar como Completado',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: block.isCompleted
                        ? const Color(0xFF64748B)
                        : AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final meal = block.meal;
    final mealIcon = _getMealIcon(meal.mealType, meal.label);
    final mealColor = _getMealColor(meal.mealType, meal.label);
    final isActive = block.status == BlockStatus.active;
    final isCompleted = block.isCompleted;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isCompleted ? const Color(0xFFF9FDF9) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isCompleted
              ? const Color(0xFFD1FAE5)
              : isActive
                  ? AppColors.primaryGreen
                  : const Color(0xFFE2E8F0),
          width: isActive ? 2.0 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: isActive
                ? AppColors.primaryGreen.withValues(alpha: 0.12)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: isActive ? 12 : 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: () => _showMealDetailModal(context),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Ícono de la Comida
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: mealColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(mealIcon, color: mealColor, size: 24),
                ),
                const SizedBox(width: 12),

                // Contenido central (Hora, Nombre, Descripción)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F5E9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              meal.time,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF166534),
                              ),
                            ),
                          ),
                          if (isActive) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'HORARIO ACTUAL',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFB45309),
                                ),
                              ),
                            ),
                          ],
                          if (isCompleted) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'LISTO',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF15803D),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        meal.label,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isCompleted
                              ? const Color(0xFF475569)
                              : AppColors.textDark,
                        ),
                      ),
                      if (meal.items.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          meal.items.join(' • '),
                          style: TextStyle(
                            fontSize: 13,
                            color: isCompleted
                                ? const Color(0xFF94A3B8)
                                : const Color(0xFF64748B),
                            height: 1.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      if (meal.notes != null &&
                          meal.notes!.trim().isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.push_pin_outlined,
                              size: 12,
                              color: Color(0xFF059669),
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                meal.notes!,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontStyle: FontStyle.italic,
                                  color: Color(0xFF059669),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            'Toca para ver receta y guía',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isCompleted
                                  ? const Color(0xFF94A3B8)
                                  : AppColors.primaryGreen,
                            ),
                          ),
                          const SizedBox(width: 2),
                          Icon(
                            Icons.chevron_right,
                            size: 14,
                            color: isCompleted
                                ? const Color(0xFF94A3B8)
                                : AppColors.primaryGreen,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Botón interactivo de checkmark a la derecha
                GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    if (onToggle != null) {
                      onToggle!();
                    } else {
                      onComplete();
                    }
                  },
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? AppColors.primaryGreen
                          : isActive
                              ? AppColors.primaryGreen.withValues(alpha: 0.1)
                              : Colors.transparent,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isCompleted
                            ? AppColors.primaryGreen
                            : isActive
                                ? AppColors.primaryGreen
                                : const Color(0xFFCBD5E1),
                        width: isCompleted ? 0 : 2,
                      ),
                    ),
                    child: isCompleted
                        ? const Icon(
                            Icons.check_rounded,
                            size: 20,
                            color: Colors.white,
                          )
                        : null,
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
