import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/premium_gate.dart';
import '../../../subscriptions/domain/protocol_model.dart';
import '../providers/progress_provider.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(progressProvider);

    final scaffold = Scaffold(
      backgroundColor: const Color(0xFFFBFDFB),
      appBar: AppBar(
        title: const Text(
          'Mi Progreso',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(
              Icons.calendar_month_rounded,
              color: AppColors.primaryGreen,
              size: 22,
            ),
            tooltip: 'Ver calendario e historial',
            onPressed: () => ref.read(progressProvider.notifier).loadAll(),
          ),
        ],
      ),
      body: _buildBody(context, ref, progress),
    );

    return PremiumGate(
      title: 'Progreso Premium',
      description: 'Activa tu membresía para acceder al seguimiento completo de tu evolución y hábitos.',
      child: scaffold,
    );
  }

  Widget _buildBody(
      BuildContext context, WidgetRef ref, ProgressState progress) {
    if (progress.isLoading && progress.error == null) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primaryGreen),
      );
    }

    if (progress.error != null &&
        progress.weeklyCompliance.isEmpty &&
        progress.latestBmi == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off, color: AppColors.textLight, size: 48),
              const SizedBox(height: 12),
              const Text(
                'Error al cargar tus datos',
                style: TextStyle(
                  color: Color(0xFF1E293B),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'No se pudieron cargar los datos. Intenta de nuevo.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () =>
                    ref.read(progressProvider.notifier).loadAll(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
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
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          // Mensaje de advertencia si hubo error pero hay datos previos
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
                    child: Text(
                      progress.error!,
                      style: const TextStyle(
                          color: AppColors.error, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),

          // 1. CUADRÍCULA DE MÉTRICAS CLAVE (2x2 STAT TILES)
          _buildMetricsGrid(progress),
          const SizedBox(height: 16),

          // 2. TARJETA HERO DE IMC Y ESTADO NUTRICIONAL
          _buildBmiCard(context, progress),
          const SizedBox(height: 16),

          // 3. GRÁFICA SEMANAL EN FORMATO PÍLDORAS CON CHECKS
          _buildWeeklyChart(progress),
          const SizedBox(height: 16),

          // 4. TARJETA DE PROTOCOLO ACTIVO Y ACCESO DIARIO
          _buildActiveProtocolCard(context, progress),
        ],
      ),
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. CUADRÍCULA DE MÉTRICAS CLAVE (2x2 STAT TILES)
  // ───────────────────────────────────────────────────────────────────────────
  Widget _buildMetricsGrid(ProgressState progress) {
    final streakText = progress.streak == 1
        ? '1 Día'
        : '${progress.streak} Días';
    final weightText = progress.latestWeightKg != null
        ? '${progress.latestWeightKg!.toStringAsFixed(1)} kg'
        : '--';

    return Column(
      children: [
        Row(
          children: [
            // Tile 1: Racha Activa
            Expanded(
              child: _StatTile(
                icon: Icons.local_fire_department_rounded,
                iconBgColor: const Color(0xFFFFF3E0),
                iconColor: const Color(0xFFFF9800),
                title: streakText,
                subtitle: 'Racha activa 🔥',
              ),
            ),
            const SizedBox(width: 12),
            // Tile 2: Jugos Consumidos
            Expanded(
              child: _StatTile(
                icon: Icons.eco_rounded,
                iconBgColor: const Color(0xFFE8F5E9),
                iconColor: AppColors.primaryGreen,
                title: '${progress.weeklyJuices} Jugos',
                subtitle: 'Esta semana',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // Tile 3: Cumplimiento
            Expanded(
              child: _StatTile(
                icon: Icons.track_changes_rounded,
                iconBgColor: const Color(0xFFE0F2FE),
                iconColor: const Color(0xFF0284C7),
                title: '${progress.weeklyAverage.toStringAsFixed(0)}%',
                subtitle: 'Cumplimiento',
              ),
            ),
            const SizedBox(width: 12),
            // Tile 4: Peso Actual
            Expanded(
              child: _StatTile(
                icon: Icons.monitor_weight_outlined,
                iconBgColor: const Color(0xFFF1F5F9),
                iconColor: const Color(0xFF475569),
                title: weightText,
                subtitle: 'Peso actual',
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. TARJETA HERO DE IMC Y ESTADO NUTRICIONAL
  // ───────────────────────────────────────────────────────────────────────────
  Widget _buildBmiCard(BuildContext context, ProgressState progress) {
    final hasBmi = progress.latestBmi != null;
    final bmiColor = hasBmi
        ? Color(ProtocolModel.getCategoryColorValue(progress.latestBmi!))
        : const Color(0xFF94A3B8);

    String statusText = 'Sin calcular';
    String helperText = 'Calcula tu IMC para personalizar tu plan';

    if (hasBmi) {
      statusText = progress.bmiCategory ??
          ProtocolModel.getCategoryLabel(progress.latestBmi!);

      if (progress.latestBmi! >= 18.5 && progress.latestBmi! <= 24.9) {
        helperText = 'Rango saludable recomendado';
      } else if (progress.latestBmi! > 24.9) {
        helperText = 'En camino hacia tu peso ideal';
      } else {
        helperText = 'En proceso de recuperación nutricional';
      }
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          // Gauge Circular
          SizedBox(
            width: 80,
            height: 80,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(80, 80),
                  painter: _BmiGaugeRing(
                    color: bmiColor,
                    bmi: progress.latestBmi ?? 0.0,
                    hasBmi: hasBmi,
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      hasBmi ? progress.latestBmi!.toStringAsFixed(1) : '--',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const Text(
                      'IMC',
                      style: TextStyle(
                        fontSize: 10,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),

          // Detalles y Botón
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: bmiColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      color: bmiColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  helperText,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => context.push('/bmi-calculator'),
                  child: Text(
                    hasBmi ? 'Actualizar Peso / Recalcular' : 'Calcular mi IMC inicial',
                    style: const TextStyle(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
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

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GRÁFICA SEMANAL EN FORMATO PÍLDORAS CON CHECKS
  // ───────────────────────────────────────────────────────────────────────────
  Widget _buildWeeklyChart(ProgressState progress) {
    final compliance = progress.weeklyCompliance;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Encabezado con Porcentaje Promedio
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Cumplimiento Semanal',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${progress.weeklyAverage.toStringAsFixed(0)}% promedio',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),

          // 7 Columnas en Formato Píldora
          if (compliance.isEmpty) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Text(
                  'Registra tus jugos diarios para ver tu evolución semanal',
                  style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ] else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: compliance.map((day) {
                final isToday = day.date.day == DateTime.now().day &&
                    day.date.month == DateTime.now().month &&
                    day.date.year == DateTime.now().year;

                return _DayPillBar(
                  label: day.dayLabel,
                  percentage: day.percentage,
                  isToday: isToday,
                );
              }).toList(),
            ),
            const SizedBox(height: 18),

            // Leyenda Inferior
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'Completado',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: 20),
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'Pendiente',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. TARJETA DE PROTOCOLO ACTIVO Y ACCESO DIARIO
  // ───────────────────────────────────────────────────────────────────────────
  Widget _buildActiveProtocolCard(BuildContext context, ProgressState progress) {
    final title = progress.activeProtocolTitle ?? 'Protocolo Desintoxicación ALOEC';
    final currentDay = progress.activeProtocolCurrentDay;
    final totalDays = progress.activeProtocolTotalDays > 0
        ? progress.activeProtocolTotalDays
        : 21;
    final progressFraction = (currentDay / totalDays).clamp(0.05, 1.0);
    final percentText = (progressFraction * 100).toStringAsFixed(0);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),

          // Barra de Progreso Lineal con Bordes Redondeados
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progressFraction,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 14),

          // Fila con Conteo de Días y Botón de Acción
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$currentDay / $totalDays días ($percentText%)',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF64748B),
                ),
              ),
              GestureDetector(
                onTap: () => context.go('/home'),
                child: const Text(
                  'Ver Agenda de Hoy',
                  style: TextStyle(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: TARJETA DE MÉTRICA INDIVIDUAL (STAT TILE)
// ─────────────────────────────────────────────────────────────────────────────
class _StatTile extends StatelessWidget {
  final IconData icon;
  final Color iconBgColor;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _StatTile({
    required this.icon,
    required this.iconBgColor,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconBgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: PÍLDORA VERTICAL PARA LA GRÁFICA SEMANAL
// ─────────────────────────────────────────────────────────────────────────────
class _DayPillBar extends StatelessWidget {
  final String label;
  final double percentage;
  final bool isToday;

  const _DayPillBar({
    required this.label,
    required this.percentage,
    required this.isToday,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = percentage >= 80;
    final isPartiallyDone = percentage > 0 && percentage < 80;

    return Column(
      children: [
        // Píldora animada / estéticamente redondeada
        Container(
          width: 38,
          height: 80,
          decoration: BoxDecoration(
            color: isCompleted
                ? AppColors.primaryGreen
                : isPartiallyDone
                    ? AppColors.primaryGreen.withOpacity(0.3)
                    : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(20),
            border: isToday
                ? Border.all(color: AppColors.primaryGreen, width: 2)
                : null,
          ),
          child: isCompleted
              ? const Center(
                  child: Icon(
                    Icons.check_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                )
              : isPartiallyDone
                  ? Center(
                      child: Text(
                        '${percentage.toInt()}%',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    )
                  : null,
        ),
        const SizedBox(height: 8),

        // Etiqueta del Día
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isToday ? FontWeight.bold : FontWeight.w500,
            color: isToday ? AppColors.primaryGreen : const Color(0xFF64748B),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAINTER: ANILLO CIRCULAR GAUGE DE IMC
// ─────────────────────────────────────────────────────────────────────────────
class _BmiGaugeRing extends CustomPainter {
  final Color color;
  final double bmi;
  final bool hasBmi;

  _BmiGaugeRing({
    required this.color,
    required this.bmi,
    required this.hasBmi,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 5;

    final bgPaint = Paint()
      ..color = hasBmi ? color.withOpacity(0.15) : Colors.grey.shade200
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    // Anillo completo de fondo
    canvas.drawCircle(center, radius, bgPaint);

    if (hasBmi) {
      final activePaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..strokeCap = StrokeCap.round;

      const startAngle = -math.pi / 2;
      final clamped = bmi.clamp(15.0, 40.0);
      final factor = (clamped - 15.0) / (40.0 - 15.0);
      final sweepAngle = (2 * math.pi) * factor;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        activePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _BmiGaugeRing oldDelegate) {
    return oldDelegate.bmi != bmi ||
        oldDelegate.color != color ||
        oldDelegate.hasBmi != hasBmi;
  }
}
