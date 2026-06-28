import 'package:cloud_firestore/cloud_firestore.dart';

class GatewayConfig {
  final String token;
  final String storeId;
  final bool isActive;
  final String environment; // 'sandbox' | 'production'

  GatewayConfig({
    required this.token,
    required this.storeId,
    required this.isActive,
    required this.environment,
  });

  factory GatewayConfig.fromFirestore(Map<String, dynamic> data) {
    return GatewayConfig(
      token: data['secretKey'] ?? '',
      storeId: data['publicKey'] ?? '',
      isActive: data['isActive'] ?? false,
      environment: data['environment'] ?? 'sandbox',
    );
  }
}

class GatewayRepository {
  final FirebaseFirestore _firestore;

  GatewayRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<GatewayConfig?> getPayphoneConfig() async {
    final doc = await _firestore.collection('gateways').doc('payphone').get();
    if (!doc.exists) return null;
    final config = GatewayConfig.fromFirestore(doc.data()!);
    if (!config.isActive) return null;
    return config;
  }
}
