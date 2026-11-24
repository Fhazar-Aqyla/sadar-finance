import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/config/app_config.dart';
import '../../../core/constants/bank_data.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/account_model.dart';
import '../../../data/services/app_update_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/google_logo_icon.dart';
import '../../widgets/sadar_card.dart';
import '../../widgets/sadar_logo.dart';
import '../../widgets/streak_leaderboard_sheet.dart';
import '../../widgets/user_avatar.dart';
import 'app_settings_screen.dart';

class ProfileAccountScreen extends ConsumerWidget {
  const ProfileAccountScreen({super.key});

  void _showAccountFormSheet(
    BuildContext context,
    WidgetRef ref, {
    AccountModel? existing,
  }) {
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final numberCtrl =
        TextEditingController(text: existing?.accountNumber ?? '');
    final balanceCtrl = TextEditingController(
      text: existing != null ? AppFormatters.number(existing.balance) : '',
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
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
                existing == null ? 'Tambah Akun Keuangan' : 'Ubah Akun Keuangan',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimaryOf(ctx),
                ),
              ),
              const SizedBox(height: 12),
              if (existing == null) ...[
                Text(
                  'Pilih Cepat Bank / E-Wallet',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: BankData.institutions.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 6),
                    itemBuilder: (_, idx) {
                      final inst = BankData.institutions[idx];
                      return ActionChip(
                        label: Text(inst.shortName),
                        onPressed: () => nameCtrl.text = inst.name,
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),
              ],
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nama Akun / Bank / E-Wallet',
                  hintText: 'Contoh: BCA Everyday, GoPay, Tunai',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: numberCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nomor Rekening / HP (Opsional)',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: balanceCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: const [CurrencyInputFormatter()],
                decoration: const InputDecoration(
                  labelText: 'Saldo',
                  prefixText: 'Rp ',
                ),
              ),
              const SizedBox(height: 18),
              ElevatedButton(
                onPressed: () async {
                  if (nameCtrl.text.trim().isEmpty) return;
                  final balance = AppFormatters.parseAmount(balanceCtrl.text);
                  try {
                    bool syncedOnline;
                    if (existing == null) {
                      syncedOnline = await ref
                          .read(financeProvider.notifier)
                          .addAccount(
                            name: nameCtrl.text.trim(),
                            accountNumber: numberCtrl.text.trim(),
                            balance: balance,
                          );
                    } else {
                      syncedOnline = await ref
                          .read(financeProvider.notifier)
                          .updateAccount(
                            existing.id,
                            name: nameCtrl.text.trim(),
                            accountNumber: numberCtrl.text.trim(),
                            balance: balance,
                          );
                    }
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (context.mounted && !syncedOnline) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'Disimpan lokal (Offline). Akan otomatis sinkron saat online.',
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.danger,
                          content: Text('$e'),
                        ),
                      );
                    }
                  }
                },
                child: Text(existing == null ? 'Simpan Akun' : 'Perbarui Akun'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showBudgetFormSheet(BuildContext context, WidgetRef ref) {
    final finance = ref.read(financeProvider);
    final budget = finance.budget;
    final needsCtrl = TextEditingController(
      text: budget != null ? AppFormatters.number(budget.needsAmount) : '',
    );
    final wantsCtrl = TextEditingController(
      text: budget != null ? AppFormatters.number(budget.wantsAmount) : '',
    );
    final savingsCtrl = TextEditingController(
      text: budget != null ? AppFormatters.number(budget.savingsAmount) : '',
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
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
                'Atur Target Budget Bulanan (50/30/20)',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimaryOf(ctx),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Tetapkan pagu bulanan untuk Kebutuhan, Keinginan, dan Tabungan.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textSecondaryOf(ctx),
                ),
              ),
              if (finance.currentMonthIncome > 0) ...[
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () {
                    final inc = finance.currentMonthIncome;
                    needsCtrl.text = AppFormatters.number(inc * 0.5);
                    wantsCtrl.text = AppFormatters.number(inc * 0.3);
                    savingsCtrl.text = AppFormatters.number(inc * 0.2);
                  },
                  icon: const Icon(Icons.auto_fix_high_rounded, size: 18),
                  label: Text(
                    'Hitung Otomatis 50/30/20 dari Pemasukan (${AppFormatters.compactRupiah(finance.currentMonthIncome)})',
                  ),
                ),
              ],
              const SizedBox(height: 14),
              TextField(
                controller: needsCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: const [CurrencyInputFormatter()],
                decoration: const InputDecoration(
                  labelText: 'Kebutuhan (Needs, 50%)',
                  prefixText: 'Rp ',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: wantsCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: const [CurrencyInputFormatter()],
                decoration: const InputDecoration(
                  labelText: 'Keinginan (Wants, 30%)',
                  prefixText: 'Rp ',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: savingsCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: const [CurrencyInputFormatter()],
                decoration: const InputDecoration(
                  labelText: 'Tabungan & Investasi (Savings, 20%)',
                  prefixText: 'Rp ',
                ),
              ),
              const SizedBox(height: 18),
              ElevatedButton(
                onPressed: () async {
                  final n = AppFormatters.parseAmount(needsCtrl.text);
                  final w = AppFormatters.parseAmount(wantsCtrl.text);
                  final s = AppFormatters.parseAmount(savingsCtrl.text);
                  try {
                    final synced =
                        await ref.read(financeProvider.notifier).saveBudget(
                              needsAmount: n,
                              wantsAmount: w,
                              savingsAmount: s,
                            );
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor:
                              synced ? AppColors.success : AppColors.warning,
                          content: Text(
                            synced
                                ? 'Target budget berhasil disimpan!'
                                : 'Target budget tersimpan lokal. Akan sinkron saat online.',
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppColors.danger,
                          content: Text('$e'),
                        ),
                      );
                    }
                  }
                },
                child: const Text('Simpan Target Budget'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showAdminBroadcastSheet(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final api = ref.read(sadarApiServiceProvider);
    List<Map<String, dynamic>> broadcasts = [];
    try {
      broadcasts = await api.getAdminBroadcasts();
    } catch (_) {}

    if (!context.mounted) return;
    final first = broadcasts.isNotEmpty ? broadcasts.first : null;
    final idCtrl = TextEditingController(
      text: (first?['id'] ?? 'bcast-main-2026').toString(),
    );
    final badgeCtrl = TextEditingController(
      text: (first?['badge'] ?? 'PENGUMUMAN & FITUR BARU').toString(),
    );
    final titleCtrl = TextEditingController(
      text: (first?['title'] ?? '').toString(),
    );
    final msgCtrl = TextEditingController(
      text: (first?['message'] ?? '').toString(),
    );
    final bannerCtrl = TextEditingController(
      text: (first?['bannerUrl'] ?? '').toString(),
    );
    final actionLabelCtrl = TextEditingController(
      text: (first?['actionLabel'] ?? 'Coba Sekarang').toString(),
    );
    final actionRouteCtrl = TextEditingController(
      text: (first?['actionRoute'] ?? '/financial-plans').toString(),
    );
    String type = (first?['type'] ?? 'info').toString();
    bool active = first?['active'] != false;
    bool saving = false;
    bool uploading = false;

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
                    const Icon(
                      Icons.campaign_rounded,
                      color: AppColors.accent,
                      size: 22,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Panel Admin Broadcast & Banner',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimaryOf(ctx),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Kelola pengumuman & foto banner yang tampil real-time di Beranda Web dan Aplikasi Android semua pengguna.',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text(
                    'Tampilkan Broadcast ke Semua Pengguna',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
                  ),
                  value: active,
                  onChanged: (v) => setModalState(() => active = v),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: badgeCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Label Badge',
                          hintText: 'PENGUMUMAN & FITUR BARU',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue:
                            ['info', 'promo', 'maintenance'].contains(type)
                                ? type
                                : 'info',
                        decoration: const InputDecoration(
                          labelText: 'Tipe Tema',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'info',
                            child: Text('Info (Teal/Navy)'),
                          ),
                          DropdownMenuItem(
                            value: 'promo',
                            child: Text('Promo (Hijau)'),
                          ),
                          DropdownMenuItem(
                            value: 'maintenance',
                            child: Text('Penting (Amber)'),
                          ),
                        ],
                        onChanged: (v) =>
                            setModalState(() => type = v ?? 'info'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Judul Pengumuman',
                    hintText: 'Contoh: Rilis SADAR Finance v1.2.2',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: msgCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Isi Pesan Broadcast',
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: bannerCtrl,
                        decoration: const InputDecoration(
                          labelText: 'URL Foto Banner (Opsional)',
                          hintText: 'https://sadar-finance.web.id/...',
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      onPressed: uploading
                          ? null
                          : () async {
                              final picked = await ImagePicker().pickImage(
                                source: ImageSource.gallery,
                                maxWidth: 1400,
                                imageQuality: 85,
                              );
                              if (picked == null) return;
                              setModalState(() => uploading = true);
                              try {
                                final url = await api.uploadBroadcastBanner(
                                  File(picked.path),
                                );
                                setModalState(() => bannerCtrl.text = url);
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      backgroundColor: AppColors.danger,
                                      content: Text('Gagal upload banner: $e'),
                                    ),
                                  );
                                }
                              } finally {
                                setModalState(() => uploading = false);
                              }
                            },
                      icon: uploading
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.upload_rounded, size: 18),
                      label: const Text('Foto'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: actionLabelCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Teks Tombol Aksi',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: actionRouteCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Rute Tujuan',
                          hintText: '/financial-plans',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                ElevatedButton.icon(
                  onPressed: saving
                      ? null
                      : () async {
                          if (titleCtrl.text.trim().isEmpty ||
                              msgCtrl.text.trim().isEmpty) {
                            return;
                          }
                          setModalState(() => saving = true);
                          try {
                            await api.saveAdminBroadcast({
                              'id': idCtrl.text.trim(),
                              'badge': badgeCtrl.text.trim(),
                              'title': titleCtrl.text.trim(),
                              'message': msgCtrl.text.trim(),
                              'type': type,
                              'active': active,
                              'bannerUrl': bannerCtrl.text.trim().isEmpty
                                  ? null
                                  : bannerCtrl.text.trim(),
                              'actionLabel': actionLabelCtrl.text.trim(),
                              'actionRoute': actionRouteCtrl.text.trim(),
                            });
                            await ref.read(financeProvider.notifier).loadAll();
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: AppColors.success,
                                  content: Text(
                                    'Broadcast & Banner berhasil diperbarui secara live!',
                                  ),
                                ),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: AppColors.danger,
                                  content: Text('Gagal menyimpan broadcast: $e'),
                                ),
                              );
                            }
                          } finally {
                            setModalState(() => saving = false);
                          }
                        },
                  icon: const Icon(Icons.publish_rounded, size: 18),
                  label: Text(
                    saving ? 'Menyimpan...' : 'Tayangkan Broadcast Sekarang',
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Keluar dari Akun?'),
        content: const Text(
          'Sesi Anda akan diakhiri di perangkat ini. Anda bisa masuk kembali kapan saja.',
          textAlign: TextAlign.justify,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
    if (ok == true) {
      ref.read(financeProvider.notifier).clear();
      await ref.read(authProvider.notifier).logout();
      if (context.mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final finance = ref.watch(financeProvider);
    final uiPrefs = ref.watch(uiPreferencesProvider);
    final hidden = uiPrefs.hideBalances;
    final user = auth.user;
    final budget = finance.budget;
    final primaryColor = AppColors.primaryOf(context);
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);

    final badges = finance.badges;
    final unlockedCount = badges.where((b) => b.unlocked).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil & Akun'),
        actions: [
          IconButton(
            tooltip: 'Pengaturan Aplikasi',
            onPressed: () => context.push('/settings'),
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(financeProvider.notifier).loadAll(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 1. Executive User Profile Card
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () => context.push('/profile-account/edit'),
                        child: UserAvatar(
                          profilePicture: user?.profilePicture,
                          apiBaseUrl: auth.apiBaseUrl,
                          initials: user?.initials ?? 'S',
                          radius: 32,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    user?.fullName ?? 'Pengguna SADAR',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 16.5,
                                      fontWeight: FontWeight.w800,
                                      color: textPrimary,
                                    ),
                                  ),
                                ),
                                if (user?.emailVerified == true) ...[
                                  const SizedBox(width: 5),
                                  const Icon(
                                    Icons.verified_rounded,
                                    color: AppColors.success,
                                    size: 17,
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '@${user?.effectiveUsername ?? 'pengguna'} - Panggilan: ${user?.displayName ?? '-'}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentOf(context),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user?.email ?? '-',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12.5,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Structured 2x2 Symmetric Identity Metadata Box
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.subtleOf(context),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderOf(context)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _IdentityMetaItem(
                                icon: Icons.work_outline_rounded,
                                label: 'Profesi',
                                value: (user?.occupation ?? '').trim().isNotEmpty
                                    ? user!.occupation!.trim()
                                    : 'Belum diatur',
                              ),
                            ),
                            Container(
                              width: 1,
                              height: 30,
                              margin:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              color: AppColors.borderOf(context),
                            ),
                            Expanded(
                              child: _IdentityMetaItem(
                                icon: Icons.location_on_outlined,
                                label: 'Domisili',
                                value: (user?.locationSummary ?? '').isNotEmpty
                                    ? user!.locationSummary
                                    : ((user?.formattedAddress ?? '').isNotEmpty
                                        ? user!.formattedAddress
                                        : 'Belum diatur'),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        Row(
                          children: [
                            Expanded(
                              child: _IdentityMetaItem(
                                icon: user?.emailVerified == true
                                    ? Icons.verified_user_rounded
                                    : Icons.info_outline_rounded,
                                iconColor: user?.emailVerified == true
                                    ? AppColors.success
                                    : AppColors.warning,
                                label: 'Status Email',
                                value: user?.emailVerified == true
                                    ? 'Email Terverifikasi'
                                    : 'Belum Verifikasi',
                                valueColor: user?.emailVerified == true
                                    ? AppColors.success
                                    : AppColors.warning,
                              ),
                            ),
                            Container(
                              width: 1,
                              height: 30,
                              margin:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              color: AppColors.borderOf(context),
                            ),
                            Expanded(
                              child: InkWell(
                                borderRadius: BorderRadius.circular(8),
                                onTap: user?.isGoogleLinked == true
                                    ? null
                                    : () => context.push('/settings'),
                                child: _IdentityMetaItem(
                                  customLeading: const GoogleLogoIcon(size: 16),
                                  label: 'Akun Google',
                                  value: user?.isGoogleLinked == true
                                      ? 'Google Tertaut'
                                      : 'Tautkan Google',
                                  valueColor: user?.isGoogleLinked == true
                                      ? textPrimary
                                      : primaryColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Clean Twin Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () =>
                              context.push('/profile-account/edit'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            padding: const EdgeInsets.symmetric(vertical: 11),
                          ),
                          icon: const Icon(Icons.edit_outlined, size: 17),
                          label: const Text(
                            'Edit Identitas Profil',
                            style: TextStyle(fontSize: 12.5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => context.push('/settings'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 11),
                          ),
                          icon: const Icon(
                            Icons.shield_outlined,
                            size: 17,
                          ),
                          label: const Text(
                            'Keamanan Akun',
                            style: TextStyle(fontSize: 12.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 2. Gamifikasi: Level, Streak, Symmetric 2-Column Badge Grid & Leaderboard
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 11,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.accent],
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'LV.${finance.financialLevel}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              finance.financialLevelTitle,
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 14.5,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${finance.xpPoints} XP - Buka karakter Avatar 2D tiap naik level',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () => StreakLeaderboardSheet.show(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF97316)
                                .withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFFF97316)
                                  .withValues(alpha: 0.35),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.local_fire_department_rounded,
                                size: 15,
                                color: Color(0xFFF97316),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${finance.streakDays} Hari',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFFF97316),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(99),
                    child: LinearProgressIndicator(
                      value: finance.levelProgressRatio,
                      minHeight: 7,
                      backgroundColor: AppColors.borderOf(context),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.accent,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Lencana Pencapaian ($unlockedCount/${badges.length})',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: textPrimary,
                        ),
                      ),
                      Text(
                        '${((unlockedCount / badges.length) * 100).round()}% Tercapai',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accentOf(context),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Symmetric 2-Column Equal-Width Badge Grid (Zero empty space on right)
                  for (int i = 0; i < badges.length; i += 2) ...[
                    if (i > 0) const SizedBox(height: 8),
                    IntrinsicHeight(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: _AchievementBadgeTile(badge: badges[i]),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: i + 1 < badges.length
                                ? _AchievementBadgeTile(badge: badges[i + 1])
                                : const SizedBox.shrink(),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => StreakLeaderboardSheet.show(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                      icon: const Icon(
                        Icons.emoji_events_outlined,
                        size: 18,
                      ),
                      label: const Text(
                        'Lihat Papan Peringkat (Leaderboard) Streak',
                        style: TextStyle(fontSize: 12.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 3. Fitur Pintar (Piutang/Split Bill & Dana Darurat)
            SadarCard(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
              child: Column(
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.purple.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.groups_rounded,
                        color: AppColors.purple,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      'Catatan Piutang Teman & Split Bill',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13.5,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      '${finance.debts.where((d) => !d.isSettled).length} catatan aktif - Kalkulator patungan & pengingat WA',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push('/debt-split'),
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.health_and_safety_rounded,
                        color: AppColors.success,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      'Kalkulator Dana Darurat & Impian',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13.5,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      'Simulasi 3x-12x pengeluaran bulanan & target tabungan',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push('/financial-plans?tab=2'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 4. Manage Financial Accounts
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionHeader(
                    title: 'Akun Keuangan Saya',
                    subtitle: '${finance.accounts.length} dompet/rekening aktif',
                    trailing: TextButton.icon(
                      onPressed: () => _showAccountFormSheet(context, ref),
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Tambah'),
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (finance.accounts.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text(
                        'Belum ada akun keuangan. Tambahkan rekening bank, e-wallet, atau tunai.',
                        style: TextStyle(
                          fontSize: 13,
                          color: textSecondary,
                        ),
                      ),
                    )
                  else
                    ...finance.accounts.map(
                      (acc) => Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.subtleOf(context),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: AppColors.borderOf(context),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: primaryColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                BankData.iconForAccount(acc.name, acc.type),
                                color: primaryColor,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    acc.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    acc.accountNumber.isNotEmpty
                                        ? '${acc.type} - ${acc.accountNumber}'
                                        : acc.type,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      color: textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              hidden
                                  ? 'Rp •••••••'
                                  : AppFormatters.rupiah(acc.balance),
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 13.5,
                                color: textPrimary,
                              ),
                            ),
                            PopupMenuButton<String>(
                              padding: EdgeInsets.zero,
                              icon: Icon(
                                Icons.more_vert_rounded,
                                size: 20,
                                color: textSecondary,
                              ),
                              onSelected: (val) async {
                                if (val == 'edit') {
                                  _showAccountFormSheet(
                                    context,
                                    ref,
                                    existing: acc,
                                  );
                                } else if (val == 'delete') {
                                  await ref
                                      .read(financeProvider.notifier)
                                      .deleteAccount(acc.id);
                                }
                              },
                              itemBuilder: (_) => const [
                                PopupMenuItem(
                                  value: 'edit',
                                  child: Text('Ubah Akun'),
                                ),
                                PopupMenuItem(
                                  value: 'delete',
                                  child: Text(
                                    'Hapus Akun',
                                    style: TextStyle(color: AppColors.danger),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 5. Monthly Budget 50/30/20
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionHeader(
                    title: 'Target Budget Bulanan',
                    subtitle: 'Alokasi 50/30/20 bulan ini',
                    trailing: TextButton(
                      onPressed: () => _showBudgetFormSheet(context, ref),
                      child: const Text('Atur'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (budget == null)
                    Text(
                      'Belum ada target budget. Ketuk "Atur" untuk menetapkan batas alokasi 50/30/20 bulanan Anda.',
                      style: TextStyle(
                        fontSize: 13,
                        color: textSecondary,
                        height: 1.4,
                      ),
                    )
                  else ...[
                    _BudgetProgressRow(
                      label: 'Kebutuhan',
                      used: budget.needsUsed,
                      limit: budget.needsAmount,
                      color: AppColors.primaryOf(context),
                    ),
                    const SizedBox(height: 10),
                    _BudgetProgressRow(
                      label: 'Keinginan',
                      used: budget.wantsUsed,
                      limit: budget.wantsAmount,
                      color: AppColors.purpleOf(context),
                    ),
                    const SizedBox(height: 10),
                    _BudgetProgressRow(
                      label: 'Tabungan',
                      used: budget.savingsUsed,
                      limit: budget.savingsAmount,
                      color: AppColors.success,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 6. Navigation Menu
            SadarCard(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
              child: Column(
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.history_rounded, color: primaryColor),
                    title: Text(
                      'Riwayat Keuangan Lengkap',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push('/financial-history'),
                  ),
                  if ((user?.email ?? '').toLowerCase() ==
                      'mhmdhabibrafi@gmail.com') ...[
                    const Divider(),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.campaign_rounded,
                        color: AppColors.accent,
                      ),
                      title: Text(
                        'Panel Admin Broadcast & Banner',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        'Tayangkan pengumuman & foto banner ke seluruh pengguna Web & APK',
                        style: TextStyle(fontSize: 12, color: textSecondary),
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded),
                      onTap: () => _showAdminBroadcastSheet(context, ref),
                    ),
                  ],
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(
                      Icons.forward_to_inbox_rounded,
                      color: AppColors.success,
                    ),
                    title: Text(
                      'Kirim e-Statement Bulanan ke Email',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      'Kirim laporan resmi berlogo SADAR Finance ke ${user?.email ?? "email Anda"}',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.send_rounded, size: 18),
                    onTap: () async {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'Sedang menyiapkan & mengirim e-Statement resmi ke email Anda...',
                          ),
                        ),
                      );
                      try {
                        final res = await ref
                            .read(sadarApiServiceProvider)
                            .sendMonthlyStatementEmail();
                        if (!context.mounted) return;
                        final period =
                            (res['periodLabel'] ?? 'Bulan Ini').toString();
                        final email =
                            (res['email'] ?? user?.email ?? '').toString();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.success,
                            content: Text(
                              'e-Statement Resmi ($period) berhasil dikirim ke $email!',
                            ),
                          ),
                        );
                      } catch (e) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.danger,
                            content: Text('Gagal mengirim e-Statement: $e'),
                          ),
                        );
                      }
                    },
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      Icons.picture_as_pdf_rounded,
                      color: AppColors.purpleOf(context),
                    ),
                    title: Text(
                      'Unduh / Bagikan Laporan e-Statement',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      'Simpan dokumen e-Statement resmi untuk dicetak sebagai PDF',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.download_rounded, size: 19),
                    onTap: () async {
                      try {
                        final res = await ref
                            .read(sadarApiServiceProvider)
                            .getMonthlyStatementPreview();
                        final html = (res['html'] ?? '').toString();
                        if (html.isEmpty) {
                          throw Exception('Konten e-Statement kosong.');
                        }
                        final dir = await getTemporaryDirectory();
                        final file = File(
                          '${dir.path}/e-Statement-SADAR-Finance.html',
                        );
                        await file.writeAsString(html);
                        await Share.shareXFiles(
                          [XFile(file.path, mimeType: 'text/html')],
                          subject: 'e-Statement Resmi SADAR Finance',
                        );
                      } catch (e) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.danger,
                            content: Text('Gagal mengunduh e-Statement: $e'),
                          ),
                        );
                      }
                    },
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(
                      Icons.system_update_rounded,
                      color: AppColors.accent,
                    ),
                    title: Text(
                      'Cek Pembaruan Aplikasi (V ${AppConfig.appVersion})',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      'Periksa rilis APK terbaru dari server resmi SADAR Finance',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () async {
                      final result = await ref
                          .read(appUpdateServiceProvider)
                          .checkForUpdates();
                      if (!context.mounted) return;
                      await AppUpdateService.showUpdateDialog(context, result);
                    },
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(
                      Icons.settings_rounded,
                      color: AppColors.accent,
                    ),
                    title: Text(
                      'Pengaturan Aplikasi',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      'Tema gelap/terang, keamanan akun, sinkronisasi & pembaruan',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push('/settings'),
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(
                      Icons.logout_rounded,
                      color: AppColors.danger,
                    ),
                    title: const Text(
                      'Keluar (Logout)',
                      style: TextStyle(
                        color: AppColors.danger,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    onTap: () => _confirmLogout(context, ref),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // Minimal Official Footer: Logo + V 1.2.0
            Center(
              child: Column(
                children: [
                  const SadarLogo(
                    variant: SadarLogoVariant.adaptive,
                    height: 19,
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
                      color: AppColors.textMutedOf(context),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

class _IdentityMetaItem extends StatelessWidget {
  final IconData? icon;
  final Color? iconColor;
  final Widget? customLeading;
  final String label;
  final String value;
  final Color? valueColor;

  const _IdentityMetaItem({
    this.icon,
    this.iconColor,
    this.customLeading,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        customLeading ??
            Icon(
              icon ?? Icons.info_outline_rounded,
              size: 16,
              color: iconColor ?? AppColors.primaryOf(context),
            ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10.5,
                  color: AppColors.textMutedOf(context),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: valueColor ?? AppColors.textPrimaryOf(context),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AchievementBadgeTile extends StatelessWidget {
  final ({String id, String title, String subtitle, bool unlocked}) badge;

  const _AchievementBadgeTile({required this.badge});

  @override
  Widget build(BuildContext context) {
    final unlocked = badge.unlocked;
    final textPrimary = AppColors.textPrimaryOf(context);
    final textMuted = AppColors.textMutedOf(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: unlocked
            ? AppColors.accent.withValues(alpha: 0.11)
            : AppColors.subtleOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: unlocked
              ? AppColors.accent.withValues(alpha: 0.45)
              : AppColors.borderOf(context),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            margin: const EdgeInsets.only(top: 2),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: unlocked
                  ? AppColors.accent.withValues(alpha: 0.18)
                  : AppColors.borderOf(context).withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(
              unlocked
                  ? Icons.workspace_premium_rounded
                  : Icons.lock_outline_rounded,
              size: 16,
              color: unlocked ? AppColors.accent : textMuted,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        badge.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: unlocked ? textPrimary : textMuted,
                        ),
                      ),
                    ),
                    if (unlocked)
                      const Icon(
                        Icons.check_circle_rounded,
                        size: 13,
                        color: AppColors.success,
                      ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  badge.subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 10.5,
                    height: 1.25,
                    color: AppColors.textSecondaryOf(context),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BudgetProgressRow extends StatelessWidget {
  final String label;
  final double used;
  final double limit;
  final Color color;

  const _BudgetProgressRow({
    required this.label,
    required this.used,
    required this.limit,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final pct = limit > 0 ? (used / limit).clamp(0.0, 1.0) : 0.0;
    final over = limit > 0 && used > limit;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimaryOf(context),
              ),
            ),
            Text(
              '${AppFormatters.compactRupiah(used)} / ${AppFormatters.compactRupiah(limit)}',
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: over
                    ? AppColors.danger
                    : AppColors.textSecondaryOf(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            minHeight: 7,
            value: pct,
            backgroundColor: AppColors.borderOf(context),
            valueColor: AlwaysStoppedAnimation<Color>(
              over ? AppColors.danger : color,
            ),
          ),
        ),
      ],
    );
  }
}
