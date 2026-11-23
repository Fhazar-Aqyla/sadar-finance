import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../presentation/screens/auth/forgot_password_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/auth/register_screen.dart';
import '../presentation/screens/auth/splash_screen.dart';
import '../presentation/screens/dashboard/dashboard_screen.dart';
import '../presentation/screens/debt/debt_split_screen.dart';
import '../presentation/screens/history/financial_history_screen.dart';
import '../presentation/screens/insight/behavior_insight_screen.dart';
import '../presentation/screens/onboarding/onboarding_screen.dart';
import '../presentation/screens/plans/financial_plans_screen.dart';
import '../presentation/screens/profile/app_settings_screen.dart';
import '../presentation/screens/profile/edit_profile_screen.dart';
import '../presentation/screens/profile/legal_screen.dart';
import '../presentation/screens/profile/profile_account_screen.dart';
import '../presentation/screens/record/record_screen.dart';
import '../presentation/screens/score/financial_score_screen.dart';
import '../presentation/widgets/app_shell.dart';
import '../providers/auth_provider.dart';
import '../providers/ui_preferences_provider.dart';

/// Notifies GoRouter ONLY when routing-relevant state changes
/// (auth status, onboarding initialization/completion) - never when
/// loading flags, theme mode, privacy toggle, or user profile fields update.
class _RouterRefreshNotifier extends ChangeNotifier {
  _RouterRefreshNotifier(Ref ref) {
    ref.listen<AuthStatus>(
      authProvider.select((s) => s.status),
      (prev, next) {
        if (prev != next) notifyListeners();
      },
    );
    ref.listen<bool>(
      uiPreferencesProvider.select((s) => s.initialized),
      (prev, next) {
        if (prev != next) notifyListeners();
      },
    );
    ref.listen<bool>(
      uiPreferencesProvider.select((s) => s.onboardingSeen),
      (prev, next) {
        if (prev != next) notifyListeners();
      },
    );
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = _RouterRefreshNotifier(ref);
  ref.onDispose(refreshNotifier.dispose);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final uiPrefs = ref.read(uiPreferencesProvider);
      final loc = state.matchedLocation;
      final isAuthRoute = loc == '/login' ||
          loc == '/register' ||
          loc == '/forgot-password';
      final isLegalRoute =
          loc == '/privacy-policy' || loc == '/terms-conditions';

      if (auth.status == AuthStatus.initial || !uiPrefs.initialized) {
        return loc == '/splash' ? null : '/splash';
      }

      if (auth.status == AuthStatus.unauthenticated) {
        if (!uiPrefs.onboardingSeen) {
          if (loc == '/onboarding' || isAuthRoute || isLegalRoute) return null;
          return '/onboarding';
        }
        if (loc == '/onboarding' || isAuthRoute || isLegalRoute) return null;
        return '/login';
      }

      if (auth.status == AuthStatus.authenticated) {
        if (loc == '/splash' || isAuthRoute) return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (_, _) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (_, _) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (_, _) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (_, _) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (_, _) => const ForgotPasswordScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AppShell(
          navigationShell: navigationShell,
        ),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (_, _) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/behavior-insight',
                builder: (_, _) => const BehaviorInsightScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/catat-keuangan',
                builder: (_, state) => RecordScreen(
                  openScanner: state.uri.queryParameters['scan'] == '1',
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/financial-score',
                builder: (_, _) => const FinancialScoreScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile-account',
                builder: (_, _) => const ProfileAccountScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/financial-history',
        builder: (_, _) => const FinancialHistoryScreen(),
      ),
      GoRoute(
        path: '/financial-plans',
        builder: (_, state) => FinancialPlansScreen(
          initialTab:
              int.tryParse(state.uri.queryParameters['tab'] ?? '0') ?? 0,
        ),
      ),
      GoRoute(
        path: '/debt-split',
        builder: (_, state) => DebtSplitScreen(
          initialTab:
              int.tryParse(state.uri.queryParameters['tab'] ?? '0') ?? 0,
        ),
      ),
      GoRoute(
        path: '/profile-account/edit',
        builder: (_, _) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (_, _) => const AppSettingsScreen(),
      ),
      GoRoute(
        path: '/privacy-policy',
        builder: (_, _) => const LegalScreen(
          title: 'Kebijakan Privasi',
          isPrivacy: true,
        ),
      ),
      GoRoute(
        path: '/terms-conditions',
        builder: (_, _) => const LegalScreen(
          title: 'Syarat & Ketentuan',
          isPrivacy: false,
        ),
      ),
    ],
  );
});
