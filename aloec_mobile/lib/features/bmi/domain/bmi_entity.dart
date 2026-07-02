import 'package:cloud_firestore/cloud_firestore.dart';

class BmiEntity {
  final String? id;
  final String uid;
  final int age;
  final double heightCm;
  final double weightKg;
  final double bmiValue;
  final String status;
  final DateTime createdAt;

  BmiEntity({
    this.id,
    required this.uid,
    required this.age,
    required this.heightCm,
    required this.weightKg,
    required this.bmiValue,
    required this.status,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'age': age,
      'heightCm': heightCm,
      'weightKg': weightKg,
      'bmiValue': bmiValue,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory BmiEntity.fromFirestore(String id, Map<String, dynamic> data) {
    final rawCreatedAt = data['createdAt'];
    DateTime createdAt;
    if (rawCreatedAt is DateTime) {
      createdAt = rawCreatedAt;
    } else {
      createdAt = (rawCreatedAt as dynamic).toDate() as DateTime;
    }
    return BmiEntity(
      id: id,
      uid: data['uid'] ?? '',
      age: (data['age'] ?? 0) as int,
      heightCm: (data['heightCm'] ?? 0).toDouble(),
      weightKg: (data['weightKg'] ?? 0).toDouble(),
      bmiValue: (data['bmiValue'] ?? 0).toDouble(),
      status: data['status'] ?? '',
      createdAt: createdAt,
    );
  }

  static String categoryFromValue(double bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  static String categoryLabelFromValue(double bmi) {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  static int categoryColorValueFromValue(double bmi) {
    if (bmi < 18.5) return 0xFF42A5F5;
    if (bmi < 25) return 0xFF2E7D32;
    if (bmi < 30) return 0xFFFF9800;
    return 0xFFD32F2F;
  }
}
