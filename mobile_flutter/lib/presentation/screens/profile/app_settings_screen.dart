import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/services/app_update_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/app_tour_dialog.dart';
import '../../widgets/sadar_card.dart';
import '../../widgets/sadar_logo.dart';

final appUpdateServiceProvider = Provider<AppUpdateService>(
  (ref) => AppUpdateService(ref.watch(apiClientProvider)),
);

class AppSettingsScreen extends ConsumerStatefulWidget {
  const AppSettingsScreen({super.key});

  @override
  ConsumerState<AppSettingsScreen> createState() => _AppSettingsScreenState();
}

class _AppSettingsScreenState extends ConsumerState<AppSettingsScreen> {
  bool _checkingUpdate = false;
  int? _patchNumber;

  @override
  void initState() {
    super.initState();
    _loadPatchInfo();
  }

  Future<void> _loadPatchInfo() async {
    final patch =
        await ref.read(appUpdateServiceProvider).getCurrentPatchNumber();
    if (mounted) setState(() => _patchNumber = patch);
  }

  Future<void> _checkUpdates() async {
    setState(() => _checkingUpdate = true);
    try {
      final result =
          await ref.read(appUpdateServiceProvider).checkForUpdates();
      if (!mounted) return;
      setState(() => _patchNumber = result.currentPatchNumber ?? _patchNumber);
      await AppUpdateService.showUpdateDialog(context, result);
    } finally {
      if (mounted) setState(() => _checkingUpdate = false);
    }
  }

