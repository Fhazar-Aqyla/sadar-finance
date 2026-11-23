import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/config/app_config.dart';
import 'core/theme/app_theme.dart';
import 'providers/ui_preferences_provider.dart';
import 'router/app_router.dart';

class SadarFinanceApp extends ConsumerWidget {
  const SadarFinanceApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final uiPrefs = ref.watch(uiPreferencesProvider);

    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: uiPrefs.themeMode,
      routerConfig: router,
    );
  }
}
