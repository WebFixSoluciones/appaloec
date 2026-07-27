import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class ReferralShareScreen extends StatelessWidget {
  const ReferralShareScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final code = GoRouterState.of(context).extra as String? ?? '';

    if (code.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Compartir')),
        body: const Center(child: Text('Cargando código...')),
      );
    }

    final link = 'https://app.alimentacionorganicaec.net/?ref=$code';
    final message = '¡Únete a ALOEC y transforma tu salud con jugos verdes! 🌱\n\n'
        'Usa mi código de referido: $code\n'
        'O regístrate aquí: $link\n\n'
        '¡Gana beneficios al unirte!';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Compartir mi código'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(message, style: const TextStyle(fontSize: 14, height: 1.5)),
            ),
            const SizedBox(height: 24),
            _ShareOption(
              icon: Icons.copy,
              label: 'Copiar link',
              color: Colors.blueGrey,
              onTap: () async {
                await Clipboard.setData(ClipboardData(text: link));
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Link copiado')),
                  );
                }
              },
            ),
            const SizedBox(height: 12),
            _ShareOption(
              icon: Icons.email_outlined,
              label: 'Enviar por Email',
              color: Colors.red,
              onTap: () async {
                final uri = Uri(
                  scheme: 'mailto',
                  queryParameters: {
                    'subject': 'Únete a ALOEC - Recetas de jugos verdes',
                    'body': message,
                  },
                );
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri);
                }
              },
            ),
            const SizedBox(height: 12),
            _ShareOption(
              icon: Icons.chat,
              label: 'WhatsApp',
              color: Colors.green,
              onTap: () async {
                final encoded = Uri.encodeComponent(message);
                final uri = Uri.parse('https://wa.me/?text=$encoded');
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
            ),
            const SizedBox(height: 12),
            _ShareOption(
              icon: Icons.share,
              label: 'Más opciones',
              color: Colors.grey,
              onTap: () async {
                await Clipboard.setData(ClipboardData(text: message));
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Mensaje copiado. Pégalo donde quieras.')),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _ShareOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ShareOption({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 16),
            Text(label, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: color)),
            const Spacer(),
            Icon(Icons.arrow_forward_ios, color: color.withOpacity(0.5), size: 16),
          ],
        ),
      ),
    );
  }
}
