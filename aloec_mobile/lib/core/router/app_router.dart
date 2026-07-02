import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/onboarding_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/juices/presentation/screens/juice_detail_screen.dart';
import '../../features/courses/presentation/screens/course_detail_screen.dart';
import '../../features/subscriptions/presentation/screens/upsell_screen.dart';
import '../../features/subscriptions/presentation/screens/checkout_screen.dart';
import '../../features/subscriptions/data/memberships_repository.dart';
import '../../features/bmi/presentation/screens/bmi_calculator_screen.dart';
import '../../features/bmi/presentation/screens/bmi_result_screen.dart';
import '../../features/subscriptions/presentation/screens/protocol_detail_screen.dart';
import '../../features/subscriptions/domain/protocol_model.dart';

import '../../features/auth/presentation/screens/force_update_screen.dart';
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
import '../../features/profile/presentation/screens/notifications_screen.dart';
import '../../features/profile/presentation/screens/help_screen.dart';
import '../../features/profile/presentation/screens/subscription_screen.dart';

const _publicRoutes = ['/splash', '/onboarding', '/auth/login', '/auth/register', '/auth/forgot-password', '/force-update'];

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

final goRouter = GoRouter(
  initialLocation: '/splash',
  refreshListenable: GoRouterRefreshStream(
    FirebaseAuth.instance.authStateChanges(),
  ),
  observers: [
    FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
  ],
  redirect: (context, state) {
    final user = FirebaseAuth.instance.currentUser;
    final isPublicRoute = _publicRoutes.contains(state.matchedLocation);

    // Si no hay usuario y está en ruta protegida → al onboarding
    if (user == null && !isPublicRoute) {
      return '/onboarding';
    }

    // Si hay usuario y está en ruta pública (excepto splash inicial) → al home
    if (user != null && isPublicRoute && state.matchedLocation != '/splash') {
      return '/home';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(
      path: '/auth/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/auth/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/auth/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/juice-detail/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return JuiceDetailScreen(juiceId: id);
      },
    ),
    GoRoute(
      path: '/course-detail/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return CourseDetailScreen(courseId: id);
      },
    ),
    GoRoute(
      path: '/premium-upsell',
      builder: (context, state) => const UpsellScreen(),
    ),
    GoRoute(
      path: '/premium-checkout',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final membership = extra?['membership'] as MembershipEntity?;
        return CheckoutScreen(membership: membership);
      },
    ),

    GoRoute(
      path: '/force-update',
      builder: (context, state) => const ForceUpdateScreen(),
    ),
    GoRoute(
      path: '/edit-profile',
      builder: (context, state) => const EditProfileScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/help',
      builder: (context, state) => const HelpScreen(),
    ),
    GoRoute(
      path: '/subscription',
      builder: (context, state) => const SubscriptionScreen(),
    ),

    // ─── IMC / Protocolo Medico ─────────────────────────────────────────────
    GoRoute(
      path: '/bmi-calculator',
      builder: (context, state) => const BmiCalculatorScreen(),
    ),
    GoRoute(
      path: '/bmi-result',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final bmi = (extra?['bmi'] as double?) ?? 0.0;
        final status = (extra?['status'] as String?) ?? '';
        final protocol = extra?['protocol'] as ProtocolModel?;
        return BmiResultScreen(bmi: bmi, status: status, protocol: protocol);
      },
    ),
    GoRoute(
      path: '/protocol-detail',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final protocol = extra?['protocol'] as ProtocolModel?;
        if (protocol == null) return const Scaffold(body: Center(child: Text('Protocolo no disponible')));
        return ProtocolDetailScreen(protocol: protocol);
      },
    ),
  ],
);
