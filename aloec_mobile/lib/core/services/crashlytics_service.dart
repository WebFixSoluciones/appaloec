import 'package:flutter/foundation.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

class CrashlyticsService {
  static Future<void> initialize() async {
    if (kReleaseMode) {
      // Pass all uncaught "fatal" errors from the framework to Crashlytics
      FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
      
      // Pass all uncaught asynchronous errors that aren't handled by the Flutter framework to Crashlytics
      PlatformDispatcher.instance.onError = (error, stack) {
        FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
        return true;
      };
    }
  }

  static void log(String message) {
    if (kReleaseMode) {
      FirebaseCrashlytics.instance.log(message);
    } else {
      debugPrint('Crashlytics Log: $message');
    }
  }

  static void setUserId(String userId) {
    if (kReleaseMode) {
      FirebaseCrashlytics.instance.setUserIdentifier(userId);
    }
  }
}
