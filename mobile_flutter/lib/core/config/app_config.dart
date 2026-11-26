import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConfig {
  static const String _envApiUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static const String productionApiUrl =
      'https://sadar-finance.web.id/api/v1';

  static String get localApiUrl {
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api/v1';
    }
    return 'http://localhost:3000/api/v1';
  }

  static String get defaultApiUrl =>
      _envApiUrl.isNotEmpty ? _envApiUrl : productionApiUrl;

  static const String appName = 'SADAR Finance';
  static const String appVersion = '2.0.0';
  static const int appBuildNumber = 11;
  static const String appTagline = 'Kelola Keuangan Pribadi Lebih Sadar';

  static String resolveUploadUrl(String? path, String activeApiBaseUrl) {
    if (path == null || path.trim().isEmpty) return '';
    final trimmed = path.trim();
    if (trimmed.startsWith('data:') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://')) {
      return trimmed;
    }
    final origin = activeApiBaseUrl.replaceAll(RegExp(r'/api/v1/?$'), '');
    if (trimmed.startsWith('/')) {
      return '$origin$trimmed';
    }
    return '$origin/$trimmed';
  }
}
