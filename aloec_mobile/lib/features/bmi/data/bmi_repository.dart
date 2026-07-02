import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../domain/bmi_entity.dart';

class BmiRepository {
  final FirebaseFirestore _firestore;

  BmiRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<void> saveRecord(BmiEntity record) async {
    await _firestore.collection('imc_records').add(record.toMap());
  }

  Future<List<BmiEntity>> getHistory(String uid) async {
    final snapshot = await _firestore
        .collection('imc_records')
        .where('uid', isEqualTo: uid)
        .orderBy('createdAt', descending: true)
        .limit(50)
        .get();

    return snapshot.docs
        .map((doc) => BmiEntity.fromFirestore(doc.id, doc.data()))
        .toList();
  }

  Future<BmiEntity?> getLatest(String uid) async {
    final snapshot = await _firestore
        .collection('imc_records')
        .where('uid', isEqualTo: uid)
        .orderBy('createdAt', descending: true)
        .limit(1)
        .get();

    if (snapshot.docs.isEmpty) return null;
    return BmiEntity.fromFirestore(snapshot.docs.first.id, snapshot.docs.first.data());
  }

  Future<BmiEntity?> saveAndReturn(BmiEntity record) async {
    final ref = await _firestore.collection('imc_records').add(record.toMap());
    return BmiEntity(
      id: ref.id,
      uid: record.uid,
      age: record.age,
      heightCm: record.heightCm,
      weightKg: record.weightKg,
      bmiValue: record.bmiValue,
      status: record.status,
      createdAt: record.createdAt,
    );
  }
}
