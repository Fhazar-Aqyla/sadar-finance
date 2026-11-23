import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/constants/bank_data.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/account_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/sadar_card.dart';
import '../../widgets/sadar_logo.dart';
import '../../widgets/user_avatar.dart';

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

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Keluar dari Akun?'),
        content: const Text(
          'Sesi Anda akan diakhiri di perangkat ini. Anda bisa masuk kembali kapan saja.',
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
            // User Profile Card
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.push('/profile-account/edit'),
                        child: Stack(
                          children: [
                            UserAvatar(
                              profilePicture: user?.profilePicture,
                              apiBaseUrl: auth.apiBaseUrl,
                              initials: user?.initials ?? 'S',
                              radius: 32,
                            ),
                            Positioned(
                              right: 0,
                              bottom: 0,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: AppColors.accent,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppColors.surfaceOf(context),
                                    width: 1.5,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.face_retouching_natural_rounded,
                                  size: 12,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
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
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: textPrimary,
                                    ),
                                  ),
                                ),
                                if (user?.emailVerified == true) ...[
                                  const SizedBox(width: 5),
                                  const Tooltip(
                                    message: 'Email Terverifikasi',
                                    child: Icon(
                                      Icons.verified_rounded,
                                      color: AppColors.success,
                                      size: 17,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user?.email ?? '-',
                              style: TextStyle(
                                fontSize: 13,
                                color: textSecondary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: (user?.emailVerified == true
                                            ? AppColors.success
                                            : AppColors.warning)
                                        .withValues(alpha: 0.14),
                                    borderRadius: BorderRadius.circular(99),
                                  ),
                                  child: Text(
                                    user?.emailVerified == true
                                        ? 'Email Terverifikasi'
                                        : 'Belum Verifikasi OTP',
                                    style: TextStyle(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w700,
                                      color: user?.emailVerified == true
                                          ? AppColors.success
                                          : AppColors.warning,
                                    ),
                                  ),
                                ),
                                if (user?.isGoogleLinked == true)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 3,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF4285F4)
                                          .withValues(alpha: 0.14),
                                      borderRadius: BorderRadius.circular(99),
                                    ),
                                    child: const Text(
                                      'Google Tertaut',
                                      style: TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF4285F4),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            if (finance.isOffline)
                              const Padding(
                                padding: EdgeInsets.only(top: 4),
                                child: Text(
                                  'Mode Offline · Data Tersimpan Lokal',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.warning,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      IconButton(
                        tooltip: 'Edit Profil & Avatar 2D',
                        onPressed: () => context.push('/profile-account/edit'),
                        icon: Icon(Icons.edit_outlined, color: primaryColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () =>
                              context.push('/profile-account/edit'),
                          icon: const Icon(
                            Icons.face_retouching_natural_rounded,
                            size: 17,
                          ),
                          label: const Text(
                            'Pilih Avatar 2D',
                            style: TextStyle(fontSize: 12.5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => context.push('/settings'),
                          icon: const Icon(
                            Icons.verified_user_outlined,
                            size: 17,
                          ),
                          label: Text(
                            user?.emailVerified == true &&
                                    user?.isGoogleLinked == true
                                ? 'Keamanan Akun'
                                : 'Tautkan Google / OTP',
                            style: const TextStyle(fontSize: 12.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Gamification: Level, Streak & Achievement Badges
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
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
                                fontSize: 15,
                                color: textPrimary,
                              ),
                            ),
                            Text(
                              '${finance.xpPoints} XP · Buka karakter Avatar 2D eksklusif tiap naik level',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF97316).withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(99),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('🔥', style: TextStyle(fontSize: 13)),
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
                  const SizedBox(height: 14),
                  Text(
                    'Lencana Pencapaian (${finance.badges.where((b) => b.unlocked).length}/${finance.badges.length})',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: finance.badges.map((b) {
                      return Tooltip(
                        message: '${b.title}: ${b.subtitle}',
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 7,
                          ),
                          decoration: BoxDecoration(
                            color: b.unlocked
                                ? AppColors.accent.withValues(alpha: 0.13)
                                : AppColors.subtleOf(context),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: b.unlocked
                                  ? AppColors.accent.withValues(alpha: 0.45)
                                  : AppColors.borderOf(context),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                b.unlocked
                                    ? Icons.workspace_premium_rounded
                                    : Icons.lock_outline_rounded,
                                size: 15,
                                color: b.unlocked
                                    ? AppColors.accent
                                    : AppColors.textMutedOf(context),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                b.title,
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: b.unlocked
                                      ? FontWeight.w800
                                      : FontWeight.w500,
                                  color: b.unlocked
                                      ? textPrimary
                                      : AppColors.textMutedOf(context),
                                ),
                              ),
                              if (b.unlocked) ...[
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.check_circle_rounded,
                                  size: 13,
                                  color: AppColors.success,
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Fitur Pintar & Otomatisasi (E-Wallet, Piutang/Split Bill, Dana Darurat)
            SadarCard(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 14),
              child: Column(
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.bolt_rounded,
                        color: AppColors.accent,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      'Koneksi E-Wallet & M-Banking Otomatis',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13.5,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      '${finance.ewalletLinks.where((e) => e.autoRecordEnabled).length} e-wallet aktif (GoPay, DANA, OVO, ShopeePay, Livin, BCA)',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push('/ewallet-connect'),
                  ),
                  const Divider(),
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
                      '${finance.debts.where((d) => !d.isSettled).length} catatan aktif · Kalkulator patungan + pengingat WA',
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

            // Manage Financial Accounts
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
                      (acc) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: primaryColor.withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            BankData.iconForAccount(acc.name, acc.type),
                            color: primaryColor,
                            size: 20,
                          ),
                        ),
                        title: Text(
                          acc.name,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: textPrimary,
                          ),
                        ),
                        subtitle: Text(
                          acc.accountNumber.isNotEmpty
                              ? '${acc.type} · ${acc.accountNumber}'
                              : acc.type,
                          style: TextStyle(fontSize: 12, color: textSecondary),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              hidden
                                  ? 'Rp •••••••'
                                  : AppFormatters.rupiah(acc.balance),
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 13.5,
                                color: textPrimary,
                              ),
                            ),
                            PopupMenuButton<String>(
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
                                PopupMenuItem(value: 'edit', child: Text('Ubah')),
                                PopupMenuItem(
                                  value: 'delete',
                                  child: Text(
                                    'Hapus',
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

            // Monthly Budget 50/30/20
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
                      'Belum ada target budget. Ketuk "Atur" untuk menetapkan batas bulanan.',
                      style: TextStyle(
                        fontSize: 13,
                        color: textSecondary,
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

            // Navigation Menu (Clean: History, App Settings, Logout)
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
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading:
                        const Icon(Icons.settings_rounded, color: AppColors.accent),
                    title: Text(
                      'Pengaturan Aplikasi',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    subtitle: Text(
                      'Tema gelap/terang, ubah kata sandi, sinkronisasi & pembaruan',
                      style: TextStyle(fontSize: 12, color: textSecondary),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push('/settings'),
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading:
                        const Icon(Icons.logout_rounded, color: AppColors.danger),
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
                    'Versi ${AppConfig.appVersion} · Smart Personal Finance',
                    style: TextStyle(
                      fontSize: 11.5,
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
