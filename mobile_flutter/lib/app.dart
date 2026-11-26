import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/config/app_config.dart';
import 'core/services/app_lock_service.dart';
import 'core/services/push_notification_service.dart';
import 'core/theme/app_theme.dart';
import 'presentation/widgets/sadar_logo.dart';
import 'providers/auth_provider.dart';
import 'providers/ui_preferences_provider.dart';
import 'router/app_router.dart';

final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

final appLockServiceProvider = Provider<AppLockService>(
  (ref) => AppLockService(),
);

class SadarFinanceApp extends ConsumerStatefulWidget {
  const SadarFinanceApp({super.key});

  @override
  ConsumerState<SadarFinanceApp> createState() => _SadarFinanceAppState();
}

class _SadarFinanceAppState extends ConsumerState<SadarFinanceApp>
    with WidgetsBindingObserver {
  bool _locked = false;
  bool _inBackground = false;
  bool _initialLockChecked = false;
  bool _authenticating = false;
  DateTime? _pausedAt;
  Timer? _globalPushTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    final isTest = Platform.environment.containsKey('FLUTTER_TEST');
    if (!isTest) {
      Future.microtask(() async {
        await PushNotificationService.requestPermission();
        await _checkRemotePushQueue();
      });
      _globalPushTimer = Timer.periodic(
        const Duration(seconds: 4),
        (_) => _checkRemotePushQueue(),
      );
    }
  }

  Future<void> _checkRemotePushQueue() async {
    if (!mounted) return;
    final enabled = ref.read(uiPreferencesProvider).pushNotificationsEnabled;
    if (!enabled) return;
    final items = await PushNotificationService.pollRemotePushFeed(
      ref.read(apiClientProvider),
      enabled: enabled,
    );
    if (!mounted || items.isEmpty) return;
    final latest = items.first;
    rootScaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.primary,
        duration: const Duration(seconds: 5),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        content: Row(
          children: [
            const Icon(
              Icons.notifications_active_rounded,
              color: AppColors.accent,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    latest['title'] ?? 'SADAR Finance V 2.0',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    latest['body'] ?? '',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _globalPushTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final uiPrefs = ref.read(uiPreferencesProvider);
    final auth = ref.read(authProvider);

    if (auth.status == AuthStatus.authenticated) {
      final shouldShield = state == AppLifecycleState.inactive ||
          state == AppLifecycleState.hidden ||
          state == AppLifecycleState.paused;
      if (_inBackground != shouldShield && mounted) {
        setState(() => _inBackground = shouldShield);
      }
    }

    if (state == AppLifecycleState.resumed) {
      _checkRemotePushQueue();
    }

    if (!uiPrefs.biometricLockEnabled ||
        auth.status != AuthStatus.authenticated) {
      return;
    }

    if (state == AppLifecycleState.paused) {
      _pausedAt = DateTime.now();
    } else if (state == AppLifecycleState.resumed) {
      // Grace period 20s so camera/gallery picker for OCR & avatar never triggers re-lock
      if (_pausedAt != null &&
          DateTime.now().difference(_pausedAt!).inSeconds >= 20) {
        setState(() => _locked = true);
        _unlock();
      }
      _pausedAt = null;
    }
  }

  Future<void> _unlock() async {
    if (_authenticating) return;
    _authenticating = true;
    try {
      final ok = await ref.read(appLockServiceProvider).authenticate();
      if (mounted && ok) {
        setState(() => _locked = false);
      }
    } finally {
      _authenticating = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final uiPrefs = ref.watch(uiPreferencesProvider);
    final auth = ref.watch(authProvider);

    if (!_initialLockChecked &&
        uiPrefs.initialized &&
        auth.status != AuthStatus.initial) {
      _initialLockChecked = true;
      if (uiPrefs.biometricLockEnabled &&
          auth.status == AuthStatus.authenticated) {
        _locked = true;
        Future.microtask(_unlock);
      }
    }

    if (auth.status == AuthStatus.unauthenticated && _locked) {
      _locked = false;
    }

    return MaterialApp.router(
      title: AppConfig.appName,
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: uiPrefs.themeMode,
      routerConfig: router,
      builder: (context, child) {
        return Stack(
          children: [
            ?child,
            Positioned.fill(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                child: (_inBackground &&
                        !_locked &&
                        uiPrefs.privacyShieldEnabled)
                    ? const _PrivacyShieldOverlay()
                    : const SizedBox.shrink(),
              ),
            ),
            if (_locked)
              Positioned.fill(
                child: _AppLockOverlay(
                  onUnlock: _unlock,
                  onLogout: () async {
                    setState(() => _locked = false);
                    await ref.read(authProvider.notifier).logout();
                  },
                ),
              ),
          ],
        );
      },
    );
  }
}

class _AppLockOverlay extends StatelessWidget {
  final VoidCallback onUnlock;
  final VoidCallback onLogout;

  const _AppLockOverlay({
    required this.onUnlock,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.bgOf(context),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SadarLogo(
                variant: SadarLogoVariant.adaptive,
                height: 36,
                alignment: CrossAxisAlignment.center,
              ),
              const SizedBox(height: 28),
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.primaryOf(context).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.fingerprint_rounded,
                  size: 40,
                  color: AppColors.primaryOf(context),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'SADAR Finance Terkunci',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimaryOf(context),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Verifikasi sidik jari, wajah, atau PIN perangkat Anda untuk melanjutkan.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13.5,
                  color: AppColors.textSecondaryOf(context),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: onUnlock,
                  icon: const Icon(Icons.lock_open_rounded),
                  label: const Text('Buka Kunci Aplikasi'),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: onLogout,
                child: Text(
                  'Keluar & Ganti Akun',
                  style: TextStyle(color: AppColors.textSecondaryOf(context)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PrivacyShieldOverlay extends StatelessWidget {
  const _PrivacyShieldOverlay();

  @override
  Widget build(BuildContext context) {
    return const Material(
      color: Color(0xFF0F172A),
      child: Center(
        child: SadarLogo(
          variant: SadarLogoVariant.light,
          height: 38,
          showFinanceSubtitle: true,
          alignment: CrossAxisAlignment.center,
        ),
      ),
    );
  }
}
