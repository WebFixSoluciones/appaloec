import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/constants/app_colors.dart';

class CoursesScreen extends StatelessWidget {
  const CoursesScreen({super.key});

  static const _courses = [
    _Course(
      id: '1',
      title: 'Dieta de Jugos Verdes',
      subtitle: 'Nivel Básico',
      description: 'Aprende los fundamentos de la dieta de jugos verdes para desintoxicar tu cuerpo.',
      lessons: 8,
      duration: '30 min',
      color: Color(0xFF67B539),
    ),
    _Course(
      id: '2',
      title: 'Jugos para tu Salud',
      subtitle: 'Nivel Intermedio',
      description: 'Descubre combinaciones de jugos para diferentes condiciones de salud.',
      lessons: 12,
      duration: '45 min',
      color: Color(0xFFE8A838),
    ),
    _Course(
      id: '3',
      title: 'Plan de Desintoxicación',
      subtitle: 'Nivel Avanzado',
      description: 'Programa completo de 7 días para una limpieza profunda y revitalización.',
      lessons: 15,
      duration: '60 min',
      color: Color(0xFFD4526E),
    ),
    _Course(
      id: '4',
      title: 'Nutrición y Bienestar',
      subtitle: 'Nivel Experto',
      description: 'Complementa tu dieta con hábitos saludables y ejercicios recomendados.',
      lessons: 10,
      duration: '40 min',
      color: Color(0xFF5B8DEF),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Videocursos'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.primaryGreen.withOpacity(0.15),
                    backgroundImage: user.photoURL != null
                        ? NetworkImage(user.photoURL!)
                        : null,
                    child: user.photoURL == null
                        ? const Icon(Icons.person, size: 18, color: AppColors.primaryGreen)
                        : null,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Hola, ${user.displayName ?? 'Usuario'}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 8),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Elige un curso y comienza a transformar tu vida',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _courses.length,
              itemBuilder: (context, index) {
                final course = _courses[index];
                return _CourseCard(course: course);
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _Course {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final int lessons;
  final String duration;
  final Color color;

  const _Course({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.lessons,
    required this.duration,
    required this.color,
  });
}

class _CourseCard extends StatelessWidget {
  final _Course course;

  const _CourseCard({required this.course});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/course-detail/${course.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: course.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(Icons.play_circle_fill, color: course.color, size: 40),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course.subtitle,
                      style: TextStyle(
                        color: course.color,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      course.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      course.description,
                      style: const TextStyle(color: Colors.grey, fontSize: 13),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.menu_book, size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(
                          '${course.lessons} lecciones',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                        ),
                        const SizedBox(width: 16),
                        Icon(Icons.timer_outlined, size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(
                          course.duration,
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }
}
