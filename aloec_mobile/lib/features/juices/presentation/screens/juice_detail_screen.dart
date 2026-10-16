import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/premium_gate.dart';
import '../providers/juices_provider.dart';

// ─── URL helpers (mismo patrón que lesson_player_screen) ─────────────────────
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
      return 'https://player.vimeo.com/video/${segments.last}?autoplay=1';
    }
  } catch (_) {}
  return url;
}

String _buildEmbedUrl(String videoUrl, String videoSource) {
  final src = videoSource.toLowerCase();
  switch (src) {
    case 'youtube':
      return _youtubeEmbed(videoUrl);
    case 'vimeo':
      return _vimeoEmbed(videoUrl);
    case 'onedrive':
      if (videoUrl.contains('embed') || videoUrl.contains('onedrive.live.com')) {
        return videoUrl;
      }
      return videoUrl; // short link → abre externamente
    default:
      return videoUrl;
  }
}

bool _canEmbed(String videoUrl, String videoSource) {
  final src = videoSource.toLowerCase();
  // OneDrive short link (1drv.ms) es lo único que requiere navegador
  if (src == 'onedrive' && videoUrl.contains('1drv.ms')) return false;
  return true;
}

// ─── Inline Video Player Widget ───────────────────────────────────────────────
class _RecipeVideoPlayer extends StatefulWidget {
  final String videoUrl;
  final String videoSource;

  const _RecipeVideoPlayer({required this.videoUrl, required this.videoSource});

  @override
  State<_RecipeVideoPlayer> createState() => _RecipeVideoPlayerState();
}

