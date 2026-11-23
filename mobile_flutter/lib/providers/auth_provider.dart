import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/app_config.dart';
import '../core/network/api_client.dart';
import '../core/storage/secure_storage.dart';
import '../data/mock/mock_repository.dart';
import '../data/models/user_model.dart';
import '../data/services/sadar_api_service.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

final mockRepositoryProvider = Provider<MockRepository>(
  (ref) => MockRepository(),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(secureStorageProvider)),
);

final sadarApiServiceProvider = Provider<SadarApiService>(
  (ref) => SadarApiService(
    ref.watch(apiClientProvider),
    ref.watch(mockRepositoryProvider),
    isDemoMode: false,
  ),
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
    _api.isDemoMode = false;

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
      // Silently refresh profile if online; stay authenticated offline if unreachable
      try {
        final fresh = await _api.getProfile();
        await _storage.saveUserMap(fresh.toJson());
        state = state.copyWith(user: fresh, isOfflineSession: false);
      } catch (e) {
        if (_isNetworkError(e)) {
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
    String? lastName,
    String? gender,
    String? phoneNumber,
    String? dateOfBirth,
    String? address,
    String? occupation,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final updated = await _api.updateProfile(
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        address: address,
        occupation: occupation,
      );
      await _storage.saveUserMap(updated.toJson());
      state = state.copyWith(user: updated, isLoading: false);
      return true;
    } catch (e) {
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

  Future<void> syncOfflinePasswordHash(String newPassword) async {
    final email = state.user?.email;
    if (email != null && email.isNotEmpty) {
      await _storage.updateOfflinePasswordHash(
        email: email,
        newPassword: newPassword,
      );
    }
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

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(
    ref.watch(secureStorageProvider),
    ref.watch(sadarApiServiceProvider),
  ),
);
