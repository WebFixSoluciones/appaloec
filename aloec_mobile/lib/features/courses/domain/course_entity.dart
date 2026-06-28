class CourseEntity {
  final String id;
  final String title;
  final String description;
  final String featuredImageUrl;
  final double totalHours;
  final String difficulty;
  final String category;
  final String instructorName;
  final String? instructorAvatarUrl;
  final int lessonsCount;
  final bool isPremium;

  CourseEntity({
    required this.id,
    required this.title,
    required this.description,
    required this.featuredImageUrl,
    required this.totalHours,
    required this.difficulty,
    required this.category,
    required this.instructorName,
    this.instructorAvatarUrl,
    required this.lessonsCount,
    required this.isPremium,
  });

  factory CourseEntity.fromFirestore(String id, Map<String, dynamic> data) {
    final instructorData = data['instructor'] as Map<String, dynamic>? ?? {};
    return CourseEntity(
      id: id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      featuredImageUrl: data['featuredImageUrl'] ?? data['thumbnailUrl'] ?? '',
      totalHours: (data['totalHours'] ?? 0).toDouble(),
      difficulty: data['difficulty'] ?? 'Básico',
      category: data['category'] ?? 'Nutrición',
      instructorName: instructorData['name'] ?? 'Especialista ALOEC',
      instructorAvatarUrl: instructorData['avatarUrl'],
      lessonsCount: (data['lessonsCount'] ?? 0).toInt(),
      isPremium: data['isPremium'] == true,
    );
  }
}

class LessonEntity {
  final String id;
  final String courseId;
  final String title;
  final String description;
  final String videoUrl;
  final String videoSource; // 'youtube' | 'vimeo' | 'upload'
  final int duration; // in seconds
  final int order;

  LessonEntity({
    required this.id,
    required this.courseId,
    required this.title,
    required this.description,
    required this.videoUrl,
    required this.videoSource,
    required this.duration,
    required this.order,
  });

  factory LessonEntity.fromFirestore(String id, Map<String, dynamic> data) {
    return LessonEntity(
      id: id,
      courseId: data['courseId'] ?? '',
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      videoUrl: data['videoUrl'] ?? '',
      videoSource: data['videoSource'] ?? 'youtube',
      duration: (data['duration'] ?? 0).toInt(),
      order: (data['order'] ?? 1).toInt(),
    );
  }
}

