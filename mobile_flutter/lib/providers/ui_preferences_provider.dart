import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UiPreferencesState {
  final ThemeMode themeMode;
  final bool hideBalances;
  final bool onboardingSeen;
  final bool biometricLockEnabled;
  final bool privacyShieldEnabled;
  final bool initialized;

  const UiPreferencesState({
    this.themeMode = ThemeMode.light,
    this.hideBalances = false,
    this.onboardingSeen = false,
    this.biometricLockEnabled = false,
    this.privacyShieldEnabled = true,
    this.initialized = false,
  });

  bool get isDarkMode => themeMode == ThemeMode.dark;

  UiPreferencesState copyWith({
    ThemeMode? themeMode,
    bool? hideBalances,
    bool? onboardingSeen,
    bool? biometricLockEnabled,
    bool? privacyShieldEnabled,
    bool? initialized,
  }) {
    return UiPreferencesState(
      themeMode: themeMode ?? this.themeMode,
      hideBalances: hideBalances ?? this.hideBalances,
      onboardingSeen: onboardingSeen ?? this.onboardingSeen,
      biometricLockEnabled: biometricLockEnabled ?? this.biometricLockEnabled,
      privacyShieldEnabled: privacyShieldEnabled ?? this.privacyShieldEnabled,
      initialized: initialized ?? this.initialized,
    );
  }
}

class UiPreferencesNotifier extends StateNotifier<UiPreferencesState> {
  static const _themeKey = 'sadar_theme_mode';
  static const _hideBalanceKey = 'sadar_hide_balances';
  static const _onboardingKey = 'sadar_onboarding_seen_v1';
  static const _biometricLockKey = 'sadar_biometric_lock_enabled';
  static const _privacyShieldKey = 'sadar_privacy_shield_enabled';
  static String _tourKey(String userId) => 'sadar_tour_seen_$userId';

  UiPreferencesNotifier() : super(const UiPreferencesState()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isDark = prefs.getBool(_themeKey) ?? false;
      final hide = prefs.getBool(_hideBalanceKey) ?? false;
      final onboarding = prefs.getBool(_onboardingKey) ?? false;
      final biometricLock = prefs.getBool(_biometricLockKey) ?? false;
      final privacyShield = prefs.getBool(_privacyShieldKey) ?? true;
      state = UiPreferencesState(
        themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
        hideBalances: hide,
        onboardingSeen: onboarding,
        biometricLockEnabled: biometricLock,
        privacyShieldEnabled: privacyShield,
        initialized: true,
      );
    } catch (_) {
      state = state.copyWith(initialized: true);
    }
  }

  Future<void> setPrivacyShieldEnabled(bool enabled) async {
    state = state.copyWith(privacyShieldEnabled: enabled);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_privacyShieldKey, enabled);
    } catch (_) {}
  }

  Future<void> setBiometricLockEnabled(bool enabled) async {
    state = state.copyWith(biometricLockEnabled: enabled);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_biometricLockKey, enabled);
    } catch (_) {}
  }

  Future<void> toggleTheme() async {
    final nextDark = !state.isDarkMode;
    state = state.copyWith(
      themeMode: nextDark ? ThemeMode.dark : ThemeMode.light,
    );
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_themeKey, nextDark);
    } catch (_) {}
  }

  Future<void> setDarkMode(bool enabled) async {
    state = state.copyWith(
      themeMode: enabled ? ThemeMode.dark : ThemeMode.light,
    );
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_themeKey, enabled);
    } catch (_) {}
  }

  Future<void> toggleHideBalances() async {
    final next = !state.hideBalances;
    state = state.copyWith(hideBalances: next);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_hideBalanceKey, next);
    } catch (_) {}
  }

  Future<void> setHideBalances(bool hide) async {
    state = state.copyWith(hideBalances: hide);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_hideBalanceKey, hide);
    } catch (_) {}
  }

  Future<void> markOnboardingSeen() async {
    state = state.copyWith(onboardingSeen: true);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_onboardingKey, true);
    } catch (_) {}
  }

  Future<void> resetOnboarding() async {
    state = state.copyWith(onboardingSeen: false);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_onboardingKey, false);
    } catch (_) {}
  }

  Future<bool> hasSeenTour(String userId) async {
    if (userId.isEmpty) return true;
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_tourKey(userId)) ?? false;
    } catch (_) {
      return true;
    }
  }

  Future<void> markTourSeen(String userId) async {
    if (userId.isEmpty) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_tourKey(userId), true);
    } catch (_) {}
  }

  Future<void> resetTour(String userId) async {
    if (userId.isEmpty) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_tourKey(userId), false);
    } catch (_) {}
  }
}

final uiPreferencesProvider =
    StateNotifierProvider<UiPreferencesNotifier, UiPreferencesState>(
  (ref) => UiPreferencesNotifier(),
);
