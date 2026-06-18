import '../../../../core/services/notification_service.dart';

enum BmiCategory {
  underweight,
  normal,
  overweight,
  obesity1,
  obesity2,
  obesity3,
}

class ProtocolMealItem {
  final String mealType;
  final String time;
  final String label;
  final List<String> items;
  final String? icon;
  final String? recipeId;
  final String? recipeName;
  final String? recipeImageUrl;
  final String? notes;

  const ProtocolMealItem({
    required this.mealType,
    required this.time,
    required this.label,
    required this.items,
    this.icon,
    this.recipeId,
    this.recipeName,
    this.recipeImageUrl,
    this.notes,
  });

  factory ProtocolMealItem.fromMap(Map<String, dynamic> map) {
    return ProtocolMealItem(
      mealType: map['mealType'] ?? 'breakfast',
      time: map['time'] ?? '',
      label: map['label'] ?? '',
      items: List<String>.from(map['items'] ?? []),
      icon: map['icon'],
      recipeId: map['recipeId'],
      recipeName: map['recipeName'],
      recipeImageUrl: map['recipeImageUrl'],
      notes: map['notes'],
    );
  }

  ProtocolMealNotification toNotification() {
    final parts = time.replaceAll(' AM', '').replaceAll(' PM', '').split(':');
    int hour = int.tryParse(parts[0]) ?? 8;
    final int minute = int.tryParse(parts[1]) ?? 0;
    if (time.contains('PM') && hour != 12) hour += 12;
    if (time.contains('AM') && hour == 12) hour = 0;

    final body = items.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join(', ');

    return ProtocolMealNotification(
      hour: hour,
      minute: minute,
      title: '🌿 ALOEC: $time - $label',
      body: recipeName != null ? '$recipeName - $body' : body,
    );
  }
}

class ProtocolModel {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String? imageUrl;
  final String bmiCategory;
  final double? bmiMin;
  final double? bmiMax;
  final List<ProtocolMealItem> schedule;
  final List<String> importantNotes;
  final String? linkedCourseTag;
  final List<String> linkedCourses;
  final bool isPremium;
  final bool isActive;
  final int order;

  const ProtocolModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    this.imageUrl,
    required this.bmiCategory,
    this.bmiMin,
    this.bmiMax,
    required this.schedule,
    required this.importantNotes,
    this.linkedCourseTag,
    this.linkedCourses = const [],
    this.isPremium = true,
    this.isActive = true,
    this.order = 0,
  });

  factory ProtocolModel.fromFirestore(String id, Map<String, dynamic> data) {
    return ProtocolModel(
      id: id,
      title: data['title'] ?? '',
      subtitle: data['subtitle'] ?? '',
      description: data['description'] ?? '',
      imageUrl: data['imageUrl'],
      bmiCategory: data['bmiCategory'] ?? 'normal',
      bmiMin: (data['bmiMin'] as num?)?.toDouble(),
      bmiMax: (data['bmiMax'] as num?)?.toDouble(),
      schedule: (data['schedule'] as List<dynamic>? ?? [])
          .map((m) => ProtocolMealItem.fromMap(Map<String, dynamic>.from(m)))
          .toList(),
      importantNotes: List<String>.from(data['importantNotes'] ?? []),
      linkedCourseTag: data['linkedCourseTag'],
      linkedCourses: List<String>.from(data['linkedCourses'] ?? []),
      isPremium: data['isPremium'] != false,
      isActive: data['isActive'] != false,
      order: (data['order'] ?? 0).toInt(),
    );
  }

  static String getCategoryLabel(double bmi) {
    if (bmi < 18.5) return 'Bajo Peso';
    if (bmi < 25.0) return 'Peso Normal';
    if (bmi < 30.0) return 'Sobrepeso';
    if (bmi < 35.0) return 'Obesidad I';
    if (bmi < 40.0) return 'Obesidad II';
    return 'Obesidad III';
  }

  static String getBmiCategoryKey(double bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25.0) return 'normal';
    if (bmi < 30.0) return 'overweight';
    if (bmi < 35.0) return 'obesity1';
    if (bmi < 40.0) return 'obesity2';
    return 'obesity3';
  }

  static int getCategoryColorValue(double bmi) {
    if (bmi < 18.5) return 0xFF2196F3;
    if (bmi < 25.0) return 0xFF67B539;
    if (bmi < 30.0) return 0xFFFF9800;
    if (bmi < 35.0) return 0xFFFF5722;
    if (bmi < 40.0) return 0xFFE53935;
    return 0xFFB71C1C;
  }
}
