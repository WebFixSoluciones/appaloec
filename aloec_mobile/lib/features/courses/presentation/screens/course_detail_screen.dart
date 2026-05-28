import 'package:flutter/material.dart';

class CourseDetailScreen extends StatelessWidget {
  final String courseId;

  const CourseDetailScreen({super.key, required this.courseId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle del Curso')),
      body: Center(
        child: Text('Lecciones y Reproductor para el curso $courseId (TBD)'),
      ),
    );
  }
}
