class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? gender;
  final String? phoneNumber;
  final String? dateOfBirth;
  final String? address;
  final String? occupation;
  final String? profilePicture;
  final String status;

  const UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.gender,
    this.phoneNumber,
    this.dateOfBirth,
    this.address,
    this.occupation,
    this.profilePicture,
    this.status = 'active',
  });

  String get fullName {
    final cleanLast = (lastName.toLowerCase() == 'user') ? '' : lastName.trim();
    final combined = '${firstName.trim()} $cleanLast'.trim();
    return combined.isNotEmpty ? combined : email;
  }

  String get displayName => firstName.trim().isNotEmpty ? firstName.trim() : fullName;

  String get initials {
    final parts = fullName.split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'S';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final rawName = (json['name'] ?? '').toString().trim();
    var first = (json['first_name'] ?? json['firstName'] ?? '').toString().trim();
    var last = (json['last_name'] ?? json['lastName'] ?? '').toString().trim();
    if (first.isEmpty && rawName.isNotEmpty) {
      final parts = rawName.split(RegExp(r'\s+'));
      first = parts.first;
      last = parts.length > 1 ? parts.sublist(1).join(' ') : '';
    }

    return UserModel(
      id: (json['users_id'] ?? json['id'] ?? '').toString(),
      firstName: first.isNotEmpty ? first : 'Pengguna',
      lastName: last,
      email: (json['email'] ?? '').toString(),
      gender: json['gender']?.toString(),
      phoneNumber: (json['phone_number'] ?? json['phoneNumber'])?.toString(),
      dateOfBirth: (json['date_of_birth'] ?? json['dateOfBirth'])?.toString(),
      address: json['address']?.toString(),
      occupation: json['occupation']?.toString(),
      profilePicture:
          (json['profile_picture'] ?? json['profilePicture'] ?? json['avatar'])
              ?.toString(),
      status: (json['status'] ?? 'active').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'users_id': id,
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'gender': gender,
        'phone_number': phoneNumber,
        'date_of_birth': dateOfBirth,
        'address': address,
        'occupation': occupation,
        'profile_picture': profilePicture,
        'status': status,
      };

  UserModel copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? gender,
    String? phoneNumber,
    String? dateOfBirth,
    String? address,
    String? occupation,
    String? profilePicture,
  }) {
    return UserModel(
      id: id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      gender: gender ?? this.gender,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      address: address ?? this.address,
      occupation: occupation ?? this.occupation,
      profilePicture: profilePicture ?? this.profilePicture,
      status: status,
    );
  }
}
