class SubscriptionEntity {
  final String id;
  final String uid;
  final String status;
  final DateTime startDate;
  final DateTime endDate;
  final String planType;

  SubscriptionEntity({
    required this.id,
    required this.uid,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.planType,
  });

  bool get isActive => status == 'active' && endDate.isAfter(DateTime.now());
}
