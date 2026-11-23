import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
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
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _occupationCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();

  File? _localAvatarPreview;
  bool _uploadingAvatar = false;
  bool _savingProfile = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    if (user != null) {
      _firstNameCtrl.text = user.firstName;
      _lastNameCtrl.text = user.lastName;
      _phoneCtrl.text = user.phoneNumber ?? '';
      _occupationCtrl.text = user.occupation ?? '';
      _addressCtrl.text = user.address ?? '';
    }
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _occupationCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
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
                          'Level Anda saat ini: Level $currentLevel · Naikkan level untuk membuka karakter eksklusif!',
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
      if (ok) {
        _localAvatarPreview = null; // Use persisted server/base64 image now
      } else {
        _localAvatarPreview = null;
      }
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

  Future<void> _saveProfile() async {
    if (_savingProfile) return;
    setState(() => _savingProfile = true);
    final ok = await ref.read(authProvider.notifier).updateProfile(
          firstName: _firstNameCtrl.text,
          lastName: _lastNameCtrl.text,
          phoneNumber: _phoneCtrl.text,
          occupation: _occupationCtrl.text,
          address: _addressCtrl.text,
        );
    if (!mounted) return;
    setState(() => _savingProfile = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: ok ? AppColors.success : AppColors.danger,
        content: Text(
          ok
              ? 'Profil berhasil diperbarui!'
              : (ref.read(authProvider).error ?? 'Gagal memperbarui profil.'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final primaryColor = AppColors.primaryOf(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SadarCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: _uploadingAvatar ? null : _pickAvatar,
                        child: UserAvatar(
                          profilePicture: auth.user?.profilePicture,
                          apiBaseUrl: auth.apiBaseUrl,
                          initials: auth.user?.initials ?? 'S',
                          radius: 44,
                          localFile: _localAvatarPreview,
                          isLoading: _uploadingAvatar,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: WrapAlignment.center,
                        children: [
                          ElevatedButton.icon(
                            onPressed: _uploadingAvatar
                                ? null
                                : _showAvatar2DPickerSheet,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accent,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                            ),
                            icon: const Icon(Icons.face_retouching_natural_rounded, size: 18),
                            label: const Text('Pilih Avatar 2D'),
                          ),
                          OutlinedButton.icon(
                            onPressed: _uploadingAvatar ? null : _pickAvatar,
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                            ),
                            icon: const Icon(
                              Icons.photo_camera_outlined,
                              size: 18,
                            ),
                            label: Text(
                              _uploadingAvatar ? 'Mengunggah...' : 'Upload Foto',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _firstNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama Depan',
                    prefixIcon: Icon(Icons.person_outline_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _lastNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama Belakang',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Nomor Handphone',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _occupationCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Pekerjaan',
                    prefixIcon: Icon(Icons.work_outline_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _addressCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Alamat',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _savingProfile ? null : _saveProfile,
                    child: _savingProfile
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Simpan Perubahan Profil'),
                  ),
                ),
              ],
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
                        'Ingin Mengubah Kata Sandi?',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13.5,
                          color: AppColors.textPrimaryOf(context),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Buka Pengaturan Aplikasi → Keamanan Akun',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondaryOf(context),
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
