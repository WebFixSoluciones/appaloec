import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/auth_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/email_queue_service.dart';

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return FirebaseAuthRepository(ref.watch(firebaseAuthProvider));
});

class FirebaseAuthRepository implements AuthRepository {
  final FirebaseAuth _firebaseAuth;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  FirebaseAuthRepository(this._firebaseAuth);

  @override
  Stream<String?> get authStateChanges => 
      _firebaseAuth.authStateChanges().map((user) => user?.uid);

  Future<void> _ensureUserDocument(User user) async {
    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (!doc.exists) {
      await _firestore.collection('users').doc(user.uid).set({
        'email': user.email ?? '',
        'displayName': user.displayName ?? '',
        'isPremium': false,
        'role': 'user',
        'status': 'active',
        'createdAt': FieldValue.serverTimestamp(),
        'photoUrl': user.photoURL ?? '',
        'authProvider': user.providerData.isNotEmpty
            ? user.providerData.first.providerId
            : 'password',
      });
    }
  }

  @override
  Future<void> signInWithEmail(String email, String password) async {
    await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
  }

  @override
  Future<void> registerWithEmail(String email, String password, String name) async {
    UserCredential credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email, password: password);
    final user = credential.user;
    if (user != null) {
      await user.updateDisplayName(name);
      await _ensureUserDocument(user);
    }

    try {
      await EmailQueueService().enqueueWelcomeEmail(
        toEmail: email,
        userName: name,
      );
    } catch (_) {}
  }

  @override
  Future<void> signOut() async {
    await _firebaseAuth.signOut();
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _firebaseAuth.sendPasswordResetEmail(email: email);
  }
}
