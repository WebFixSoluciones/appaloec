import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/juice_entity.dart';

class RecipesRepository {
  final FirebaseFirestore _firestore;

  RecipesRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<List<RecipeEntity>> getAllRecipes() async {
    final snapshot = await _firestore
        .collection('recipes')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();

    return snapshot.docs
        .where((doc) => doc.data()['deletedAt'] == null)
        .map((doc) => RecipeEntity.fromFirestore(doc.id, doc.data()))
        .toList();
  }

  Future<List<RecipeEntity>> getRecipesByCategory(String category) async {
    final snapshot = await _firestore
        .collection('recipes')
        .where('category', isEqualTo: category)
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();

    return snapshot.docs
        .where((doc) => doc.data()['deletedAt'] == null)
        .map((doc) => RecipeEntity.fromFirestore(doc.id, doc.data()))
        .toList();
  }

  Future<RecipeEntity?> getRecipeById(String id) async {
    final doc = await _firestore.collection('recipes').doc(id).get();
    if (!doc.exists) return null;
    return RecipeEntity.fromFirestore(doc.id, doc.data()!);
  }
}
