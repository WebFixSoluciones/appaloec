import 'package:flutter_test/flutter_test.dart';
import 'package:aloec_mobile/features/progress/presentation/providers/progress_provider.dart';

void main() {
  group('ProgressState Tests', () {
    test('Calculates weekly average correctly', () {
      final state = ProgressState(
        weeklyCompliance: [
          DailyCompliance(
            date: DateTime(2026, 10, 14),
            dayLabel: 'L',
            completed: 4,
            total: 4,
            percentage: 100.0,
          ),
          DailyCompliance(
            date: DateTime(2026, 10, 15),
            dayLabel: 'M',
            completed: 2,
            total: 4,
            percentage: 50.0,
          ),
          DailyCompliance(
            date: DateTime(2026, 10, 16),
            dayLabel: 'M',
            completed: 3,
            total: 4,
            percentage: 75.0,
          ),
          DailyCompliance(
            date: DateTime(2026, 10, 17),
            dayLabel: 'J',
            completed: 4,
            total: 4,
            percentage: 100.0,
          ),
        ],
      );

      // (100 + 50 + 75 + 100) / 4 = 325 / 4 = 81.25
      expect(state.weeklyAverage, 81.25);
      expect(state.weeklyAverage.toStringAsFixed(0), '81');
    });

    test('Handles empty weekly compliance safely', () {
      const state = ProgressState();
      expect(state.weeklyAverage, 0.0);
      expect(state.streak, 0);
      expect(state.weeklyJuices, 0);
      expect(state.latestWeightKg, isNull);
    });

    test('copyWith preserves and updates metric fields', () {
      const state = ProgressState();
      final updated = state.copyWith(
        latestBmi: 23.8,
        bmiCategory: 'Peso Normal',
        latestWeightKg: 68.5,
        latestHeightCm: 169.0,
        streak: 7,
        weeklyJuices: 18,
        activeProtocolTitle: 'Protocolo Desintoxicación Gerson',
        activeProtocolCurrentDay: 6,
        activeProtocolTotalDays: 14,
      );

      expect(updated.latestBmi, 23.8);
      expect(updated.bmiCategory, 'Peso Normal');
      expect(updated.latestWeightKg, 68.5);
      expect(updated.latestHeightCm, 169.0);
      expect(updated.streak, 7);
      expect(updated.weeklyJuices, 18);
      expect(updated.activeProtocolTitle, 'Protocolo Desintoxicación Gerson');
      expect(updated.activeProtocolCurrentDay, 6);
      expect(updated.activeProtocolTotalDays, 14);
    });
  });
}
