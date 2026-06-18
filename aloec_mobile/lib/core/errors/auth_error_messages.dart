import 'package:firebase_auth/firebase_auth.dart';

String mapAuthError(dynamic error) {
  if (error is FirebaseAuthException) {
    switch (error.code) {
      case 'invalid-email':
      case 'ERROR_INVALID_EMAIL':
        return 'El formato del correo electrónico no es válido.';
      case 'user-disabled':
        return 'Esta cuenta ha sido deshabilitada. Contacta al soporte.';
      case 'user-not-found':
        return 'No existe una cuenta con este correo electrónico.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'La contraseña ingresada es incorrecta.';
      case 'email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico.';
      case 'operation-not-allowed':
        return 'Esta operación no está habilitada temporalmente.';
      case 'weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'too-many-requests':
        return 'Demasiados intentos fallidos. Cuenta temporalmente bloqueada. Intenta más tarde.';
      case 'network-request-failed':
        return 'Error de conexión. Verifica tu acceso a internet.';
      case 'invalid-action-code':
        return 'El enlace de recuperación es inválido o ha expirado.';
      default:
        return 'Error de autenticación: ${error.message ?? "intenta de nuevo"}';
    }
  }

  if (error is Exception) {
    final msg = error.toString();
    if (msg.contains('cancelado')) return msg;
    if (msg.contains('Facebook')) return msg;
    if (msg.contains('Google')) return msg;
  }

  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
