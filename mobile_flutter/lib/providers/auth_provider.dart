import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/app_config.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../core/storage/secure_storage.dart';
import '../data/models/user_model.dart';
import '../data/services/sadar_api_service.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(secureStorageProvider)),
);

final sadarApiServiceProvider = Provider<SadarApiService>(
  (ref) => SadarApiService(ref.watch(apiClientProvider)),
);

enum AuthStatus { initial, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final bool isOfflineSession;
  final String apiBaseUrl;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.isOfflineSession = false,
    this.apiBaseUrl = AppConfig.productionApiUrl,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    bool clearUser = false,
    bool? isOfflineSession,
    String? apiBaseUrl,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      isOfflineSession: isOfflineSession ?? this.isOfflineSession,
      apiBaseUrl: apiBaseUrl ?? this.apiBaseUrl,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final SecureStorageService _storage;
  final SadarApiService _api;

  AuthNotifier(this._storage, this._api) : super(const AuthState()) {
    bootstrap();
  }

  static bool _isNetworkError(Object e) {
    final msg = e.toString().toLowerCase();
    return msg.contains('socketexception') ||
        msg.contains('tidak dapat terhubung') ||
        msg.contains('koneksi') ||
        msg.contains('timeout') ||
        msg.contains('failed host lookup') ||
        msg.contains('network is unreachable') ||
        msg.contains('connection');
  }

