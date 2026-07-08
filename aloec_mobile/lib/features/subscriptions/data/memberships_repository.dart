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
    // Parseo defensivo: el precio puede llegar como num o como String desde Firestore
    double parsedPrice = 0.0;
    final rawPrice = data['price'];
    if (rawPrice is num) {
      parsedPrice = rawPrice.toDouble();
    } else if (rawPrice is String) {
      parsedPrice = double.tryParse(rawPrice) ?? 0.0;
    }

    // durationDays también puede llegar como String
    int parsedDays = 30;
    final rawDays = data['durationDays'];
    if (rawDays is int) {
      parsedDays = rawDays;
    } else if (rawDays is String) {
      parsedDays = int.tryParse(rawDays) ?? 30;
    }

    return MembershipEntity(
      id: id,
      name: data['name'] ?? '',
      price: parsedPrice,
      durationDays: parsedDays,
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
    try {
      // Fetch all memberships and filter client-side:
      // — isActive must be true
      // — deletedAt must NOT exist (soft delete pattern used by admin)
      final snapshot = await _firestore
          .collection('memberships')
          .orderBy('price')
          .get();

      final memberships = snapshot.docs
          .where((doc) {
            final data = doc.data();
            // Exclude soft-deleted documents
            if (data.containsKey('deletedAt') && data['deletedAt'] != null) {
              return false;
            }
            return data['isActive'] == true;
          })
          .map((doc) => MembershipEntity.fromFirestore(doc.id, doc.data()))
          .toList();

      return memberships;
    } catch (e) {
      // On error, return empty list — do NOT show deleted plans as fallback
      return [];
    }
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
