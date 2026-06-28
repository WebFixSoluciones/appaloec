import 'package:cloud_firestore/cloud_firestore.dart';

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
}
