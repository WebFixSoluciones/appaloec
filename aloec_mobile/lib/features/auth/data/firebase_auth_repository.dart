import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import '../domain/auth_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/email_queue_service.dart';

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return FirebaseAuthRepository(ref.watch(firebaseAuthProvider));
});

class FirebaseAuthRepository implements AuthRepository {
  final FirebaseAuth _firebaseAuth;

  FirebaseAuthRepository(this._firebaseAuth);

  @override
  Stream<String?> get authStateChanges => 
      _firebaseAuth.authStateChanges().map((user) => user?.uid);

  @override
  Future<void> signInWithEmail(String email, String password) async {
    await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
  }

  @override
  Future<void> registerWithEmail(String email, String password, String name) async {
    UserCredential credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email, password: password);
    await credential.user?.updateDisplayName(name);

    // Encolar email de bienvenida
    try {
      await EmailQueueService().enqueueWelcomeEmail(
        toEmail: email,
        userName: name,
      );
    } catch (_) {
      // No bloquear el registro si falla el enqueue
    }
  }

  @override
  Future<void> signInWithGoogle() async {
    final GoogleSignIn googleSignIn = GoogleSignIn();
    final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
    
    if (googleUser == null) {
      throw Exception('Inicio de sesión con Google cancelado por el usuario.');
    }

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    final AuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    await _firebaseAuth.signInWithCredential(credential);
  }

  @override
  Future<void> signInWithFacebook() async {
    final LoginResult result = await FacebookAuth.instance.login();
    
    if (result.status == LoginStatus.success) {
      final OAuthCredential credential = FacebookAuthProvider.credential(
        result.accessToken!.token,
      );
      await _firebaseAuth.signInWithCredential(credential);
    } else if (result.status == LoginStatus.cancelled) {
      throw Exception('Inicio de sesión con Facebook cancelado por el usuario.');
    } else {
      throw Exception('Error al iniciar sesión con Facebook: ${result.message}');
    }
  }

  @override
  Future<void> signOut() async {
    try { await GoogleSignIn().signOut(); } catch (_) {}
    try { await FacebookAuth.instance.logOut(); } catch (_) {}
    await _firebaseAuth.signOut();
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _firebaseAuth.sendPasswordResetEmail(email: email);
  }
}
