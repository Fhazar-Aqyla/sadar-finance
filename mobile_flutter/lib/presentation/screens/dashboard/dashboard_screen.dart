import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/bank_data.dart';
import '../../../core/constants/category_helpers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/transaction_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/app_tour_dialog.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/sadar_card.dart';
import '../../widgets/sadar_logo.dart';
import '../profile/app_settings_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  bool _tourChecked = false;
  bool _otaChecked = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      final auth = ref.read(authProvider);
      final finance = ref.read(financeProvider);
      if (finance.accounts.isEmpty && !finance.isLoading) {
        ref.read(financeProvider.notifier).loadAll(userId: auth.user?.id);
      }
      await _maybeShowTourGuide(auth.user?.id);
      await _maybeCheckSilentOta();
    });
  }

  Future<void> _maybeShowTourGuide(String? userId) async {
    if (_tourChecked || userId == null || userId.isEmpty) return;
    _tourChecked = true;
    final uiNotifier = ref.read(uiPreferencesProvider.notifier);
    final seen = await uiNotifier.hasSeenTour(userId);
    if (!seen && mounted) {
      await uiNotifier.markTourSeen(userId);
      if (!mounted) return;
      await AppTourDialog.show(
        context,
        onSetupAccount: () {
          if (mounted && ref.read(financeProvider).accounts.isEmpty) {
            context.go('/profile-account');
          }
        },
      );
    }
  }

  Future<void> _maybeCheckSilentOta() async {
    if (_otaChecked) return;
    _otaChecked = true;
    final ready =
        await ref.read(appUpdateServiceProvider).checkSilentOtaOnLaunch();
    if (ready && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          duration: Duration(seconds: 5),
          content: Text(
            'Pembaruan aplikasi berhasil diunduh otomatis. Buka ulang aplikasi untuk menerapkan.',
          ),
        ),
      );
    }
  }

  void _showNotificationsSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (ctx) => Consumer(
        builder: (ctx, modalRef, _) {
          final finance = modalRef.watch(financeProvider);
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Notifikasi & Peringatan',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimaryOf(ctx),
                        ),
                      ),
                    ),
                    if (finance.alerts.isNotEmpty)
                      TextButton.icon(
                        onPressed: () {
                          modalRef
                              .read(financeProvider.notifier)
                              .clearAlerts();
                        },
                        icon: const Icon(Icons.done_all_rounded, size: 17),
                        label: const Text('Bersihkan'),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (finance.alerts.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text(
                        'Belum ada peringatan keuangan. Kondisi terkendali!',
                        style: TextStyle(color: AppColors.textSecondaryOf(ctx)),
                      ),
                    ),
                  )
                else
                  ...finance.alerts.take(5).map(
                        (a) => Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.warning.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: AppColors.warning.withValues(alpha: 0.35),
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.warning_amber_rounded,
                                color: AppColors.warning,
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  a.message,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textPrimaryOf(ctx),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final finance = ref.watch(financeProvider);
    final uiPrefs = ref.watch(uiPreferencesProvider);
    final userName = auth.user?.displayName ?? 'Pengguna';

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => ref.read(financeProvider.notifier).loadAll(),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: _buildHeader(userName, finance, uiPrefs),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  if (finance.isOffline || finance.pendingSyncCount > 0) ...[
                    _buildSyncStatusBanner(finance),
                    const SizedBox(height: 14),
                  ],
                  _buildQuickActions(),
                  const SizedBox(height: 16),
                  if (finance.accounts.isNotEmpty) ...[
                    _buildAccountsCarousel(finance, uiPrefs.hideBalances),
                    const SizedBox(height: 16),
                  ] else if (!finance.isLoading) ...[
                    _buildNewUserSetupBanner(),
                    const SizedBox(height: 16),
                  ],
                  _buildSummaryGrid(finance, uiPrefs.hideBalances),
                  const SizedBox(height: 16),
                  _buildFinancialPlansCard(finance, uiPrefs.hideBalances),
                  const SizedBox(height: 16),
                  if (finance.alerts.isNotEmpty) ...[
                    _buildAlertBanner(finance),
                    const SizedBox(height: 16),
                  ],
                  _buildSmartInsightCard(finance),
                  const SizedBox(height: 16),
                  _buildCashflowChartCard(finance),
                  const SizedBox(height: 16),
                  _buildExpenseTrendCard(finance),
                  const SizedBox(height: 16),
                  _buildCategoryDonutCard(finance),
                  const SizedBox(height: 16),
                  _buildRecentTransactionsCard(finance, uiPrefs.hideBalances),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
    String userName,
    FinanceState finance,
    UiPreferencesState uiPrefs,
  ) {
    final hidden = uiPrefs.hideBalances;
    final budget = finance.budget;
    final budgetLimit = budget?.totalLimit ?? 0;
    final budgetRatio = budgetLimit > 0
        ? (finance.currentMonthTotalOutflow / budgetLimit).clamp(0.0, 1.0)
        : 0.0;
    final budgetPct = budgetLimit > 0
        ? ((finance.currentMonthTotalOutflow / budgetLimit) * 100)
            .clamp(0, 999)
            .round()
        : 0;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0A1E36), AppColors.brandNavy, AppColors.primary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -50,
            right: -35,
            child: Container(
              width: 170,
              height: 170,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accent.withValues(alpha: 0.14),
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Brand Row with Unified SADAR Finance Logo + Quick Controls
                  Row(
                    children: [
                      const SadarLogo(
                        variant: SadarLogoVariant.light,
                        height: 21,
                        showFinanceSubtitle: true,
                        alignment: CrossAxisAlignment.center,
                      ),
                      const Spacer(),
                      IconButton(
                        tooltip: hidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo',
                        onPressed: () => ref
                            .read(uiPreferencesProvider.notifier)
                            .toggleHideBalances(),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.12),
                          minimumSize: const Size(38, 38),
                        ),
                        icon: Icon(
                          hidden
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: Colors.white,
                          size: 19,
                        ),
                      ),
                      const SizedBox(width: 6),
                      IconButton(
                        tooltip:
                            uiPrefs.isDarkMode ? 'Mode Terang' : 'Mode Gelap',
                        onPressed: () => ref
                            .read(uiPreferencesProvider.notifier)
                            .toggleTheme(),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.12),
                          minimumSize: const Size(38, 38),
                        ),
                        icon: Icon(
                          uiPrefs.isDarkMode
                              ? Icons.light_mode_outlined
                              : Icons.dark_mode_outlined,
                          color: Colors.white,
                          size: 19,
                        ),
                      ),
                      const SizedBox(width: 6),
                      IconButton(
                        tooltip: 'Notifikasi',
                        onPressed: _showNotificationsSheet,
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white.withValues(alpha: 0.12),
                          minimumSize: const Size(38, 38),
                        ),
                        icon: Badge(
                          isLabelVisible: finance.alerts.isNotEmpty,
                          label: Text('${finance.alerts.length}'),
                          child: const Icon(
                            Icons.notifications_outlined,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Halo, $userName 👋',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Yuk lihat kondisi keuanganmu hari ini.',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.78),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.11),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.18),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Total Saldo Gabungan (${finance.accounts.length} akun)',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.8),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            if (budgetLimit > 0)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: (budgetPct >= 90
                                          ? AppColors.danger
                                          : AppColors.accent)
                                      .withValues(alpha: 0.28),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  'Budget $budgetPct%',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          hidden
                              ? 'Rp ••••••••'
                              : AppFormatters.rupiah(finance.totalBalance),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.6,
                          ),
                        ),
                        if (budgetLimit > 0) ...[
                          const SizedBox(height: 10),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(99),
                            child: LinearProgressIndicator(
                              value: budgetRatio,
                              minHeight: 6,
                              backgroundColor:
                                  Colors.white.withValues(alpha: 0.18),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                budgetPct >= 90
                                    ? const Color(0xFFFCA5A5)
                                    : const Color(0xFF5EEAD4),
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: _HeaderFlowPill(
                                icon: Icons.arrow_downward_rounded,
                                color: AppColors.success,
                                label: 'Pemasukan Bulan Ini',
                                value: hidden
                                    ? 'Rp •••••'
                                    : AppFormatters.compactRupiah(
                                        finance.currentMonthIncome,
                                      ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _HeaderFlowPill(
                                icon: Icons.arrow_upward_rounded,
                                color: const Color(0xFFFCA5A5),
                                label: 'Pengeluaran Bulan Ini',
                                value: hidden
                                    ? 'Rp •••••'
                                    : AppFormatters.compactRupiah(
                                        finance.currentMonthExpense,
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountsCarousel(FinanceState finance, bool hidden) {
    final palettes = [
      [const Color(0xFF1E3A8A), const Color(0xFF2563EB)],
      [const Color(0xFF0F766E), const Color(0xFF14B8A6)],
      [const Color(0xFF4C1D95), const Color(0xFF7C3AED)],
      [const Color(0xFF10344B), const Color(0xFF1D4ED8)],
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Dompet & Rekening',
          subtitle: 'Geser untuk lihat semua akun aktif',
          trailing: TextButton(
            onPressed: () => context.go('/profile-account'),
            child: const Text('Kelola'),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 112,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: finance.accounts.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (_, idx) {
              final acc = finance.accounts[idx];
              final colors = palettes[idx % palettes.length];
              return GestureDetector(
                onTap: () => context.go('/profile-account'),
                child: Container(
                  width: 196,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: colors,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: colors.first.withValues(alpha: 0.25),
                        blurRadius: 12,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(9),
                            ),
                            child: Icon(
                              BankData.iconForAccount(acc.name, acc.type),
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              acc.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            acc.accountNumber.isNotEmpty
                                ? acc.accountNumber
                                : acc.type,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.72),
                              fontSize: 10.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            hidden
                                ? 'Rp •••••••'
                                : AppFormatters.rupiah(acc.balance),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNewUserSetupBanner() {
    return SadarCard(
      color: AppColors.accent.withValues(alpha: 0.08),
      borderColor: AppColors.accent.withValues(alpha: 0.35),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.rocket_launch_rounded,
              color: AppColors.accentOf(context),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Mulai Atur Keuanganmu',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                    color: AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Tambahkan rekening/dompet pertama & target budget 50/30/20.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondaryOf(context),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () => context.go('/profile-account'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            child: const Text('Atur'),
          ),
        ],
      ),
    );
  }

  Widget _buildSyncStatusBanner(FinanceState finance) {
    final offline = finance.isOffline;
    final tone = offline ? AppColors.warning : AppColors.accent;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: AppColors.isDark(context) ? 0.16 : 0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: tone.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(
            offline ? Icons.cloud_off_rounded : Icons.cloud_sync_rounded,
            color: tone,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  offline
                      ? 'Mode Offline — Fitur AI & OCR Dinonaktifkan'
                      : 'Menyinkronkan Perubahan Lokal',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 12.5,
                    color: AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  finance.pendingSyncCount > 0
                      ? '${finance.pendingSyncCount} catatan lokal siap dikirim otomatis saat online.'
                      : 'Catat manual tetap bisa digunakan & tersimpan lokal.',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textSecondaryOf(context),
                  ),
                ),
              ],
            ),
          ),
          if (finance.isSyncing)
            const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else
            TextButton(
              onPressed: () =>
                  ref.read(financeProvider.notifier).syncPendingAndRefresh(),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                minimumSize: const Size(0, 32),
              ),
              child: const Text('Sinkron'),
            ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _QuickActionTile(
          icon: Icons.receipt_long_rounded,
          label: 'Catat\nBelanja',
          color: AppColors.primaryLight,
          onTap: () => context.go('/catat-keuangan'),
        ),
        const SizedBox(width: 10),
        _QuickActionTile(
          icon: Icons.document_scanner_rounded,
          label: 'Scan\nStruk AI',
          color: AppColors.accent,
          onTap: () => context.go('/catat-keuangan?scan=1'),
        ),
        const SizedBox(width: 10),
        _QuickActionTile(
          icon: Icons.insights_rounded,
          label: 'Insight\nPerilaku',
          color: AppColors.purple,
          onTap: () => context.go('/behavior-insight'),
        ),
        const SizedBox(width: 10),
        _QuickActionTile(
          icon: Icons.history_rounded,
          label: 'Riwayat\nLengkap',
          color: AppColors.success,
          onTap: () => context.push('/financial-history'),
        ),
      ],
    );
  }

  Widget _buildSummaryGrid(FinanceState finance, bool hidden) {
    final score = finance.healthScore?.overallScore;
    final remBudget = finance.remainingBudget;
    final hasBudgetOrIncome = finance.hasBudgetOrIncome;
    return Row(
      children: [
        Expanded(
          child: SadarCard(
            padding: const EdgeInsets.all(14),
            onTap: () => context.go('/profile-account'),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.pie_chart_outline_rounded,
                      size: 16,
                      color: remBudget < 0 ? AppColors.danger : AppColors.accent,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        hasBudgetOrIncome ? 'Sisa Budget' : 'Dana Tersedia',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondaryOf(context),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  hidden ? 'Rp •••••••' : AppFormatters.rupiah(remBudget),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: remBudget < 0
                        ? AppColors.danger
                        : AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  hasBudgetOrIncome
                      ? '${finance.totalRecordsCount} total catatan'
                      : 'Ketuk untuk atur budget',
                  style: TextStyle(
                    fontSize: 11,
                    color: hasBudgetOrIncome
                        ? AppColors.textMutedOf(context)
                        : AppColors.accentOf(context),
                    fontWeight:
                        hasBudgetOrIncome ? FontWeight.w500 : FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: SadarCard(
            padding: const EdgeInsets.all(14),
            onTap: () => context.go('/financial-score'),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.speed_rounded,
                      size: 16,
                      color: AppColors.primaryLight,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Skor Finansial',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondaryOf(context),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      score != null ? '$score' : '-',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: _scoreColor(score ?? 70),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 3, left: 3),
                      child: Text(
                        '/ 100',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textMutedOf(context),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  finance.healthScore?.status ?? 'Ketuk untuk detail',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondaryOf(context),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFinancialPlansCard(FinanceState finance, bool hidden) {
    final goals = finance.savingsGoals;
    final recurring = finance.recurringItems;
    final now = DateTime.now();
    final unpaidRecurring =
        recurring.where((r) => !r.isPaidFor(now)).toList();

    return SadarCard(
      onTap: () => context.push('/financial-plans'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primaryOf(context).withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.flag_rounded,
                  color: AppColors.primaryOf(context),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Target Tabungan & Tagihan Rutin',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                        color: AppColors.textPrimaryOf(context),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      goals.isEmpty && recurring.isEmpty
                          ? 'Atur target dana darurat, impian, & jadwal tagihan bulanan'
                          : '${goals.length} target tabungan · ${unpaidRecurring.length} jadwal rutin menunggu bulan ini',
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
          if (goals.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.subtleOf(context),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderOf(context)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          goals.first.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimaryOf(context),
                          ),
                        ),
                      ),
                      Text(
                        '${goals.first.progressPercent}%',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(99),
                    child: LinearProgressIndicator(
                      value: goals.first.progressRatio,
                      minHeight: 6,
                      backgroundColor: AppColors.borderOf(context),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.success,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    hidden
                        ? 'Rp ••••• dari Rp •••••'
                        : '${AppFormatters.compactRupiah(goals.first.currentAmount)} dari ${AppFormatters.compactRupiah(goals.first.targetAmount)}',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAlertBanner(FinanceState finance) {
    final alert = finance.alerts.first;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.42)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.warning_amber_rounded,
            color: AppColors.warning,
            size: 22,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Peringatan Prediktif',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  alert.message,
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(context),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSmartInsightCard(FinanceState finance) {
    final rec = finance.behaviorPrediction?.recommendation ??
        (finance.insights.isNotEmpty
            ? finance.insights.first.description
            : 'Catat transaksi harianmu secara rutin agar analisis AI dapat mendeteksi pola belanja lebih akurat.');
    return SadarCard(
      onTap: () => context.go('/behavior-insight'),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.lightbulb_outline_rounded,
              color: AppColors.accentOf(context),
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Smart Insight',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  rec,
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(context),
                    height: 1.4,
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
    );
  }

  Widget _buildCashflowChartCard(FinanceState finance) {
    final now = DateTime.now();
    final months = List.generate(
      6,
      (i) => DateTime(now.year, now.month - (5 - i), 1),
    );

    final incomeSeries = months.map((m) {
      return finance.incomes
          .where((e) => e.incomeDate.year == m.year && e.incomeDate.month == m.month)
          .fold<double>(0, (s, e) => s + e.amount);
    }).toList();

    final expenseSeries = months.map((m) {
      return finance.transactions
          .where((e) =>
              e.transactionDate.year == m.year &&
              e.transactionDate.month == m.month)
          .fold<double>(0, (s, e) => s + e.amount);
    }).toList();

    final maxVal = [
      ...incomeSeries,
      ...expenseSeries,
      100000.0,
    ].reduce((a, b) => a > b ? a : b);

    final expenseBarColor = AppColors.primaryOf(context);
    final gridColor = AppColors.borderOf(context);
    final mutedColor = AppColors.textMutedOf(context);
    final secondaryColor = AppColors.textSecondaryOf(context);

    return SadarCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'Arus Kas 6 Bulan Terakhir',
            subtitle: 'Perbandingan pemasukan vs pengeluaran',
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const _LegendDot(color: AppColors.success, label: 'Pemasukan'),
              const SizedBox(width: 14),
              _LegendDot(color: expenseBarColor, label: 'Pengeluaran'),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            height: 180,
            child: BarChart(
              BarChartData(
                maxY: maxVal * 1.2,
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) =>
                      FlLine(color: gridColor, strokeWidth: 1),
                ),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 48,
                      getTitlesWidget: (value, meta) => Text(
                        AppFormatters.compactRupiah(value).replaceAll('Rp ', ''),
                        style: TextStyle(
                          fontSize: 10,
                          color: mutedColor,
                        ),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final idx = value.toInt();
                        if (idx < 0 || idx >= months.length) {
                          return const SizedBox.shrink();
                        }
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            AppFormatters.monthShort(months[idx].month),
                            style: TextStyle(
                              fontSize: 11,
                              color: secondaryColor,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                barGroups: List.generate(months.length, (i) {
                  return BarChartGroupData(
                    x: i,
                    barsSpace: 4,
                    barRods: [
                      BarChartRodData(
                        toY: incomeSeries[i],
                        color: AppColors.success,
                        width: 10,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      BarChartRodData(
                        toY: expenseSeries[i],
                        color: expenseBarColor,
                        width: 10,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ],
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpenseTrendCard(FinanceState finance) {
    final now = DateTime.now();
    final days = List.generate(
      7,
      (i) => DateTime(now.year, now.month, now.day).subtract(Duration(days: 6 - i)),
    );
    final spots = <FlSpot>[];
    double maxY = 50000;
    for (int i = 0; i < days.length; i++) {
      final d = days[i];
      final sum = finance.transactions
          .where((t) =>
              t.transactionDate.year == d.year &&
              t.transactionDate.month == d.month &&
              t.transactionDate.day == d.day)
          .fold<double>(0, (s, t) => s + t.amount);
      if (sum > maxY) maxY = sum;
      spots.add(FlSpot(i.toDouble(), sum));
    }

    final gridColor = AppColors.borderOf(context);
    final mutedColor = AppColors.textMutedOf(context);
    final secondaryColor = AppColors.textSecondaryOf(context);

    return SadarCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'Tren Pengeluaran 7 Hari',
            subtitle: 'Pantau laju belanja harianmu',
          ),
          const SizedBox(height: 18),
          SizedBox(
            height: 160,
            child: LineChart(
              LineChartData(
                minY: 0,
                maxY: maxY * 1.25,
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) =>
                      FlLine(color: gridColor, strokeWidth: 1),
                ),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 48,
                      getTitlesWidget: (v, _) => Text(
                        AppFormatters.compactRupiah(v).replaceAll('Rp ', ''),
                        style: TextStyle(
                          fontSize: 10,
                          color: mutedColor,
                        ),
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      interval: 1,
                      getTitlesWidget: (v, _) {
                        final idx = v.toInt();
                        if (idx < 0 || idx >= days.length) {
                          return const SizedBox.shrink();
                        }
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            '${days[idx].day}/${days[idx].month}',
                            style: TextStyle(
                              fontSize: 10,
                              color: secondaryColor,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    color: AppColors.accent,
                    barWidth: 3,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: AppColors.accent.withValues(alpha: 0.16),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryDonutCard(FinanceState finance) {
    final totals = finance.categoryTotalsCurrentMonth;
    final sum = totals.values.fold<double>(0, (s, v) => s + v);

    return SadarCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'Distribusi Kategori Bulan Ini',
            subtitle: 'Porsi Kebutuhan, Keinginan, dan Tabungan',
          ),
          const SizedBox(height: 16),
          if (sum <= 0)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 18),
              child: Center(
                child: Text(
                  'Belum ada pengeluaran tercatat bulan ini.',
                  style: TextStyle(
                    color: AppColors.textSecondaryOf(context),
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else
            Row(
              children: [
                SizedBox(
                  width: 130,
                  height: 130,
                  child: PieChart(
                    PieChartData(
                      centerSpaceRadius: 36,
                      sectionsSpace: 3,
                      sections: totals.entries
                          .where((e) => e.value > 0)
                          .map((e) {
                        final pct = (e.value / sum * 100);
                        return PieChartSectionData(
                          value: e.value,
                          color: CategoryHelpers.colorForGroup(e.key),
                          radius: 26,
                          title: '${pct.toStringAsFixed(0)}%',
                          titleStyle: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(width: 18),
                Expanded(
                  child: Column(
                    children: totals.entries.map((e) {
                      final pct = sum > 0 ? (e.value / sum * 100) : 0;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: CategoryHelpers.colorForGroup(e.key),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                CategoryHelpers.labelForGroup(e.key),
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimaryOf(context),
                                ),
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  AppFormatters.compactRupiah(e.value),
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimaryOf(context),
                                  ),
                                ),
                                Text(
                                  '${pct.toStringAsFixed(0)}%',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textMutedOf(context),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildRecentTransactionsCard(FinanceState finance, bool hidden) {
    final recent = finance.transactions.take(6).toList();
    return SadarCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Transaksi Terbaru',
            trailing: TextButton(
              onPressed: () => context.push('/financial-history'),
              child: const Text('Lihat Semua'),
            ),
          ),
          const SizedBox(height: 8),
          if (recent.isEmpty)
            EmptyStateWidget(
              icon: Icons.receipt_long_rounded,
              title: 'Belum Ada Transaksi',
              message: 'Mulai catat pengeluaran atau scan struk belanja pertamamu.',
              actionLabel: 'Catat Sekarang',
              onAction: () => context.go('/catat-keuangan'),
            )
          else
            ...recent.map((t) => _TransactionRow(
                  transaction: t,
                  accountName: t.accountName ??
                      finance.accountNameById(t.accountId),
                  hidden: hidden,
                )),
        ],
      ),
    );
  }

  Color _scoreColor(int score) {
    if (score <= 40) return AppColors.danger;
    if (score <= 70) return AppColors.warning;
    return AppColors.success;
  }
}

class _HeaderFlowPill extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String value;

  const _HeaderFlowPill({
    required this.icon,
    required this.color,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
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
                    color: Colors.white.withValues(alpha: 0.75),
                    fontSize: 10,
                  ),
                ),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
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

class _QuickActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
          decoration: BoxDecoration(
            color: AppColors.surfaceOf(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderOf(context)),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimaryOf(context),
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondaryOf(context),
          ),
        ),
      ],
    );
  }
}

class _TransactionRow extends StatelessWidget {
  final TransactionModel transaction;
  final String accountName;
  final bool hidden;

  const _TransactionRow({
    required this.transaction,
    required this.accountName,
    this.hidden = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = CategoryHelpers.colorForGroup(transaction.categoryGroup);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              CategoryHelpers.iconForGroup(transaction.categoryGroup),
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  transaction.displayTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${transaction.categoryLabel} · $accountName · ${AppFormatters.shortDate(transaction.transactionDate)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textSecondaryOf(context),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            hidden ? 'Rp •••••' : '-${AppFormatters.rupiah(transaction.amount)}',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13.5,
              color: AppColors.danger,
            ),
          ),
        ],
      ),
    );
  }
}
