import 'package:flutter_test/flutter_test.dart';
import 'package:aloec_mobile/core/services/notification_service.dart';
import 'package:aloec_mobile/features/subscriptions/domain/protocol_model.dart';
import 'package:aloec_mobile/features/profile/presentation/screens/notifications_screen.dart';
import 'package:flutter/material.dart';

void main() {
  group('NotificationService & Models', () {
    test('ProtocolMealNotification holds expected values', () {
      const notif = ProtocolMealNotification(
        hour: 10,
        minute: 30,
        title: 'Jugo Verde',
        body: 'Hora de renovarte',
        payload: '/home',
      );

      expect(notif.hour, 10);
      expect(notif.minute, 30);
      expect(notif.title, 'Jugo Verde');
      expect(notif.body, 'Hora de renovarte');
      expect(notif.payload, '/home');
    });

    test('ProtocolMealItem converts correctly to ProtocolMealNotification', () {
      const item = ProtocolMealItem(
        mealType: 'mid_morning',
        time: '10:30 AM',
        label: 'Media Mañana',
        items: ['Jugo Verde Renovador', '1 Limón'],
        recipeName: 'Jugo Verde ALOEC',
      );

      final notif = item.toNotification();
      expect(notif.hour, 10);
      expect(notif.minute, 30);
      expect(notif.title, contains('Media Mañana'));
      expect(notif.body, contains('Jugo Verde ALOEC'));
    });

    test('ProtocolMealItem handles 24h conversion and PM times correctly', () {
      const pmItem = ProtocolMealItem(
        mealType: 'dinner',
        time: '06:30 PM',
        label: 'Cena Ligera',
        items: ['Sopa de calabacín'],
      );

      final notif = pmItem.toNotification();
      expect(notif.hour, 18);
      expect(notif.minute, 30);
    });

    test('MealReminderModel initializes and updates state correctly', () {
      final model = MealReminderModel(
        id: 'lunch',
        label: 'Almuerzo',
        defaultTime: '13:00',
        time: '13:00',
        enabled: true,
        icon: Icons.restaurant,
        recipeTitle: 'Almuerzo Depurativo',
        recipeDescription: 'Comida rica en fibra viva',
        ingredients: ['Ensalada', 'Pollo'],
        protocolTip: 'Masticar despacio',
      );

      expect(model.id, 'lunch');
      expect(model.time, '13:00');
      expect(model.enabled, true);

      model.time = '13:30';
      model.enabled = false;
      expect(model.time, '13:30');
      expect(model.enabled, false);
    });
  });
}
