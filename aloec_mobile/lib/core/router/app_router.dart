import 'package:go_router/go_router.dart';
import 'package:firebase_analytics/firebase_analytics.dart';

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
import '../../features/bmi/presentation/screens/bmi_calculator_screen.dart';
import '../../features/bmi/presentation/screens/bmi_result_screen.dart';
import '../../features/subscriptions/presentation/screens/protocol_detail_screen.dart';
import '../../features/subscriptions/domain/protocol_model.dart';

final goRouter = GoRouter(
  initialLocation: '/splash',
  observers: [
    FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
  ],
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
      builder: (context, state) => const CheckoutScreen(),
    ),

    // ─── IMC / Protocolo Médico ─────────────────────────────────────────────
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
        final protocol =
            extra?['protocol'] as ProtocolModel? ?? AloecProtocols.overweight;
        return ProtocolDetailScreen(protocol: protocol);
      },
    ),
  ],
);
