import 'package:flutter_test/flutter_test.dart';
import 'package:aloec_mobile/features/bmi/domain/bmi_entity.dart';

void main() {
  group('BmiEntity', () {
    test('categoryFromValue returns correct categories', () {
      expect(BmiEntity.categoryFromValue(16.0), 'underweight');
      expect(BmiEntity.categoryFromValue(18.4), 'underweight');
      expect(BmiEntity.categoryFromValue(18.5), 'normal');
      expect(BmiEntity.categoryFromValue(22.0), 'normal');
      expect(BmiEntity.categoryFromValue(24.9), 'normal');
      expect(BmiEntity.categoryFromValue(25.0), 'overweight');
      expect(BmiEntity.categoryFromValue(29.9), 'overweight');
      expect(BmiEntity.categoryFromValue(30.0), 'obese');
      expect(BmiEntity.categoryFromValue(35.0), 'obese');
    });

    test('categoryLabelFromValue returns correct labels', () {
      expect(BmiEntity.categoryLabelFromValue(16.0), 'Bajo peso');
      expect(BmiEntity.categoryLabelFromValue(22.0), 'Peso normal');
      expect(BmiEntity.categoryLabelFromValue(27.0), 'Sobrepeso');
      expect(BmiEntity.categoryLabelFromValue(32.0), 'Obesidad');
    });

    test('categoryColorValueFromValue returns correct colors', () {
      expect(BmiEntity.categoryColorValueFromValue(16.0), 0xFF42A5F5);
      expect(BmiEntity.categoryColorValueFromValue(22.0), 0xFF2E7D32);
      expect(BmiEntity.categoryColorValueFromValue(27.0), 0xFFFF9800);
      expect(BmiEntity.categoryColorValueFromValue(32.0), 0xFFD32F2F);
    });

    test('toMap produces correct map', () {
      final entity = BmiEntity(
        uid: 'user123',
        age: 30,
        heightCm: 170,
        weightKg: 70,
        bmiValue: 24.2,
        status: 'normal',
        createdAt: DateTime(2025, 1, 15),
      );

      final map = entity.toMap();
      expect(map['uid'], 'user123');
      expect(map['age'], 30);
      expect(map['heightCm'], 170);
      expect(map['weightKg'], 70);
      expect(map['bmiValue'], 24.2);
      expect(map['status'], 'normal');
      expect(map['createdAt'], '2025-01-15T00:00:00.000');
    });

    test('fromFirestore creates correct entity', () {
      final data = {
        'uid': 'user123',
        'age': 25,
        'heightCm': 165.5,
        'weightKg': 60.0,
        'bmiValue': 21.9,
        'status': 'normal',
        'createdAt': DateTime(2025, 3, 10),
      };

      final entity = BmiEntity.fromFirestore('record1', data);
      expect(entity.id, 'record1');
      expect(entity.uid, 'user123');
      expect(entity.age, 25);
      expect(entity.heightCm, 165.5);
      expect(entity.weightKg, 60.0);
      expect(entity.bmiValue, 21.9);
      expect(entity.status, 'normal');
    });
  });
}
