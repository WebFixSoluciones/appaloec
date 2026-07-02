import 'package:flutter_test/flutter_test.dart';
import 'package:aloec_mobile/features/courses/domain/course_entity.dart';

void main() {
  group('CourseEntity', () {
    test('fromFirestore creates correct entity with full data', () {
      final data = {
        'title': 'Terapia Gerson',
        'description': 'Curso completo',
        'featuredImageUrl': 'https://example.com/course.jpg',
        'totalHours': 3.5,
        'difficulty': 'Intermedio',
        'category': 'Nutricion',
        'instructor': {
          'name': 'Dr. Lopez',
          'avatarUrl': 'https://example.com/avatar.jpg',
        },
        'lessonsCount': 12,
        'isPremium': true,
      };

      final entity = CourseEntity.fromFirestore('course1', data);
      expect(entity.id, 'course1');
      expect(entity.title, 'Terapia Gerson');
      expect(entity.description, 'Curso completo');
      expect(entity.totalHours, 3.5);
      expect(entity.difficulty, 'Intermedio');
      expect(entity.category, 'Nutricion');
      expect(entity.instructorName, 'Dr. Lopez');
      expect(entity.instructorAvatarUrl, 'https://example.com/avatar.jpg');
      expect(entity.lessonsCount, 12);
      expect(entity.isPremium, true);
    });

    test('fromFirestore handles missing instructor data', () {
      final data = {
        'title': 'Jugos Basicos',
        'description': '',
        'featuredImageUrl': '',
        'totalHours': 1.0,
        'difficulty': 'Basico',
        'category': 'Jugos',
        'lessonsCount': 5,
        'isPremium': false,
      };

      final entity = CourseEntity.fromFirestore('course2', data);
      expect(entity.id, 'course2');
      expect(entity.instructorName, 'Especialista ALOEC');
      expect(entity.instructorAvatarUrl, isNull);
      expect(entity.isPremium, false);
    });

    test('fromFirestore handles thumbnailUrl fallback', () {
      final data = <String, dynamic>{
        'title': 'Test',
        'description': '',
        'thumbnailUrl': 'https://example.com/thumb.jpg',
        'totalHours': 0,
        'difficulty': 'Basico',
        'category': 'General',
        'instructor': <String, dynamic>{},
        'lessonsCount': 0,
        'isPremium': false,
      };

      final entity = CourseEntity.fromFirestore('course3', data);
      expect(entity.featuredImageUrl, 'https://example.com/thumb.jpg');
    });
  });

  group('LessonEntity', () {
    test('fromFirestore creates correct entity', () {
      final data = {
        'courseId': 'course1',
        'title': 'Leccion 1',
        'description': 'Intro',
        'videoUrl': 'https://youtube.com/watch?v=abc',
        'videoSource': 'youtube',
        'duration': 300,
        'order': 1,
      };

      final entity = LessonEntity.fromFirestore('lesson1', data);
      expect(entity.id, 'lesson1');
      expect(entity.courseId, 'course1');
      expect(entity.title, 'Leccion 1');
      expect(entity.videoUrl, 'https://youtube.com/watch?v=abc');
      expect(entity.videoSource, 'youtube');
      expect(entity.duration, 300);
      expect(entity.order, 1);
    });

    test('fromFirestore handles defaults', () {
      final data = <String, dynamic>{
        'courseId': 'course2',
        'title': '',
        'description': '',
        'videoUrl': '',
        'duration': 0,
      };

      final entity = LessonEntity.fromFirestore('lesson2', data);
      expect(entity.videoSource, 'youtube');
      expect(entity.order, 1);
      expect(entity.description, '');
    });
  });
}