class _RecipeVideoPlayerState extends State<_RecipeVideoPlayer> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isFullscreen = false;

  @override
  void initState() {
    super.initState();
    if (_canEmbed(widget.videoUrl, widget.videoSource)) {
      _controller = WebViewController();
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
      await _controller.setJavaScriptMode(JavaScriptMode.unrestricted);
      await _controller.setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => _setPlayerState(loading: true, error: false),
          onPageFinished: (_) {
            if (!mounted) return;
            if (widget.videoSource.trim().toLowerCase() != 'upload') {
              _setPlayerState(loading: false, error: _hasError);
            }
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame != true) return;
            _setPlayerState(loading: false, error: true);
          },
        ),
      );
      await _controller.addJavaScriptChannel(
        'AloecVideo',
        onMessageReceived: (message) {
          if (message.message == 'ready' || message.message == 'playing') {
            _setPlayerState(loading: false, error: false);
          } else if (message.message.startsWith('error')) {
            _setPlayerState(loading: false, error: true);
          }
        },
      );
      final platform = _controller.platform;
      if (platform is AndroidWebViewController) {
        await platform.setMediaPlaybackRequiresUserGesture(false);
      }
      if (!mounted) return;
      await _loadVideo();
    } catch (error) {
      debugPrint('Recipe video initialization failed: $error');
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
      final src = widget.videoSource.trim().toLowerCase();
      if (src == 'upload') {
        final videoUrl = const HtmlEscape(HtmlEscapeMode.attribute)
            .convert(widget.videoUrl.trim());
        final html = _buildHtmlVideoPlayer(videoUrl);
        await _controller.loadHtmlString(
          html,
          baseUrl: 'https://app-aloec.firebaseapp.com',
        );
      } else {
        final embedUrl = _buildEmbedUrl(widget.videoUrl, widget.videoSource);
        await _controller.loadRequest(Uri.parse(embedUrl));
      }
    } catch (error) {
      debugPrint('Recipe video loading failed: $error');
      _setPlayerState(loading: false, error: true);
    }
  }

  void _toggleFullscreen() {
    setState(() => _isFullscreen = !_isFullscreen);
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canEmbed = _canEmbed(widget.videoUrl, widget.videoSource);

    if (!canEmbed) {
      // OneDrive short link → botón de reproducción
      return Container(
        width: double.infinity,
        height: 200,
        color: const Color(0xFF0F1114),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_queue, color: Colors.white38, size: 56),
            const SizedBox(height: 12),
            const Text(
              'Enlace externo de OneDrive',
              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.open_in_new, size: 18),
              label: const Text('Abrir en OneDrive', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () async {
                final uri = Uri.parse(widget.videoUrl);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
            ),
          ],
      ),
    );
  }

    return Column(
      children: [
        Stack(
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: WebViewWidget(controller: _controller),
            ),
            if (_isLoading)
              const AspectRatio(
                aspectRatio: 16 / 9,
                child: ColoredBox(
                  color: Colors.black,
                  child: Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
                ),
              ),
            if (_hasError)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: ColoredBox(
                  color: Colors.black87,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.white54, size: 40),
                      const SizedBox(height: 8),
                      const Text('No se pudo cargar el video',
                          style: TextStyle(color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.refresh, size: 16),
                        onPressed: () => unawaited(_loadVideo()),
                        label: const Text('Reintentar', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),
            // Fullscreen toggle button
            Positioned(
              bottom: 8,
              right: 8,
              child: GestureDetector(
                onTap: _toggleFullscreen,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Icon(
                    _isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ─── JuiceDetailScreen ────────────────────────────────────────────────────────
class JuiceDetailScreen extends ConsumerWidget {
  final String juiceId;

  const JuiceDetailScreen({super.key, required this.juiceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recipeAsync = ref.watch(recipeByIdProvider(juiceId));

    if (recipeAsync.isLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
      );
    }

    final recipe = recipeAsync.valueOrNull;

    if (recipe == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(child: Text('Receta no encontrada', style: TextStyle(color: Colors.grey))),
      );
    }

    final info = recipe.nutritionalInfo;
    final hasVideo = recipe.videoUrl.isNotEmpty;

    final scaffold = Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // ─── Hero image header ─────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            backgroundColor: AppColors.primaryGreen,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
              onPressed: () => context.pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: recipe.imageUrl.isNotEmpty
                  ? Image.network(
                      recipe.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: Colors.green[50],
                        child: const Icon(Icons.restaurant_menu, size: 80, color: Colors.green),
                      ),
                    )
                  : Container(
                      color: Colors.green[50],
                      child: const Icon(Icons.restaurant_menu, size: 80, color: Colors.green),
                    ),
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── Inline Video Player ───────────────────────────────────
                if (hasVideo) ...[
                  _RecipeVideoPlayer(
                    videoUrl: recipe.videoUrl,
                    videoSource: recipe.videoSource,
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    color: const Color(0xFF0F1114),
                    child: Row(
                      children: [
                        const Icon(Icons.play_circle_outline, color: Colors.white54, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          'Video: ${recipe.title}',
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // ─── Content ────────────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              recipe.title,
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primaryGreen.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              recipe.categoryLabel,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (recipe.tags.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          children: recipe.tags
                              .map((tag) => Chip(
                                    label: Text(tag, style: const TextStyle(fontSize: 10)),
                                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    visualDensity: VisualDensity.compact,
                                    backgroundColor: Colors.grey[100],
                                  ))
                              .toList(),
                        ),
                      ],
                      const SizedBox(height: 8),
                      Text(
                        recipe.description,
                        style: const TextStyle(color: Colors.grey, height: 1.5),
                      ),

                      // Nutritional info
                      const SizedBox(height: 24),
                      const Text('Informacion Nutricional',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _NutritionChip(icon: Icons.local_fire_department, label: '${info.calories} kcal', color: Colors.orange),
                          _NutritionChip(icon: Icons.fitness_center, label: '${info.protein}g proteina', color: Colors.red),
                          _NutritionChip(icon: Icons.grain, label: '${info.carbs}g carbos', color: Colors.amber),
                          _NutritionChip(icon: Icons.water_drop, label: '${info.fat}g grasas', color: Colors.blue),
                          _NutritionChip(icon: Icons.grass, label: '${info.fiber}g fibra', color: Colors.green),
                        ],
                      ),
                      if (info.vitamins.isNotEmpty || info.minerals.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            ...info.vitamins.map((v) => _TagChip(label: v, color: Colors.purple)),
                            ...info.minerals.map((m) => _TagChip(label: m, color: Colors.teal)),
                          ],
                        ),
                      ],

                      // Ingredients
                      if (recipe.ingredients.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        const Text('Ingredientes',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 12),
                        ...recipe.ingredients.map(
                          (ing) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.check_circle, size: 16, color: AppColors.primaryGreen),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(ing, style: const TextStyle(fontSize: 14, height: 1.4)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],

                      // Preparation
                      if (recipe.preparation.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        const Text('Preparacion',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 12),
                        Text(
                          recipe.preparation,
                          style: const TextStyle(color: Colors.grey, height: 1.6, fontSize: 14),
                        ),
                      ],

                      // Benefits
                      if (recipe.benefits.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        const Text('Beneficios',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 12),
                        ...recipe.benefits.map(
                          (b) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.favorite, size: 14, color: Colors.red),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(b, style: const TextStyle(fontSize: 14, height: 1.4)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );

    if (recipe.isPremium) {
      return PremiumGate(
        title: 'Receta Premium',
        description: 'Desbloquea todas las recetas premium con videos y guias completas.',
        child: scaffold,
      );
    }
    return scaffold;
  }
}

// ─── Supporting widgets ───────────────────────────────────────────────────────
class _NutritionChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _NutritionChip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}

class _TagChip extends StatelessWidget {
  final String label;
  final Color color;
  const _TagChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
