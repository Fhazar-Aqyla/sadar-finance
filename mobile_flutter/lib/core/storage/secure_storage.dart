import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  static const _tokenKey = 'sadar_jwt_token';
  static const _userKey = 'sadar_user_json';
  static const _apiUrlKey = 'sadar_api_base_url';
  static const _offlineVaultKey = 'sadar_offline_cred_vault';

  final FlutterSecureStorage _secure = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> _writeSecret(String key, String value) async {
    try {
      await _secure.write(key: key, value: value);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
    }
  }

  Future<String?> _readSecret(String key) async {
    try {
      final val = await _secure.read(key: key);
      if (val != null) return val;
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  Future<void> _deleteSecret(String key) async {
    try {
      await _secure.delete(key: key);
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  Future<void> saveToken(String token) => _writeSecret(_tokenKey, token);

  Future<String?> getToken() => _readSecret(_tokenKey);

  Future<void> saveUserMap(Map<String, dynamic> user) =>
      _writeSecret(_userKey, jsonEncode(user));

  Future<Map<String, dynamic>?> getUserMap() async {
    final raw = await _readSecret(_userKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      return decoded is Map<String, dynamic> ? decoded : null;
    } catch (_) {
      return null;
    }
  }

  /// Salted SHA-256 hash stored encrypted for offline login verification.
  static String _hashPassword(String email, String password) {
    final normalized = '${email.trim().toLowerCase()}::sadar_offline_v1::$password';
    return sha256.convert(utf8.encode(normalized)).toString();
  }

  Future<void> saveOfflineCredentials({
    required String email,
    required String password,
    required String token,
    required Map<String, dynamic> user,
  }) async {
    final payload = {
      'email': email.trim().toLowerCase(),
      'hash': _hashPassword(email, password),
      'token': token,
      'user': user,
      'savedAt': DateTime.now().toIso8601String(),
    };
    await _writeSecret(_offlineVaultKey, jsonEncode(payload));
  }

  Future<({String token, Map<String, dynamic> user})?> verifyOfflineCredentials({
    required String email,
    required String password,
  }) async {
    final raw = await _readSecret(_offlineVaultKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      final map = jsonDecode(raw);
      if (map is! Map<String, dynamic>) return null;
      final savedEmail = (map['email'] ?? '').toString().toLowerCase();
      final savedHash = (map['hash'] ?? '').toString();
      if (savedEmail != email.trim().toLowerCase()) return null;
      if (savedHash != _hashPassword(email, password)) return null;
      final user = map['user'];
      final token = (map['token'] ?? '').toString();
      if (user is Map<String, dynamic> && token.isNotEmpty) {
        return (token: token, user: user);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> updateOfflinePasswordHash({
    required String email,
    required String newPassword,
  }) async {
    final raw = await _readSecret(_offlineVaultKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final map = jsonDecode(raw);
      if (map is! Map<String, dynamic>) return;
      if ((map['email'] ?? '').toString().toLowerCase() ==
          email.trim().toLowerCase()) {
        map['hash'] = _hashPassword(email, newPassword);
        await _writeSecret(_offlineVaultKey, jsonEncode(map));
      }
    } catch (_) {}
  }

  Future<void> clearAuth() async {
    await _deleteSecret(_tokenKey);
    await _deleteSecret(_userKey);
  }

  Future<void> saveApiUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiUrlKey, url.trim());
  }

  Future<String?> getApiUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_apiUrlKey);
  }
}
