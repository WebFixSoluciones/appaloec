class NutritionalInfo {
  final int calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;
  final List<String> vitamins;
  final List<String> minerals;

  const NutritionalInfo({
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.fiber,
    this.vitamins = const [],
    this.minerals = const [],
  });

  factory NutritionalInfo.fromMap(Map<String, dynamic> map) {
    return NutritionalInfo(
      calories: (map['calories'] ?? 0).toInt(),
      protein: (map['proteins'] ?? map['protein'] ?? 0).toDouble(),
      carbs: (map['carbs'] ?? 0).toDouble(),
      fat: (map['fats'] ?? map['fat'] ?? 0).toDouble(),
      fiber: (map['fiber'] ?? 0).toDouble(),
      vitamins: List<String>.from(map['vitamins'] ?? []),
      minerals: List<String>.from(map['minerals'] ?? []),
    );
  }
}

class RecipeEntity {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final List<String> ingredients;
  final String preparation;
  final List<String> benefits;
  final NutritionalInfo nutritionalInfo;
  final String category;
  final List<String> tags;
  final int prepTime;
  final String difficulty;
  final bool isPremium;
  final bool isActive;
  final int order;

  const RecipeEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.ingredients,
    required this.preparation,
    required this.benefits,
    required this.nutritionalInfo,
    required this.category,
    this.tags = const [],
    this.prepTime = 10,
    this.difficulty = 'Fácil',
    this.isPremium = false,
    this.isActive = true,
    this.order = 0,
  });

  factory RecipeEntity.fromFirestore(String id, Map<String, dynamic> data) {
    final nutritionalValues = data['nutritionalValues'] as Map<String, dynamic>? ?? {};
    return RecipeEntity(
      id: id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      imageUrl: data['imageUrl'] ?? '',
      ingredients: List<String>.from(data['ingredients'] ?? []),
      preparation: data['preparation'] ?? '',
      benefits: List<String>.from(data['benefits'] ?? []),
      nutritionalInfo: NutritionalInfo.fromMap(nutritionalValues),
      category: data['category'] ?? 'other',
      tags: List<String>.from(data['tags'] ?? []),
      prepTime: (data['prepTime'] ?? 10).toInt(),
      difficulty: data['difficulty'] ?? 'Fácil',
      isPremium: data['isPremium'] == true,
      isActive: data['isActive'] != false,
      order: (data['order'] ?? 0).toInt(),
    );
  }

  String get categoryLabel {
    switch (category) {
      case 'green_juice': return 'Jugo Verde';
      case 'salad': return 'Ensalada';
      case 'breakfast': return 'Desayuno';
      case 'snack': return 'Snack';
      case 'main_dish': return 'Plato Principal';
      case 'smoothie': return 'Batido';
      default: return 'Otro';
    }
  }
}
