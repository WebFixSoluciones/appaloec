import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  /// Inicializa el plugin y solicita permisos al sistema operativo.
  Future<void> initialize() async {
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

    await _plugin.initialize(initSettings);
  }

  /// Cancela TODAS las notificaciones programadas previamente.
  Future<void> cancelAllNotifications() async {
    await _plugin.cancelAll();
  }

  /// Programa una notificación diaria recurrente a la hora especificada.
  ///
  /// [id] - ID único de la notificación (usa el índice de la comida).
  /// [hour] - Hora de la notificación (formato 24h).
  /// [minute] - Minuto de la notificación.
  /// [title] - Título de la notificación (Ej: "¡Hora de tu Desayuno! 🥤").
  /// [body] - Cuerpo del mensaje con los ítems del protocolo.
  Future<void> scheduleDailyNotification({
    required int id,
    required int hour,
    required int minute,
    required String title,
    required String body,
  }) async {
    final AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'aloec_protocol_channel',
      'Recordatorios de Protocolo ALOEC',
      channelDescription:
          'Notificaciones diarias de recordatorio de comidas y actividades del protocolo de salud.',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      color: const Color(0xFF67B539),
      ticker: 'aloec_ticker',
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final NotificationDetails notifDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _plugin.periodicallyShow(
      id,
      title,
      body,
      RepeatInterval.daily,
      notifDetails,
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
    );
  }

  /// Programa todas las notificaciones para un protocolo dado.
  ///
  /// [meals] - Lista de comidas/actividades con su hora y descripción.
  Future<void> scheduleProtocolNotifications(
      List<ProtocolMealNotification> meals) async {
    await cancelAllNotifications();

    for (int i = 0; i < meals.length; i++) {
      final meal = meals[i];
      await scheduleDailyNotification(
        id: i,
        hour: meal.hour,
        minute: meal.minute,
        title: meal.title,
        body: meal.body,
      );
    }

    debugPrint(
        '✅ [NotificationService] ${meals.length} recordatorios diarios programados.');
  }
}

/// Modelo de datos para una notificación de comida del protocolo.
class ProtocolMealNotification {
  final int hour;
  final int minute;
  final String title;
  final String body;

  const ProtocolMealNotification({
    required this.hour,
    required this.minute,
    required this.title,
    required this.body,
  });
}
