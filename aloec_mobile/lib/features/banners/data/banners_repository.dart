import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/banner_entity.dart';

class BannersRepository {
  final FirebaseFirestore _firestore;

  BannersRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<List<BannerEntity>> getActiveBanners() async {
    final snapshot = await _firestore
        .collection('marketing_banners')
        .where('isActive', isEqualTo: true)
        .get();

    final now = DateTime.now();
    return snapshot.docs
        .map((doc) => BannerEntity.fromFirestore(doc.id, doc.data()))
        .where((banner) {
      if (banner.startDate != null && banner.startDate!.isNotEmpty) {
        final start = DateTime.tryParse(banner.startDate!);
        if (start != null && now.isBefore(start)) return false;
      }
      if (banner.endDate != null && banner.endDate!.isNotEmpty) {
        final end = DateTime.tryParse(banner.endDate!);
        if (end != null && now.isAfter(end)) return false;
      }
      return true;
    }).toList();
  }

  Future<void> incrementClickCount(String bannerId) async {
    await _firestore.collection('marketing_banners').doc(bannerId).update({
      'clicksCount': FieldValue.increment(1),
    });
  }
}
