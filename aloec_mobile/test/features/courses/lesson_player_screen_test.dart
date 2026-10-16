import 'dart:async';

import 'package:aloec_mobile/features/courses/domain/course_entity.dart';
import 'package:aloec_mobile/features/courses/presentation/screens/lesson_player_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:webview_flutter_platform_interface/webview_flutter_platform_interface.dart';

LessonEntity lesson({String source = 'youtube'}) => LessonEntity(
      id: 'lesson',
      courseId: 'course',
      title: 'Clase',
      description: '',
      videoUrl: source == 'upload'
          ? 'https://example.com/video.mp4?token=a&name="video"'
          : 'https://www.youtube.com/watch?v=example1234',
      videoSource: source,
      duration: 60,
      order: 1,
    );

void main() {
  late _TestWebViewPlatform platform;
  setUp(() {
    platform = _TestWebViewPlatform();
    WebViewPlatform.instance = platform;
  });

  Future<void> openPlayer(WidgetTester tester,
      {String source = 'youtube'}) async {
    await tester.pumpWidget(MaterialApp(
      home: LessonPlayerScreen(
          lesson: lesson(source: source), courseTitle: 'Curso'),
    ));
    await tester.pump();
  }

  testWidgets('first navigation waits for native configuration',
      (tester) async {
    platform.configuration = Completer<void>();
    await openPlayer(tester);
    expect(platform.controller.requests, isEmpty);
    platform.configuration!.complete();
    await tester.pump();
    expect(platform.controller.requests, hasLength(1));
    expect(platform.controller.channel, isNotNull);
    expect(platform.controller.delegate, isNotNull);
  });

  testWidgets('secondary resource failures do not block the video',
      (tester) async {
    await openPlayer(tester);
    platform.delegate.finished('https://www.youtube.com/embed/example1234');
    platform.delegate.resourceError(const WebResourceError(
      errorCode: -2,
      description: 'Thumbnail unavailable',
      isForMainFrame: false,
    ));
    await tester.pump();
    expect(find.text('Reintentar'), findsNothing);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets('main page failure offers retry and reloads the original video',
      (tester) async {
    await openPlayer(tester);
    platform.delegate.resourceError(const WebResourceError(
      errorCode: -2,
      description: 'Document unavailable',
      isForMainFrame: true,
    ));
    platform.delegate.finished('https://www.youtube.com/embed/example1234');
    await tester.pump();
    expect(find.text('Reintentar'), findsOneWidget);
    await tester.tap(find.text('Reintentar'));
    await tester.pump();
    expect(platform.controller.requests, hasLength(2));
    expect(platform.controller.requests[0].uri,
        platform.controller.requests[1].uri);
    expect(find.text('Reintentar'), findsNothing);
  });

  testWidgets('direct video failure is reported and late callbacks are safe',
      (tester) async {
    await openPlayer(tester, source: 'upload');
    expect(platform.controller.html,
        contains('token=a&amp;name=&quot;video&quot;'));
    platform.controller.channel!.onMessageReceived(
      const JavaScriptMessage(message: 'error'),
    );
    await tester.pump();
    expect(find.text('Reintentar'), findsOneWidget);

    await tester.pumpWidget(const SizedBox());
    platform.delegate.started('https://example.com');
    platform.delegate.finished('https://example.com');
    platform.delegate.resourceError(const WebResourceError(
      errorCode: -2,
      description: 'Late error',
      isForMainFrame: true,
    ));
    expect(tester.takeException(), isNull);
  });
}

class _TestWebViewPlatform extends WebViewPlatform {
  Completer<void>? configuration;
  late _TestController controller;
  late _TestDelegate delegate;

  @override
  PlatformWebViewController createPlatformWebViewController(
      PlatformWebViewControllerCreationParams params) {
    return controller = _TestController(params, configuration);
  }

  @override
  PlatformNavigationDelegate createPlatformNavigationDelegate(
      PlatformNavigationDelegateCreationParams params) {
    return delegate = _TestDelegate(params);
  }

  @override
  PlatformWebViewWidget createPlatformWebViewWidget(
          PlatformWebViewWidgetCreationParams params) =>
      _TestWidget(params);
}

class _TestController extends PlatformWebViewController {
  _TestController(super.params, this.configuration) : super.implementation();
  final Completer<void>? configuration;
  final requests = <LoadRequestParams>[];
  PlatformNavigationDelegate? delegate;
  JavaScriptChannelParams? channel;
  String? html;

  @override
  Future<void> setJavaScriptMode(JavaScriptMode mode) async {
    await configuration?.future;
  }

  @override
  Future<void> setPlatformNavigationDelegate(
      PlatformNavigationDelegate value) async {
    delegate = value;
  }

  @override
  Future<void> addJavaScriptChannel(JavaScriptChannelParams params) async {
    channel = params;
  }

  @override
  Future<void> loadRequest(LoadRequestParams params) async {
    requests.add(params);
  }

  @override
  Future<void> loadHtmlString(String value, {String? baseUrl}) async {
    html = value;
  }
}

class _TestDelegate extends PlatformNavigationDelegate {
  _TestDelegate(super.params) : super.implementation();
  late PageEventCallback started;
  late PageEventCallback finished;
  late WebResourceErrorCallback resourceError;

  @override
  Future<void> setOnPageStarted(PageEventCallback callback) async =>
      started = callback;
  @override
  Future<void> setOnPageFinished(PageEventCallback callback) async =>
      finished = callback;
  @override
  Future<void> setOnWebResourceError(WebResourceErrorCallback callback) async =>
      resourceError = callback;
}

class _TestWidget extends PlatformWebViewWidget {
  _TestWidget(super.params) : super.implementation();
  @override
  Widget build(BuildContext context) => const SizedBox.expand();
}
