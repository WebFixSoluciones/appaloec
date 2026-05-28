abstract class AuthRepository {
  Future<void> signInWithEmail(String email, String password);
  Future<void> registerWithEmail(String email, String password, String name);
  Future<void> signOut();
  Future<void> sendPasswordResetEmail(String email);
  Stream<String?> get authStateChanges; // Returns user ID or null
}
