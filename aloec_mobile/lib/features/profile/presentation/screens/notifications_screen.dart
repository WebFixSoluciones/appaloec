import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/notification_service.dart';

class MealReminderModel {
  final String id;
  final String label;
  final String defaultTime;
  String time;
  bool enabled;
  final IconData icon;
  final bool isJuice;
  final String recipeTitle;
  final String recipeDescription;
  final List<String> ingredients;
  final String protocolTip;

  MealReminderModel({
    required this.id,
    required this.label,
    required this.defaultTime,
    required this.time,
    required this.enabled,
    required this.icon,
    this.isJuice = false,
    required this.recipeTitle,
    required this.recipeDescription,
    required this.ingredients,
    required this.protocolTip,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _remindersEnabled = true;
  bool _hydrationEnabled = true;
  bool _tipsEnabled = true;
  bool _loading = true;
  bool _isSaving = false;

  late final List<MealReminderModel> _meals = [
    MealReminderModel(
      id: 'breakfast',
      label: 'Desayuno',
      defaultTime: '08:00',
      time: '08:00',
      enabled: true,
      icon: Icons.wb_sunny_outlined,
      recipeTitle: 'Desayuno Nutritivo & Activador',
      recipeDescription:
          'Momento para encender tu metabolismo con alimentos limpios y suplementación clave del protocolo.',
      ingredients: [
        '1 Cápsula de aceite de hígado de bacalao',
        'Huevos de campo o medio aguacate con sal marina',
        'Infusión herbal tibia (manzanilla o menta)',
        'Caminata matutina de 15 a 20 minutos',
      ],
      protocolTip:
          'Toma los suplementos con abundante agua tibia y evita azúcares o harinas refinadas.',
    ),
    MealReminderModel(
      id: 'mid_morning',
      label: 'Media Mañana / Jugo Verde',
      defaultTime: '10:30',
      time: '10:30',
      enabled: true,
      icon: Icons.eco_outlined,
      isJuice: true,
      recipeTitle: 'Jugo Verde Renovador ALOEC',
      recipeDescription:
          'El pilar de la jugoterapia. Aporta clorofila viva, oxigena cada célula y alcaliniza tu cuerpo.',
      ingredients: [
        '1 taza de espinacas frescas lavadas',
        '2 ramas crujientes de apio',
        '1/2 pepino con piel',
        '1 manzana verde para dar sabor y enzimas',
        'Zumo recién exprimido de 1 limón',
        '200 ml de agua purificada o mineral',
      ],
      protocolTip:
          'Bebe lentamente ensalivando cada sorbo para facilitar la absorción enzimática inmediata.',
    ),
    MealReminderModel(
      id: 'lunch',
      label: 'Almuerzo',
      defaultTime: '13:00',
      time: '13:00',
      enabled: true,
      icon: Icons.restaurant_outlined,
      recipeTitle: 'Almuerzo Depurativo Equilibrado',
      recipeDescription:
          'Comida principal rica en fibra viva, vegetales coloridos y proteína magra de digestión limpia.',
      ingredients: [
        'Ensalada grande de hojas verdes mixtas',
        'Proteína limpia: pechuga orgánica o pescado blanco',
        '1 cucharada de aceite de oliva extra virgen prensado en frío',
        'Semillas de chía o lino molidas',
      ],
      protocolTip:
          'Mastica despacio al menos 20 veces cada bocado para evitar pesadez e inflamación.',
    ),
    MealReminderModel(
      id: 'mid_afternoon',
      label: 'Media Tarde / Jugo',
      defaultTime: '15:30',
      time: '15:30',
      enabled: true,
      icon: Icons.apple_outlined,
      isJuice: true,
      recipeTitle: 'Jugo de Zanahoria & Antioxidantes',
      recipeDescription:
          'Recarga profunda de betacarotenos y antioxidantes para evitar la fatiga y ansiedad vespertina.',
      ingredients: [
        '3 zanahorias medianas',
        '1 manzana roja o verde',
        '1 trozo pequeño de jengibre fresco (1 cm)',
        '1 cápsula de selenio (según indicación de tu plan)',
      ],
      protocolTip:
          'Excelente para mantener la energía constante sin provocar picos de insulina.',
    ),
    MealReminderModel(
      id: 'dinner',
      label: 'Cena Ligera',
      defaultTime: '18:30',
      time: '18:30',
      enabled: true,
      icon: Icons.nights_stay_outlined,
      recipeTitle: 'Cena Restauradora y Digestiva',
      recipeDescription:
          'Preparación reconfortante y tibia para permitir la regeneración celular durante la noche.',
      ingredients: [
        'Crema o sopa tibia de calabacín y vegetales al vapor',
        'Infusión digestiva relajante (toronjil o valeriana)',
        'Enema de café a las 21h00 si tu protocolo activo lo contempla',
      ],
      protocolTip:
          'Cena al menos 2 horas y media antes de acostarte para un sueño verdaderamente reparador.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final doc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get()
          .timeout(const Duration(seconds: 6));

      if (doc.exists && mounted) {
        final data = doc.data()!;
        setState(() {
          _remindersEnabled = data['notificationsEnabled'] != false;
          _hydrationEnabled = data['hydrationReminder'] != false;
          _tipsEnabled = data['tipsNotifications'] != false;

          if (data['reminderSettings'] != null) {
            final settings = data['reminderSettings'] as List;
            for (final s in settings) {
              final label = s['label'] as String?;
              final time = s['time'] as String?;
              final enabled = s['enabled'] as bool?;

              final match = _meals.where((m) => m.id == label).firstOrNull;
              if (match != null) {
                if (time != null && time.isNotEmpty) match.time = time;
                if (enabled != null) match.enabled = enabled;
              }
            }
          }
        });
      }
    } catch (e) {
      debugPrint('Error cargando recordatorios: $e');
    }

    if (mounted) setState(() => _loading = false);
  }

  String _getNextNotificationInfo() {
    if (!_remindersEnabled) return 'Recordatorios en pausa';

    final now = TimeOfDay.now();
    final nowMinutes = now.hour * 60 + now.minute;

    MealReminderModel? nextMeal;
    int minDiff = 999999;

    for (final m in _meals) {
      if (!m.enabled) continue;
      final parts = m.time.split(':');
      if (parts.length != 2) continue;
      final h = int.tryParse(parts[0]) ?? 0;
      final min = int.tryParse(parts[1]) ?? 0;
      final mealMinutes = h * 60 + min;

      int diff = mealMinutes - nowMinutes;
      if (diff <= 0) diff += 24 * 60; // Día siguiente

      if (diff < minDiff) {
        minDiff = diff;
        nextMeal = m;
      }
    }

    if (nextMeal == null) return 'Sin recordatorios activos';
    return 'Próximo aviso: ${nextMeal.time} • ${nextMeal.label}';
  }

  Future<void> _save() async {
    if (_isSaving) return;
    setState(() => _isSaving = true);

    final user = FirebaseAuth.instance.currentUser;
    final ns = NotificationService();

    try {
      if (user != null) {
        await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
          'notificationsEnabled': _remindersEnabled,
          'hydrationReminder': _hydrationEnabled,
          'tipsNotifications': _tipsEnabled,
          'reminderSettings': _meals
              .map((m) => {
                    'label': m.id,
                    'time': m.time,
                    'enabled': m.enabled,
                  })
              .toList(),
        }, SetOptions(merge: true));
      }

      if (_remindersEnabled) {
        final notifications = <ProtocolMealNotification>[];
        for (final meal in _meals) {
          if (!meal.enabled) continue;
          final parts = meal.time.split(':');
          if (parts.length != 2) continue;
          final h = int.tryParse(parts[0]) ?? 8;
          final m = int.tryParse(parts[1]) ?? 0;

          notifications.add(ProtocolMealNotification(
            hour: h,
            minute: m,
            title: '🌿 ${meal.label} ALOEC',
            body: '${meal.recipeTitle} • Toca para ver tu receta y guía.',
            payload: '/home',
          ));
        }
        await ns.scheduleProtocolNotifications(notifications);
      } else {
        await ns.cancelAllNotifications();
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.white, size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Preferencias guardadas y recordatorios programados',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.primaryGreen,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al guardar preferencias: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _sendTestNotification() async {
    final ns = NotificationService();
    final ok = await ns.showInstantNotification(
      title: '🥤 ¡Hora de tu Jugo Verde ALOEC!',
      body: 'Tu cuerpo se revitaliza hoy. Toca para ver tu receta y guía.',
      payload: '/home',
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(ok ? Icons.notifications_active : Icons.error_outline,
                  color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  ok
                      ? '¡Aviso enviado! Desliza la barra superior de tu celular para verlo.'
                      : 'No se pudo enviar. Verifica los permisos de notificación en tu teléfono.',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          backgroundColor: ok ? AppColors.primaryGreen : AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  void _showMealDetailModal(MealReminderModel meal) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.fromLTRB(
              24, 16, 24, MediaQuery.of(ctx).viewInsets.bottom + 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pill handle
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
              const SizedBox(height: 20),

              // Header con Icono y Categoría
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(meal.icon,
                        color: AppColors.primaryGreen, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            meal.isJuice
                                ? 'JUGOTERAPIA ALOEC'
                                : 'MOMENTO DEL PROTOCOLO',
                            style: const TextStyle(
                              color: AppColors.primaryGreen,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          meal.label,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Text(
                      meal.time,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: AppColors.textDark,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Título y Descripción de la receta
              Text(
                meal.recipeTitle,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                meal.recipeDescription,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              // Ingredientes o Guía
              const Text(
                'Ingredientes y Pasos Clave:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 10),
              ...meal.ingredients.map(
                (item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 2),
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: AppColors.primaryGreen,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check,
                            size: 10, color: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          item,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textDark,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Tarjeta de Consejo del Protocolo
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.lightbulb_outline,
                        color: AppColors.primaryGreen, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        meal.protocolTip,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF166534),
                          height: 1.35,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Botón de Acción directa a Hoy
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    context.go('/home');
                  },
                  icon: const Icon(Icons.calendar_today, size: 18),
                  label: const Text(
                    'Ver en mi Protocolo Diario',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
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
    if (_loading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAF8),
        appBar: AppBar(
          title: const Text('Notificaciones',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
          backgroundColor: Colors.white,
          foregroundColor: AppColors.textDark,
          elevation: 0,
          centerTitle: true,
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.primaryGreen),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF8),
      appBar: AppBar(
        title: const Text(
          'Notificaciones',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 17,
            color: AppColors.textDark,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              size: 20, color: AppColors.textDark),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _save,
            child: _isSaving
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.primaryGreen),
                  )
                : const Text(
                    'Guardar',
                    style: TextStyle(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        children: [
          // 1. Hero Card: Recordatorios Automáticos
          _buildHeroCard(),
          const SizedBox(height: 24),

          // 2. Horarios de Jugos y Comidas
          const Text(
            'Horarios de Jugos y Comidas',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Toca una comida para ver su receta y guía, o ajusta la hora de aviso.',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 14),

          ..._meals.map((meal) => _buildMealRow(meal)),
          const SizedBox(height: 24),

          // 3. Otros Hábitos
          const Text(
            'Otros Hábitos',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 12),
          _buildHabitSwitch(
            icon: Icons.water_drop_outlined,
            title: 'Recordatorio de Hidratación (Agua)',
            subtitle: 'Avisos periódicos cada 2 horas para beber agua viva',
            value: _hydrationEnabled,
            onChanged: (val) => setState(() => _hydrationEnabled = val),
          ),
          const SizedBox(height: 10),
          _buildHabitSwitch(
            icon: Icons.local_fire_department_outlined,
            title: 'Nuevas Recetas y Consejos de Salud',
            subtitle: 'Noticias y recomendaciones de salud natural de ALOEC',
            value: _tipsEnabled,
            onChanged: (val) => setState(() => _tipsEnabled = val),
          ),
          const SizedBox(height: 24),

          // 4. Tarjeta de Comprobación y Prueba Inmediata en Dispositivo
          _buildDeviceTestCard(),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: _isSaving ? null : _save,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: _isSaving
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text(
                    'Guardar Preferencias',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9), // Menta suave
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFC8E6C9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.notifications_active,
                    color: Colors.white, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Recordatorios Automáticos',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.textDark,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Sincronizado con tu protocolo activo',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF2E7D32),
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: _remindersEnabled,
                activeColor: AppColors.primaryGreen,
                activeTrackColor: AppColors.primaryGreen.withValues(alpha: 0.35),
                onChanged: (val) => setState(() => _remindersEnabled = val),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Chip de Próximo Aviso
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: const Color(0xFFA5D6A7)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.schedule, size: 14, color: AppColors.primaryGreen),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    _getNextNotificationInfo(),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryGreen,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMealRow(MealReminderModel meal) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _showMealDetailModal(meal),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                // Icono
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: meal.isJuice
                        ? const Color(0xFFE8F5E9)
                        : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    meal.icon,
                    size: 20,
                    color: meal.isJuice
                        ? AppColors.primaryGreen
                        : AppColors.textDark,
                  ),
                ),
                const SizedBox(width: 12),

                // Nombre de la comida
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        meal.label,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: meal.enabled
                              ? AppColors.textDark
                              : Colors.grey.shade400,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        meal.recipeTitle,
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Píldora de Hora (Tappable para editar)
                GestureDetector(
                  onTap: () async {
                    final parts = meal.time.split(':');
                    final initHour = int.tryParse(parts[0]) ?? 8;
                    final initMin = int.tryParse(parts[1]) ?? 0;

                    final picked = await showTimePicker(
                      context: context,
                      initialTime:
                          TimeOfDay(hour: initHour, minute: initMin),
                      builder: (context, child) {
                        return Theme(
                          data: Theme.of(context).copyWith(
                            colorScheme: const ColorScheme.light(
                              primary: AppColors.primaryGreen,
                              onPrimary: Colors.white,
                              onSurface: AppColors.textDark,
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );

                    if (picked != null) {
                      setState(() {
                        meal.time =
                            '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
                      });
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: meal.isJuice
                          ? AppColors.primaryGreen
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                      border: meal.isJuice
                          ? null
                          : Border.all(color: Colors.grey.shade300),
                    ),
                    child: Text(
                      meal.time,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: meal.isJuice
                            ? Colors.white
                            : AppColors.textDark,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Switch
                Switch(
                  value: meal.enabled && _remindersEnabled,
                  activeColor: AppColors.primaryGreen,
                  onChanged: _remindersEnabled
                      ? (val) => setState(() => meal.enabled = val)
                      : null,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHabitSwitch({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.blue.shade700, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            activeColor: AppColors.primaryGreen,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceTestCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.smartphone,
                    color: AppColors.primaryGreen, size: 20),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Prueba en tu Teléfono',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.textDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Comprueba inmediatamente que las notificaciones con sonido y vibración llegan a la barra superior de tu dispositivo.',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600, height: 1.4),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              onPressed: _sendTestNotification,
              icon: const Icon(Icons.notifications_active_outlined, size: 18),
              label: const Text(
                'Enviar Notificación de Prueba Ahora',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(color: AppColors.primaryGreen, width: 1.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
