import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Politica de Privacidad',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _section(
              '1. Informacion que Recopilamos',
              'ALOEC recopila la siguiente informacion:\n\n'
                  '* Datos de cuenta: nombre y correo electronico proporcionados durante el registro.\n'
                  '* Datos de salud: peso, altura, IMC y registros historicos que tu ingresas voluntariamente.\n'
                  '* Datos de uso: interacciones con la App, cursos vistos, recetas consultadas y progreso en protocolos.\n'
                  '* Datos de pago: las transacciones se procesan externamente a traves de Payphone. ALOEC no almacena numeros de tarjeta ni datos financieros sensibles.',
            ),
            _section(
              '2. Como Usamos tu Informacion',
              'Utilizamos tu informacion para:\n\n'
                  '* Proporcionar y personalizar el servicio de protocolos de salud.\n'
                  '* Calcular tu IMC y recomendarte planes de dieta adecuados.\n'
                  '* Enviar notificaciones y recordatorios de tu protocolo activo.\n'
                  '* Procesar tu suscripcion Premium.\n'
                  '* Mejorar la App mediante analisis de uso.\n'
                  '* Enviar comunicaciones sobre tu cuenta y actualizaciones del servicio.',
            ),
            _section(
              '3. Almacenamiento y Seguridad',
              'Tus datos se almacenan de forma segura en Firebase (Google Cloud), que cumple con certificaciones ISO 27001, SOC 2 y PCI DSS. Implementamos cifrado en transito (TLS) y en reposo. Solo personal autorizado de WebFix Soluciones tiene acceso administrativo a los datos.',
            ),
            _section(
              '4. No Compartimos tus Datos',
              'ALOEC no vende, alquila ni comparte tu informacion personal con terceros con fines comerciales. Los datos solo se comparten cuando:\n\n'
                  '* Tu lo autorizas explicitamente.\n'
                  '* Es requerido por ley o proceso legal.\n'
                  '* Es necesario para proteger derechos, propiedad o seguridad.',
            ),
            _section(
              '5. Retencion de Datos',
              'Conservamos tus datos mientras tu cuenta este activa. Si eliminas tu cuenta, tus datos personales y registros de salud se eliminan de nuestros servidores en un plazo de 30 dias. Los datos agregados y anonimizados pueden conservarse para analisis estadistico.',
            ),
            _section(
              '6. Tus Derechos',
              'Tienes derecho a:\n\n'
                  '* Acceder a tus datos personales.\n'
                  '* Rectificar datos inexactos.\n'
                  '* Solicitar la eliminacion de tus datos.\n'
                  '* Exportar tus datos en formato legible.\n'
                  '* Oponerte al tratamiento de tus datos.\n\n'
                  'Para ejercer estos derechos, contactanos en hola@aloec.app.',
            ),
            _section(
              '7. Cookies y Tecnologias Similares',
              'La App movil no utiliza cookies. El panel administrativo web puede utilizar cookies tecnicas esenciales para el funcionamiento. No utilizamos cookies de seguimiento ni publicitarias.',
            ),
            _section(
              '8. Menores de Edad',
              'ALOEC no esta dirigida a menores de 13 anos. No recopilamos intencionalmente informacion de menores. Si eres padre/madre y crees que tu hijo nos ha proporcionado datos, contactanos para eliminarlos.',
            ),
            _section(
              '9. Cambios en esta Politica',
              'Podemos actualizar esta politica periodicamente. Te notificaremos cambios significativos a traves de la App o por correo electronico. El uso continuado de la App despues de los cambios constituye aceptacion.',
            ),
            _section(
              '10. Contacto',
              'Para preguntas sobre privacidad o para ejercer tus derechos:\n\n'
                  'Email: hola@aloec.app\n'
                  'WhatsApp: +593 99 950 4321\n'
                  'Responsable: WebFix Soluciones\n'
                  'Direccion: Quito, Ecuador',
            ),
            const SizedBox(height: 16),
            const Text(
              'Ultima actualizacion: Julio 2026',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: AppColors.textDark)),
          const SizedBox(height: 6),
          Text(body,
              style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMedium,
                  height: 1.6)),
        ],
      ),
    );
  }
}
