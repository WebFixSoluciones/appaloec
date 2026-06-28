import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/courses_repository.dart';
import '../../domain/course_entity.dart';

final coursesRepositoryProvider = Provider<CoursesRepository>((ref) {
  return CoursesRepository();
});

final coursesProvider = FutureProvider<List<CourseEntity>>((ref) async {
  final repository = ref.watch(coursesRepositoryProvider);
  return repository.getAllCourses();
});

final courseLessonsProvider = FutureProvider.family<List<LessonEntity>, String>((ref, courseId) async {
  final repository = ref.watch(coursesRepositoryProvider);
  return repository.getLessonsForCourse(courseId);
});

final courseDetailProvider = FutureProvider.family<CourseEntity?, String>((ref, courseId) async {
  final repository = ref.watch(coursesRepositoryProvider);
  return repository.getCourseById(courseId);
});

