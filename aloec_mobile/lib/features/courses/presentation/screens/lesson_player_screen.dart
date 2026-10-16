import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
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
  // Solo los enlaces directos de OneDrive sin embed (1drv.ms) abren en navegador.
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
    // Forzar orientaciones
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
      DeviceOrientation.portraitUp,
    ]);

    if (_needsWebView(widget.lesson)) {
      _webViewController = WebViewController();
      unawaited(_initializePlayer());
    }
  }

  void _setPlayerState({required bool loading, bool error = false}) {
    if (!mounted) return;
    setState(() {
      _isLoading = loading;
      _hasError = error;
    });
  }

  Future<void> _initializePlayer() async {
    try {
      // Complete native configuration before the first navigation.
      await _webViewController.setJavaScriptMode(JavaScriptMode.unrestricted);
      await _webViewController.setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => _setPlayerState(loading: true, error: false),
          onPageFinished: (_) {
            if (!mounted) return;
            // For uploaded videos, AloecVideo channel emits 'ready' once metadata buffers.
            // For third-party embeds (YouTube/Vimeo), page finish indicates completion.
            if (widget.lesson.videoSource.trim().toLowerCase() != 'upload') {
              _setPlayerState(loading: false, error: _hasError);
            }
          },
          onWebResourceError: (error) {
            // Ads, analytics, range requests and subresources may emit transient errors.
            // Only a confirmed main frame document failure should trigger an error screen.
            if (error.isForMainFrame != true) return;
            _setPlayerState(loading: false, error: true);
          },
        ),
      );
      await _webViewController.addJavaScriptChannel(
        'AloecVideo',
        onMessageReceived: (message) {
          if (message.message == 'ready' || message.message == 'playing') {
            _setPlayerState(loading: false, error: false);
          } else if (message.message.startsWith('error')) {
            _setPlayerState(loading: false, error: true);
          }
        },
      );
      final platform = _webViewController.platform;
      if (platform is AndroidWebViewController) {
        await platform.setMediaPlaybackRequiresUserGesture(false);
      }
      if (!mounted) return;
      await _loadVideo();
    } catch (error) {
      debugPrint('Video player initialization failed: $error');
      _setPlayerState(loading: false, error: true);
    }
  }

  String _buildHtmlVideoPlayer(String videoUrl) {
    return '''
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        background-color: #000;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        -webkit-user-select: none;
        user-select: none;
      }
      video {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        object-fit: contain;
        background-color: #000;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      video::-internal-media-controls-download-button {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        overflow: hidden;
      }
    </style>
  </head>
  <body oncontextmenu="return false;">
    <video
      id="videoPlayer"
      controls
      controlsList="nodownload"
      oncontextmenu="return false;"
      autoplay
      playsinline
      webkit-playsinline
      preload="auto"
      src="$videoUrl"
    >
      Tu dispositivo no soporta este reproductor de video.
    </video>
    <script>
      (function() {
        const player = document.getElementById('videoPlayer');
        let readySent = false;
        function notifyReady() {
          if (!readySent && window.AloecVideo) {
            readySent = true;
            try { AloecVideo.postMessage('ready'); } catch(e) {}
          }
        }
        player.addEventListener('loadedmetadata', notifyReady);
        player.addEventListener('canplay', notifyReady);
        player.addEventListener('playing', notifyReady);
        player.addEventListener('error', function() {
          const err = player.error;
          // Ignore MEDIA_ERR_ABORTED (1) which occurs during buffer renegotiation
          if (err && err.code && err.code !== 1) {
            if (window.AloecVideo) {
              try { AloecVideo.postMessage('error'); } catch(e) {}
            }
          }
        });
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            notifyReady();
          });
        }
      })();
    </script>
  </body>
</html>
''';
  }

  Future<void> _loadVideo() async {
    if (!mounted) return;
    _setPlayerState(loading: true, error: false);
    try {
      final source = widget.lesson.videoSource.trim().toLowerCase();
      if (source == 'upload') {
        final videoUrl = const HtmlEscape(HtmlEscapeMode.attribute)
            .convert(widget.lesson.videoUrl.trim());
        final html = _buildHtmlVideoPlayer(videoUrl);
        await _webViewController.loadHtmlString(
          html,
          baseUrl: 'https://app-aloec.firebaseapp.com',
        );
      } else {
        final embedUrl = buildEmbedUrl(widget.lesson);
        await _webViewController.loadRequest(Uri.parse(embedUrl));
      }
    } catch (error) {
      debugPrint('Video loading failed: $error');
      _setPlayerState(loading: false, error: true);
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
      'youtube': [const Color(0xFFFF0000), Colors.white],
      'vimeo': [const Color(0xFF1AB7EA), Colors.white],
      'onedrive': [const Color(0xFF0078D4), Colors.white],
      'upload': [const Color(0xFF7B2D8B), Colors.white],
    };
    final source = widget.lesson.videoSource.toLowerCase();
    final colors = sourceColors[source] ?? [Colors.grey, Colors.white];
    final labels = {
      'youtube': 'YouTube',
      'vimeo': 'Vimeo',
      'onedrive': 'OneDrive',
      'upload': 'Video',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: colors[0].withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors[0].withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.play_circle_outline, size: 12, color: colors[0]),
          const SizedBox(width: 4),
          Text(
            labels[source] ?? source.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: colors[0],
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
                            child: CircularProgressIndicator(
                                color: AppColors.primaryGreen),
                          ),
                        if (_hasError)
                          _ErrorView(
                            onRetry: () => unawaited(_loadVideo()),
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
                        Icon(Icons.timer_outlined,
                            size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(
                          '$durationMin min',
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey.shade600),
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
                      style:
                          TextStyle(fontSize: 13, color: Colors.grey.shade600),
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
  final VoidCallback onRetry;

  const _ErrorView({required this.onRetry});

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
                style:
                    TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.refresh, size: 18),
                onPressed: onRetry,
                label: const Text('Reintentar',
                    style: TextStyle(fontWeight: FontWeight.bold)),
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
    final label = isOneDrive ? 'Video en OneDrive' : 'Reproducir Video';
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
          Text(label,
              style: const TextStyle(
                  color: Colors.white70, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(hint,
              style: const TextStyle(color: Colors.white38, fontSize: 12)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.open_in_new, size: 18),
            label: const Text('Reproducir video',
                style: TextStyle(fontWeight: FontWeight.bold)),
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
