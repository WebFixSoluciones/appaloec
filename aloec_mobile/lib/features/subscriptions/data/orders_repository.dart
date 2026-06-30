import 'package:cloud_firestore/cloud_firestore.dart';

class OrderEntity {
  final String id;
  final String userId;
  final String userEmail;
  final String membershipId;
  final String membershipName;
  final double amount;
  final String status; // 'paid', 'pending', 'failed'
  final String paymentMethod;
  final String transactionId;
  final String invoiceNumber;
  final DateTime createdAt;

  OrderEntity({
    required this.id,
    required this.userId,
    required this.userEmail,
    required this.membershipId,
    required this.membershipName,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    required this.transactionId,
    required this.invoiceNumber,
    required this.createdAt,
  });
}

class OrdersRepository {
  final FirebaseFirestore _firestore;

  OrdersRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  String _generateInvoiceNumber() {
    final now = DateTime.now();
    final timestamp = '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}';
    final random = now.millisecondsSinceEpoch.toString().substring(7);
    return 'ALOEC-$timestamp-$random';
  }

  Future<String> createOrder({
    required String userId,
    required String userEmail,
    required String membershipId,
    required String membershipName,
    required double amount,
    required int transactionId,
  }) async {
    final invoiceNumber = _generateInvoiceNumber();
    final docRef = await _firestore.collection('orders').add({
      'userId': userId,
      'userEmail': userEmail,
      'membershipId': membershipId,
      'membershipName': membershipName,
      'amount': amount,
      'status': 'paid',
      'paymentMethod': 'PayPhone',
      'transactionId': transactionId.toString(),
      'invoiceNumber': invoiceNumber,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  Future<void> createPendingOrder({
    required String orderId,
    required String userId,
    required String userEmail,
    required String membershipId,
    required String membershipName,
    required double amount,
    required String clientTransactionId,
  }) async {
    await _firestore.collection('orders').doc(orderId).set({
      'userId': userId,
      'userEmail': userEmail,
      'membershipId': membershipId,
      'membershipName': membershipName,
      'amount': amount,
      'status': 'pending',
      'paymentMethod': 'PayPhone',
      'transactionId': '',
      'clientTransactionId': clientTransactionId,
      'invoiceNumber': _generateInvoiceNumber(),
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> updateOrderStatus({
    required String orderId,
    required String status,
    String? transactionId,
  }) async {
    final data = <String, dynamic>{
      'status': status,
      'updatedAt': FieldValue.serverTimestamp(),
    };
    if (transactionId != null) {
      data['transactionId'] = transactionId;
    }
    await _firestore.collection('orders').doc(orderId).update(data);
  }

  Future<void> activateUserMembership({
    required String userId,
    required String membershipId,
  }) async {
    final batch = _firestore.batch();

    final userRef = _firestore.collection('users').doc(userId);
    batch.update(userRef, {
      'membershipId': membershipId,
      'membershipUpdatedAt': FieldValue.serverTimestamp(),
      'isPremium': true,
    });

    final bmiSnapshot = await _firestore
        .collection('users')
        .doc(userId)
        .collection('bmi_records')
        .orderBy('date', descending: true)
        .limit(1)
        .get();

    if (bmiSnapshot.docs.isNotEmpty) {
      final bmiData = bmiSnapshot.docs.first.data();
      final bmi = (bmiData['bmi'] as num?)?.toDouble();
      if (bmi != null) {
        String categoryKey;
        if (bmi < 18.5) {
          categoryKey = 'underweight';
        } else if (bmi < 25.0) {
          categoryKey = 'normal';
        } else if (bmi < 30.0) {
          categoryKey = 'overweight';
        } else if (bmi < 35.0) {
          categoryKey = 'obesity1';
        } else if (bmi < 40.0) {
          categoryKey = 'obesity2';
        } else {
          categoryKey = 'obesity3';
        }

        final protocolSnapshot = await _firestore
            .collection('diet_protocols')
            .where('bmiCategory', isEqualTo: categoryKey)
            .where('isActive', isEqualTo: true)
            .limit(1)
            .get();

        if (protocolSnapshot.docs.isNotEmpty) {
          batch.update(userRef, {
            'activeProtocolId': protocolSnapshot.docs.first.id,
          });
        }
      }
    }

    await batch.commit();
  }
}
