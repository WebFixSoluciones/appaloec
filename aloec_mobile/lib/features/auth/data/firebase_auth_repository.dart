import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/auth_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/email_queue_service.dart';
import '../../../core/services/referral_service.dart';

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

  Future<void> _ensureUserDocument(User user, {String? referralCode}) async {
    final doc = await _firestore.collection('users').doc(user.uid).get();
    if (!doc.exists) {
      final userData = <String, dynamic>{
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
        'referral': {
          'code': '',
          'referredByUid': null,
          'referredByCode': referralCode ?? null,
          'status': referralCode != null ? 'referred' : 'none',
          'registeredAt': FieldValue.serverTimestamp(),
          'convertedAt': null,
        },
        'affiliateBalance': {
          'pendingUSD': 0,
          'approvedUSD': 0,
          'paidUSD': 0,
          'rejectedUSD': 0,
          'updatedAt': FieldValue.serverTimestamp(),
        },
      };
      await _firestore.collection('users').doc(user.uid).set(userData);
    }

    if (referralCode != null && referralCode.isNotEmpty) {
      try {
        await ReferralService.saveReferralOnRegistration(
          userUid: user.uid,
          referredByCode: referralCode,
        );
      } catch (_) {}
    }
  }

  @override
  Future<void> signInWithEmail(String email, String password) async {
    final cred = await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
    if (cred.user != null) {
      await _ensureUserDocument(cred.user!);
    }
  }

  @override
  Future<void> registerWithEmail(String email, String password, String name, {String? referralCode}) async {
    UserCredential credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email, password: password);
    final user = credential.user;
    if (user != null) {
      await user.updateDisplayName(name);
      await _ensureUserDocument(user, referralCode: referralCode);
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
