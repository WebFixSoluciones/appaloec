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
}
