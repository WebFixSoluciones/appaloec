import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import '../../data/banners_repository.dart';
import '../../domain/banner_entity.dart';

class BannerCarousel extends StatefulWidget {
  final String position;

  const BannerCarousel({super.key, required this.position});

  @override
  State<BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  final _repo = BannersRepository();
  List<BannerEntity> _banners = [];
  bool _loading = true;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadBanners();
  }

  Future<void> _loadBanners() async {
    try {
      final all = await _repo.getActiveBanners();
      if (!mounted) return;
      setState(() {
        _banners = all.where((b) => b.position == widget.position).toList();
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  void _onBannerTap(BannerEntity banner) async {
    _repo.incrementClickCount(banner.id);
    if (banner.targetUrl.isEmpty) return;

    if (banner.targetUrl.startsWith('http')) {
      final uri = Uri.tryParse(banner.targetUrl);
      if (uri != null) {
        try {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } catch (_) {}
      }
    } else {
      if (context.mounted) {
        context.push(banner.targetUrl);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const SizedBox.shrink();
    if (_banners.isEmpty) return const SizedBox.shrink();

    final banner = _banners[_currentIndex];

    return GestureDetector(
      onTap: () => _onBannerTap(banner),
      child: Container(
        width: double.infinity,
        height: 160,
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.network(
                banner.imageUrl,
                width: double.infinity,
                height: 160,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: const Color(0xFFE8F5E9),
                  child: const Center(
                    child: Icon(Icons.image_not_supported,
                        color: Colors.grey, size: 40),
                  ),
                ),
                loadingBuilder: (_, child, progress) {
                  if (progress == null) return child;
                  return Container(
                    color: const Color(0xFFF5F5F5),
                    child: const Center(
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Color(0xFF67B539),
                      ),
                    ),
                  );
                },
              ),
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(14),
                    bottomRight: Radius.circular(14),
                  ),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                ),
                child: Text(
                  banner.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            if (_banners.length > 1)
              Positioned(
                bottom: 10,
                right: 14,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(_banners.length, (i) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: i == _currentIndex ? 18 : 6,
                      height: 6,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: i == _currentIndex
                            ? Colors.white
                            : Colors.white54,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    );
                  }),
                ),
              ),
            if (_banners.length > 1)
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                width: 30,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _currentIndex = (_currentIndex - 1 + _banners.length) % _banners.length;
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [
                          Colors.black.withOpacity(0.05),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            if (_banners.length > 1)
              Positioned(
                right: 0,
                top: 0,
                bottom: 0,
                width: 30,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _currentIndex = (_currentIndex + 1) % _banners.length;
                    });
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.05),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
