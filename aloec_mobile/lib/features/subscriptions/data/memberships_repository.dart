import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class MembershipEntity {
  final String id;
  final String name;
  final double price;
  final int durationDays;
  final List<String> features;
  final bool isActive;

  MembershipEntity({
    required this.id,
    required this.name,
    required this.price,
    required this.durationDays,
    required this.features,
    required this.isActive,
  });

  factory MembershipEntity.fromFirestore(String id, Map<String, dynamic> data) {
    return MembershipEntity(
      id: id,
      name: data['name'] ?? '',
      price: (data['price'] ?? 0).toDouble(),
      durationDays: data['durationDays'] ?? 30,
      features: List<String>.from(data['features'] ?? []),
      isActive: data['isActive'] ?? false,
    );
  }

  String get durationLabel {
    if (durationDays <= 31) return 'mes';
    if (durationDays <= 93) return 'trimestre';
    if (durationDays <= 186) return 'semestre';
    return 'año';
  }

  String get priceLabel => '\$${price.toStringAsFixed(2)}/$durationLabel';

  int get priceCents => (price * 100).round();
}

class MembershipsRepository {
  final FirebaseFirestore _firestore;

  MembershipsRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<List<MembershipEntity>> getActiveMemberships() async {
    final snapshot = await _firestore
        .collection('memberships')
        .where('isActive', isEqualTo: true)
        .orderBy('price')
        .get();

    return snapshot.docs
        .where((doc) => doc.data()['deletedAt'] == null)
        .map((doc) => MembershipEntity.fromFirestore(doc.id, doc.data()))
        .toList();
  }

  Future<bool> restorePurchases() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;

    final ordersSnapshot = await _firestore
        .collection('orders')
        .where('userId', isEqualTo: user.uid)
        .where('status', isEqualTo: 'paid')
        .orderBy('createdAt', descending: true)
        .limit(1)
        .get();

    if (ordersSnapshot.docs.isEmpty) return false;

    final orderData = ordersSnapshot.docs.first.data();
    final expiry = orderData['expiresAt'] as dynamic;
    DateTime? expiryDate;
    if (expiry != null) expiryDate = (expiry as dynamic).toDate();

    if (expiryDate != null && expiryDate.isBefore(DateTime.now())) {
      return false;
    }

    await _firestore.collection('users').doc(user.uid).set({
      'isPremium': true,
      'activeMembershipId': orderData['membershipId'] ?? '',
      'membershipExpiresAt': expiryDate,
    }, SetOptions(merge: true));

    return true;
  }
}
