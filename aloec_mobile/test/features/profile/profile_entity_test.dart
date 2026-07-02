import 'package:flutter_test/flutter_test.dart';
import 'package:aloec_mobile/features/profile/domain/profile_entity.dart';

void main() {
  group('ProfileEntity', () {
    test('fromMap creates correct entity with all fields', () {
      final map = {
        'displayName': 'Maria Garcia',
        'photoUrl': 'https://example.com/photo.jpg',
        'language': 'es',
        'isPremium': true,
      };

      final entity = ProfileEntity.fromMap(map, 'user123');
      expect(entity.uid, 'user123');
      expect(entity.displayName, 'Maria Garcia');
      expect(entity.photoUrl, 'https://example.com/photo.jpg');
      expect(entity.language, 'es');
      expect(entity.isPremium, true);
    });

    test('fromMap handles missing fields with defaults', () {
      final map = <String, dynamic>{};
      final entity = ProfileEntity.fromMap(map, 'user456');

      expect(entity.uid, 'user456');
      expect(entity.displayName, '');
      expect(entity.photoUrl, '');
      expect(entity.language, 'es');
      expect(entity.isPremium, false);
    });

    test('toMap produces correct map', () {
      final entity = ProfileEntity(
        uid: 'user789',
        displayName: 'John Doe',
        photoUrl: 'https://example.com/avatar.jpg',
        language: 'en',
        isPremium: false,
      );

      final map = entity.toMap();
      expect(map['displayName'], 'John Doe');
      expect(map['photoUrl'], 'https://example.com/avatar.jpg');
      expect(map['language'], 'en');
      expect(map['isPremium'], false);
      expect(map.containsKey('uid'), false);
    });

    test('constructor uses correct defaults', () {
      final entity = ProfileEntity(uid: 'u1', displayName: 'Test');
      expect(entity.photoUrl, '');
      expect(entity.language, 'es');
      expect(entity.isPremium, false);
    });
  });
}
