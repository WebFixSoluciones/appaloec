import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/juices_provider.dart';

class JuicesScreen extends ConsumerStatefulWidget {
  const JuicesScreen({super.key});

  @override
  ConsumerState<JuicesScreen> createState() => _JuicesScreenState();
}

class _JuicesScreenState extends ConsumerState<JuicesScreen> {
  final _searchCtrl = TextEditingController();
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _searchCtrl.addListener(() {
      ref.read(recipeSearchQuery.notifier).state = _searchCtrl.text;
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final recipesAsync = ref.watch(filteredRecipesProvider);
    final allRecipesAsync = ref.watch(allRecipesProvider);

    List<RecipeEntity> allRecipes = allRecipesAsync.valueOrNull ?? [];
    List<RecipeEntity> filteredRecipes = recipesAsync.valueOrNull ?? allRecipes;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Recetas Saludables',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: recipesAsync.isLoading && allRecipes.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : RefreshIndicator(
              color: AppColors.primaryGreen,
              onRefresh: () async => ref.invalidate(allRecipesProvider),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: _searchCtrl,
                      decoration: InputDecoration(
                        hintText: 'Buscar receta...',
                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
                        prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                        suffixIcon: _searchCtrl.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, color: Colors.grey, size: 18),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  ref.read(recipeSearchQuery.notifier).state = '';
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: Colors.grey.shade200),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: AppColors.primaryGreen, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 36,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _CategoryChip(
                            label: 'Todas',
                            isSelected: _selectedCategory == null,
                            onTap: () => setState(() => _selectedCategory = null),
                          ),
                          _CategoryChip(label: 'Jugos', isSelected: _selectedCategory == 'green_juice', onTap: () => setState(() => _selectedCategory = 'green_juice')),
                          _CategoryChip(label: 'Ensaladas', isSelected: _selectedCategory == 'salad', onTap: () => setState(() => _selectedCategory = 'salad')),
                          _CategoryChip(label: 'Desayunos', isSelected: _selectedCategory == 'breakfast', onTap: () => setState(() => _selectedCategory = 'breakfast')),
                          _CategoryChip(label: 'Batidos', isSelected: _selectedCategory == 'smoothie', onTap: () => setState(() => _selectedCategory = 'smoothie')),
                          _CategoryChip(label: 'Snacks', isSelected: _selectedCategory == 'snack', onTap: () => setState(() => _selectedCategory = 'snack')),
                          _CategoryChip(label: 'Platos', isSelected: _selectedCategory == 'main_dish', onTap: () => setState(() => _selectedCategory = 'main_dish')),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Recetas', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        Text(
                          '${filteredRecipes.length} resultado${filteredRecipes.length != 1 ? 's' : ''}',
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: filteredRecipes.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.restaurant_menu, size: 48, color: Colors.grey[300]),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'No se encontraron recetas',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.grey, fontSize: 14),
                                  ),
                                ],
                              ),
                            )
                          : ListView.separated(
                              itemCount: filteredRecipes.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final recipe = filteredRecipes[index];
                                return _RecipeCard(
                                  recipe: recipe,
                                  onTap: () => context.push('/juice-detail/${recipe.id}'),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryGreen : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? AppColors.primaryGreen : Colors.grey.shade300,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }
}

class _RecipeCard extends StatelessWidget {
  final RecipeEntity recipe;
  final VoidCallback onTap;

  const _RecipeCard({required this.recipe, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.grey.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 4))
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 90,
              height: 90,
              margin: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(14),
              ),
              child: recipe.imageUrl.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.network(recipe.imageUrl, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.restaurant_menu, color: Colors.green, size: 40),
                      ),
                    )
                  : const Icon(Icons.restaurant_menu, color: Colors.green, size: 40),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(recipe.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        ),
                        if (recipe.isPremium)
                          Container(
                            margin: const EdgeInsets.only(left: 4),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.amber[50],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.amber.shade200),
                            ),
                            child: const Text('PRO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.amber)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(recipe.categoryLabel, style: TextStyle(color: AppColors.primaryGreen, fontSize: 11, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(recipe.description, style: const TextStyle(color: Colors.grey, fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _InfoChip(icon: Icons.timer_outlined, label: '${recipe.prepTime} min'),
                        const SizedBox(width: 8),
                        _InfoChip(icon: Icons.local_fire_department_outlined, label: '${recipe.nutritionalInfo.calories} kcal'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(right: 12),
              child: Icon(Icons.chevron_right, color: Colors.grey, size: 20),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primaryGreen.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 12, color: AppColors.primaryGreen),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.primaryGreen, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
