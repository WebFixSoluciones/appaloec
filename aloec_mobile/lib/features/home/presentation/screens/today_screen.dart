import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/premium_gate.dart';
import '../../../courses/presentation/screens/courses_screen.dart';
import '../../../banners/presentation/widgets/banner_carousel.dart';
import '../../../profile/data/firestore_profile_repository.dart';
import '../providers/protocol_day_provider.dart';
import '../widgets/block_card.dart';

class TodayScreen extends ConsumerStatefulWidget {
  const TodayScreen({super.key});

  @override
  ConsumerState<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends ConsumerState<TodayScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime date) {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const months = [
      '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return '${days[date.weekday - 1]} ${date.day} ${months[date.month]}';
  }

  @override
  Widget build(BuildContext context) {
    final dayState = ref.watch(protocolDayProvider);
    final profileAsync = ref.watch(userProfileStreamProvider);
    final isPremium = profileAsync.value?.isPremium ?? false;

    final bodyContent = dayState.isLoading
        ? const Center(
            child: CircularProgressIndicator(color: AppColors.primaryGreen))
        : dayState.protocol == null
            ? Column(
                children: [
                  const BannerCarousel(position: 'inicio'),
                  Expanded(child: _buildEmptyState()),
                ],
              )
            : Column(
                children: [
                  const BannerCarousel(position: 'inicio'),
                  Expanded(child: _buildTimeline(dayState)),
                ],
              );

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: AppColors.backgroundLight,
        elevation: 0,
        leadingWidth: 100,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'ALOEC',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w800,
                fontSize: 20,
              ),
            ),
          ),
        ),
        title: Text(
          _formatDate(DateTime.now()),
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: AppColors.textLight,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.school_outlined, color: AppColors.textDark),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const CoursesScreen(),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined,
                color: AppColors.textDark),
            onPressed: () => context.push('/notifications'),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: dayState.protocol != null && !isPremium
          ? PremiumGate(
              title: 'Protocolo Diario Premium',
              description: 'Activa tu membresia para seguir tu protocolo personalizado dia a dia.',
              child: bodyContent,
            )
          : bodyContent,
    );
  }

  Widget _buildEmptyState() {
    final isPremium = (ref.watch(userProfileStreamProvider).value?.isPremium ?? false);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.assignment_outlined,
                  size: 50, color: AppColors.primaryGreen),
            ),
            const SizedBox(height: 20),
            Text(
              isPremium
                  ? 'Protocolo no asignado'
                  : 'No tienes un protocolo activo',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              isPremium
                  ? 'Calcula tu IMC para recibir tu protocolo personalizado.'
                  : 'Calcula tu IMC para recibir un protocolo personalizado.',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textLight,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                icon: const Icon(Icons.calculate),
                label: const Text('Calcular mi IMC',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600)),
                onPressed: () => context.push('/bmi-calculator'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(ProtocolDayState dayState) {
    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: () =>
          ref.read(protocolDayProvider.notifier).loadProtocol(),
      child: ListView(
        controller: _scrollController,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 130),
        children: [
          _buildProtocolHeader(dayState),
          const SizedBox(height: 18),
          ...dayState.blocks.asMap().entries.map((entry) {
            return TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: 1),
              duration: Duration(milliseconds: 250 + entry.key * 40),
              curve: Curves.easeOut,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Transform.translate(
                    offset: Offset(0, 16 * (1 - value)),
                    child: child,
                  ),
                );
              },
              child: BlockCard(
                block: entry.value,
                index: entry.key,
                onComplete: () => ref
                    .read(protocolDayProvider.notifier)
                    .markBlockCompleted(entry.key),
                onToggle: () => ref
                    .read(protocolDayProvider.notifier)
                    .toggleBlockCompleted(entry.key),
              ),
            );
          }),
          if (dayState.notes.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildNotesSection(dayState.notes),
          ],
        ],
      ),
    );
  }

  Widget _buildProtocolHeader(ProtocolDayState dayState) {
    final percent = dayState.completionPercent;
    final done = dayState.blocks.where((b) => b.isCompleted).length;
    final total = dayState.blocks.length;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Día ${dayState.currentDay} de ${dayState.totalDays}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF166534),
                  ),
                ),
              ),
              Text(
                '${(percent * 100).toInt()}% Completado',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: percent),
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOut,
              builder: (context, value, _) {
                return LinearProgressIndicator(
                  value: value,
                  minHeight: 10,
                  backgroundColor: const Color(0xFFF1F5F9),
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    AppColors.primaryGreen,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(
                done == total && total > 0
                    ? Icons.celebration_rounded
                    : Icons.task_alt_rounded,
                size: 14,
                color: const Color(0xFF64748B),
              ),
              const SizedBox(width: 6),
              Text(
                done == total && total > 0
                    ? '¡Felicidades! Completaste todos tus horarios de hoy'
                    : '$done de $total comidas y pautas realizadas',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNotesSection(List<String> notes) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.lightbulb_outline, size: 18, color: Color(0xFFD97706)),
              SizedBox(width: 8),
              Text(
                'Recomendaciones del Protocolo',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF92400E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...notes.map((note) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Icon(
                        Icons.fiber_manual_record,
                        size: 8,
                        color: Color(0xFFD97706),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        note,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF78350F),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
