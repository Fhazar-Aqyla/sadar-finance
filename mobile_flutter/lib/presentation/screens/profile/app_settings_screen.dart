import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../app.dart';
import '../../../core/config/app_config.dart';
import '../../../core/services/google_auth_helper.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/services/app_update_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/app_tour_dialog.dart';
import '../../widgets/google_logo_icon.dart';
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

  Future<void> _exportBackupJson(FinanceState finance) async {
    try {
      final user = ref.read(authProvider).user;
      final payload = {
        'app': 'SADAR Finance',
        'version': AppConfig.appVersion,
        'exportedAt': DateTime.now().toIso8601String(),
        'userEmail': user?.email ?? '',
        'accounts': finance.accounts.map((a) => a.toJson()).toList(),
        'transactions': finance.transactions.map((t) => t.toJson()).toList(),
        'incomes': finance.incomes.map((i) => i.toJson()).toList(),
        'savingsGoals': finance.savingsGoals.map((g) => g.toJson()).toList(),
        'recurringItems':
            finance.recurringItems.map((r) => r.toJson()).toList(),
        'debts': finance.debts.map((d) => d.toJson()).toList(),
        'transfers': finance.transfers.map((tr) => tr.toJson()).toList(),
      };
      final jsonStr = const JsonEncoder.withIndent('  ').convert(payload);
      final dir = await getTemporaryDirectory();
      final stamp = AppFormatters.isoDateOnly(DateTime.now());
      final file = File('${dir.path}/backup-sadar-finance-$stamp.json');
      await file.writeAsString(jsonStr, flush: true);
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'application/json')],
        subject: 'Cadangan Data SADAR Finance V 2.0 ($stamp)',
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.danger,
          content: Text('Gagal membuat file cadangan: $e'),
        ),
      );
    }
  }

  void _showRestoreJsonSheet() {
    final jsonCtrl = TextEditingController();
    bool restoring = false;
    showModalBottomSheet<void>(
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
                Text(
                  'Pulihkan Data dari Cadangan JSON',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Tempelkan isi file backup-sadar-finance.json Anda di bawah ini untuk memulihkan dan menyinkronkan data rencana keuangan & akun.',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: jsonCtrl,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    labelText: 'Isi JSON Cadangan',
                    hintText: '{\n  "app": "SADAR Finance",\n  ...\n}',
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: restoring
                      ? null
                      : () async {
                          final raw = jsonCtrl.text.trim();
                          if (raw.isEmpty) return;
                          setModalState(() => restoring = true);
                          try {
                            final decoded = jsonDecode(raw);
                            if (decoded is! Map<String, dynamic>) {
                              throw Exception('Format JSON tidak valid.');
                            }
                            await ref
                                .read(sadarApiServiceProvider)
                                .syncFinancialPlans(
                                  savingsGoals:
                                      (decoded['savingsGoals'] as List?) ??
                                          const [],
                                  recurringItems:
                                      (decoded['recurringItems'] as List?) ??
                                          const [],
                                  debts:
                                      (decoded['debts'] as List?) ?? const [],
                                  transfers: (decoded['transfers'] as List?) ??
                                      const [],
                                );
                            await ref.read(financeProvider.notifier).loadAll();
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: AppColors.success,
                                  content: Text(
                                    'Data cadangan berhasil dipulihkan & disinkronkan!',
                                  ),
                                ),
                              );
                            }
                          } catch (e) {
                            setModalState(() => restoring = false);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: AppColors.danger,
                                  content: Text('Gagal memulihkan data: $e'),
                                ),
                              );
                            }
                          }
                        },
                  icon: const Icon(Icons.restore_rounded, size: 18),
                  label: Text(
                    restoring ? 'Memulihkan...' : 'Pulihkan & Sinkronkan Sekarang',
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
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

  void _showEmailVerificationSheet() {
    final otpCtrl = TextEditingController();
    bool sending = false;
    bool verifying = false;
    bool codeSent = false;
    String? infoMessage;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final email = ref.read(authProvider).user?.email ?? '-';
          return Padding(
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
                          color: AppColors.accent.withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.mark_email_read_rounded,
                          color: AppColors.accent,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Verifikasi Email (Kode OTP)',
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
                    'Kirim kode verifikasi 6 digit ke $email untuk mengaktifkan lencana Email Terverifikasi.',
                    style: TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textSecondaryOf(ctx),
                    ),
                  ),
                  const SizedBox(height: 14),
                  if (infoMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.success.withValues(alpha: 0.35),
                        ),
                      ),
                      child: Text(
                        infoMessage!,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimaryOf(ctx),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  OutlinedButton.icon(
                    onPressed: sending
                        ? null
                        : () async {
                            setModalState(() => sending = true);
                            try {
                              final res = await ref
                                  .read(authProvider.notifier)
                                  .sendEmailOtp();
                              final preview =
                                  res['otpPreview']?.toString() ?? '';
                              setModalState(() {
                                sending = false;
                                codeSent = true;
                                infoMessage = preview.isNotEmpty
                                    ? 'Kode OTP terkirim! (Kode Pratinjau: $preview)'
                                    : (res['message']?.toString() ??
                                        'Kode verifikasi 6 digit telah dikirim ke email Anda.');
                                if (preview.isNotEmpty) {
                                  otpCtrl.text = preview;
                                }
                              });
                            } catch (e) {
                              setModalState(() => sending = false);
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
                    icon: sending
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send_rounded, size: 18),
                    label: Text(
                      codeSent
                          ? 'Kirim Ulang Kode OTP ke Email'
                          : 'Kirim Kode OTP 6 Digit Sekarang',
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: otpCtrl,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 6,
                    ),
                    decoration: const InputDecoration(
                      labelText: 'Masukkan Kode OTP 6 Digit',
                      hintText: '123456',
                      counterText: '',
                      prefixIcon: Icon(Icons.pin_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: verifying
                          ? null
                          : () async {
                              final code = otpCtrl.text.trim();
                              if (code.length != 6) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Masukkan 6 digit kode OTP dari email Anda.',
                                    ),
                                  ),
                                );
                                return;
                              }
                              setModalState(() => verifying = true);
                              try {
                                await ref
                                    .read(authProvider.notifier)
                                    .verifyEmailWithOtp(code);
                                if (ctx.mounted) Navigator.pop(ctx);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      backgroundColor: AppColors.success,
                                      content: Text(
                                        'Email berhasil diverifikasi!',
                                      ),
                                    ),
                                  );
                                }
                              } catch (e) {
                                setModalState(() => verifying = false);
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
                      child: verifying
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Verifikasi Kode OTP'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _handleGoogleLinkToggle() async {
    final user = ref.read(authProvider).user;
    if (user == null) return;
    if (user.isGoogleLinked) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Lepas Tautan Google?'),
          content: Text(
            'Tautan akun Google (${user.googleEmail ?? user.email}) akan dilepas. Anda tetap bisa masuk dengan email & kata sandi.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
              ),
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Lepas Tautan'),
            ),
          ],
        ),
      );
      if (confirm != true || !mounted) return;
      try {
        await ref.read(authProvider.notifier).unlinkGoogleAccount();
        await GoogleAuthHelper.signOutGoogle();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tautan akun Google berhasil dilepas.'),
          ),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppColors.danger, content: Text('$e')),
        );
      }
      return;
    }

    final picked = await GoogleAuthHelper.pickGoogleAccount(
      context,
      prefillEmail: user.email,
      prefillName: user.fullName,
    );
    if (picked == null || !mounted) return;
    try {
      await ref.read(authProvider.notifier).linkGoogleAccount(
            googleId: picked.googleId,
            email: picked.email,
            photoUrl: picked.photoUrl,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.success,
          content: Text('Akun Google (${picked.email}) berhasil ditautkan!'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.danger, content: Text('$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final uiPrefs = ref.watch(uiPreferencesProvider);
    final finance = ref.watch(financeProvider);
    final primaryColor = AppColors.primaryOf(context);
    final secondaryColor = AppColors.textSecondaryOf(context);
    final mutedColor = AppColors.textMutedOf(context);

    final lastSyncText = finance.lastSyncedAt != null
        ? AppFormatters.fullDateTime(finance.lastSyncedAt!)
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
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: Icon(
                    Icons.fingerprint_rounded,
                    color: primaryColor,
                  ),
                  title: Text(
                    'Kunci Aplikasi (Biometrik / PIN)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    uiPrefs.biometricLockEnabled
                        ? 'Aktif saat membuka aplikasi atau kembali dari latar belakang'
                        : 'Lindungi data keuangan dengan sidik jari, wajah, atau PIN HP',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  value: uiPrefs.biometricLockEnabled,
                  onChanged: (enabled) async {
                    final lockService = ref.read(appLockServiceProvider);
                    final supported = await lockService.isSupported();
                    if (!supported) {
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: AppColors.warning,
                          content: Text(
                            'Perangkat belum mengaktifkan kunci layar (PIN / Sidik Jari).',
                          ),
                        ),
                      );
                      return;
                    }
                    final verified = await lockService.authenticate(
                      reason: enabled
                          ? 'Verifikasi untuk mengaktifkan Kunci Aplikasi'
                          : 'Verifikasi untuk menonaktifkan Kunci Aplikasi',
                    );
                    if (!verified) return;
                    await ref
                        .read(uiPreferencesProvider.notifier)
                        .setBiometricLockEnabled(enabled);
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: AppColors.success,
                        content: Text(
                          enabled
                              ? 'Kunci Aplikasi biometrik berhasil diaktifkan.'
                              : 'Kunci Aplikasi dinonaktifkan.',
                        ),
                      ),
                    );
                  },
                ),
                const Divider(),
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
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    user?.emailVerified == true
                        ? Icons.verified_rounded
                        : Icons.mark_email_unread_outlined,
                    color: user?.emailVerified == true
                        ? AppColors.success
                        : AppColors.warning,
                  ),
                  title: Text(
                    'Verifikasi Email (Kode OTP 6 Digit)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    user?.emailVerified == true
                        ? 'Email ${user?.email ?? ''} telah terverifikasi'
                        : 'Kirim kode OTP 6 digit ke ${user?.email ?? 'email Anda'}',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  trailing: user?.emailVerified == true
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(99),
                          ),
                          child: const Text(
                            'Terverifikasi',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.success,
                            ),
                          ),
                        )
                      : TextButton(
                          onPressed: _showEmailVerificationSheet,
                          child: const Text('Verifikasi'),
                        ),
                  onTap: user?.emailVerified == true
                      ? null
                      : _showEmailVerificationSheet,
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const GoogleLogoIcon(
                    size: 18,
                    withBadgeBackground: true,
                  ),
                  title: Text(
                    'Tautkan Akun Google',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    user?.isGoogleLinked == true
                        ? 'Tertaut ke ${user?.googleEmail ?? user?.email}'
                        : 'Hubungkan akun Google untuk masuk 1-ketuk & verifikasi instan',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  trailing: TextButton(
                    onPressed: _handleGoogleLinkToggle,
                    child: Text(
                      user?.isGoogleLinked == true ? 'Lepas' : 'Tautkan',
                      style: TextStyle(
                        color: user?.isGoogleLinked == true
                            ? AppColors.danger
                            : primaryColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  onTap: _handleGoogleLinkToggle,
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
                        ? '${finance.pendingSyncCount} perubahan menunggu sinkronisasi - Sinkron terakhir: $lastSyncText'
                        : 'Data tersimpan lokal & otomatis sinkron - Sinkron terakhir: $lastSyncText',
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
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    Icons.backup_table_rounded,
                    color: primaryColor,
                  ),
                  title: Text(
                    'Cadangkan Data Keuangan (Backup JSON)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    'Ekspor seluruh akun, transaksi, tabungan, dan jadwal rutin ke file cadangan (.json)',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  trailing: const Icon(Icons.download_rounded, size: 20),
                  onTap: () => _exportBackupJson(finance),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(
                    Icons.restore_page_rounded,
                    color: AppColors.accent,
                  ),
                  title: Text(
                    'Pulihkan dari Cadangan (Restore JSON)',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  subtitle: Text(
                    'Impor kembali data cadangan JSON SADAR Finance ke perangkat & Cloud',
                    style: TextStyle(fontSize: 12, color: secondaryColor),
                  ),
                  trailing: const Icon(Icons.upload_file_rounded, size: 20),
                  onTap: _showRestoreJsonSheet,
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
                    ? 'Versi ${AppConfig.appVersion} - Patch OTA #$_patchNumber'
                    : 'Versi ${AppConfig.appVersion} - Pembaruan OTA aktif',
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
                  'V ${AppConfig.appVersion}',
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                    color: mutedColor,
                  ),
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
