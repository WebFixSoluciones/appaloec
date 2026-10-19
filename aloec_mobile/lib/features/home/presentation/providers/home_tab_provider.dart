import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provider que controla el índice de la pestaña activa en HomeScreen
/// 0: Hoy (Protocolo)
/// 1: Recetas (JuicesScreen - Pantalla de inicio por defecto)
/// 2: Progreso
/// 3: Perfil
final homeTabProvider = StateProvider<int>((ref) => 1);
