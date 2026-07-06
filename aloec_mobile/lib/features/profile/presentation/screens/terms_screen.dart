import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Terminos y Condiciones',
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
              '1. Aceptacion de los Terminos',
              'Al descargar, instalar o utilizar la aplicacion ALOEC ("la App"), aceptas estos Terminos y Condiciones. Si no estas de acuerdo, no utilices la App.',
            ),
            _section(
              '2. Descripcion del Servicio',
              'ALOEC es una plataforma de salud y bienestar que ofrece calculo de IMC, planes de dieta basados en jugos verdes, videocursos educativos, seguimiento de progreso y contenido premium mediante suscripcion.',
            ),
            _section(
              '3. Suscripciones y Pagos',
              'El acceso a contenido Premium requiere una suscripcion activa. Los pagos se procesan a traves de Payphone y son recurrentes segun el plan seleccionado. Puedes cancelar tu suscripcion en cualquier momento desde tu perfil o contactando a soporte.',
            ),
            _section(
              '4. Responsabilidad Medica',
              'ALOEC no es un sustituto de consejo medico profesional. La informacion proporcionada sobre dietas, jugos y protocolos tiene fines educativos. Consulta siempre a tu medico antes de iniciar cualquier programa de dieta o ejercicio.',
            ),
            _section(
              '5. Propiedad Intelectual',
              'Todo el contenido de ALOEC incluyendo recetas, videocursos, graficos, logos, textos y disenos es propiedad exclusiva de WebFix Soluciones. No se permite la reproduccion, distribucion o modificacion sin autorizacion.',
            ),
            _section(
              '6. Privacidad y Datos Personales',
              'ALOEC recopila unicamente los datos necesarios para proveer el servicio: nombre, correo electronico, datos de salud (IMC, peso, altura) y progreso. No compartimos tus datos con terceros. Consulta nuestra Politica de Privacidad para mas detalles.',
            ),
            _section(
              '7. Cancelaciones y Reembolsos',
              'Puedes cancelar tu suscripcion en cualquier momento. Las suscripciones no utilizadas parcialmente no son reembolsables, excepto donde la ley lo requiera. Los reembolsos se evaluan caso por caso.',
            ),
            _section(
              '8. Modificaciones',
              'ALOEC se reserva el derecho de modificar estos terminos en cualquier momento. Los cambios entraran en vigor al ser publicados en la App. El uso continuado de la App constituye aceptacion de los nuevos terminos.',
            ),
            _section(
              '9. Limitacion de Responsabilidad',
              'ALOEC y WebFix Soluciones no seran responsables por danos directos, indirectos, incidentales o consecuentes derivados del uso de la App, incluyendo pero no limitado a problemas de salud, perdida de datos o interrupcion del servicio.',
            ),
            _section(
              '10. Ley Aplicable',
              'Estos terminos se rigen por las leyes de la Republica del Ecuador. Cualquier disputa sera resuelta en los tribunales competentes de Quito.',
            ),
            _section(
              '11. Contacto',
              'Para cualquier consulta sobre estos terminos, escribenos a: hola@aloec.app o contactanos por WhatsApp al +593 99 950 4321.',
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
