import 'package:cloud_firestore/cloud_firestore.dart';

class EmailQueueService {
  final FirebaseFirestore _firestore;

  EmailQueueService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<void> enqueueWelcomeEmail({
    required String toEmail,
    required String userName,
  }) async {
    final smtpDoc = await _firestore
        .collection('admin_settings')
        .doc('smtp_config')
        .get();

    if (!smtpDoc.exists || smtpDoc.data()?['enabled'] != true) {
      return;
    }

    await _firestore.collection('mail_queue').add({
      'to': toEmail,
      'subject': 'Bienvenido a ALOEC - Tu viaje hacia una vida saludable',
      'template': 'welcome',
      'templateData': {
        'userName': userName,
        'appName': 'ALOEC',
      },
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
      'attempts': 0,
    });
  }
}