  Future<void> bootstrap() async {
    final savedUrl = await _storage.getApiUrl();
    final isDeprecatedUrl =
        savedUrl != null && savedUrl.contains('sadar-finance.up.railway.app');
    final effectiveUrl =
        (savedUrl != null && savedUrl.isNotEmpty && !isDeprecatedUrl)
            ? savedUrl
            : AppConfig.defaultApiUrl;
    if (isDeprecatedUrl) {
      await _storage.saveApiUrl(effectiveUrl);
    }

    _api.setBaseUrl(effectiveUrl);

    final token = await _storage.getToken();
    final cachedUserMap = await _storage.getUserMap();

    // Reject legacy demo tokens so production mode is strictly enforced
    if (token != null &&
        token.isNotEmpty &&
        token != 'demo-jwt-token-sadar-finance') {
      final cachedUser =
          cachedUserMap != null ? UserModel.fromJson(cachedUserMap) : null;
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: cachedUser,
        isOfflineSession: false,
        apiBaseUrl: effectiveUrl,
        clearError: true,
      );
      // Silently refresh profile if online; logout cleanly if token expired (401)
      try {
        final fresh = await _api.getProfile();
        await _storage.saveUserMap(fresh.toJson());
        state = state.copyWith(user: fresh, isOfflineSession: false);
      } catch (e) {
        if (e is ApiException && e.statusCode == 401) {
          await handleSessionExpired();
        } else if (_isNetworkError(e)) {
          state = state.copyWith(isOfflineSession: true);
        }
      }
    } else {
      if (token == 'demo-jwt-token-sadar-finance') {
        await _storage.clearAuth();
      }
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        clearUser: true,
        isOfflineSession: false,
        apiBaseUrl: effectiveUrl,
        clearError: true,
      );
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _api.login(email: email, password: password);
      await _storage.saveToken(result.token);
      await _storage.saveUserMap(result.user.toJson());
      await _storage.saveOfflineCredentials(
        email: email,
        password: password,
        token: result.token,
        user: result.user.toJson(),
      );
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: result.user,
        isOfflineSession: false,
        isLoading: false,
        clearError: true,
      );
      return true;
    } catch (e) {
      // Offline Login fallback: verify against locally stored encrypted credentials
      if (_isNetworkError(e)) {
        final offline = await _storage.verifyOfflineCredentials(
          email: email,
          password: password,
        );
        if (offline != null) {
          await _storage.saveToken(offline.token);
          await _storage.saveUserMap(offline.user);
          state = state.copyWith(
            status: AuthStatus.authenticated,
            user: UserModel.fromJson(offline.user),
            isOfflineSession: true,
            isLoading: false,
            clearError: true,
          );
          return true;
        }
        state = state.copyWith(
          isLoading: false,
          error:
              'Sedang offline. Masuk offline hanya tersedia untuk akun yang pernah login di perangkat ini.',
        );
        return false;
      }
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  Future<bool> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
    String? occupation,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _api.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        occupation: occupation,
      );
      await _storage.saveToken(result.token);
      await _storage.saveUserMap(result.user.toJson());
      await _storage.saveOfflineCredentials(
        email: email,
        password: password,
        token: result.token,
        user: result.user.toJson(),
      );
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: result.user,
        isOfflineSession: false,
        isLoading: false,
        clearError: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> updateProfile({
    String? firstName,
    String? middleName,
    String? lastName,
    String? username,
    String? gender,
    String? phoneNumber,
    String? dateOfBirth,
    String? address,
    String? city,
    String? province,
    String? postalCode,
    String? occupation,
    String? financialGoal,
    int? streakDays,
    int? xpPoints,
    int? financialLevel,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.updateProfile(
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        username: username,
        gender: gender,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        address: address,
        city: city,
        province: province,
        postalCode: postalCode,
        occupation: occupation,
        financialGoal: financialGoal,
        streakDays: streakDays,
        xpPoints: xpPoints,
        financialLevel: financialLevel,
      );
      // Merge extended fields locally too in case backend DB hasn't migrated new columns yet
      final merged = updated.copyWith(
        firstName: firstName?.trim().isNotEmpty == true
            ? firstName!.trim()
            : updated.firstName,
        middleName: middleName != null ? middleName.trim() : updated.middleName,
        lastName: lastName?.trim().isNotEmpty == true
            ? lastName!.trim()
            : updated.lastName,
        username: username != null
            ? username.trim().replaceAll('@', '').toLowerCase()
            : updated.username,
        gender: gender ?? updated.gender,
        phoneNumber: phoneNumber ?? updated.phoneNumber,
        dateOfBirth: dateOfBirth ?? updated.dateOfBirth,
        address: address ?? updated.address,
        city: city ?? updated.city,
        province: province ?? updated.province,
        postalCode: postalCode ?? updated.postalCode,
        occupation: occupation ?? updated.occupation,
        financialGoal: financialGoal ?? updated.financialGoal,
        streakDays: streakDays ?? updated.streakDays,
        xpPoints: xpPoints ?? updated.xpPoints,
        financialLevel: financialLevel ?? updated.financialLevel,
      );
      await _storage.saveUserMap(merged.toJson());
      state = state.copyWith(user: merged, isLoading: false);
      return true;
    } catch (e) {
      // Fallback: if server rejects unknown columns before VPS update or device is offline, persist locally
      if (state.user != null) {
        final localUpdated = state.user!.copyWith(
          firstName: firstName?.trim().isNotEmpty == true
              ? firstName!.trim()
              : state.user!.firstName,
          middleName:
              middleName != null ? middleName.trim() : state.user!.middleName,
          lastName: lastName?.trim().isNotEmpty == true
              ? lastName!.trim()
              : state.user!.lastName,
          username: username != null
              ? username.trim().replaceAll('@', '').toLowerCase()
              : state.user!.username,
          gender: gender ?? state.user!.gender,
          phoneNumber: phoneNumber ?? state.user!.phoneNumber,
          dateOfBirth: dateOfBirth ?? state.user!.dateOfBirth,
          address: address ?? state.user!.address,
          city: city ?? state.user!.city,
          province: province ?? state.user!.province,
          postalCode: postalCode ?? state.user!.postalCode,
          occupation: occupation ?? state.user!.occupation,
          financialGoal: financialGoal ?? state.user!.financialGoal,
          streakDays: streakDays ?? state.user!.streakDays,
          xpPoints: xpPoints ?? state.user!.xpPoints,
          financialLevel: financialLevel ?? state.user!.financialLevel,
        );
        await _storage.saveUserMap(localUpdated.toJson());
        // Also try updating standard ERD columns on server if online
        try {
          await _api.updateProfile(
            firstName: localUpdated.firstName,
            lastName: [
              if ((localUpdated.middleName ?? '').trim().isNotEmpty)
                localUpdated.middleName!.trim(),
              localUpdated.lastName.trim(),
            ].where((s) => s.isNotEmpty).join(' '),
            gender: localUpdated.gender,
            phoneNumber: localUpdated.phoneNumber,
            dateOfBirth: localUpdated.dateOfBirth,
            address: localUpdated.address,
            occupation: localUpdated.occupation,
          );
        } catch (_) {}
        state = state.copyWith(user: localUpdated, isLoading: false);
        return true;
      }
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> uploadAvatar(File file) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.uploadProfilePicture(file);
      await _storage.saveUserMap(updated.toJson());
      state = state.copyWith(user: updated, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> selectAvatar2DPreset(String presetId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.updateProfile(profilePicture: presetId);
      await _storage.saveUserMap(updated.toJson());
      state = state.copyWith(user: updated, isLoading: false);
      return true;
    } catch (e) {
      // Offline fallback: update local user avatar immediately
      if (_isNetworkError(e) && state.user != null) {
        final localUpdated = state.user!.copyWith(profilePicture: presetId);
        await _storage.saveUserMap(localUpdated.toJson());
        state = state.copyWith(user: localUpdated, isLoading: false);
        return true;
      }
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> signInWithGoogle({
    required String email,
    String? displayName,
    String? googleId,
    String? idToken,
    String? photoUrl,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _api.authenticateWithGoogle(
        email: email,
        displayName: displayName,
        googleId: googleId,
        idToken: idToken,
        photoUrl: photoUrl,
      );
      await _storage.saveToken(result.token);
      await _storage.saveUserMap(result.user.toJson());
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: result.user,
        isOfflineSession: false,
        isLoading: false,
        clearError: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> linkGoogleAccount({
    required String email,
    String? googleId,
    String? photoUrl,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.linkGoogleAccount(
        email: email,
        googleId: googleId,
        photoUrl: photoUrl,
      );
      await _storage.saveUserMap(updated.toJson());
      state = state.copyWith(user: updated, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> unlinkGoogleAccount() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.unlinkGoogleAccount();
      await _storage.saveUserMap(updated.toJson());
      state = state.copyWith(user: updated, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<Map<String, dynamic>> sendEmailOtp() async {
    return _api.sendEmailOtp(email: state.user?.email);
  }

  Future<bool> verifyEmailWithOtp(String otp) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.verifyEmailOtp(
        otp: otp,
        email: state.user?.email,
      );
      await _storage.saveUserMap(updated.toJson());
      state = state.copyWith(user: updated, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> syncOfflinePasswordHash(String newPassword) async {
    final email = state.user?.email;
    if (email != null && email.isNotEmpty) {
      await _storage.updateOfflinePasswordHash(
        email: email,
        newPassword: newPassword,
      );
    }
  }

  Future<void> handleSessionExpired() async {
    if (state.status == AuthStatus.unauthenticated) return;
    await _storage.clearAuth();
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      clearUser: true,
      isOfflineSession: false,
      isLoading: false,
      error: 'Sesi Anda telah berakhir. Silakan masuk kembali.',
    );
  }

  Future<void> logout() async {
    await _storage.clearAuth();
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      clearUser: true,
      isOfflineSession: false,
      isLoading: false,
      clearError: true,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final client = ref.watch(apiClientProvider);
  final notifier = AuthNotifier(
    ref.watch(secureStorageProvider),
    ref.watch(sadarApiServiceProvider),
  );
  client.onUnauthorized = notifier.handleSessionExpired;
  return notifier;
});
