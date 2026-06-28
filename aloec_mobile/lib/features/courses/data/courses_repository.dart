import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/course_entity.dart';

class CoursesRepository {
  final FirebaseFirestore _firestore;

  CoursesRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<List<CourseEntity>> getAllCourses() async {
    final snapshot = await _firestore
        .collection('courses')
        .get();

    return snapshot.docs
        .where((doc) => doc.data()['deletedAt'] == null)
        .map((doc) => CourseEntity.fromFirestore(doc.id, doc.data()))
        .toList();
  }

  Future<CourseEntity?> getCourseById(String id) async {
    final doc = await _firestore.collection('courses').doc(id).get();
    if (!doc.exists || doc.data()?['deletedAt'] != null) return null;
    return CourseEntity.fromFirestore(doc.id, doc.data()!);
  }

  Future<List<LessonEntity>> getLessonsForCourse(String courseId) async {
    final snapshot = await _firestore
        .collection('lessons')
        .where('courseId', isEqualTo: courseId)
        .get();

    final lessons = snapshot.docs
        .map((doc) => LessonEntity.fromFirestore(doc.id, doc.data()))
        .toList();

    // Sort by order ascending
    lessons.sort((a, b) => a.order.compareTo(b.order));
    return lessons;
  }
}
