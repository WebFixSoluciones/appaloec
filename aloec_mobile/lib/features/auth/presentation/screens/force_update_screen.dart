import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/version_service.dart';

class ForceUpdateScreen extends StatefulWidget {
  const ForceUpdateScreen({super.key});

  @override
  State<ForceUpdateScreen> createState() => _ForceUpdateScreenState();
}

class _ForceUpdateScreenState extends State<ForceUpdateScreen> {
  bool _isMaintenance = false;

  bool get _isAndroid => Platform.isAndroid;
  bool get _isIOS => Platform.isIOS;

  @override
  void initState() {
    super.initState();
    _checkMode();
  }

  Future<void> _checkMode() async {
    final maintenance = await VersionService.isMaintenanceMode();
    if (mounted) setState(() => _isMaintenance = maintenance);
  }

  Future<void> _openStore() async {
    if (_isAndroid) {
      final uris = [
        Uri.parse('market://details?id=com.webfix.aloec_mobile'),
        Uri.parse(
            'https://play.google.com/store/apps/details?id=com.webfix.aloec_mobile'),
      ];
      for (final uri in uris) {
        try {
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
            return;
          }
        } catch (_) {}
      }
    } else if (_isIOS) {
      final uris = [
        Uri.parse('itms-apps://itunes.apple.com/app/id0000000000'),
        Uri.parse(
            'https://apps.apple.com/app/id0000000000'),
      ];
      for (final uri in uris) {
        try {
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
            return;
          }
        } catch (_) {}
      }
    }
  }

  String get _storeName => _isAndroid ? 'Google Play' : 'App Store';

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: (_isMaintenance
                              ? Colors.orange
                              : AppColors.primaryGreen)
                          .withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _isMaintenance
                          ? Icons.construction_rounded
                          : Icons.system_update_rounded,
                      color: _isMaintenance
                          ? Colors.orange
                          : AppColors.primaryGreen,
                      size: 52,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text(
                    _isMaintenance
                        ? 'En Mantenimiento'
                        : 'Actualizacion Disponible',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _isMaintenance
                        ? 'ALOEC esta en mantenimiento.\n'
                            'Volveremos pronto con mejoras.\n'
                            'Gracias por tu paciencia.'
                        : 'Hay una nueva version de ALOEC disponible.\n'
                            'Actualiza la app para continuar disfrutando\n'
                            'de todos los beneficios.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textLight,
                      height: 1.5,
                    ),
                  ),
                  if (!_isMaintenance) ...[
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton.icon(
                        onPressed: _openStore,
                        icon:
                            const Icon(Icons.download, color: Colors.white),
                        label: Text('Abrir $_storeName',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGreen,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
