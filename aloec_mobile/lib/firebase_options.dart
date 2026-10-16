import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4',
    appId: '1:75165578833:web:db63c434d7c68e848e6a70',
    messagingSenderId: '75165578833',
    projectId: 'app-aloec',
    authDomain: 'app-aloec.firebaseapp.com',
    storageBucket: 'app-aloec.firebasestorage.app',
    measurementId: 'G-7DW1EXHVQM',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAtcwsCGfed0vLZfTK-IW5gTI5ttNXC1_Y',
    appId: '1:75165578833:android:aad140d1afdeddc48e6a70',
    messagingSenderId: '75165578833',
    projectId: 'app-aloec',
    storageBucket: 'app-aloec.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4',
    appId: '1:75165578833:ios:db63c434d7c68e848e6a70',
    messagingSenderId: '75165578833',
    projectId: 'app-aloec',
    storageBucket: 'app-aloec.firebasestorage.app',
    iosBundleId: 'net.alimentacionorganica.aloec',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4',
    appId: '1:75165578833:ios:db63c434d7c68e848e6a70',
    messagingSenderId: '75165578833',
    projectId: 'app-aloec',
    storageBucket: 'app-aloec.firebasestorage.app',
    iosBundleId: 'net.alimentacionorganica.aloec',
  );
}
