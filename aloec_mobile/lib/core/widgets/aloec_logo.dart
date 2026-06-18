import 'package:flutter/material.dart';

/// Widget del logo oficial de ALOEC.
/// Usa [size] para controlar el ancho (alto se ajusta automáticamente).
class AloecLogo extends StatelessWidget {
  final double size;

  const AloecLogo({super.key, this.size = 140});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: size,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) {
        // Fallback en caso de que el asset no cargue
        return Text(
          'ALOEC',
          style: TextStyle(
            fontSize: size * 0.28,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF67B539),
            letterSpacing: 2.0,
          ),
        );
      },
    );
  }
}
