import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/version_service.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  Future<void> _openWhatsApp() async {
    const phone = '593999504321';
    const message = 'Hola ALOEC, necesito ayuda con la aplicacion.';
    final encoded = Uri.encodeComponent(message);
    final uris = [
      Uri.parse('whatsapp://send?phone=$phone&text=$encoded'),
      Uri.parse('https://wa.me/$phone?text=$encoded'),
    ];
    for (final uri in uris) {
      try {
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
          return;
        }
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Ayuda'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildCard(
            icon: Icons.chat,
            iconColor: const Color(0xFF25D366),
            title: 'Contactar por WhatsApp',
            subtitle: 'Un asesor te atendera en minutos',
            onTap: _openWhatsApp,
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Preguntas Frecuentes',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.textDark)),
                const SizedBox(height: 16),
                _faqItem('Como funciona el protocolo?',
                    'Cada protocolo tiene un plan diario con horarios de comidas y jugos. La app te envia recordatorios para que no olvides nada.'),
                _faqItem('Como pago en efectivo?',
                    'Selecciona "Comprar en Efectivo" y un asesor te contactara por WhatsApp para coordinar el pago y activar tu plan.'),
                _faqItem('Como cambio mi plan?',
                    'Ve a tu perfil > Suscripcion para ver y cambiar tu plan actual.'),
                _faqItem('Como cancelo mi membresia?',
                    'Contacta a soporte por WhatsApp. No hay cargos automaticos.'),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: Text(
              'ALOEC v${VersionService.currentVersion}',
              style: const TextStyle(
                  fontSize: 12, color: AppColors.textLight),
            ),
          ),
          const SizedBox(height: 8),
          const Center(
            child: Text(
              'Desarrollado por Web Fix',
              style: TextStyle(fontSize: 11, color: AppColors.textLight),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style: const TextStyle(
                          color: AppColors.textLight, fontSize: 13)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _faqItem(String question, String answer) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(question,
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: AppColors.textDark)),
          const SizedBox(height: 4),
          Text(answer,
              style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textLight,
                  height: 1.4)),
        ],
      ),
    );
  }
}
