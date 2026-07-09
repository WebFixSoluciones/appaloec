class BannerEntity {
  final String id;
  final String title;
  final String imageUrl;
  final String targetUrl;
  final String position;
  final String? startDate;
  final String? endDate;
  final int clicksCount;
  final bool isActive;

  BannerEntity({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.targetUrl,
    required this.position,
    this.startDate,
    this.endDate,
    required this.clicksCount,
    required this.isActive,
  });

  factory BannerEntity.fromFirestore(String id, Map<String, dynamic> data) {
    return BannerEntity(
      id: id,
      title: data['title'] ?? '',
      imageUrl: data['imageUrl'] ?? '',
      targetUrl: data['targetUrl'] ?? '',
      position: data['position'] ?? 'inicio',
      startDate: data['startDate'] as String?,
      endDate: data['endDate'] as String?,
      clicksCount: (data['clicksCount'] ?? 0) is int
          ? data['clicksCount'] as int
          : 0,
      isActive: data['isActive'] ?? false,
    );
  }

  bool get isVigente {
    final now = DateTime.now();
    if (startDate != null && startDate!.isNotEmpty) {
      final start = DateTime.tryParse(startDate!);
      if (start != null && now.isBefore(start)) return false;
    }
    if (endDate != null && endDate!.isNotEmpty) {
      final end = DateTime.tryParse(endDate!);
      if (end != null && now.isAfter(end)) return false;
    }
    return isActive;
  }
}
