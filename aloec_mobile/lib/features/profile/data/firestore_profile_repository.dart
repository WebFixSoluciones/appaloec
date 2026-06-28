import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../domain/profile_entity.dart';
import '../domain/profile_repository.dart';

final firestoreProvider = Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instance);

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return FirestoreProfileRepository(ref.watch(firestoreProvider));
});

final userProfileStreamProvider = StreamProvider<ProfileEntity?>((ref) {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return Stream.value(null);
  
  return FirebaseFirestore.instance
      .collection('users')
      .doc(user.uid)
      .snapshots()
      .map((snapshot) {
        if (snapshot.exists && snapshot.data() != null) {
          return ProfileEntity.fromMap(snapshot.data()!, user.uid);
        }
        return null;
      });
});


class FirestoreProfileRepository implements ProfileRepository {
  final FirebaseFirestore _firestore;

  FirestoreProfileRepository(this._firestore);

  @override
  Future<ProfileEntity?> getProfile(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    if (doc.exists && doc.data() != null) {
      return ProfileEntity.fromMap(doc.data()!, uid);
    }
    return null;
  }

  @override
  Future<void> updateProfile(ProfileEntity profile) async {
    await _firestore.collection('users').doc(profile.uid).set(profile.toMap(), SetOptions(merge: true));
  }

  @override
  Future<void> updateProfilePhoto(String uid, String filePath) async {
    // Requires firebase_storage. Implement file upload.
    throw UnimplementedError('File upload not implemented yet');
  }
}
