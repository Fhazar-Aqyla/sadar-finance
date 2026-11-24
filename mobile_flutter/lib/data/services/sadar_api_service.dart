import 'dart:io';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/formatters.dart';
import '../models/account_model.dart';
import '../models/analytics_models.dart';
import '../models/budget_model.dart';
import '../models/income_model.dart';
import '../models/ocr_scan_model.dart';
import '../models/transaction_model.dart';
import '../models/user_model.dart';

class AuthResult {
  final UserModel user;
  final String token;
  const AuthResult({required this.user, required this.token});
}

class SadarApiService {
  final ApiClient _client;

  SadarApiService(this._client);

  String get baseUrl => _client.baseUrl;

  void setBaseUrl(String url) => _client.updateBaseUrl(url);

  // ── AUTH ───────────────────────────────────────────────────

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final data = await _client.post(
      '/auth/login',
      data: {'email': email.trim(), 'password': password},
    );
    return AuthResult(
      user: UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map)),
      token: data['token'].toString(),
    );
  }

  Future<AuthResult> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
    String? occupation,
  }) async {
    final payload = <String, dynamic>{
      'firstName': firstName.trim(),
      'lastName': lastName.trim(),
      'email': email.trim(),
      'password': password,
      if (phoneNumber != null && phoneNumber.trim().isNotEmpty)
        'phoneNumber': phoneNumber.trim(),
      if (occupation != null && occupation.trim().isNotEmpty)
        'occupation': occupation.trim(),
    };
    final data = await _client.post('/auth/register', data: payload);
    return AuthResult(
      user: UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map)),
      token: data['token'].toString(),
    );
  }

  Future<Map<String, dynamic>> forgotPasswordWithOtp(String email) async {
    final data = await _client.post(
      '/auth/forgot-password',
      data: {'email': email.trim()},
    );
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return {'message': 'Kode OTP pemulihan kata sandi telah dikirim.'};
  }

  Future<String> forgotPassword(String email) async {
    final res = await forgotPasswordWithOtp(email);
    return (res['message'] ?? 'Permintaan reset password telah diproses.')
        .toString();
  }

  Future<Map<String, dynamic>> sendEmailOtp({
    String? email,
    String purpose = 'verify',
  }) async {
    final data = await _client.post(
      '/auth/send-otp',
      data: {
        if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
        'purpose': purpose,
      },
    );
    return data is Map
        ? Map<String, dynamic>.from(data)
        : <String, dynamic>{'message': 'Kode OTP dikirim'};
  }

  Future<UserModel> verifyEmailOtp({
    required String otp,
    String? email,
  }) async {
    final data = await _client.post(
      '/auth/verify-otp',
      data: {
        'otp': otp.trim(),
        if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
      },
    );
    if (data is Map && data['user'] is Map) {
      return UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    }
    return getProfile();
  }

  Future<String> resetPasswordWithOtp({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    final data = await _client.post(
      '/auth/reset-password-otp',
      data: {
        'email': email.trim(),
        'otp': otp.trim(),
        'newPassword': newPassword,
      },
    );
    if (data is Map && data['message'] != null) {
      return data['message'].toString();
    }
    return 'Kata sandi berhasil diperbarui!';
  }

  Future<AuthResult> authenticateWithGoogle({
    required String email,
    String? displayName,
    String? googleId,
    String? idToken,
    String? accessToken,
    String? photoUrl,
  }) async {
    final payload = <String, dynamic>{'email': email.trim()};
    if (displayName != null) payload['displayName'] = displayName.trim();
    if (googleId != null) payload['googleId'] = googleId;
    if (idToken != null) payload['idToken'] = idToken;
    if (accessToken != null) payload['accessToken'] = accessToken;
    if (photoUrl != null) payload['photoUrl'] = photoUrl;
    final data = await _client.post('/auth/google', data: payload);
    return AuthResult(
      user: UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map)),
      token: data['token'].toString(),
    );
  }

  Future<UserModel> linkGoogleAccount({
    required String email,
    String? googleId,
    String? idToken,
    String? photoUrl,
  }) async {
    final payload = <String, dynamic>{'email': email.trim()};
    if (googleId != null) payload['googleId'] = googleId;
    if (idToken != null) payload['idToken'] = idToken;
    if (photoUrl != null) payload['photoUrl'] = photoUrl;
    final data = await _client.post('/auth/google/link', data: payload);
    if (data is Map && data['user'] is Map) {
      return UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    }
    return getProfile();
  }

  Future<UserModel> unlinkGoogleAccount() async {
    final data = await _client.delete('/auth/google/link');
    if (data is Map && data['user'] is Map) {
      return UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    }
    return getProfile();
  }

  Future<UserModel> getProfile() async {
    final data = await _client.get('/auth/me');
    final map = (data is Map && data['user'] is Map)
        ? Map<String, dynamic>.from(data['user'] as Map)
        : Map<String, dynamic>.from(data as Map);
    return UserModel.fromJson(map);
  }

  Future<UserModel> updateProfile({
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
    String? profilePicture,
    int? streakDays,
    int? xpPoints,
    int? financialLevel,
  }) async {
    final payload = <String, dynamic>{};
    if (firstName != null && firstName.trim().isNotEmpty) {
      payload['firstName'] = firstName.trim();
    }
    if (middleName != null) {
      payload['middleName'] = middleName.trim();
    }
    if (lastName != null && lastName.trim().isNotEmpty) {
      payload['lastName'] = lastName.trim();
    }
    if (username != null) {
      payload['username'] =
          username.trim().replaceAll('@', '').toLowerCase();
    }
    if (gender != null) payload['gender'] = gender.trim();
    if (phoneNumber != null) payload['phoneNumber'] = phoneNumber.trim();
    if (dateOfBirth != null) payload['dateOfBirth'] = dateOfBirth.trim();
    if (address != null) payload['address'] = address.trim();
    if (city != null) payload['city'] = city.trim();
    if (province != null) payload['province'] = province.trim();
    if (postalCode != null) payload['postalCode'] = postalCode.trim();
    if (occupation != null) payload['occupation'] = occupation.trim();
    if (financialGoal != null) payload['financialGoal'] = financialGoal.trim();
    if (profilePicture != null && profilePicture.trim().isNotEmpty) {
      payload['profilePicture'] = profilePicture.trim();
    }
    if (streakDays != null) payload['streakDays'] = streakDays;
    if (xpPoints != null) payload['xpPoints'] = xpPoints;
    if (financialLevel != null) payload['financialLevel'] = financialLevel;

    final data = await _client.put('/auth/me', data: payload);
    final map = (data is Map && data['user'] is Map)
        ? Map<String, dynamic>.from(data['user'] as Map)
        : Map<String, dynamic>.from(data as Map);
    return UserModel.fromJson(map);
  }

  Future<List<Map<String, dynamic>>> getStreakLeaderboard() async {
    final data = await _client.get('/auth/leaderboard');
    final rawList = (data is Map && data['leaderboard'] is List)
        ? (data['leaderboard'] as List)
        : (data is List ? data : const []);
    return rawList
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  Future<List<Map<String, dynamic>>> getActiveBroadcasts() async {
    final data = await _client.get('/app/broadcasts');
    final rawList = (data is Map && data['broadcasts'] is List)
        ? (data['broadcasts'] as List)
        : (data is List ? data : const []);
    return rawList
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  Future<List<Map<String, dynamic>>> getAdminBroadcasts() async {
    final data = await _client.get('/app/admin/broadcasts');
    final rawList = (data is Map && data['broadcasts'] is List)
        ? (data['broadcasts'] as List)
        : (data is List ? data : const []);
    return rawList
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  Future<List<Map<String, dynamic>>> saveAdminBroadcast(
    Map<String, dynamic> payload,
  ) async {
    final data = await _client.post('/app/admin/broadcasts', data: payload);
    final rawList = (data is Map && data['broadcasts'] is List)
        ? (data['broadcasts'] as List)
        : const [];
    return rawList
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  Future<List<Map<String, dynamic>>> deleteAdminBroadcast(String id) async {
    final data = await _client.delete('/app/admin/broadcasts/$id');
    final rawList = (data is Map && data['broadcasts'] is List)
        ? (data['broadcasts'] as List)
        : const [];
    return rawList
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  Future<String> uploadBroadcastBanner(File imageFile) async {
    final filename = imageFile.path.split(RegExp(r'[/\\]')).last;
    final ext = filename.split('.').last.toLowerCase();
    final mediaType = ext == 'png'
        ? MediaType('image', 'png')
        : ext == 'webp'
            ? MediaType('image', 'webp')
            : MediaType('image', 'jpeg');
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        imageFile.path,
        filename: filename,
        contentType: mediaType,
      ),
    });
    final data = await _client.post('/app/admin/banner-upload', data: formData);
    if (data is Map && data['imageUrl'] != null) {
      return data['imageUrl'].toString();
    }
    return '';
  }

  Future<Map<String, dynamic>> getFinancialPlans() async {
    final data = await _client.get('/plans');
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return const {};
  }

  Future<Map<String, dynamic>> saveFinancialPlans({
    required List<Map<String, dynamic>> savingsGoals,
    required List<Map<String, dynamic>> recurringItems,
    required List<Map<String, dynamic>> debts,
    required List<Map<String, dynamic>> transfers,
  }) async {
    final data = await _client.put(
      '/plans',
      data: {
        'savingsGoals': savingsGoals,
        'recurringItems': recurringItems,
        'debts': debts,
        'transfers': transfers,
      },
    );
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return const {};
  }

  Future<Map<String, dynamic>> syncFinancialPlans({
    required List<dynamic> savingsGoals,
    required List<dynamic> recurringItems,
    required List<dynamic> debts,
    required List<dynamic> transfers,
  }) async {
    return saveFinancialPlans(
      savingsGoals: savingsGoals
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
      recurringItems: recurringItems
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
      debts: debts
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
      transfers: transfers
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
    );
  }

  Future<Map<String, dynamic>> sendMonthlyStatementEmail({
    String? month,
  }) async {
    final data = await _client.post(
      '/analytics/statement/email',
      data: {if (month != null && month.isNotEmpty) 'month': month},
    );
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return const {};
  }

  Future<Map<String, dynamic>> getMonthlyStatementPreview({
    String? month,
  }) async {
    final data = await _client.get(
      '/analytics/statement/preview',
      query: {if (month != null && month.isNotEmpty) 'month': month},
    );
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return const {};
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await _client.put(
      '/auth/password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );
  }

  Future<UserModel> uploadProfilePicture(File imageFile) async {
    final filename = imageFile.path.split(RegExp(r'[/\\]')).last;
    final ext = filename.split('.').last.toLowerCase();
    final mediaType = ext == 'png'
        ? MediaType('image', 'png')
        : ext == 'webp'
            ? MediaType('image', 'webp')
            : MediaType('image', 'jpeg');
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        imageFile.path,
        filename: filename,
        contentType: mediaType,
      ),
    });
    final data = await _client.post(
      '/auth/profile-picture',
      data: formData,
    );
    if (data is Map && data['user'] is Map) {
      return UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    }
    if (data is Map &&
        (data['users_id'] != null ||
            data['id'] != null ||
            data['profile_picture'] != null)) {
      return UserModel.fromJson(Map<String, dynamic>.from(data));
    }
    return getProfile();
  }

  Future<void> deleteUserAccount(String password) async {
    await _client.delete('/auth/me', data: {'password': password});
  }

  // ── ACCOUNTS ───────────────────────────────────────────────

  Future<List<AccountModel>> getAccounts() async {
    final data = await _client.get('/accounts');
    final list = _extractList(data);
    return list
        .map((e) => AccountModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<AccountModel> createAccount({
    required String accountName,
    String accountNumber = '',
    required double balance,
  }) async {
    final data = await _client.post(
      '/accounts',
      data: {
        'accountName': accountName.trim(),
        'accountNumber': accountNumber.trim(),
        'balance': balance,
      },
    );
    return AccountModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<AccountModel> updateAccount(
    String id, {
    String? accountName,
    String? accountNumber,
    double? balance,
  }) async {
    final data = await _client.put(
      '/accounts/$id',
      data: {
        if (accountName != null) 'accountName': accountName.trim(),
        if (accountNumber != null) 'accountNumber': accountNumber.trim(),
        'balance': ?balance,
      },
    );
    return AccountModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> deleteAccount(String id) async {
    await _client.delete('/accounts/$id');
  }

  Future<void> transferFunds({
    required String fromAccountId,
    required String toAccountId,
    required double amount,
    String? note,
  }) async {
    await _client.post(
      '/accounts/transfer',
      data: {
        'fromAccountId': fromAccountId,
        'toAccountId': toAccountId,
        'amount': amount,
        if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
      },
    );
  }

  // ── TRANSACTIONS ───────────────────────────────────────────

  Future<List<TransactionModel>> getTransactions({
    int limit = 100,
    int page = 1,
  }) async {
    final data = await _client.get(
      '/transactions',
      query: {'limit': limit, 'page': page},
    );
    final list = _extractList(data);
    return list
        .map((e) =>
            TransactionModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<TransactionModel> createTransaction({
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime transactionDate,
    required String description,
    required double amount,
    String source = 'manual',
    String? ocrScanId,
  }) async {
    final data = await _client.post(
      '/transactions',
      data: {
        if (accountId != null && accountId.isNotEmpty) 'accountId': accountId,
        'categoryGroup': categoryGroup,
        if (categoryDetail != null && categoryDetail.trim().isNotEmpty)
          'categoryDetail': categoryDetail.trim(),
        'transactionDate': transactionDate.toUtc().toIso8601String(),
        'description': description.trim(),
        'source': source,
        'amount': amount,
        if (ocrScanId != null && ocrScanId.isNotEmpty) 'ocrScanId': ocrScanId,
      },
    );
    return TransactionModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<TransactionModel> updateTransaction(
    String id, {
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime transactionDate,
    required String description,
    required double amount,
  }) async {
    final data = await _client.put(
      '/transactions/$id',
      data: {
        if (accountId != null && accountId.isNotEmpty) 'accountId': accountId,
        'categoryGroup': categoryGroup,
        'categoryDetail':
            (categoryDetail != null && categoryDetail.trim().isNotEmpty)
                ? categoryDetail.trim()
                : null,
        'transactionDate': transactionDate.toUtc().toIso8601String(),
        'description': description.trim(),
        'amount': amount,
      },
    );
    return TransactionModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> deleteTransaction(String id) async {
    await _client.delete('/transactions/$id');
  }

  // ── INCOMES ────────────────────────────────────────────────

  Future<List<IncomeModel>> getIncomes({
    int limit = 100,
    int page = 1,
  }) async {
    final data = await _client.get(
      '/incomes',
      query: {'limit': limit, 'page': page},
    );
    final list = _extractList(data);
    return list
        .map((e) => IncomeModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<IncomeModel> createIncome({
    String? accountId,
    required double amount,
    required DateTime incomeDate,
    required String source,
  }) async {
    final data = await _client.post(
      '/incomes',
      data: {
        if (accountId != null && accountId.isNotEmpty) 'accountId': accountId,
        'amount': amount,
        'incomeDate': incomeDate.toUtc().toIso8601String(),
        'source': source.trim(),
      },
    );
    return IncomeModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<IncomeModel> updateIncome(
    String id, {
    String? accountId,
    required double amount,
    required DateTime incomeDate,
    required String source,
  }) async {
    final data = await _client.put(
      '/incomes/$id',
      data: {
        if (accountId != null && accountId.isNotEmpty) 'accountId': accountId,
        'amount': amount,
        'incomeDate': incomeDate.toUtc().toIso8601String(),
        'source': source.trim(),
      },
    );
    return IncomeModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> deleteIncome(String id) async {
    await _client.delete('/incomes/$id');
  }

  // ── OCR ────────────────────────────────────────────────────

  Future<OcrScanModel> uploadReceipt(File imageFile) async {
    final filename = imageFile.path.split(RegExp(r'[/\\]')).last;
    final ext = filename.split('.').last.toLowerCase();
    final mediaType = ext == 'png'
        ? MediaType('image', 'png')
        : ext == 'webp'
            ? MediaType('image', 'webp')
            : MediaType('image', 'jpeg');

    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        imageFile.path,
        filename: filename,
        contentType: mediaType,
      ),
    });

    final uploaded = await _client.post(
      '/ocr/upload',
      data: formData,
    );
    var scan = OcrScanModel.fromJson(Map<String, dynamic>.from(uploaded as Map));

    // Poll if backend queued async OCR processing (up to 60s for AI cold start)
    int attempts = 0;
    while ((scan.status == 'pending' || scan.status == 'processing') &&
        attempts < 30) {
      await Future.delayed(const Duration(seconds: 2));
      final polled = await _client.get('/ocr/${scan.id}');
      scan = OcrScanModel.fromJson(Map<String, dynamic>.from(polled as Map));
      attempts++;
    }
    return scan;
  }

  Future<void> confirmOcrTransaction(
    String scanId, {
    String? accountId,
    required String categoryGroup,
    String? categoryDetail,
    required DateTime transactionDate,
    required String description,
    required double amount,
  }) async {
    await _client.post(
      '/ocr/$scanId/confirm-transaction',
      data: {
        if (accountId != null && accountId.isNotEmpty) 'accountId': accountId,
        'categoryGroup': categoryGroup,
        if (categoryDetail != null && categoryDetail.trim().isNotEmpty)
          'categoryDetail': categoryDetail.trim(),
        'transactionDate': transactionDate.toUtc().toIso8601String(),
        'description': description.trim(),
        'amount': amount,
        'source': 'ocr',
      },
    );
  }

  // ── ANALYTICS & BUDGET ─────────────────────────────────────

  Future<BudgetModel?> getLatestBudget() async {
    final data = await _client.get('/analytics/budget');
    if (data == null || data is! Map) return null;
    return BudgetModel.fromJson(Map<String, dynamic>.from(data));
  }

  Future<BudgetModel> createBudget({
    required double needsAmount,
    required double wantsAmount,
    required double savingsAmount,
  }) async {
    final data = await _client.post(
      '/analytics/budget',
      data: {
        'needsAmount': needsAmount,
        'wantsAmount': wantsAmount,
        'savingsAmount': savingsAmount,
        'limitAmount': needsAmount + wantsAmount + savingsAmount,
      },
    );
    return BudgetModel.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<HealthScoreResult> calculateHealthScore({String period = '3m'}) async {
    final data = await _client.post(
      '/analytics/health-score',
      data: {'period': period},
    );
    return HealthScoreResult.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<ScoreHistoryItem>> getScoreHistory() async {
    final data = await _client.get('/analytics/health-score/history');
    return _extractList(data)
        .map((e) =>
            ScoreHistoryItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<InsightModel>> getInsights() async {
    final data = await _client.get('/analytics/insights');
    return _extractList(data)
        .map((e) => InsightModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<InsightModel>> analyzeBehavior({
    DateTime? periodStart,
    DateTime? periodEnd,
  }) async {
    final now = DateTime.now();
    final start = periodStart ?? DateTime(now.year, now.month - 1, 1);
    final end = periodEnd ?? now;
    final data = await _client.post(
      '/analytics/behavior',
      data: {
        'periodStart': AppFormatters.isoDateOnly(start),
        'periodEnd': AppFormatters.isoDateOnly(end),
      },
    );
    return _extractList(data)
        .map((e) => InsightModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<AlertModel>> getAlerts() async {
    final data = await _client.get('/analytics/alerts');
    return _extractList(data)
        .map((e) => AlertModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<Map<String, dynamic>> categorizeTransaction({
    required String text,
    String? merchant,
    double? amount,
  }) async {
    final data = await _client.post(
      '/analytics/categorize',
      data: {
        'text': text.trim(),
        if (merchant != null && merchant.trim().isNotEmpty)
          'merchant': merchant.trim(),
        if (amount != null && amount > 0) 'amount': amount,
      },
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<BehaviorPredictionModel> predictBehavior({
    required double amount,
    String? categoryGroup,
    String? merchant,
    double? rolling7dSpending,
  }) async {
    final data = await _client.post(
      '/analytics/behavior/predict',
      data: {
        'amount': amount > 0 ? amount : 50000,
        'categoryGroup': ?categoryGroup,
        if (merchant != null && merchant.isNotEmpty) 'merchant': merchant,
        'rolling7dSpending': ?rolling7dSpending,
      },
    );
    return BehaviorPredictionModel.fromJson(
      Map<String, dynamic>.from(data as Map),
    );
  }

  Future<OverspendingForecastModel> predictOverspending({
    double? budgetLimit,
  }) async {
    final now = DateTime.now();
    final data = await _client.post(
      '/analytics/overspending',
      data: {
        'month': AppFormatters.isoDateOnly(DateTime(now.year, now.month, 1)),
        if (budgetLimit != null && budgetLimit > 0) 'budgetLimit': budgetLimit,
      },
    );
    return OverspendingForecastModel.fromJson(
      Map<String, dynamic>.from(data as Map),
    );
  }

  List<dynamic> _extractList(dynamic data) {
    if (data is List) return data;
    if (data is Map) {
      for (final key in [
        'items',
        'rows',
        'data',
        'records',
        'transactions',
        'incomes',
        'accounts',
        'insights',
        'alerts',
        'scores',
      ]) {
        if (data[key] is List) return data[key] as List;
      }
    }
    return const [];
  }
}
