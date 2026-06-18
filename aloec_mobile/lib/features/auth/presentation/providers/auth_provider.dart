import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/errors/auth_error_messages.dart';
import '../../data/firebase_auth_repository.dart';
import '../../domain/auth_repository.dart';

enum AuthStateStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStateStatus status;
  final String? errorMessage;
  final String? userId;

  AuthState({required this.status, this.errorMessage, this.userId});

  factory AuthState.initial() => AuthState(status: AuthStateStatus.initial);
  factory AuthState.loading() => AuthState(status: AuthStateStatus.loading);
  factory AuthState.authenticated(String userId) => AuthState(status: AuthStateStatus.authenticated, userId: userId);
  factory AuthState.unauthenticated() => AuthState(status: AuthStateStatus.unauthenticated);
  factory AuthState.error(String message) => AuthState(status: AuthStateStatus.error, errorMessage: message);
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthNotifier(this._authRepository) : super(AuthState.initial()) {
    _checkAuthState();
  }

  void _checkAuthState() {
    _authRepository.authStateChanges.listen((userId) {
      if (userId != null) {
        state = AuthState.authenticated(userId);
      } else {
        state = AuthState.unauthenticated();
      }
    });
  }

  Future<void> signIn(String email, String password) async {
    state = AuthState.loading();
    try {
      await _authRepository.signInWithEmail(email, password);
    } catch (e) {
      state = AuthState.error(mapAuthError(e));
    }
  }

  Future<void> signInWithGoogle() async {
    state = AuthState.loading();
    try {
      await _authRepository.signInWithGoogle();
    } catch (e) {
      state = AuthState.error(mapAuthError(e));
    }
  }

  Future<void> signInWithFacebook() async {
    state = AuthState.loading();
    try {
      await _authRepository.signInWithFacebook();
    } catch (e) {
      state = AuthState.error(mapAuthError(e));
    }
  }

  Future<void> register(String email, String password, String name) async {
    state = AuthState.loading();
    try {
      await _authRepository.registerWithEmail(email, password, name);
    } catch (e) {
      state = AuthState.error(mapAuthError(e));
    }
  }

  Future<void> signOut() async {
    await _authRepository.signOut();
  }
}
