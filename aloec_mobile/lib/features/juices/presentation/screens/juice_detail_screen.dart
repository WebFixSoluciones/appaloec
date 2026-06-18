import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/juice_entity.dart';
import '../../data/recipes_repository.dart';
import 'package:go_router/go_router.dart';

class JuiceDetailScreen extends StatefulWidget {
  final String juiceId;

  const JuiceDetailScreen({super.key, required this.juiceId});

  @override
  State<JuiceDetailScreen> createState() => _JuiceDetailScreenState();
}

class _JuiceDetailScreenState extends State<JuiceDetailScreen> {
  final _recipesRepo = RecipesRepository();
  RecipeEntity? _recipe;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRecipe();
  }

  Future<void> _loadRecipe() async {
    try {
      final recipe = await _recipesRepo.getRecipeById(widget.juiceId);
      setState(() {
        _recipe = recipe;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading recipe: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0, leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.black), onPressed: () => context.pop())),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
      );
    }

    if (_recipe == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0, leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.black), onPressed: () => context.pop())),
        body: const Center(child: Text('Receta no encontrada', style: TextStyle(color: Colors.grey))),
      );
    }

    final recipe = _recipe!;
    final info = recipe.nutritionalInfo;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            backgroundColor: AppColors.primaryGreen,
            leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white), onPressed: () => context.pop()),
            flexibleSpace: FlexibleSpaceBar(
              background: recipe.imageUrl.isNotEmpty
                  ? Image.network(recipe.imageUrl, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(color: Colors.green[50], child: const Icon(Icons.restaurant_menu, size: 80, color: Colors.green)))
                  : Container(color: Colors.green[50], child: const Icon(Icons.restaurant_menu, size: 80, color: Colors.green)),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title + Category
                  Row(
                    children: [
                      Expanded(
                        child: Text(recipe.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(recipe.categoryLabel, style: const TextStyle(fontSize: 11, color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  if (recipe.tags.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      children: recipe.tags.map((tag) => Chip(
                        label: Text(tag, style: const TextStyle(fontSize: 10)),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                        backgroundColor: Colors.grey[100],
                      )).toList(),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(recipe.description, style: const TextStyle(color: Colors.grey, height: 1.5)),
                  const SizedBox(height: 24),

                  // Nutrition
                  const Text('Información Nutricional', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _NutritionChip(icon: Icons.local_fire_department, label: '${info.calories} kcal', color: Colors.orange),
                      _NutritionChip(icon: Icons.fitness_center, label: '${info.protein}g proteína', color: Colors.red),
                      _NutritionChip(icon: Icons.grain, label: '${info.carbs}g carbos', color: Colors.amber),
                      _NutritionChip(icon: Icons.water_drop, label: '${info.fat}g grasas', color: Colors.blue),
                      _NutritionChip(icon: Icons.grass, label: '${info.fiber}g fibra', color: Colors.green),
                    ],
                  ),
                  if (info.vitamins.isNotEmpty || info.minerals.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        ...info.vitamins.map((v) => _TagChip(label: v, color: Colors.purple)),
                        ...info.minerals.map((m) => _TagChip(label: m, color: Colors.teal)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),

                  // Ingredients
                  if (recipe.ingredients.isNotEmpty) ...[
                    const Text('Ingredientes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 12),
                    ...recipe.ingredients.asMap().entries.map(
                      (e) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check_circle, size: 16, color: AppColors.primaryGreen),
                            const SizedBox(width: 8),
                            Expanded(child: Text(e.value, style: const TextStyle(fontSize: 14, height: 1.4))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Preparation
                  if (recipe.preparation.isNotEmpty) ...[
                    const Text('Preparación', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 12),
                    Text(recipe.preparation, style: const TextStyle(color: Colors.grey, height: 1.6, fontSize: 14)),
                    const SizedBox(height: 24),
                  ],

                  // Benefits
                  if (recipe.benefits.isNotEmpty) ...[
                    const Text('Beneficios', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const SizedBox(height: 12),
                    ...recipe.benefits.map(
                      (b) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.favorite, size: 14, color: Colors.red),
                            const SizedBox(width: 8),
                            Expanded(child: Text(b, style: const TextStyle(fontSize: 14, height: 1.4))),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NutritionChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _NutritionChip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}

class _TagChip extends StatelessWidget {
  final String label;
  final Color color;
  const _TagChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
