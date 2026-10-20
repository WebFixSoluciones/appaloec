import 'package:flutter_test/flutter_test.dart';

// Funciones de cálculo exactas implementadas en BmiCalculatorScreen
double parseHeightToMeters(String raw, {bool isMetric = true}) {
  final clean = raw.replaceAll(',', '.').trim();
  final val = double.tryParse(clean) ?? 0.0;
  if (val <= 0) return 0.0;
  if (!isMetric) {
    return val * 0.0254; // pulgadas a metros
  }
  if (val < 3.0) {
    return val; // escrito en metros (ej. 1.56)
  } else if (val >= 30.0 && val <= 280.0) {
    return val / 100.0; // escrito en centímetros (ej. 156)
  }
  return val / 100.0;
}

double parseWeightToKg(String raw, {bool isMetric = true}) {
  final clean = raw.replaceAll(',', '.').trim();
  final val = double.tryParse(clean) ?? 0.0;
  if (val <= 0) return 0.0;
  if (!isMetric) {
    return val * 0.45359237; // libras a kilogramos
  }
  return val;
}

double calculateBmi(double weightKg, double heightM) {
  if (heightM <= 0) return 0.0;
  return weightKg / (heightM * heightM);
}

void main() {
  group('BMI Auto-detection and Calculation Tests', () {
    test('User case: 1.56 m and 100 kg calculates 41.1 IMC, NOT 410913.9', () {
      final heightM = parseHeightToMeters('1.56');
      final weightKg = parseWeightToKg('100');
      final bmi = calculateBmi(weightKg, heightM);

      expect(heightM, closeTo(1.56, 0.001));
      expect(weightKg, 100.0);
      expect(bmi, closeTo(41.09, 0.01));
      expect(bmi.toStringAsFixed(1), '41.1');
    });

    test('User case with comma: 1,56 m and 100 kg calculates 41.1 IMC', () {
      final heightM = parseHeightToMeters('1,56');
      final weightKg = parseWeightToKg('100');
      final bmi = calculateBmi(weightKg, heightM);

      expect(heightM, closeTo(1.56, 0.001));
      expect(bmi.toStringAsFixed(1), '41.1');
    });

    test('User case in centimeters: 156 cm and 100 kg calculates 41.1 IMC', () {
      final heightM = parseHeightToMeters('156');
      final weightKg = parseWeightToKg('100');
      final bmi = calculateBmi(weightKg, heightM);

      expect(heightM, closeTo(1.56, 0.001));
      expect(bmi.toStringAsFixed(1), '41.1');
    });

    test('Calculates healthy weight range accurately for 1.56 m', () {
      const heightM = 1.56;
      final minHealthyWeight = 18.5 * (heightM * heightM);
      final maxHealthyWeight = 24.9 * (heightM * heightM);

      expect(minHealthyWeight, closeTo(45.02, 0.05));
      expect(maxHealthyWeight, closeTo(60.59, 0.05));
      expect(minHealthyWeight.toStringAsFixed(1), '45.0');
      expect(maxHealthyWeight.toStringAsFixed(1), '60.6');
    });

    test('Standard normal BMI case: 1.70 m and 65 kg', () {
      final heightM = parseHeightToMeters('1.70');
      final weightKg = parseWeightToKg('65');
      final bmi = calculateBmi(weightKg, heightM);

      expect(bmi.toStringAsFixed(1), '22.5');
    });
  });
}
