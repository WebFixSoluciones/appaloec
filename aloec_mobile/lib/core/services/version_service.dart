import 'dart:io' show Platform;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';

class VersionService {
  static const String currentVersion = '1.4.0';
  static const int currentVersionCode = 20;

  static const String defaultPlayStoreUrl =
      'https://play.google.com/store/apps/details?id=net.alimentacionorganica.aloec&hl=es_419';
  static const String defaultAppStoreUrl =
      'https://apps.apple.com/app/id0000000000';

  static Future<Map<String, dynamic>?>? _settingsFuture;

  static Future<Map<String, dynamic>?> _getSettings() async {
    return _settingsFuture ??= _loadSettings();
  }

  static Future<Map<String, dynamic>?> _loadSettings() async {
    try {
      final doc = await FirebaseFirestore.instance
          .collection('system_settings')
          .doc('global')
          .get()
          .timeout(const Duration(seconds: 5));

      if (doc.exists) {
        return doc.data();
      }
    } catch (_) {}

    try {
      final doc = await FirebaseFirestore.instance
          .collection('app_config')
          .doc('main')
          .get()
          .timeout(const Duration(seconds: 5));

      if (doc.exists) {
        return doc.data();
      }
    } catch (_) {}

    return null;
  }

  static Future<bool> isMaintenanceMode() async {
    try {
      final settings = await _getSettings();
      if (settings == null) return false;
      return settings['maintenanceMode'] == true;
    } catch (e) {
      debugPrint('VersionService maintenance check error: $e');
      return false;
    }
  }

  static Future<String?> getMinimumVersion() async {
    try {
      final settings = await _getSettings();
      if (settings == null) return null;

      if (Platform.isAndroid) {
        final min = settings['minAppVersionAndroid'] as String?;
        if (min != null && min.isNotEmpty) return min;
      } else if (Platform.isIOS) {
        final min = settings['minAppVersionIos'] as String?;
        if (min != null && min.isNotEmpty) return min;
      }
    } catch (_) {}
    return null;
  }

  static Future<String?> getLatestVersion() async {
    try {
      final settings = await _getSettings();
      if (settings == null) return null;

      if (Platform.isAndroid) {
        final latest = settings['latestAppVersionAndroid'] as String?;
        if (latest != null && latest.isNotEmpty) return latest;
      } else if (Platform.isIOS) {
        final latest = settings['latestAppVersionIos'] as String?;
        if (latest != null && latest.isNotEmpty) return latest;
      }
    } catch (_) {}
    return null;
  }

  static Future<bool> isUpdateRequired() async {
    try {
      final minimum = await getMinimumVersion();
      if (minimum == null) return false;
      return _compareVersions(currentVersion, minimum) < 0;
    } catch (e) {
      debugPrint('VersionService error: $e');
      return false;
    }
  }

  static Future<bool> isOptionalUpdateAvailable() async {
    try {
      final latest = await getLatestVersion();
      if (latest == null) return false;
      return _compareVersions(currentVersion, latest) < 0;
    } catch (e) {
      debugPrint('VersionService optional update error: $e');
      return false;
    }
  }

  static int _compareVersions(String a, String b) {
    final aParts = a.split('.').map((p) => int.tryParse(p) ?? 0).toList();
    final bParts = b.split('.').map((p) => int.tryParse(p) ?? 0).toList();

    for (var i = 0; i < 3; i++) {
      final aVal = i < aParts.length ? aParts[i] : 0;
      final bVal = i < bParts.length ? bParts[i] : 0;
      if (aVal != bVal) return aVal - bVal;
    }
    return 0;
  }

  static Future<void> openStore() async {
    final url = Platform.isIOS ? defaultAppStoreUrl : defaultPlayStoreUrl;
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Error opening store: $e');
    }
  }

  /// Verifica si hay actualizaciones o si corresponde mostrar el modal de Novedades.
  static Future<void> checkAppUpdateAndWhatsNew(BuildContext context) async {
    // 1. Revisar si hay actualización opcional disponible
    final optionalUpdate = await isOptionalUpdateAvailable();
    if (optionalUpdate && context.mounted) {
      final settings = await _getSettings();
      final title = (settings?['updateTitle'] as String?) ??
          '¡Nueva versión de ALOEC disponible!';
      final message = (settings?['updateMessage'] as String?) ??
          'Hemos preparado mejoras importantes en la calculadora de IMC, hábitos diarios y estabilidad.';

      if (context.mounted) {
        _showOptionalUpdateDialog(context, title, message);
      }
      return;
    }

    // 2. Si no hay actualización pendiente, verificar si corresponde mostrar "Novedades tras actualizar"
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastSeenCode = prefs.getInt('last_seen_version_code') ?? 0;

      if (lastSeenCode > 0 && lastSeenCode < currentVersionCode) {
        if (context.mounted) {
          _showWhatsNewModal(context);
        }
      }

      // Guardar que ya se registró la versión actual
      await prefs.setInt('last_seen_version_code', currentVersionCode);
    } catch (e) {
      debugPrint('Error checking what\'s new: $e');
    }
  }

  static void _showOptionalUpdateDialog(
      BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20),
        actionsPadding: const EdgeInsets.all(16),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.system_update_rounded,
                color: AppColors.primaryGreen,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
            ),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF475569),
            height: 1.4,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'Más tarde',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              openStore();
            },
            child: const Text(
              'Actualizar ahora',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  static void _showWhatsNewModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    '✨ ¡Tu app se actualizó!',
                    style: TextStyle(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                const Text(
                  'v1.4.0 (v20)',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'Descubre lo nuevo en ALOEC',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Hemos diseñado nuevas funciones pensadas para tu salud y comodidad:',
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 18),

            // Feature 1
            const _WhatsNewItem(
              icon: Icons.calculate_rounded,
              iconColor: AppColors.primaryGreen,
              title: 'Calculadora de IMC Todo-en-Uno',
              description:
                  'Ingresa tu estatura en metros o centímetros automáticamente con diagnóstico instantáneo y protocolo médico sugerido.',
            ),
            const SizedBox(height: 14),

            // Feature 2
            const _WhatsNewItem(
              icon: Icons.insights_rounded,
              iconColor: Color(0xFF0284C7),
              title: 'Dashboard "Mi Progreso" Renovado',
              description:
                  'Métricas 2x2 en tiempo real, conteo de racha, jugos tomados y gráfica semanal con formato de píldoras.',
            ),
            const SizedBox(height: 14),

            // Feature 3
            const _WhatsNewItem(
              icon: Icons.account_balance_rounded,
              iconColor: Color(0xFFFF9800),
              title: 'Pagos con Transferencia Bancaria',
              description:
                  'Disponible para Ecuador: obtén las cuentas oficiales y notifica tu compra fácilmente por WhatsApp.',
            ),
            const SizedBox(height: 24),

            // Botón de Cierre
            GestureDetector(
              onTap: () => Navigator.of(context).pop(),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1B5E20), Color(0xFF67B539)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    '¡Excelente, comenzar!',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
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

class _WhatsNewItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String description;

  const _WhatsNewItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 3),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF64748B),
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
