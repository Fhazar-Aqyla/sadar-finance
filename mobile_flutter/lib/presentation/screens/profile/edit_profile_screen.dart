import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/avatar_2d_preset.dart';
import '../../widgets/sadar_card.dart';
import '../../widgets/user_avatar.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  static const _locationChannel = MethodChannel(
    'com.sadarfinance.sadar_finance/location',
  );

  static const List<String> _occupationOptions = [
    'Mahasiswa / Pelajar',
    'Karyawan Swasta',
    'ASN / PNS / BUMN',
    'Wiraswasta / Pengusaha',
    'Profesional / Konsultan',
    'Freelancer / Kreator Digital',
    'Ibu Rumah Tangga',
    'Lainnya',
  ];

  static const List<String> _financialGoalOptions = [
    'Membangun Dana Darurat Ideal',
    'Disiplin Budget 50/30/20',
    'Tabungan & Investasi Jangka Panjang',
    'Bebas Utang & Arus Kas Sehat',
    'Persiapan Pendidikan / Rumah Impian',
  ];

  final _firstNameCtrl = TextEditingController();
  final _middleNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _occupationCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _provinceCtrl = TextEditingController();
  final _postalCodeCtrl = TextEditingController();

  String _selectedGender = '';
  String _selectedDob = '';
  String _selectedGoal = '';

  File? _localAvatarPreview;
  bool _uploadingAvatar = false;
  bool _savingProfile = false;
  bool _locatingGps = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    if (user != null) {
      _firstNameCtrl.text = user.firstName;
      _middleNameCtrl.text = user.middleName ?? '';
      _lastNameCtrl.text = user.lastName;
      _usernameCtrl.text = user.effectiveUsername;
      _phoneCtrl.text = user.phoneNumber ?? '';
      _occupationCtrl.text = user.occupation ?? '';
      _addressCtrl.text = user.formattedAddress;
      _cityCtrl.text = user.city ?? '';
      _provinceCtrl.text = user.province ?? '';
      _postalCodeCtrl.text = user.postalCode ?? '';
      _selectedGender = (user.gender ?? '').toLowerCase();
      if ((user.dateOfBirth ?? '').isNotEmpty) {
        _selectedDob = user.dateOfBirth!.split('T').first;
      }
      _selectedGoal = user.financialGoal ?? '';
    }
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _middleNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _usernameCtrl.dispose();
    _phoneCtrl.dispose();
    _occupationCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _provinceCtrl.dispose();
    _postalCodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _detectAddressFromGps() async {
    if (_locatingGps) return;
    setState(() => _locatingGps = true);
    try {
      final coords = await _locationChannel.invokeMethod<Map>(
        'getCurrentLocation',
      );
      if (coords == null) {
        throw Exception('Koordinat GPS tidak tersedia.');
      }
      final lat = (coords['lat'] as num).toDouble();
      final lon = (coords['lon'] as num).toDouble();

      await _reverseGeocodeCoordinates(lat, lon);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.success,
          content: Text(
            'Alamat berhasil dilacak otomatis dari titik lokasi GPS Anda!',
          ),
        ),
      );
    } on PlatformException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.warning,
          content: Text(
            e.message ??
                'Aktifkan GPS dan izinkan akses lokasi, atau gunakan fitur Cari Lokasi.',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.warning,
          content: Text('Gagal melacak GPS: $e'),
        ),
      );
    } finally {
      if (mounted) setState(() => _locatingGps = false);
    }
  }

  Future<void> _reverseGeocodeCoordinates(double lat, double lon) async {
    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 8),
        receiveTimeout: const Duration(seconds: 8),
        headers: {
          'User-Agent': 'SADARFinanceApp/1.2.0 (https://sadar-finance.web.id)',
          'Accept-Language': 'id',
        },
      ),
    );

    try {
      final res = await dio.get(
        'https://nominatim.openstreetmap.org/reverse',
        queryParameters: {
          'format': 'jsonv2',
          'lat': lat,
          'lon': lon,
          'addressdetails': 1,
        },
      );
      if (res.data is Map) {
        final data = Map<String, dynamic>.from(res.data as Map);
        final addr = data['address'] is Map
            ? Map<String, dynamic>.from(data['address'] as Map)
            : <String, dynamic>{};

        final road =
            (addr['road'] ?? addr['residential'] ?? addr['neighbourhood'] ?? '')
                .toString()
                .trim();
        final suburb = (addr['village'] ??
                addr['suburb'] ??
                addr['quarter'] ??
                addr['hamlet'] ??
                '')
            .toString()
            .trim();
        final district = (addr['city_district'] ??
                addr['municipality'] ??
                addr['county'] ??
                '')
            .toString()
            .trim();
        final city =
            (addr['city'] ?? addr['town'] ?? addr['regency'] ?? addr['county'] ?? '')
                .toString()
                .trim();
        final state = (addr['state'] ?? addr['region'] ?? '').toString().trim();
        final postcode = (addr['postcode'] ?? '').toString().trim();

        final streetParts = [road, suburb, district]
            .where((s) => s.isNotEmpty)
            .toList();
        final streetLine = streetParts.isNotEmpty
            ? streetParts.join(', ')
            : (data['display_name'] ?? '').toString();

        setState(() {
          if (streetLine.isNotEmpty) {
            _addressCtrl.text = UserModel.formatTitleCaseAddress(streetLine);
          }
          if (city.isNotEmpty) _cityCtrl.text = city;
          if (state.isNotEmpty) _provinceCtrl.text = state;
          if (postcode.isNotEmpty) _postalCodeCtrl.text = postcode;
        });
        return;
      }
    } catch (_) {}

    // Fallback to BigDataCloud Reverse Geocoding API
    final bdc = await dio.get(
      'https://api.bigdatacloud.net/data/reverse-geocode-client',
      queryParameters: {
        'latitude': lat,
        'longitude': lon,
        'localityLanguage': 'id',
      },
    );
    if (bdc.data is Map) {
      final map = Map<String, dynamic>.from(bdc.data as Map);
      final locality = (map['locality'] ?? '').toString().trim();
      final city = (map['city'] ?? '').toString().trim();
      final province = (map['principalSubdivision'] ?? '').toString().trim();
      final postcode = (map['postcode'] ?? '').toString().trim();

      setState(() {
        if (locality.isNotEmpty && _addressCtrl.text.trim().isEmpty) {
          _addressCtrl.text = locality;
        }
        if (city.isNotEmpty) _cityCtrl.text = city;
        if (province.isNotEmpty) _provinceCtrl.text = province;
        if (postcode.isNotEmpty) _postalCodeCtrl.text = postcode;
      });
    }
  }

  void _showLocationSearchSheet() {
    final searchCtrl = TextEditingController(
      text: _cityCtrl.text.isNotEmpty ? _cityCtrl.text : '',
    );
    bool searching = false;
    List<Map<String, dynamic>> results = [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.map_outlined,
                    color: AppColors.primaryOf(ctx),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Cari Alamat dari Peta Lokasi',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimaryOf(ctx),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Ketik nama jalan, perumahan, kelurahan, atau kota untuk mengisi alamat otomatis.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textSecondaryOf(ctx),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: searchCtrl,
                      textInputAction: TextInputAction.search,
                      decoration: const InputDecoration(
                        labelText: 'Nama Jalan / Perumahan / Kota',
                        hintText: 'Contoh: Cipta Karya Pekanbaru',
                        prefixIcon: Icon(Icons.search_rounded),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: searching
                        ? null
                        : () async {
                            final q = searchCtrl.text.trim();
                            if (q.length < 3) return;
                            setModalState(() => searching = true);
                            try {
                              final dio = Dio(
                                BaseOptions(
                                  headers: {
                                    'User-Agent':
                                        'SADARFinanceApp/1.2.0 (https://sadar-finance.web.id)',
                                    'Accept-Language': 'id',
                                  },
                                ),
                              );
                              final res = await dio.get(
                                'https://nominatim.openstreetmap.org/search',
                                queryParameters: {
                                  'format': 'jsonv2',
                                  'q': q,
                                  'countrycodes': 'id',
                                  'addressdetails': 1,
                                  'limit': 5,
                                },
                              );
                              if (res.data is List) {
                                setModalState(() {
                                  results = (res.data as List)
                                      .whereType<Map>()
                                      .map((e) => Map<String, dynamic>.from(e))
                                      .toList();
                                });
                              }
                            } catch (_) {
                            } finally {
                              setModalState(() => searching = false);
                            }
                          },
                    child: searching
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Cari'),
                  ),
                ],
              ),
              if (results.isNotEmpty) ...[
                const SizedBox(height: 12),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 240),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: results.length,
                    separatorBuilder: (_, _) => const Divider(height: 1),
                    itemBuilder: (_, idx) {
                      final r = results[idx];
                      final display = (r['display_name'] ?? '').toString();
                      final addr = r['address'] is Map
                          ? Map<String, dynamic>.from(r['address'] as Map)
                          : <String, dynamic>{};
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(
                          Icons.place_rounded,
                          color: AppColors.accent,
                        ),
                        title: Text(
                          display,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        onTap: () {
                          final city = (addr['city'] ??
                                  addr['town'] ??
                                  addr['regency'] ??
                                  addr['county'] ??
                                  '')
                              .toString()
                              .trim();
                          final state = (addr['state'] ?? '').toString().trim();
                          final postcode =
                              (addr['postcode'] ?? '').toString().trim();
                          final shortStreet =
                              display.split(',').take(3).join(',').trim();
                          setState(() {
                            _addressCtrl.text =
                                UserModel.formatTitleCaseAddress(shortStreet);
                            if (city.isNotEmpty) _cityCtrl.text = city;
                            if (state.isNotEmpty) _provinceCtrl.text = state;
                            if (postcode.isNotEmpty) {
                              _postalCodeCtrl.text = postcode;
                            }
                          });
                          Navigator.pop(ctx);
                        },
                      );
                    },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showAvatar2DPickerSheet() {
    final currentLevel = ref.read(financeProvider).financialLevel;
    final currentPic = ref.read(authProvider).user?.profilePicture ?? '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.76,
        maxChildSize: 0.92,
        minChildSize: 0.50,
        builder: (ctx, scrollCtrl) => Padding(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pilih Karakter Avatar 2D',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimaryOf(ctx),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Level Anda saat ini: Level $currentLevel - Naikkan level untuk membuka karakter eksklusif!',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondaryOf(ctx),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: GridView.builder(
                  controller: scrollCtrl,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.78,
                  ),
                  itemCount: Avatar2DPreset.catalog.length,
                  itemBuilder: (ctx, idx) {
                    final preset = Avatar2DPreset.catalog[idx];
                    final unlocked = currentLevel >= preset.requiredLevel;
                    final selected = currentPic == preset.id;

                    return InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () async {
                        if (!unlocked) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.warning,
                              content: Text(
                                'Karakter "${preset.name}" terbuka di Level ${preset.requiredLevel}. Rajin catat transaksi untuk naik level!',
                              ),
                            ),
                          );
                          return;
                        }
                        Navigator.pop(ctx);
                        setState(() => _uploadingAvatar = true);
                        final ok = await ref
                            .read(authProvider.notifier)
                            .selectAvatar2DPreset(preset.id);
                        if (!mounted) return;
                        setState(() {
                          _uploadingAvatar = false;
                          _localAvatarPreview = null;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor:
                                ok ? AppColors.success : AppColors.danger,
                            content: Text(
                              ok
                                  ? 'Avatar 2D "${preset.name}" berhasil digunakan!'
                                  : 'Gagal menyimpan avatar.',
                            ),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: selected
                              ? AppColors.accent.withValues(alpha: 0.14)
                              : AppColors.subtleOf(ctx),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: selected
                                ? AppColors.accent
                                : AppColors.borderOf(ctx),
                            width: selected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Stack(
                              alignment: Alignment.center,
                              children: [
                                Opacity(
                                  opacity: unlocked ? 1.0 : 0.38,
                                  child: Avatar2DWidget(
                                    preset: preset,
                                    size: 58,
                                  ),
                                ),
                                if (!unlocked)
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.black.withValues(alpha: 0.65),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.lock_rounded,
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              preset.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimaryOf(ctx),
                              ),
                            ),
                            Text(
                              unlocked
                                  ? preset.roleTag
                                  : 'Level ${preset.requiredLevel}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 10,
                                color: unlocked
                                    ? AppColors.textSecondaryOf(ctx)
                                    : AppColors.warning,
                                fontWeight: unlocked
                                    ? FontWeight.w500
                                    : FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickAvatar() async {
    if (_uploadingAvatar) return;
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 75,
    );
    if (picked == null) return;
    final file = File(picked.path);
    setState(() {
      _localAvatarPreview = file;
      _uploadingAvatar = true;
    });
    final ok = await ref.read(authProvider.notifier).uploadAvatar(file);
    if (!mounted) return;
    setState(() {
      _uploadingAvatar = false;
      _localAvatarPreview = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: ok ? AppColors.success : AppColors.danger,
        content: Text(
          ok
              ? 'Foto profil berhasil disimpan!'
              : (ref.read(authProvider).error ?? 'Gagal mengunggah foto profil.'),
        ),
      ),
    );
  }

  Future<void> _pickDateOfBirth() async {
    final initial = DateTime.tryParse(_selectedDob) ?? DateTime(2002, 1, 1);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1945),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      final y = picked.year.toString().padLeft(4, '0');
      final m = picked.month.toString().padLeft(2, '0');
      final d = picked.day.toString().padLeft(2, '0');
      setState(() => _selectedDob = '$y-$m-$d');
    }
  }

  Future<void> _saveProfile() async {
    if (_savingProfile) return;
    if (_firstNameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.warning,
          content: Text('Nama Depan wajib diisi.'),
        ),
      );
      return;
    }

    setState(() => _savingProfile = true);
    final finance = ref.read(financeProvider);
    final cleanAddress = UserModel.formatTitleCaseAddress(_addressCtrl.text);
    _addressCtrl.text = cleanAddress;

    final ok = await ref.read(authProvider.notifier).updateProfile(
          firstName: _firstNameCtrl.text.trim(),
          middleName: _middleNameCtrl.text.trim(),
          lastName: _lastNameCtrl.text.trim().isNotEmpty
              ? _lastNameCtrl.text.trim()
              : _firstNameCtrl.text.trim(),
          username: _usernameCtrl.text
              .trim()
              .replaceAll('@', '')
              .toLowerCase(),
          gender: _selectedGender.isNotEmpty ? _selectedGender : null,
          dateOfBirth: _selectedDob.isNotEmpty ? _selectedDob : null,
          phoneNumber: _phoneCtrl.text.trim(),
          occupation: _occupationCtrl.text.trim(),
          financialGoal: _selectedGoal.isNotEmpty ? _selectedGoal : null,
          address: cleanAddress,
          city: _cityCtrl.text.trim(),
          province: _provinceCtrl.text.trim(),
          postalCode: _postalCodeCtrl.text.trim(),
          streakDays: finance.streakDays,
          xpPoints: finance.xpPoints,
          financialLevel: finance.financialLevel,
        );
    if (!mounted) return;
    setState(() => _savingProfile = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: ok ? AppColors.success : AppColors.danger,
        content: Text(
          ok
              ? 'Profil berhasil diperbarui! Sapaan aktif: "Halo, ${ref.read(authProvider).user?.displayName ?? ''}"'
              : (ref.read(authProvider).error ?? 'Gagal memperbarui profil.'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final finance = ref.watch(financeProvider);
    final primaryColor = AppColors.primaryOf(context);
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);

    final previewGreeting = _middleNameCtrl.text.trim().isNotEmpty
        ? _middleNameCtrl.text.trim()
        : (_firstNameCtrl.text.trim().isNotEmpty
            ? _firstNameCtrl.text.trim()
            : 'Pengguna');

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Identitas Profil')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
        children: [
          // 1. Kartu Foto & Avatar 2D
          SadarCard(
            child: Column(
              children: [
                GestureDetector(
                  onTap: _uploadingAvatar ? null : _showAvatar2DPickerSheet,
                  child: Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      UserAvatar(
                        profilePicture: auth.user?.profilePicture,
                        apiBaseUrl: auth.apiBaseUrl,
                        initials: auth.user?.initials ?? 'S',
                        radius: 44,
                        localFile: _localAvatarPreview,
                        isLoading: _uploadingAvatar,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.accent],
                          ),
                          borderRadius: BorderRadius.circular(99),
                          border: Border.all(
                            color: AppColors.surfaceOf(context),
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          'LV.${finance.financialLevel}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Sapaan Beranda: "Halo, $previewGreeting"',
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '@${_usernameCtrl.text.trim().isEmpty ? (auth.user?.effectiveUsername ?? 'username') : _usernameCtrl.text.trim().replaceAll('@', '')} - ${finance.financialLevelTitle}',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.accentOf(context),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed:
                            _uploadingAvatar ? null : _showAvatar2DPickerSheet,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accent,
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        icon: const Icon(
                          Icons.face_retouching_natural_rounded,
                          size: 18,
                        ),
                        label: const Text('Pilih Avatar 2D'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _uploadingAvatar ? null : _pickAvatar,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        icon: const Icon(
                          Icons.photo_camera_outlined,
                          size: 18,
                        ),
                        label: Text(
                          _uploadingAvatar ? 'Mengunggah...' : 'Upload Foto',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. Kartu Identitas Nama & Username Leaderboard
          SadarCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(
                  title: 'Identitas Nama & Username',
                  subtitle:
                      'Nama Tengah digunakan sebagai nama panggilan di Beranda & Email',
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _firstNameCtrl,
                        onChanged: (_) => setState(() {}),
                        decoration: const InputDecoration(
                          labelText: 'Nama Depan',
                          hintText: 'Muhammad',
                          prefixIcon: Icon(Icons.person_outline_rounded),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _middleNameCtrl,
                        onChanged: (_) => setState(() {}),
                        decoration: const InputDecoration(
                          labelText: 'Nama Tengah (Panggilan)',
                          hintText: 'Habib',
                          prefixIcon: Icon(Icons.record_voice_over_outlined),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _lastNameCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Nama Belakang',
                          hintText: 'Rafi',
                          prefixIcon: Icon(Icons.badge_outlined),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _usernameCtrl,
                        onChanged: (_) => setState(() {}),
                        decoration: const InputDecoration(
                          labelText: 'Username Leaderboard',
                          hintText: 'habibrafi',
                          prefixText: '@',
                          prefixIcon: Icon(Icons.emoji_events_outlined),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 3. Kartu Profesi, Data Diri & Fokus Finansial
          SadarCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(
                  title: 'Profesi & Identitas Personal',
                  subtitle: 'Data profil untuk personalisasi analisis keuangan',
                ),
                const SizedBox(height: 14),
                Text(
                  'Pilih Kategori Pekerjaan / Profesi',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _occupationOptions.map((occ) {
                    final selected = _occupationCtrl.text.trim().toLowerCase() ==
                        occ.toLowerCase();
                    return ChoiceChip(
                      label: Text(
                        occ,
                        style: const TextStyle(fontSize: 11.5),
                      ),
                      selected: selected,
                      onSelected: (_) {
                        setState(() => _occupationCtrl.text = occ);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _occupationCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Detail Pekerjaan /Jabatan / Jurusan',
                    hintText: 'Contoh: Mahasiswa Teknik Informatika',
                    prefixIcon: Icon(Icons.work_outline_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue:
                            (_selectedGender == 'male' || _selectedGender == 'female')
                                ? _selectedGender
                                : null,
                        decoration: const InputDecoration(
                          labelText: 'Jenis Kelamin',
                          prefixIcon: Icon(Icons.wc_rounded),
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'male',
                            child: Text('Laki-laki'),
                          ),
                          DropdownMenuItem(
                            value: 'female',
                            child: Text('Perempuan'),
                          ),
                        ],
                        onChanged: (v) =>
                            setState(() => _selectedGender = v ?? ''),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: _pickDateOfBirth,
                        borderRadius: BorderRadius.circular(14),
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Tanggal Lahir',
                            prefixIcon: Icon(Icons.cake_outlined),
                          ),
                          child: Text(
                            _selectedDob.isNotEmpty
                                ? _selectedDob
                                : 'Pilih Tanggal',
                            style: TextStyle(
                              fontSize: 13.5,
                              color: _selectedDob.isNotEmpty
                                  ? textPrimary
                                  : AppColors.textMutedOf(context),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Nomor Handphone / WhatsApp',
                    hintText: '081234567890',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _financialGoalOptions.contains(_selectedGoal)
                      ? _selectedGoal
                      : null,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    labelText: 'Fokus Tujuan Finansial Utama',
                    prefixIcon: Icon(Icons.flag_outlined),
                  ),
                  items: _financialGoalOptions
                      .map(
                        (g) => DropdownMenuItem(
                          value: g,
                          child: Text(
                            g,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => _selectedGoal = v ?? ''),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Kartu Alamat & Pelacak Lokasi GPS (Google Maps / OpenStreetMap)
          SadarCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeader(
                  title: 'Alamat & Lokasi Domisili',
                  subtitle: 'Lacak koordinat GPS HP atau cari nama jalan otomatis',
                  trailing: TextButton.icon(
                    onPressed: () {
                      setState(() {
                        _addressCtrl.text =
                            UserModel.formatTitleCaseAddress(_addressCtrl.text);
                      });
                    },
                    icon: const Icon(Icons.auto_fix_high_rounded, size: 16),
                    label: const Text('Rapikan'),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _locatingGps ? null : _detectAddressFromGps,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        icon: _locatingGps
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.my_location_rounded, size: 17),
                        label: Text(
                          _locatingGps ? 'Melacak GPS...' : 'Lacak Lokasi GPS',
                          style: const TextStyle(fontSize: 12.5),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _showLocationSearchSheet,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        icon: const Icon(Icons.map_outlined, size: 17),
                        label: const Text(
                          'Cari di Peta',
                          style: TextStyle(fontSize: 12.5),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _addressCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Alamat Jalan / Perumahan / Nomor Rumah',
                    hintText:
                        'Jl. Cipta Karya Ujung, Perumahan Karya Gading Permai No. B14',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: _cityCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Kota / Kabupaten',
                          hintText: 'Pekanbaru',
                          prefixIcon: Icon(Icons.location_city_rounded),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _postalCodeCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Kode Pos',
                          hintText: '28294',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _provinceCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Provinsi',
                    hintText: 'Riau',
                    prefixIcon: Icon(Icons.public_rounded),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _savingProfile ? null : _saveProfile,
              icon: _savingProfile
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.check_circle_outline_rounded, size: 20),
              label: const Text('Simpan Seluruh Perubahan Profil'),
            ),
          ),
          const SizedBox(height: 14),
          SadarCard(
            onTap: () => context.push('/settings'),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Icon(Icons.settings_outlined, color: primaryColor, size: 22),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pengaturan Keamanan & Kata Sandi',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13.5,
                          color: textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Kelola kata sandi, verifikasi OTP email, dan tautan Google',
                        style: TextStyle(
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.textMutedOf(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
