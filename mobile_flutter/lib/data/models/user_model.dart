class UserModel {
  final String id;
  final String firstName;
  final String? middleName;
  final String lastName;
  final String? username;
  final String email;
  final String? gender;
  final String? phoneNumber;
  final String? dateOfBirth;
  final String? address;
  final String? city;
  final String? province;
  final String? postalCode;
  final String? occupation;
  final String? financialGoal;
  final String? profilePicture;
  final String status;
  final int streakDays;
  final int xpPoints;
  final int financialLevel;
  final bool emailVerified;
  final String? googleId;
  final String? googleEmail;

  const UserModel({
    required this.id,
    required this.firstName,
    this.middleName,
    required this.lastName,
    this.username,
    required this.email,
    this.gender,
    this.phoneNumber,
    this.dateOfBirth,
    this.address,
    this.city,
    this.province,
    this.postalCode,
    this.occupation,
    this.financialGoal,
    this.profilePicture,
    this.status = 'active',
    this.streakDays = 1,
    this.xpPoints = 50,
    this.financialLevel = 1,
    this.emailVerified = false,
    this.googleId,
    this.googleEmail,
  });

  bool get isGoogleLinked =>
      (googleId != null && googleId!.trim().isNotEmpty) ||
      (googleEmail != null && googleEmail!.trim().isNotEmpty);

  String get fullName {
    final cleanMiddle = (middleName ?? '').trim();
    final cleanLast = (lastName.toLowerCase() == 'user') ? '' : lastName.trim();
    final parts = [firstName.trim(), cleanMiddle, cleanLast]
        .where((p) => p.isNotEmpty)
        .toList();
    final combined = parts.join(' ').trim();
    return combined.isNotEmpty ? combined : email;
  }

  /// Greeting / nickname used across Dashboard ("Halo, Habib") and notifications.
  /// Prioritizes `middleName` (Nama Tengah / Panggilan) when present, otherwise `firstName`.
  String get displayName {
    final nick = (middleName ?? '').trim();
    if (nick.isNotEmpty) return nick;
    if (firstName.trim().isNotEmpty) return firstName.trim();
    return fullName;
  }

  /// Clean @username handle for the Streak Leaderboard.
  String get effectiveUsername {
    final raw = (username ?? '').trim().replaceAll('@', '');
    if (raw.isNotEmpty) return raw.toLowerCase();
    final base = '$displayName${lastName.trim()}'
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9_]'), '');
    if (base.isNotEmpty) return base;
    return email.split('@').first.toLowerCase();
  }

  String get formattedAddress {
    final raw = (address ?? '').trim();
    if (raw.isEmpty) return '';
    return formatTitleCaseAddress(raw);
  }

  String get locationSummary {
    final c = (city ?? '').trim();
    final p = (province ?? '').trim();
    if (c.isNotEmpty && p.isNotEmpty) return '$c, $p';
    if (c.isNotEmpty) return c;
    if (p.isNotEmpty) return p;
    return '';
  }

  static String formatTitleCaseAddress(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) return '';
    final words = trimmed.split(RegExp(r'\s+'));
    final formatted = words.map((w) {
      final upper = w.toUpperCase().replaceAll('.', '');
      if (upper == 'JL' || upper == 'JLN') return 'Jl.';
      if (upper == 'NO' || upper == 'NOMOR') return 'No.';
      if (upper == 'RT' || upper == 'RW' || upper == 'GG') return upper;
      if (RegExp(r'^[A-Z]\d+$').hasMatch(upper)) return upper; // e.g. B14
      if (w.length <= 1) return w.toUpperCase();
      return '${w[0].toUpperCase()}${w.substring(1).toLowerCase()}';
    }).join(' ');
    return formatted;
  }

  String get initials {
    final parts =
        fullName.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'S';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final rawName = (json['name'] ?? '').toString().trim();
    var first =
        (json['first_name'] ?? json['firstName'] ?? '').toString().trim();
    var middle =
        (json['middle_name'] ?? json['middleName'] ?? '').toString().trim();
    var last = (json['last_name'] ?? json['lastName'] ?? '').toString().trim();

    if (first.isEmpty && rawName.isNotEmpty) {
      final parts = rawName.split(RegExp(r'\s+'));
      first = parts.first;
      if (parts.length >= 3) {
        middle = parts[1];
        last = parts.sublist(2).join(' ');
      } else {
        last = parts.length > 1 ? parts.sublist(1).join(' ') : '';
      }
    } else if (middle.isEmpty && last.contains(' ')) {
      // Auto-split legacy 2-word lastName (e.g. "Habib Rafi") into middleName="Habib", lastName="Rafi"
      final parts =
          last.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
      if (parts.length >= 2) {
        middle = parts.first;
        last = parts.sublist(1).join(' ');
      }
    }

    return UserModel(
      id: (json['users_id'] ?? json['id'] ?? '').toString(),
      firstName: first.isNotEmpty ? first : 'Pengguna',
      middleName: middle.isNotEmpty ? middle : null,
      lastName: last,
      username: (json['username'] ?? '').toString().trim().isNotEmpty
          ? (json['username']).toString().trim()
          : null,
      email: (json['email'] ?? '').toString(),
      gender: json['gender']?.toString(),
      phoneNumber: (json['phone_number'] ?? json['phoneNumber'])?.toString(),
      dateOfBirth: (json['date_of_birth'] ?? json['dateOfBirth'])?.toString(),
      address: json['address']?.toString(),
      city: json['city']?.toString(),
      province: json['province']?.toString(),
      postalCode: (json['postal_code'] ?? json['postalCode'])?.toString(),
      occupation: json['occupation']?.toString(),
      financialGoal:
          (json['financial_goal'] ?? json['financialGoal'])?.toString(),
      profilePicture:
          (json['profile_picture'] ?? json['profilePicture'] ?? json['avatar'])
              ?.toString(),
      status: (json['status'] ?? 'active').toString(),
      streakDays:
          int.tryParse('${json['streak_days'] ?? json['streakDays'] ?? 1}') ??
              1,
      xpPoints:
          int.tryParse('${json['xp_points'] ?? json['xpPoints'] ?? 50}') ?? 50,
      financialLevel: int.tryParse(
              '${json['financial_level'] ?? json['financialLevel'] ?? 1}') ??
          1,
      emailVerified:
          json['email_verified'] == true || json['emailVerified'] == true,
      googleId: (json['google_id'] ?? json['googleId'])?.toString(),
      googleEmail: (json['google_email'] ?? json['googleEmail'])?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'users_id': id,
        'first_name': firstName,
        'middle_name': middleName,
        'last_name': lastName,
        'username': username,
        'email': email,
        'gender': gender,
        'phone_number': phoneNumber,
        'date_of_birth': dateOfBirth,
        'address': address,
        'city': city,
        'province': province,
        'postal_code': postalCode,
        'occupation': occupation,
        'financial_goal': financialGoal,
        'profile_picture': profilePicture,
        'status': status,
        'streak_days': streakDays,
        'xp_points': xpPoints,
        'financial_level': financialLevel,
        'email_verified': emailVerified,
        'google_id': googleId,
        'google_email': googleEmail,
      };

  UserModel copyWith({
    String? firstName,
    String? middleName,
    String? lastName,
    String? username,
    String? email,
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
    bool? emailVerified,
    String? googleId,
    String? googleEmail,
  }) {
    return UserModel(
      id: id,
      firstName: firstName ?? this.firstName,
      middleName: middleName ?? this.middleName,
      lastName: lastName ?? this.lastName,
      username: username ?? this.username,
      email: email ?? this.email,
      gender: gender ?? this.gender,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      address: address ?? this.address,
      city: city ?? this.city,
      province: province ?? this.province,
      postalCode: postalCode ?? this.postalCode,
      occupation: occupation ?? this.occupation,
      financialGoal: financialGoal ?? this.financialGoal,
      profilePicture: profilePicture ?? this.profilePicture,
      status: status,
      streakDays: streakDays ?? this.streakDays,
      xpPoints: xpPoints ?? this.xpPoints,
      financialLevel: financialLevel ?? this.financialLevel,
      emailVerified: emailVerified ?? this.emailVerified,
      googleId: googleId ?? this.googleId,
      googleEmail: googleEmail ?? this.googleEmail,
    );
  }
}
