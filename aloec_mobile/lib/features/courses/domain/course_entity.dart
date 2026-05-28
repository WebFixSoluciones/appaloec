class CourseEntity {
  final String id;
  final String title;
  final String description;
  final String thumbnailUrl;
  final bool isPremium;

  CourseEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.thumbnailUrl,
    required this.isPremium,
  });
}

class LessonEntity {
  final String id;
  final String courseId;
  final String title;
  final String videoUrl;
  final bool isPreview;

  LessonEntity({
    required this.id,
    required this.courseId,
    required this.title,
    required this.videoUrl,
    this.isPreview = false,
  });
}
