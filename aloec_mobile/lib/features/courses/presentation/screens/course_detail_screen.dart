import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/aloec_image.dart';
import '../../../profile/data/firestore_profile_repository.dart';
import '../../domain/course_entity.dart';
import '../providers/courses_provider.dart';

class CourseDetailScreen extends ConsumerWidget {
  final String courseId;

  const CourseDetailScreen({super.key, required this.courseId});

  Color _getDifficultyColor(String difficulty) {
    final diff = difficulty.toLowerCase();
    if (diff.contains('bás') || diff.contains('bas') || diff.contains('easy') || diff.contains('fác') || diff.contains('fac')) {
      return const Color(0xFF67B539);
    } else if (diff.contains('inter') || diff.contains('med')) {
      return const Color(0xFFE8A838);
    } else if (diff.contains('avan') || diff.contains('hard') || diff.contains('dif')) {
      return const Color(0xFFD4526E);
    } else {
      return const Color(0xFF5B8DEF);
    }
  }

  Future<void> _playVideo(BuildContext context, LessonEntity lesson) async {
    final url = lesson.videoUrl;
    if (url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Este video no tiene una URL configurada.')),
      );
      return;
    }

    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('No se pudo abrir el enlace: $url')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al reproducir video: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileStreamProvider);
    final courseAsync = ref.watch(courseDetailProvider(courseId));
    final lessonsAsync = ref.watch(courseLessonsProvider(courseId));

    final isUserPremium = profileAsync.value?.isPremium ?? false;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: courseAsync.when(
        data: (course) {
          if (course == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('Curso no encontrado')),
              body: const Center(child: Text('El curso solicitado no existe.')),
            );
          }

          final difficultyColor = _getDifficultyColor(course.difficulty);
          final isLocked = course.isPremium && !isUserPremium;

          return CustomScrollView(
            slivers: [
              // ─── Header Sliver with collapsing image ──────────────────────
              SliverAppBar(
                expandedHeight: 240,
                pinned: true,
                backgroundColor: AppColors.primaryGreen,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
                  onPressed: () => context.pop(),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (course.featuredImageUrl.isNotEmpty)
                        AloecImage(imageUrl: course.featuredImageUrl)
                      else
                        Container(
                          color: difficultyColor.withOpacity(0.8),
                          child: const Icon(Icons.video_library, size: 80, color: Colors.white24),
                        ),
                      // Gradient overlay
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.3),
                              Colors.black.withOpacity(0.7),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ─── Course Information Details ──────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Badge row
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: difficultyColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              course.difficulty,
                              style: TextStyle(
                                color: difficultyColor,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          if (course.isPremium)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.amber.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.amber.shade300),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.workspace_premium, color: Colors.amber, size: 14),
                                  SizedBox(width: 4),
                                  Text(
                                    'PREMIUM',
                                    style: TextStyle(
                                      color: Colors.amber,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Title
                      Text(
                        course.title,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Duration & Lessons Count
                      Row(
                        children: [
                          const Icon(Icons.timer_outlined, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${course.totalHours} horas de contenido',
                            style: const TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                          const SizedBox(width: 16),
                          const Icon(Icons.menu_book, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${course.lessonsCount} lecciones',
                            style: const TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                        ],
                      ),
                      const Divider(height: 32),

                      // Instructor Section
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: AppColors.primaryGreen.withOpacity(0.1),
                            backgroundImage: course.instructorAvatarUrl != null
                                ? NetworkImage(course.instructorAvatarUrl!)
                                : null,
                            child: course.instructorAvatarUrl == null
                                ? const Icon(Icons.person, color: AppColors.primaryGreen)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Instructor del curso',
                                style: TextStyle(color: Colors.grey, fontSize: 11),
                              ),
                              Text(
                                course.instructorName,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textDark,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Description
                      const Text(
                        'Acerca de este curso',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        course.description,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                          height: 1.5,
                        ),
                      ),

                      // Premium lock banner
                      if (isLocked) ...[
                        const SizedBox(height: 24),
                        GestureDetector(
                          onTap: () => context.push('/premium-upsell'),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1B5E20), Color(0xFF67B539)],
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.lock, color: Colors.white, size: 28),
                                SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Contenido Premium bloqueado',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Suscríbete para acceder a este videocurso y todas las lecciones.',
                                        style: TextStyle(color: Colors.white70, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                Icon(Icons.chevron_right, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      ],

                      const Divider(height: 40),

                      // Lessons Header
                      const Text(
                        'Lecciones del curso',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),

              // ─── Lessons List Sliver ─────────────────────────────────────
              lessonsAsync.when(
                data: (lessonsList) {
                  if (lessonsList.isEmpty) {
                    return const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 32, horizontal: 20),
                        child: Center(
                          child: Text(
                            'No hay lecciones cargadas aún para este curso.',
                            style: TextStyle(color: Colors.grey, fontSize: 14),
                          ),
                        ),
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.only(left: 16, right: 16, bottom: 40),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final lesson = lessonsList[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 1,
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: isLocked
                                      ? Colors.grey.shade100
                                      : AppColors.primaryGreen.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isLocked ? Icons.lock_outline : Icons.play_arrow_rounded,
                                  color: isLocked ? Colors.grey : AppColors.primaryGreen,
                                  size: 24,
                                ),
                              ),
                              title: Text(
                                'Clase ${lesson.order}: ${lesson.title}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (lesson.description.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      lesson.description,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ],
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Icon(Icons.timer_outlined, size: 12, color: Colors.grey.shade500),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${(lesson.duration / 60).round()} min',
                                        style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                                      ),
                                      const SizedBox(width: 12),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.shade100,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          lesson.videoSource.toUpperCase(),
                                          style: TextStyle(fontSize: 9, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              trailing: const Icon(Icons.chevron_right, size: 18),
                              onTap: isLocked
                                  ? () => context.push('/premium-upsell')
                                  : () => _playVideo(context, lesson),
                            ),
                          );
                        },
                        childCount: lessonsList.length,
                      ),
                    ),
                  );
                },
                loading: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: CircularProgressIndicator(color: AppColors.primaryGreen),
                    ),
                  ),
                ),
                error: (err, stack) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Center(
                      child: Text(
                        'Error al cargar lecciones: $err',
                        style: const TextStyle(color: Colors.redAccent),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primaryGreen),
        ),
        error: (err, stack) => Scaffold(
          appBar: AppBar(title: const Text('Error')),
          body: Center(
            child: Text('Error al cargar detalles del curso: $err'),
          ),
        ),
      ),
    );
  }
}

