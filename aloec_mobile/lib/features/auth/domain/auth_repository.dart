abstract class AuthRepository {
  Future<void> signInWithEmail(String email, String password);
  Future<void> registerWithEmail(String email, String password, String name, {String? referralCode});
  Future<void> signOut();
  Future<void> sendPasswordResetEmail(String email);
  Stream<String?> get authStateChanges;
}
