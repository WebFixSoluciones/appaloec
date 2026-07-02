import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../subscriptions/domain/protocol_model.dart';
import '../providers/progress_provider.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(progressProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Mi Progreso'),
        backgroundColor: AppColors.backgroundLight,
        elevation: 0,
      ),
      body: _buildBody(context, ref, progress),
    );
  }

  Widget _buildBody(
      BuildContext context, WidgetRef ref, ProgressState progress) {
    if (progress.isLoading && progress.error == null) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primaryGreen));
    }

    if (progress.error != null && progress.weeklyCompliance.isEmpty &&
        progress.latestBmi == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off, color: AppColors.textLight, size: 48),
              const SizedBox(height: 12),
              const Text('Error al cargar tus datos',
                  style: TextStyle(
                      color: AppColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(progress.error!,
                  textAlign: TextAlign.center,
                  style:
                      const TextStyle(color: AppColors.textLight, fontSize: 12)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () =>
                    ref.read(progressProvider.notifier).loadAll(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: () => ref.read(progressProvider.notifier).loadAll(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (progress.error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      color: AppColors.error, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(progress.error!,
                        style: const TextStyle(
                            color: AppColors.error, fontSize: 12)),
                  ),
                ],
              ),
            ),
          _buildBmiCard(context, progress),
          const SizedBox(height: 16),
          _buildStreakCard(progress),
          const SizedBox(height: 16),
          _buildWeeklyChart(progress),
        ],
      ),
    );
  }

  Widget _buildBmiCard(BuildContext context, ProgressState progress) {
    final hasBmi = progress.latestBmi != null;
    final color = hasBmi
        ? Color(ProtocolModel.getCategoryColorValue(progress.latestBmi!))
        : AppColors.textLight;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    hasBmi ? progress.latestBmi!.toStringAsFixed(1) : '--',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Indice de Masa Corporal',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      hasBmi
                          ? (progress.bmiCategory ??
                              ProtocolModel.getCategoryLabel(
                                  progress.latestBmi!))
                          : 'Sin calcular',
                      style: TextStyle(
                        fontSize: 13,
                        color: color,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (progress.bmiDate != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        'Ultimo calculo: ${progress.bmiDate!.day}/${progress.bmiDate!.month}/${progress.bmiDate!.year}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textLight,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(color: AppColors.primaryGreen),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.calculate, size: 18),
              label: Text(hasBmi ? 'Recalcular IMC' : 'Calcular IMC'),
              onPressed: () => context.push('/bmi-calculator'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStreakCard(ProgressState progress) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.local_fire_department,
                color: Colors.orange, size: 28),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${progress.streak} dias consecutivos',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                progress.streak > 0
                    ? 'Sigue asi!'
                    : 'Completa bloques para empezar tu racha',
                style:
                    const TextStyle(fontSize: 13, color: AppColors.textLight),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyChart(ProgressState progress) {
    final compliance = progress.weeklyCompliance;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Cumplimiento semanal',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDark,
                ),
              ),
              Text(
                '${progress.weeklyAverage.toStringAsFixed(0)}% avg',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
          if (compliance.isEmpty) ...[
            const SizedBox(height: 24),
            Center(
              child: Column(
                children: [
                  Icon(Icons.bar_chart,
                      color: Colors.grey.shade300, size: 40),
                  const SizedBox(height: 8),
                  const Text(
                    'Sin datos de esta semana',
                    style:
                        TextStyle(fontSize: 13, color: AppColors.textLight),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Completa bloques diarios para ver tu progreso',
                    style: TextStyle(fontSize: 11, color: AppColors.textLight),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ] else ...[
            const SizedBox(height: 20),
            SizedBox(
              height: 150,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: compliance.map((day) {
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: _DayBar(
                        label: day.dayLabel,
                        percentage: day.percentage,
                        completed: day.completed,
                        total: day.total,
                        isToday: day.date.day == DateTime.now().day &&
                            day.date.month == DateTime.now().month &&
                            day.date.year == DateTime.now().year,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 4),
                const Text('Completado',
                    style: TextStyle(fontSize: 11, color: AppColors.textLight)),
                const SizedBox(width: 16),
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 4),
                const Text('Pendiente',
                    style: TextStyle(fontSize: 11, color: AppColors.textLight)),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _DayBar extends StatefulWidget {
  final String label;
  final double percentage;
  final int completed;
  final int total;
  final bool isToday;

  const _DayBar({
    required this.label,
    required this.percentage,
    required this.completed,
    required this.total,
    required this.isToday,
  });

  @override
  State<_DayBar> createState() => _DayBarState();
}

class _DayBarState extends State<_DayBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant _DayBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.percentage != widget.percentage) {
      _controller
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasProtocol = widget.total > 0;
    final color = hasProtocol
        ? AppColors.primaryGreen
        : Colors.grey.shade300;

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Flexible(
          child: AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              return FractionallySizedBox(
                heightFactor: hasProtocol
                    ? _animation.value * (widget.percentage / 100)
                    : 0.04,
                child: Container(
                  width: double.infinity,
                  margin: EdgeInsets.only(
                      bottom: widget.percentage > 0 ? 0 : 4),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              );
            },
            child: null,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.percentage >= 100
                ? AppColors.primaryGreen.withOpacity(0.15)
                : widget.isToday
                    ? AppColors.primaryGreen.withOpacity(0.1)
                    : Colors.transparent,
            border: widget.isToday
                ? Border.all(color: AppColors.primaryGreen, width: 1.5)
                : null,
          ),
          child: Center(
            child: Text(
              widget.label,
              style: TextStyle(
                fontSize: 12,
                fontWeight:
                    widget.isToday ? FontWeight.w700 : FontWeight.w500,
                color: widget.isToday
                    ? AppColors.primaryGreen
                    : AppColors.textLight,
              ),
            ),
          ),
        ),
      ],
    );
  }
}


