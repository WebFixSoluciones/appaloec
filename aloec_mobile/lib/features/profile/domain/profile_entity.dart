class ProfileEntity {
  final String uid;
  final String displayName;
  final String photoUrl;
  final String language;
  final bool isPremium;

  ProfileEntity({
    required this.uid,
    required this.displayName,
    this.photoUrl = '',
    this.language = 'es',
    this.isPremium = false,
  });

  factory ProfileEntity.fromMap(Map<String, dynamic> map, String uid) {
    return ProfileEntity(
      uid: uid,
      displayName: map['displayName'] ?? '',
      photoUrl: map['photoUrl'] ?? '',
      language: map['language'] ?? 'es',
      isPremium: map['isPremium'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'displayName': displayName,
      'photoUrl': photoUrl,
      'language': language,
      'isPremium': isPremium,
    };
  }
}
