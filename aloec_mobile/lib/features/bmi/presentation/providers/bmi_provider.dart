import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../data/bmi_repository.dart';

final bmiRepositoryProvider = Provider<BmiRepository>((ref) {
  return BmiRepository();
});

final bmiHistoryProvider = FutureProvider.autoDispose<List<BmiEntity>>((ref) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return [];
  final repo = ref.watch(bmiRepositoryProvider);
  return repo.getHistory(user.uid);
});

final bmiLatestProvider = FutureProvider.autoDispose<BmiEntity?>((ref) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return null;
  final repo = ref.watch(bmiRepositoryProvider);
  return repo.getLatest(user.uid);
});
