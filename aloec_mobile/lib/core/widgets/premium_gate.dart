import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../features/profile/data/firestore_profile_repository.dart';
import '../theme/app_colors.dart';

class PremiumGate extends ConsumerWidget {
  final Widget child;
  final String title;
  final String description;

  const PremiumGate({
    super.key,
    required this.child,
    this.title = 'Contenido Premium',
    this.description = 'Este contenido es exclusivo para usuarios con membresia activa.',
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileStreamProvider);
    final isPremium = profileAsync.value?.isPremium ?? false;

    if (isPremium) return child;

    return _buildLockedScreen(context);
  }

  Widget _buildLockedScreen(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.lock_outline,
                  size: 40, color: AppColors.primaryGreen),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              description,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textLight,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                onPressed: () => context.push('/premium-upsell'),
                child: const Text(
                  'Ver Planes Premium',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
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