  void _showChangePasswordSheet() {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();
    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;
    bool submitting = false;

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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryOf(ctx).withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.lock_reset_rounded,
                        color: AppColors.primaryOf(ctx),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Ubah Kata Sandi',
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
                  'Pastikan kata sandi baru minimal 8 karakter dan mudah Anda ingat.',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: currentCtrl,
                  obscureText: obscureCurrent,
                  decoration: InputDecoration(
                    labelText: 'Kata Sandi Saat Ini',
                    prefixIcon: const Icon(Icons.lock_outline_rounded),
                    suffixIcon: IconButton(
                      onPressed: () =>
                          setModalState(() => obscureCurrent = !obscureCurrent),
                      icon: Icon(
                        obscureCurrent
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newCtrl,
                  obscureText: obscureNew,
                  decoration: InputDecoration(
                    labelText: 'Kata Sandi Baru',
                    prefixIcon: const Icon(Icons.key_rounded),
                    suffixIcon: IconButton(
                      onPressed: () =>
                          setModalState(() => obscureNew = !obscureNew),
                      icon: Icon(
                        obscureNew
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmCtrl,
                  obscureText: obscureConfirm,
                  decoration: InputDecoration(
                    labelText: 'Konfirmasi Kata Sandi Baru',
                    prefixIcon: const Icon(Icons.verified_user_outlined),
                    suffixIcon: IconButton(
                      onPressed: () =>
                          setModalState(() => obscureConfirm = !obscureConfirm),
                      icon: Icon(
                        obscureConfirm
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: submitting
                        ? null
                        : () async {
                            if (currentCtrl.text.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Masukkan kata sandi saat ini.'),
                                ),
                              );
                              return;
                            }
                            if (newCtrl.text.length < 8) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content:
                                      Text('Kata sandi baru minimal 8 karakter.'),
                                ),
                              );
                              return;
                            }
                            if (newCtrl.text != confirmCtrl.text) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content:
                                      Text('Konfirmasi kata sandi tidak cocok.'),
                                ),
                              );
                              return;
                            }
                            setModalState(() => submitting = true);
                            try {
                              await ref
                                  .read(sadarApiServiceProvider)
                                  .changePassword(
                                    currentPassword: currentCtrl.text,
                                    newPassword: newCtrl.text,
                                    confirmPassword: confirmCtrl.text,
                                  );
                              await ref
                                  .read(authProvider.notifier)
                                  .syncOfflinePasswordHash(newCtrl.text);
                              if (ctx.mounted) Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: AppColors.success,
                                    content: Text(
                                      'Kata sandi berhasil diperbarui!',
                                    ),
                                  ),
                                );
                              }
                            } catch (e) {
                              setModalState(() => submitting = false);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    backgroundColor: AppColors.danger,
                                    content: Text('$e'),
                                  ),
                                );
                              }
                            }
                          },
                    child: submitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Perbarui Kata Sandi'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final uiPrefs = ref.watch(uiPreferencesProvider);
    final finance = ref.watch(financeProvider);
    final primaryColor = AppColors.primaryOf(context);
    final secondaryColor = AppColors.textSecondaryOf(context);
    final mutedColor = AppColors.textMutedOf(context);

    final lastSyncText = finance.lastSyncedAt != null
        ? AppFormatters.shortDate(finance.lastSyncedAt!)
        : 'Belum tersinkron';

    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan Aplikasi')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Section 1: Tampilan & Privasi
          _SettingsGroupLabel('TAMPILAN & PRIVASI'),
          const SizedBox(height: 8),
          SadarCard(
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
            child: Column(
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: Icon(
                    uiPrefs.isDarkMode
                        ? Icons.dark_mode_rounded
                        : Icons.light_mode_rounded,
                    color: primaryColor,
                  ),
                  title: Text(
                    'Mode Gelap (Dark Mode)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    uiPrefs.isDarkMode
                        ? 'Tema gelap aktif untuk kenyamanan mata'
                        : 'Tema terang bersih standar SADAR Finance',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  value: uiPrefs.isDarkMode,
                  onChanged: (v) => ref
                      .read(uiPreferencesProvider.notifier)
                      .setDarkMode(v),
                ),
                const Divider(),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: const Icon(
                    Icons.visibility_off_outlined,
                    color: AppColors.accent,
                  ),
                  title: Text(
                    'Mode Privasi Saldo',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    'Samarkan nominal saldo dan transaksi di layar',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  value: uiPrefs.hideBalances,
                  onChanged: (v) => ref
                      .read(uiPreferencesProvider.notifier)
                      .setHideBalances(v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Section 2: Keamanan Akun
          _SettingsGroupLabel('KEAMANAN AKUN'),
          const SizedBox(height: 8),
          SadarCard(
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.lock_reset_rounded, color: primaryColor),
                  title: Text(
                    'Ubah Kata Sandi',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    finance.isOffline
                        ? 'Membutuhkan koneksi internet untuk ubah kata sandi'
                        : 'Perbarui kata sandi akun SADAR Finance Anda',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: finance.isOffline
                      ? () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Ubah kata sandi memerlukan koneksi internet.',
                              ),
                            ),
                          );
                        }
                      : _showChangePasswordSheet,
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Section 3: Data Lokal & Sinkronisasi Otomatis
          _SettingsGroupLabel('DATA LOKAL & SINKRONISASI'),
          const SizedBox(height: 8),
          SadarCard(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 14),
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    finance.isOffline
                        ? Icons.cloud_off_rounded
                        : Icons.cloud_done_rounded,
                    color:
                        finance.isOffline ? AppColors.warning : AppColors.success,
                  ),
                  title: Text(
                    finance.isOffline
                        ? 'Mode Offline Aktif'
                        : 'Terhubung & Tersinkronisasi',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    finance.pendingSyncCount > 0
                        ? '${finance.pendingSyncCount} perubahan menunggu sinkronisasi · Terakhir: $lastSyncText'
                        : 'Data tersimpan lokal & otomatis sinkron · Terakhir: $lastSyncText',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  trailing: finance.isSyncing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : TextButton(
                          onPressed: () async {
                            final synced = await ref
                                .read(financeProvider.notifier)
                                .syncPendingAndRefresh();
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: synced
                                    ? AppColors.success
                                    : AppColors.warning,
                                content: Text(
                                  synced
                                      ? 'Seluruh data berhasil disinkronkan!'
                                      : 'Perangkat masih offline. Data akan otomatis sinkron saat terhubung.',
                                ),
                              ),
                            );
                          },
                          child: const Text('Sinkronkan'),
                        ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Section 4: Pembaruan Aplikasi (OTA Auto-Update)
          _SettingsGroupLabel('PEMBARUAN APLIKASI'),
          const SizedBox(height: 8),
          SadarCard(
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(
                Icons.system_update_rounded,
                color: AppColors.accent,
              ),
              title: Text(
                'Cek Pembaruan Otomatis',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimaryOf(context),
                ),
              ),
              subtitle: Text(
                _patchNumber != null
                    ? 'Versi ${AppConfig.appVersion} · Patch OTA #$_patchNumber'
                    : 'Versi ${AppConfig.appVersion} · Pembaruan OTA aktif',
                style: TextStyle(fontSize: 12, color: secondaryColor),
              ),
              trailing: _checkingUpdate
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.chevron_right_rounded),
              onTap: _checkingUpdate ? null : _checkUpdates,
            ),
          ),
          const SizedBox(height: 18),

          // Section 5: Panduan & Legal
          _SettingsGroupLabel('PANDUAN & INFORMASI'),
          const SizedBox(height: 8),
          SadarCard(
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.explore_outlined, color: primaryColor),
                  title: Text(
                    'Ulangi Panduan Aplikasi (Tour Guide)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => AppTourDialog.show(context),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.slideshow_rounded, color: secondaryColor),
                  title: Text(
                    'Lihat Halaman Perkenalan',
                    style: TextStyle(
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/onboarding'),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading:
                      Icon(Icons.privacy_tip_outlined, color: secondaryColor),
                  title: Text(
                    'Kebijakan Privasi',
                    style: TextStyle(color: AppColors.textPrimaryOf(context)),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/privacy-policy'),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading:
                      Icon(Icons.description_outlined, color: secondaryColor),
                  title: Text(
                    'Syarat & Ketentuan',
                    style: TextStyle(color: AppColors.textPrimaryOf(context)),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/terms-conditions'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Column(
              children: [
                const SadarLogo(
                  variant: SadarLogoVariant.adaptive,
                  height: 20,
                  showFinanceSubtitle: true,
                  alignment: CrossAxisAlignment.center,
                ),
                const SizedBox(height: 6),
                Text(
                  'Versi ${AppConfig.appVersion} · Smart Personal Finance',
                  style: TextStyle(fontSize: 11.5, color: mutedColor),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _SettingsGroupLabel extends StatelessWidget {
  final String text;
  const _SettingsGroupLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.0,
          color: AppColors.textMutedOf(context),
        ),
      ),
    );
  }
}
