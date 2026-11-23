import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/secure_storage.dart';
import 'api_exception.dart';

class ApiClient {
  final SecureStorageService _storage;
  late Dio _dio;
  String _baseUrl;
  Future<void> Function()? onUnauthorized;
  bool _handlingUnauthorized = false;

  ApiClient(this._storage, {String? initialBaseUrl})
      : _baseUrl = initialBaseUrl ?? AppConfig.defaultApiUrl {
    _dio = _buildDio(_baseUrl);
  }

  String get baseUrl => _baseUrl;

  void updateBaseUrl(String newBaseUrl) {
    final normalized = newBaseUrl.trim().replaceAll(RegExp(r'/+$'), '');
    if (normalized.isEmpty) return;
    _baseUrl = normalized;
    _dio.options.baseUrl = _baseUrl;
  }

  Dio _buildDio(String baseUrl) {
    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 60),
        headers: const {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          if (options.data is FormData) {
            options.headers.remove('Content-Type');
            options.contentType = null;
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final statusCode = error.response?.statusCode;
          final path = error.requestOptions.path;
          final isAuthCredentialCall =
              path.contains('/auth/login') ||
              path.contains('/auth/register') ||
              path.contains('/auth/password');
          if (statusCode == 401 &&
              !isAuthCredentialCall &&
              onUnauthorized != null &&
              !_handlingUnauthorized) {
            _handlingUnauthorized = true;
            try {
              await onUnauthorized!.call();
            } finally {
              _handlingUnauthorized = false;
            }
          }
          handler.next(error);
        },
      ),
    );

    return dio;
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    try {
      final response = await _dio.get(path, queryParameters: query);
      return _unwrap(response.data);
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> post(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(path, data: data, options: options);
      return _unwrap(response.data);
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> put(String path, {dynamic data}) async {
    try {
      final response = await _dio.put(path, data: data);
      return _unwrap(response.data);
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  Future<dynamic> delete(String path, {dynamic data}) async {
    try {
      final response = await _dio.delete(path, data: data);
      return _unwrap(response.data);
    } on DioException catch (e) {
      throw _mapError(e);
    }
  }

  dynamic _unwrap(dynamic body) {
    if (body is Map<String, dynamic> && body.containsKey('data')) {
      return body['data'];
    }
    return body;
  }

  ApiException _mapError(DioException e) {
    final statusCode = e.response?.statusCode;
    final data = e.response?.data;

    if (data is Map<String, dynamic>) {
      final errObj = data['error'];
      if (errObj is Map<String, dynamic>) {
        return ApiException(
          message: errObj['message']?.toString() ??
              'Terjadi kesalahan saat menghubungi server.',
          code: errObj['code']?.toString(),
          statusCode: statusCode,
          details: errObj['details'],
        );
      }
      if (data['message'] != null) {
        return ApiException(
          message: data['message'].toString(),
          statusCode: statusCode,
        );
      }
    }

    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return ApiException(
        message: 'Koneksi ke server timeout. Periksa jaringan Anda.',
        code: 'TIMEOUT',
        statusCode: statusCode,
      );
    }

    if (e.type == DioExceptionType.connectionError) {
      return ApiException(
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        code: 'CONNECTION_ERROR',
        statusCode: statusCode,
      );
    }

    return ApiException(
      message: e.message ?? 'Terjadi kesalahan saat menghubungi server.',
      statusCode: statusCode,
    );
  }
}
