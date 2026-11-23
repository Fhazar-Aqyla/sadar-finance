import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/category_helpers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/account_model.dart';
import '../../../data/models/financial_plan_models.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/sadar_card.dart';

class FinancialPlansScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const FinancialPlansScreen({super.key, this.initialTab = 0});

  @override
  ConsumerState<FinancialPlansScreen> createState() =>
      _FinancialPlansScreenState();
}

class _FinancialPlansScreenState extends ConsumerState<FinancialPlansScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const _goalCategories = [
    'Dana Darurat',
    'Tabungan & Investasi',
    'Gadget & Barang',
    'Liburan',
    'Pendidikan',
    'Lainnya',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, 2),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showAddGoalSheet() {
    final titleCtrl = TextEditingController();
    final targetCtrl = TextEditingController();
    final initialCtrl = TextEditingController();
    String category = _goalCategories.first;

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
                Text(
                  'Tambah Target Tabungan',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama Target Impian',
                    hintText: 'Contoh: Dana Darurat, Laptop Kerja, Umroh',
                    prefixIcon: Icon(Icons.flag_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _goalCategories.map((c) {
                    return ChoiceChip(
                      label: Text(c),
                      selected: category == c,
                      onSelected: (_) => setModalState(() => category = c),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: targetCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: const [CurrencyInputFormatter()],
                  decoration: const InputDecoration(
                    labelText: 'Target Nominal',
                    prefixText: 'Rp ',
                    hintText: '10.000.000',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: initialCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: const [CurrencyInputFormatter()],
                  decoration: const InputDecoration(
                    labelText: 'Saldo Awal Terkumpul (Opsional)',
                    prefixText: 'Rp ',
                    hintText: '0',
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () async {
                      final title = titleCtrl.text.trim();
                      final target = AppFormatters.parseAmount(targetCtrl.text);
                      final initAmt =
                          AppFormatters.parseAmount(initialCtrl.text);
                      if (title.isEmpty || target <= 0) return;
                      await ref.read(financeProvider.notifier).addSavingsGoal(
                            title: title,
                            targetAmount: target,
                            initialAmount: initAmt,
                            category: category,
                          );
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Simpan Target Tabungan'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showContributeSheet(
    SavingsGoalModel goal,
    List<AccountModel> accounts,
  ) {
    final amountCtrl = TextEditingController();
    String? selectedAccountId = accounts.isNotEmpty ? accounts.first.id : null;
    bool deductFromAccount = accounts.isNotEmpty;

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
                Text(
                  'Tambah Tabungan: ${goal.title}',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Kekurangan target: ${AppFormatters.rupiah(goal.remainingAmount)}',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: const [CurrencyInputFormatter()],
                  decoration: const InputDecoration(
                    labelText: 'Nominal Setoran Tabungan',
                    prefixText: 'Rp ',
                    hintText: '250.000',
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [50000, 100000, 250000, 500000, 1000000].map((v) {
                    return ActionChip(
                      label: Text(AppFormatters.compactRupiah(v.toDouble())),
                      onPressed: () => setModalState(
                        () => amountCtrl.text = AppFormatters.number(v),
                      ),
                    );
                  }).toList(),
                ),
                if (accounts.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'Potong dari Saldo Rekening & Catat ke Alokasi Tabungan (20%)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    value: deductFromAccount,
                    onChanged: (v) =>
                        setModalState(() => deductFromAccount = v),
                  ),
                  if (deductFromAccount)
                    DropdownButtonFormField<String>(
                      initialValue: selectedAccountId,
                      decoration: const InputDecoration(
                        labelText: 'Pilih Rekening Sumber',
                        prefixIcon:
                            Icon(Icons.account_balance_wallet_outlined),
                      ),
                      items: accounts
                          .map(
                            (a) => DropdownMenuItem<String>(
                              value: a.id,
                              child: Text(
                                '${a.name} (${AppFormatters.compactRupiah(a.balance)})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (v) =>
                          setModalState(() => selectedAccountId = v),
                    ),
                ],
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                    ),
                    onPressed: () async {
                      final amt = AppFormatters.parseAmount(amountCtrl.text);
                      if (amt <= 0) return;
                      try {
                        await ref
                            .read(financeProvider.notifier)
                            .contributeToSavingsGoal(
                              goalId: goal.id,
                              amount: amt,
                              sourceAccountId:
                                  deductFromAccount ? selectedAccountId : null,
                            );
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: AppColors.success,
                              content: Text(
                                'Setoran tabungan berhasil ditambahkan!',
                              ),
                            ),
                          );
                        }
                      } catch (e) {
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
                    child: const Text('Simpan Setoran Tabungan'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAddRecurringSheet(List<AccountModel> accounts) {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final dayCtrl = TextEditingController(text: '1');
    bool isIncome = false;
    String categoryGroup = 'Needs';
    String? accountId = accounts.isNotEmpty ? accounts.first.id : null;

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
                Text(
                  'Tambah Tagihan / Pemasukan Rutin',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('Tagihan / Pengeluaran'),
                        selected: !isIncome,
                        onSelected: (_) => setModalState(() => isIncome = false),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('Gaji / Pemasukan'),
                        selected: isIncome,
                        onSelected: (_) => setModalState(() => isIncome = true),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    labelText:
                        isIncome ? 'Nama Pemasukan Rutin' : 'Nama Tagihan Rutin',
                    hintText: isIncome
                        ? 'Contoh: Gaji Bulanan, Uang Saku'
                        : 'Contoh: Listrik PLN, WiFi, Kos, Netflix',
                    prefixIcon: const Icon(Icons.event_repeat_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: amountCtrl,
                        keyboardType: TextInputType.number,
                        inputFormatters: const [CurrencyInputFormatter()],
                        decoration: const InputDecoration(
                          labelText: 'Nominal Rutin',
                          prefixText: 'Rp ',
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: dayCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Tgl Jatuh Tempo',
                          hintText: '1 - 31',
                        ),
                      ),
                    ),
                  ],
                ),
                if (!isIncome) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: CategoryHelpers.groups.map((g) {
                      return ChoiceChip(
                        label: Text(CategoryHelpers.labelForGroup(g)),
                        selected: categoryGroup == g,
                        onSelected: (_) =>
                            setModalState(() => categoryGroup = g),
                      );
                    }).toList(),
                  ),
                ],
                if (accounts.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: accountId,
                    decoration: const InputDecoration(
                      labelText: 'Akun Default',
                      prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                    ),
                    items: accounts
                        .map(
                          (a) => DropdownMenuItem<String>(
                            value: a.id,
                            child: Text(a.name, overflow: TextOverflow.ellipsis),
                          ),
                        )
                        .toList(),
                    onChanged: (v) => setModalState(() => accountId = v),
                  ),
                ],
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () async {
                      final title = titleCtrl.text.trim();
                      final amt = AppFormatters.parseAmount(amountCtrl.text);
                      final day =
                          (int.tryParse(dayCtrl.text.trim()) ?? 1).clamp(1, 31);
                      if (title.isEmpty || amt <= 0) return;
                      await ref.read(financeProvider.notifier).addRecurringItem(
                            title: title,
                            amount: amt,
                            isIncome: isIncome,
                            categoryGroup: categoryGroup,
                            accountId: accountId,
                            dayOfMonth: day,
                          );
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Simpan Jadwal Rutin'),
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
    final finance = ref.watch(financeProvider);
    final hidden = ref.watch(uiPreferencesProvider).hideBalances;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Target & Tagihan Rutin'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryOf(context),
          unselectedLabelColor: AppColors.textSecondaryOf(context),
          indicatorColor: AppColors.primaryOf(context),
          tabs: [
            Tab(
              icon: const Icon(Icons.savings_outlined),
              text: 'Target (${finance.savingsGoals.length})',
            ),
            Tab(
              icon: const Icon(Icons.event_repeat_rounded),
              text: 'Rutin (${finance.recurringItems.length})',
            ),
            const Tab(
              icon: Icon(Icons.calculate_outlined),
              text: 'Dana Darurat',
            ),
          ],
        ),
      ),
      floatingActionButton: _tabController.index < 2
          ? FloatingActionButton.extended(
              onPressed: () {
                if (_tabController.index == 0) {
                  _showAddGoalSheet();
                } else {
                  _showAddRecurringSheet(finance.accounts);
                }
              },
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Tambah'),
            )
          : null,
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildGoalsTab(finance, hidden),
          _buildRecurringTab(finance, hidden),
          _EmergencyFundCalculatorTab(
            finance: finance,
            onCreatedGoal: () => _tabController.animateTo(0),
          ),
        ],
      ),
    );
  }

  Widget _buildGoalsTab(FinanceState finance, bool hidden) {
    if (finance.savingsGoals.isEmpty) {
      return ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const EmptyStateWidget(
            icon: Icons.flag_circle_outlined,
            title: 'Belum Ada Target Tabungan',
            message:
                'Buat target impian seperti Dana Darurat, Laptop Baru, atau Liburan untuk memantau progres tabungan 20% Anda.',
          ),
          const SizedBox(height: 12),
          Center(
            child: ElevatedButton.icon(
              onPressed: _showAddGoalSheet,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Buat Target Tabungan Pertama'),
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      itemCount: finance.savingsGoals.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) {
        final g = finance.savingsGoals[i];
        return SadarCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      g.isCompleted
                          ? Icons.verified_rounded
                          : Icons.savings_rounded,
                      color: AppColors.success,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          g.title,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimaryOf(context),
                          ),
                        ),
                        Text(
                          g.category,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondaryOf(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      '${g.progressPercent}%',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.delete_outline_rounded,
                      size: 19,
                      color: AppColors.textMutedOf(context),
                    ),
                    onPressed: () => ref
                        .read(financeProvider.notifier)
                        .deleteSavingsGoal(g.id),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  value: g.progressRatio,
                  minHeight: 8,
                  backgroundColor: AppColors.borderOf(context),
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppColors.success),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    hidden
                        ? 'Terkumpul: Rp •••••'
                        : 'Terkumpul: ${AppFormatters.rupiah(g.currentAmount)}',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  Text(
                    hidden
                        ? 'Target: Rp •••••'
                        : 'Target: ${AppFormatters.rupiah(g.targetAmount)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                ],
              ),
              if (!g.isCompleted) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _showContributeSheet(g, finance.accounts),
                    icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                    label: const Text('Tambah Setoran Tabungan'),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildRecurringTab(FinanceState finance, bool hidden) {
    if (finance.recurringItems.isEmpty) {
      return ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const EmptyStateWidget(
            icon: Icons.event_repeat_rounded,
            title: 'Belum Ada Jadwal Rutin',
            message:
                'Tambahkan tagihan bulanan (Listrik, WiFi, Kos, Cicilan) atau Gaji tetap agar bisa dicatat 1-klik setiap bulan.',
          ),
          const SizedBox(height: 12),
          Center(
            child: ElevatedButton.icon(
              onPressed: () => _showAddRecurringSheet(finance.accounts),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Tambah Jadwal Rutin Pertama'),
            ),
          ),
        ],
      );
    }

    final now = DateTime.now();
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      itemCount: finance.recurringItems.length,
      separatorBuilder: (_, _) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) {
        final item = finance.recurringItems[i];
        final isPaid = item.isPaidFor(now);
        final accName = finance.accountNameById(item.accountId);
        final color = item.isIncome ? AppColors.success : AppColors.primary;

        return SadarCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      item.isIncome
                          ? Icons.payments_outlined
                          : Icons.receipt_long_rounded,
                      color: color,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimaryOf(context),
                          ),
                        ),
                        Text(
                          'Setiap Tgl ${item.dayOfMonth} - ${accName != '-' ? accName : 'Akun Default'}',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondaryOf(context),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    hidden ? 'Rp •••••' : AppFormatters.rupiah(item.amount),
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      color: item.isIncome
                          ? AppColors.success
                          : AppColors.textPrimaryOf(context),
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.delete_outline_rounded,
                      size: 19,
                      color: AppColors.textMutedOf(context),
                    ),
                    onPressed: () => ref
                        .read(financeProvider.notifier)
                        .deleteRecurringItem(item.id),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: (isPaid ? AppColors.success : AppColors.warning)
                          .withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      isPaid
                          ? 'Sudah Dicatat Bulan Ini'
                          : 'Belum Dicatat Bulan Ini',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: isPaid ? AppColors.success : AppColors.warning,
                      ),
                    ),
                  ),
                  if (!isPaid)
                    ElevatedButton.icon(
                      onPressed: () async {
                        try {
                          await ref
                              .read(financeProvider.notifier)
                              .executeRecurringItem(item.id);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: AppColors.success,
                                content: Text(
                                  '"${item.title}" berhasil dicatat untuk bulan ini!',
                                ),
                              ),
                            );
                          }
                        } catch (e) {
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
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      icon: const Icon(Icons.check_rounded, size: 16),
                      label: Text(item.isIncome ? 'Terima Gaji' : 'Catat Lunas'),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _EmergencyFundCalculatorTab extends ConsumerStatefulWidget {
  final FinanceState finance;
  final VoidCallback onCreatedGoal;

  const _EmergencyFundCalculatorTab({
    required this.finance,
    required this.onCreatedGoal,
  });

  @override
  ConsumerState<_EmergencyFundCalculatorTab> createState() =>
      _EmergencyFundCalculatorTabState();
}

class _EmergencyFundCalculatorTabState
    extends ConsumerState<_EmergencyFundCalculatorTab> {
  int _multiplier = 6; // 3x Lajang Pemula, 6x Lajang Ideal, 9x Menikah, 12x Keluarga / Freelancer
  int _targetMonths = 12;

  @override
  Widget build(BuildContext context) {
    final monthlyExp = widget.finance.currentMonthExpense > 0
        ? widget.finance.currentMonthExpense
        : (widget.finance.budget != null &&
                widget.finance.budget!.needsAmount > 0
            ? widget.finance.budget!.needsAmount
            : 2500000.0);
    final idealFund = monthlyExp * _multiplier;
    final currentCushion = widget.finance.totalBalance;
    final coveragePct = idealFund > 0
        ? ((currentCushion / idealFund) * 100).clamp(0, 100).round()
        : 0;
    final shortfall = (idealFund - currentCushion).clamp(0.0, double.infinity);
    final monthlySavingNeeded =
        _targetMonths > 0 ? shortfall / _targetMonths : shortfall;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SadarCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionHeader(
                title: 'Kalkulator Kesehatan Dana Darurat',
                subtitle:
                    'Dihitung otomatis dari pengeluaran bulanan & saldo akun aktif Anda',
              ),
              const SizedBox(height: 14),
              Text(
                'Pilih Profil Tanggungan Anda:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimaryOf(context),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  (3, 'Lajang Awal (3x)'),
                  (6, 'Lajang Ideal (6x)'),
                  (9, 'Menikah (9x)'),
                  (12, 'Keluarga / Freelance (12x)'),
                ].map((opt) {
                  return ChoiceChip(
                    label: Text(opt.$2),
                    selected: _multiplier == opt.$1,
                    onSelected: (_) => setState(() => _multiplier = opt.$1),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryOf(context).withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.primaryOf(context).withValues(alpha: 0.30),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Target Dana Darurat Ideal ($_multiplier Bulan)',
                      style: TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textSecondaryOf(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      AppFormatters.rupiah(idealFund),
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryOf(context),
                      ),
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(99),
                      child: LinearProgressIndicator(
                        value: (coveragePct / 100).clamp(0.0, 1.0),
                        minHeight: 8,
                        backgroundColor: AppColors.borderOf(context),
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          AppColors.success,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Kesiapan Dana Saat Ini: $coveragePct% (${AppFormatters.compactRupiah(currentCushion)})',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimaryOf(context),
                      ),
                    ),
                  ],
                ),
              ),
              if (shortfall > 0) ...[
                const SizedBox(height: 14),
                Text(
                  'Simulasi Waktu Pencapaian ($_targetMonths Bulan):',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Slider(
                  value: _targetMonths.toDouble(),
                  min: 3,
                  max: 36,
                  divisions: 11,
                  label: '$_targetMonths Bulan',
                  onChanged: (v) => setState(() => _targetMonths = v.round()),
                ),
                Text(
                  'Rekomendasi sisihkan: ${AppFormatters.rupiah(monthlySavingNeeded)} / bulan',
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.accentOf(context),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    await ref.read(financeProvider.notifier).addSavingsGoal(
                          title: 'Dana Darurat Ideal (${_multiplier}x)',
                          targetAmount: idealFund,
                          initialAmount:
                              currentCushion.clamp(0, idealFund).toDouble(),
                          category: 'Dana Darurat',
                        );
                    widget.onCreatedGoal();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: AppColors.success,
                          content: Text(
                            'Target Dana Darurat berhasil ditambahkan ke Target Tabungan!',
                          ),
                        ),
                      );
                    }
                  },
                  icon: const Icon(Icons.flag_rounded),
                  label: const Text('Jadikan Target Tabungan Aktif'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
