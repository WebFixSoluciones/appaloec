import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/protocol_model.dart';

class ProtocolsRepository {
  final FirebaseFirestore _firestore;

  ProtocolsRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<List<ProtocolModel>> getAllProtocols() async {
    final snapshot = await _firestore
        .collection('diet_protocols')
        .where('isActive', isEqualTo: true)
        .orderBy('order')
        .get();

    return snapshot.docs
        .where((doc) => doc.data()['deletedAt'] == null)
        .map((doc) => ProtocolModel.fromFirestore(doc.id, doc.data()))
        .toList();
  }

  Future<ProtocolModel?> getProtocolForBmi(double bmiValue) async {
    final categoryKey = ProtocolModel.getBmiCategoryKey(bmiValue);

    final snapshot = await _firestore
        .collection('diet_protocols')
        .where('bmiCategory', isEqualTo: categoryKey)
        .where('isActive', isEqualTo: true)
        .limit(1)
        .get();

    if (snapshot.docs.isEmpty) {
      final allProtocols = await getAllProtocols();
      for (final protocol in allProtocols) {
        if (protocol.bmiMin != null && protocol.bmiMax != null) {
          if (bmiValue >= protocol.bmiMin! && bmiValue < protocol.bmiMax!) {
            return protocol;
          }
        }
      }
      return null;
    }

    final doc = snapshot.docs.first;
    return ProtocolModel.fromFirestore(doc.id, doc.data());
  }
}
