import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/course_entity.dart';

/// Convierte cualquier URL de video en una URL de embed reproducible.
String buildEmbedUrl(LessonEntity lesson) {
  final url = lesson.videoUrl.trim();
  final source = lesson.videoSource.toLowerCase();

  switch (source) {
    case 'youtube':
      return _youtubeEmbed(url);
    case 'vimeo':
      return _vimeoEmbed(url);
    case 'onedrive':
      // Si ya es embed de OneDrive, úsalo directamente
      if (url.contains('embed') || url.contains('onedrive.live.com')) {
        return url;
      }
      // Short link 1drv.ms — no tiene embed directo, abrimos en navegador
      return url;
    case 'upload':
    default:
      return url; // Firebase Storage URL — se abre en navegador
  }
}

String _youtubeEmbed(String url) {
  String videoId = '';
  try {
    final uri = Uri.parse(url);
    if (uri.host.contains('youtu.be')) {
      videoId = uri.pathSegments.first;
    } else {
      videoId = uri.queryParameters['v'] ?? '';
      if (videoId.isEmpty && uri.pathSegments.isNotEmpty) {
        videoId = uri.pathSegments.last;
      }
    }
  } catch (_) {}
  if (videoId.isEmpty) return url;
  return 'https://www.youtube.com/embed/$videoId?rel=0&playsinline=1&autoplay=1';
}

String _vimeoEmbed(String url) {
  try {
    final uri = Uri.parse(url);
    final segments = uri.pathSegments.where((s) => s.isNotEmpty).toList();
    if (segments.isNotEmpty) {
      final videoId = segments.last;
      return 'https://player.vimeo.com/video/$videoId?autoplay=1';
    }
  } catch (_) {}
  return url;
}

bool _needsWebView(LessonEntity lesson) {
  final source = lesson.videoSource.toLowerCase();
  if (source == 'upload') return false;
  if (source == 'onedrive' && lesson.videoUrl.contains('1drv.ms')) return false;
  return true;
}

class LessonPlayerScreen extends StatefulWidget {
  final LessonEntity lesson;
  final String courseTitle;

  const LessonPlayerScreen({
    super.key,
    required this.lesson,
    required this.courseTitle,
  });

  @override
  State<LessonPlayerScreen> createState() => _LessonPlayerScreenState();
}

class _LessonPlayerScreenState extends State<LessonPlayerScreen> {
  late final WebViewController _webViewController;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    // Forzar pantalla horizontal durante reproducción
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
      DeviceOrientation.portraitUp,
    ]);

    if (_needsWebView(widget.lesson)) {
      final embedUrl = buildEmbedUrl(widget.lesson);
      _webViewController = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (_) => setState(() {
              _isLoading = true;
              _hasError = false;
            }),
            onPageFinished: (_) => setState(() => _isLoading = false),
            onWebResourceError: (_) => setState(() {
              _isLoading = false;
              _hasError = true;
            }),
          ),
        )
        ..loadRequest(Uri.parse(embedUrl));
    }
  }

  @override
  void dispose() {
    // Restaurar orientaciones normales
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    super.dispose();
  }

  Widget _buildSourceBadge() {
    final sourceColors = {
      'youtube':  [const Color(0xFFFF0000), Colors.white],
      'vimeo':    [const Color(0xFF1AB7EA), Colors.white],
      'onedrive': [const Color(0xFF0078D4), Colors.white],
      'upload':   [const Color(0xFF7B2D8B), Colors.white],
    };
    final source = widget.lesson.videoSource.toLowerCase();
    final colors = sourceColors[source] ?? [Colors.grey, Colors.white];
    final labels = {
      'youtube': 'YouTube',
      'vimeo': 'Vimeo',
      'onedrive': 'OneDrive',
      'upload': 'Firebase Storage',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: (colors[0] as Color).withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: (colors[0] as Color).withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.play_circle_outline, size: 12, color: colors[0] as Color),
          const SizedBox(width: 4),
          Text(
            labels[source] ?? source.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: colors[0] as Color,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lesson = widget.lesson;
    final useWebView = _needsWebView(lesson);
    final durationMin = (lesson.duration / 60).round();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          lesson.title,
          style: const TextStyle(color: Colors.white, fontSize: 15),
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          // Abrir en navegador como fallback
          IconButton(
            icon: const Icon(Icons.open_in_browser, color: Colors.white70),
            tooltip: 'Abrir en navegador',
            onPressed: () async {
              final uri = Uri.parse(lesson.videoUrl);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // ─── Video Player Area ───────────────────────────────────────────
          Container(
            color: Colors.black,
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: useWebView
                  ? Stack(
                      children: [
                        WebViewWidget(controller: _webViewController),
                        if (_isLoading)
                          const Center(
                            child: CircularProgressIndicator(color: AppColors.primaryGreen),
                          ),
                        if (_hasError)
                          _ErrorView(
                            videoUrl: lesson.videoUrl,
                            onRetry: () {
                              setState(() {
                                _isLoading = true;
                                _hasError = false;
                              });
                              _webViewController.reload();
                            },
                          ),
                      ],
                    )
                  : _FallbackPlayerView(lesson: lesson),
            ),
          ),

          // ─── Lesson Info Panel ───────────────────────────────────────────
          Expanded(
            child: Container(
              color: Colors.white,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Source + duration
                    Row(
                      children: [
                        _buildSourceBadge(),
                        const SizedBox(width: 10),
                        Icon(Icons.timer_outlined, size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(
                          '$durationMin min',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Lesson title
                    Text(
                      'Clase ${lesson.order}: ${lesson.title}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Course name
                    Text(
                      widget.courseTitle,
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                    ),

                    if (lesson.description.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Descripción',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        lesson.description,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Error View ───────────────────────────────────────────────────────────────
class _ErrorView extends StatelessWidget {
  final String videoUrl;
  final VoidCallback onRetry;

  const _ErrorView({required this.videoUrl, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black87,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.white54, size: 48),
              const SizedBox(height: 12),
              const Text(
                'No se pudo cargar el video',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: onRetry,
                    child: const Text('Reintentar', style: TextStyle(color: AppColors.primaryGreen)),
                  ),
                  const SizedBox(width: 12),
                  TextButton(
                    onPressed: () async {
                      final uri = Uri.parse(videoUrl);
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      }
                    },
                    child: const Text('Abrir en navegador', style: TextStyle(color: Colors.white70)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Fallback para OneDrive (1drv.ms) y Firebase Storage ────────────────────
class _FallbackPlayerView extends StatelessWidget {
  final LessonEntity lesson;

  const _FallbackPlayerView({required this.lesson});

  @override
  Widget build(BuildContext context) {
    final isOneDrive = lesson.videoSource.toLowerCase() == 'onedrive';
    final icon = isOneDrive ? Icons.cloud : Icons.video_file;
    final label = isOneDrive ? 'Video en OneDrive' : 'Video en Firebase Storage';
    final hint = isOneDrive
        ? 'Se abrirá la app de OneDrive o el navegador'
        : 'Se abrirá el reproductor del sistema';

    return Container(
      color: const Color(0xFF0F1114),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.white38, size: 56),
          const SizedBox(height: 16),
          Text(label, style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(hint, style: const TextStyle(color: Colors.white38, fontSize: 12)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.open_in_new, size: 18),
            label: const Text('Reproducir video', style: TextStyle(fontWeight: FontWeight.bold)),
            onPressed: () async {
              final uri = Uri.parse(lesson.videoUrl);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
        ],
      ),
    );
  }
}
