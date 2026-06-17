import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/services/notification_service.dart';
import '../../domain/protocol_model.dart';

class ProtocolDetailScreen extends StatefulWidget {
  final ProtocolModel protocol;

  const ProtocolDetailScreen({super.key, required this.protocol});

  @override
  State<ProtocolDetailScreen> createState() => _ProtocolDetailScreenState();
}

class _ProtocolDetailScreenState extends State<ProtocolDetailScreen>
    with SingleTickerProviderStateMixin {
  bool _notificationsActive = false;
  bool _isLoadingNotif = false;
  Map<String, dynamic>? _linkedCourse;
  bool _isLoadingCourse = true;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeInOut);
    _animController.forward();
    _loadLinkedCourse();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  /// Consulta Firestore para obtener el curso vinculado al protocolo.
  Future<void> _loadLinkedCourse() async {
    if (widget.protocol.linkedCourseTag == null) {
      setState(() => _isLoadingCourse = false);
      return;
    }
    try {
      final query = await FirebaseFirestore.instance
          .collection('courses')
          .where('tags', arrayContains: widget.protocol.linkedCourseTag)
          .limit(1)
          .get();

      if (query.docs.isNotEmpty) {
        setState(() {
          _linkedCourse = {
            'id': query.docs.first.id,
            ...query.docs.first.data(),
          };
        });
      }
    } catch (e) {
      debugPrint('⚠️ [ProtocolDetailScreen] Error cargando curso vinculado: $e');
    } finally {
      setState(() => _isLoadingCourse = false);
    }
  }

  Future<void> _toggleNotifications() async {
    setState(() => _isLoadingNotif = true);
    final service = NotificationService();

    if (_notificationsActive) {
      await service.cancelAllNotifications();
      setState(() {
        _notificationsActive = false;
        _isLoadingNotif = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🔕 Recordatorios del protocolo desactivados.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } else {
      final notifications = widget.protocol.schedule
          .map((meal) => meal.toNotification())
          .toList();
      await service.scheduleProtocolNotifications(notifications);
      setState(() {
        _notificationsActive = true;
        _isLoadingNotif = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                '🔔 ¡Protocolo activado! Recibirás ${notifications.length} recordatorios diarios.'),
            backgroundColor: AppColors.primaryGreen,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final protocol = widget.protocol;
    final categoryColor = Color(AloecProtocols.getCategoryColorValue(
      protocol.category == BmiCategory.underweight
          ? 17.0
          : protocol.category == BmiCategory.overweight
              ? 27.0
              : protocol.category == BmiCategory.obesity1
                  ? 32.0
                  : 38.0,
    ));

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: FadeTransition(
        opacity: _fadeAnim,
        child: CustomScrollView(
          slivers: [
            // ─── Header Sliver ────────────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 220,
              pinned: true,
              backgroundColor: categoryColor,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
                onPressed: () => context.pop(),
              ),
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
                title: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      protocol.title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      protocol.subtitle,
                      style: const TextStyle(fontSize: 11, color: Colors.white70),
                    ),
                  ],
                ),
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        categoryColor.withOpacity(0.8),
                        categoryColor,
                      ],
                    ),
                  ),
                  child: Center(
                    child: Icon(
                      Icons.health_and_safety_rounded,
                      size: 80,
                      color: Colors.white.withOpacity(0.3),
                    ),
                  ),
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ─── Descripción ─────────────────────────────────────────
                    _SectionCard(
                      child: Text(
                        protocol.description,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textLight,
                          height: 1.6,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ─── Premium CTA Banner ──────────────────────────────────
                    _PremiumCtaBanner(
                      onTap: () => context.push('/premium-upsell'),
                    ),
                    const SizedBox(height: 20),

                    // ─── Agenda Diaria ───────────────────────────────────────
                    _SectionTitle(
                        icon: Icons.schedule_rounded,
                        label: 'Agenda Diaria del Protocolo'),
                    const SizedBox(height: 12),
                    ...protocol.schedule.map((meal) => _MealCard(meal: meal)),
                    const SizedBox(height: 20),

                    // ─── Notas Importantes ───────────────────────────────────
                    _SectionTitle(
                        icon: Icons.info_outline_rounded,
                        label: 'Notas Importantes'),
                    const SizedBox(height: 12),
                    _SectionCard(
                      child: Column(
                        children: protocol.importantNotes
                            .map(
                              (note) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Icon(Icons.fiber_manual_record,
                                        size: 8,
                                        color: categoryColor),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        note,
                                        style: TextStyle(
                                            fontSize: 13,
                                            color: AppColors.textDark,
                                            height: 1.5),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // ─── Cursos Vinculados ───────────────────────────────────
                    _SectionTitle(
                        icon: Icons.play_circle_outline_rounded,
                        label: 'Videocurso Vinculado'),
                    const SizedBox(height: 12),
                    _isLoadingCourse
                        ? const Center(
                            child: CircularProgressIndicator(
                              color: AppColors.primaryGreen,
                            ),
                          )
                        : _linkedCourse != null
                            ? _LinkedCourseCard(
                                course: _linkedCourse!,
                                onTap: () => context.push(
                                    '/course-detail/${_linkedCourse!['id']}'),
                              )
                            : _CoursePlaceholderCard(),
                    const SizedBox(height: 24),

                    // ─── Botón Activar Protocolo ─────────────────────────────
                    _ActivateProtocolButton(
                      isActive: _notificationsActive,
                      isLoading: _isLoadingNotif,
                      onTap: _toggleNotifications,
                      color: categoryColor,
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Widgets Privados ─────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  final IconData icon;
  final String label;
  const _SectionTitle({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primaryGreen, size: 20),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textDark,
          ),
        ),
      ],
    );
  }
}

class _SectionCard extends StatelessWidget {
  final Widget child;
  const _SectionCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _MealCard extends StatelessWidget {
  final ProtocolMealItem meal;
  const _MealCard({required this.meal});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Time bubble
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              meal.time,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryGreen,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (meal.icon != null)
                      Text(meal.icon!, style: const TextStyle(fontSize: 16)),
                    if (meal.icon != null) const SizedBox(width: 6),
                    Text(
                      meal.label,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ...meal.items.asMap().entries.map(
                      (e) => Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          '${e.key + 1}. ${e.value}',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textLight,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Banner de CTA Premium - incita la compra de suscripción.
class _PremiumCtaBanner extends StatelessWidget {
  final VoidCallback onTap;
  const _PremiumCtaBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1B5E20), Color(0xFF388E3C), Color(0xFF67B539)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryGreen.withOpacity(0.35),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.workspace_premium_rounded,
                  color: Colors.white, size: 28),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '🌟 ¡Función Premium!',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Desbloquea protocolos completos, videocursos de Terapia Gerson y recordatorios personalizados.',
                    style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(50),
                    ),
                    child: const Text(
                      '¡Obtener Premium ahora! →',
                      style: TextStyle(
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
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

class _LinkedCourseCard extends StatelessWidget {
  final Map<String, dynamic> course;
  final VoidCallback onTap;

  const _LinkedCourseCard({required this.course, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryGreen.withOpacity(0.08),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.play_circle_rounded,
                  color: AppColors.primaryGreen, size: 32),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course['title'] ?? 'Videocurso Disponible',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    course['description'] ?? 'Accede a tu videocurso.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 12, color: AppColors.textLight),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: AppColors.primaryGreen),
          ],
        ),
      ),
    );
  }
}

class _CoursePlaceholderCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: AppColors.primaryGreen.withOpacity(0.2), style: BorderStyle.solid),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.hourglass_empty_rounded,
                color: AppColors.primaryGreen, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '🎓 Curso de Terapia Gerson',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Pronto estará disponible. Cuando el administrador cargue el curso, aparecerá aquí automáticamente.',
                  style: TextStyle(fontSize: 12, color: AppColors.textLight, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivateProtocolButton extends StatelessWidget {
  final bool isActive;
  final bool isLoading;
  final VoidCallback onTap;
  final Color color;

  const _ActivateProtocolButton({
    required this.isActive,
    required this.isLoading,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: double.infinity,
        height: 56,
        decoration: BoxDecoration(
          color: isActive ? Colors.orange : color,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: (isActive ? Colors.orange : color).withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isActive ? Icons.notifications_off : Icons.notifications_active,
                      color: Colors.white,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      isActive
                          ? 'Desactivar Recordatorios'
                          : '🔔 Iniciar Protocolo y Activar Recordatorios',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
