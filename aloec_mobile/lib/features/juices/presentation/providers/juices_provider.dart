import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/juice_entity.dart';
import '../../data/recipes_repository.dart';

final recipesRepositoryProvider = Provider<RecipesRepository>((ref) {
  return RecipesRepository();
});

final allRecipesProvider = FutureProvider.autoDispose<List<RecipeEntity>>((ref) async {
  final repo = ref.watch(recipesRepositoryProvider);
  return repo.getAllRecipes();
});

final recipeByIdProvider = FutureProvider.autoDispose.family<RecipeEntity?, String>((ref, id) async {
  final repo = ref.watch(recipesRepositoryProvider);
  return repo.getRecipeById(id);
});

final recipeSearchQuery = StateProvider.autoDispose<String>((ref) => '');

final filteredRecipesProvider = FutureProvider.autoDispose<List<RecipeEntity>>((ref) async {
  final query = ref.watch(recipeSearchQuery).toLowerCase();
  final repo = ref.watch(recipesRepositoryProvider);
  final recipes = await repo.getAllRecipes();
  if (query.isEmpty) return recipes;
  return recipes.where((r) {
    return r.title.toLowerCase().contains(query) ||
        r.description.toLowerCase().contains(query) ||
        r.tags.any((t) => t.toLowerCase().contains(query));
  }).toList();
});
