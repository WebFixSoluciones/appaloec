import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import '../domain/profile_entity.dart';
import '../domain/profile_repository.dart';

final firestoreProvider = Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instance);
final firebaseStorageProvider = Provider<FirebaseStorage>((ref) => FirebaseStorage.instance);

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return FirestoreProfileRepository(
    ref.watch(firestoreProvider),
    ref.watch(firebaseStorageProvider),
  );
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
  final FirebaseStorage _storage;

  FirestoreProfileRepository(this._firestore, this._storage);

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
  Future<String> updateProfilePhoto(String uid, String filePath) async {
    final ref = _storage.ref().child('users/$uid/profile_photo.jpg');
    await ref.putFile(await _storage.ref().bucket.isEmpty ? throw UnimplementedError() : null);
    return '';
  }

  Future<String> uploadProfilePhotoBytes(String uid, List<int> bytes) async {
    final ref = _storage.ref().child('users/$uid/profile_photo.jpg');
    final metadata = SettableMetadata(contentType: 'image/jpeg');
    await ref.putData(bytes, metadata);
    final url = await ref.getDownloadURL();

    await FirebaseAuth.instance.currentUser?.updatePhotoURL(url);
    await _firestore.collection('users').doc(uid).set({
      'photoUrl': url,
    }, SetOptions(merge: true));

    return url;
  }
}
