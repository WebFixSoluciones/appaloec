import 'dart:io' show Platform;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class VersionService {
  static const String currentVersion = '1.2.0';

  static Map<String, dynamic>? _cachedSettings;

  static Future<Map<String, dynamic>?> _getSettings() async {
    if (_cachedSettings != null) return _cachedSettings;

    try {
      final doc = await FirebaseFirestore.instance
          .collection('system_settings')
          .doc('global')
          .get();

      if (doc.exists) {
        _cachedSettings = doc.data();
        return _cachedSettings;
      }
    } catch (_) {}

    try {
      final doc = await FirebaseFirestore.instance
          .collection('app_config')
          .doc('main')
          .get();

      if (doc.exists) {
        _cachedSettings = doc.data();
        return _cachedSettings;
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
}
