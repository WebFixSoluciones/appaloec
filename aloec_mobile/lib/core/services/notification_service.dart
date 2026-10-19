import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;
  static ValueChanged<String?>? onNotificationTap;

  /// Inicializa el plugin, zonas horarias y canal de Android.
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      tz.initializeTimeZones();
    } catch (e) {
      debugPrint('⚠️ [NotificationService] TimeZone init: $e');
    }

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        debugPrint('🔔 [NotificationService] Tap recibido: ${response.payload}');
        onNotificationTap?.call(response.payload);
      },
    );

    // Crear el canal explícitamente en Android para garantizar sonido y máxima visibilidad
    try {
      final androidPlugin = _plugin.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(
          const AndroidNotificationChannel(
            'aloec_protocol_channel',
            'Recordatorios de Protocolo ALOEC',
            description:
                'Notificaciones diarias de recordatorio de comidas y actividades del protocolo de salud.',
            importance: Importance.max,
            playSound: true,
            enableVibration: true,
          ),
        );
      }
    } catch (e) {
      debugPrint('⚠️ [NotificationService] Error creando canal Android: $e');
    }

    _initialized = true;
  }

  /// Cancela TODAS las notificaciones programadas previamente.
  Future<void> cancelAllNotifications() async {
    try {
      await _plugin.cancelAll();
      debugPrint('🔕 [NotificationService] Todas las notificaciones canceladas');
    } catch (e) {
      debugPrint('⚠️ [NotificationService] Error al cancelar notificaciones: $e');
    }
  }

  /// Solicita permisos de notificación al sistema operativo (Android 13+ / iOS).
  Future<bool> requestPermission() async {
    try {
      final androidImplementation =
          _plugin.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      final grantedAndroid =
          await androidImplementation?.requestNotificationsPermission();

      final iosImplementation =
          _plugin.resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>();
      final grantedIos = await iosImplementation?.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );

      return (grantedAndroid ?? true) && (grantedIos ?? true);
    } catch (e) {
      debugPrint('⚠️ [NotificationService] Error al solicitar permisos: $e');
      return false;
    }
  }

  NotificationDetails _buildNotificationDetails({
    String? channelDescription,
  }) {
    final AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'aloec_protocol_channel',
      'Recordatorios de Protocolo ALOEC',
      channelDescription: channelDescription ??
          'Notificaciones diarias de recordatorio de comidas y actividades del protocolo de salud.',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      color: const Color(0xFF67B539),
      ticker: 'aloec_ticker',
      enableVibration: true,
      playSound: true,
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    return NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
  }

  /// Envía una notificación INMEDIATA al dispositivo para pruebas de usuario.
  Future<bool> showInstantNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    try {
      await initialize();
      final hasPermission = await requestPermission();
      if (!hasPermission) {
        debugPrint('⚠️ [NotificationService] Permiso de notificación denegado');
      }

      await _plugin.show(
        DateTime.now().millisecond,
        title,
        body,
        _buildNotificationDetails(),
        payload: payload,
      );
      debugPrint('✅ [NotificationService] Notificación instantánea enviada: $title');
      return true;
    } catch (e) {
      debugPrint('⚠️ [NotificationService] Error en notificación instantánea: $e');
      return false;
    }
  }

  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    try {
      final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
      tz.TZDateTime scheduledDate =
          tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
      if (scheduledDate.isBefore(now)) {
        scheduledDate = scheduledDate.add(const Duration(days: 1));
      }
      return scheduledDate;
    } catch (_) {
      // Fallback a hora estándar si tz.local no está mapeado
      final now = DateTime.now();
      DateTime dt = DateTime(now.year, now.month, now.day, hour, minute);
      if (dt.isBefore(now)) {
        dt = dt.add(const Duration(days: 1));
      }
      return tz.TZDateTime.from(dt, tz.UTC);
    }
  }

  /// Programa una notificación diaria recurrente a la hora exacta especificada.
  Future<void> scheduleDailyNotification({
    required int id,
    required int hour,
    required int minute,
    required String title,
    required String body,
    String? payload,
  }) async {
    await initialize();
    final notifDetails = _buildNotificationDetails();

    try {
      final scheduledDate = _nextInstanceOfTime(hour, minute);
      await _plugin.zonedSchedule(
        id,
        title,
        body,
        scheduledDate,
        notifDetails,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.time,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: payload,
      );
      debugPrint(
          '⏰ [NotificationService] Programada notificación #$id a las $hour:$minute: $title');
    } catch (e) {
      debugPrint(
          '⚠️ [NotificationService] zonedSchedule falló, intentando fallback periódica: $e');
      try {
        await _plugin.periodicallyShow(
          id,
          title,
          body,
          RepeatInterval.daily,
          notifDetails,
          androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        );
      } catch (err) {
        debugPrint('⚠️ [NotificationService] Fallback periódica falló: $err');
      }
    }
  }

  /// Programa todas las notificaciones para un protocolo dado.
  Future<bool> scheduleProtocolNotifications(
      List<ProtocolMealNotification> meals) async {
    try {
      await initialize();
      await cancelAllNotifications();

      for (int i = 0; i < meals.length; i++) {
        final meal = meals[i];
        await scheduleDailyNotification(
          id: i,
          hour: meal.hour,
          minute: meal.minute,
          title: meal.title,
          body: meal.body,
          payload: meal.payload,
        );
      }

      debugPrint(
          '✅ [NotificationService] ${meals.length} recordatorios diarios programados.');
      return true;
    } catch (e) {
      debugPrint(
          '⚠️ [NotificationService] Error programando notificaciones: $e');
      return false;
    }
  }
}

/// Modelo de datos para una notificación de comida del protocolo.
class ProtocolMealNotification {
  final int hour;
  final int minute;
  final String title;
  final String body;
  final String? payload;

  const ProtocolMealNotification({
    required this.hour,
    required this.minute,
    required this.title,
    required this.body,
    this.payload,
  });
}
