import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/category_helpers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/account_model.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/sadar_card.dart';

class _HistoryItem {
  final String id;
  final bool isIncome;
  final bool isTransfer;
  final String? accountId;
  final String title;
  final String subtitle;
  final String categoryGroup;
  final String? categoryDetail;
  final double amount;
  final DateTime date;

  const _HistoryItem({
    required this.id,
    required this.isIncome,
    this.isTransfer = false,
    required this.accountId,
    required this.title,
    required this.subtitle,
    required this.categoryGroup,
    this.categoryDetail,
    required this.amount,
    required this.date,
  });
}

class FinancialHistoryScreen extends ConsumerStatefulWidget {
  const FinancialHistoryScreen({super.key});

  @override
  ConsumerState<FinancialHistoryScreen> createState() =>
      _FinancialHistoryScreenState();
}

class _FinancialHistoryScreenState
    extends ConsumerState<FinancialHistoryScreen> {
  final _searchCtrl = TextEditingController();
  String _typeFilter = 'all'; // all | expense | income
  String _categoryFilter = 'all'; // all | Needs | Wants | Savings
  String _periodFilter = 'all'; // all | this_month | last_month | custom
  String _accountFilter = 'all'; // all | accountId
  DateTimeRange? _customRange;
  bool _exporting = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickCustomRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: now.add(const Duration(days: 30)),
      initialDateRange: _customRange ??
          DateTimeRange(
            start: DateTime(now.year, now.month, 1),
            end: now,
          ),
    );
    if (picked != null) {
      setState(() {
        _customRange = picked;
        _periodFilter = 'custom';
      });
    }
  }

  String _escapeCsv(String value) {
    final clean = value.replaceAll('"', '""');
    return '"$clean"';
  }

  Future<void> _exportCsv(List<_HistoryItem> rows) async {
    if (rows.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak ada data untuk diekspor pada filter saat ini.'),
        ),
      );
      return;
    }
    setState(() => _exporting = true);
    try {
      final buf = StringBuffer('\uFEFF'); // UTF-8 BOM for Excel compatibility
      buf.writeln('Tanggal,Tipe,Judul,Kategori,Detail,Akun,Nominal');
      for (final item in rows) {
        final dateStr = AppFormatters.isoDateOnly(item.date);
        final typeStr = item.isIncome ? 'Pemasukan' : 'Pengeluaran';
        final accName = item.subtitle.contains('-')
            ? item.subtitle.split('-').last.trim()
            : '-';
        buf.writeln(
          [
            _escapeCsv(dateStr),
            _escapeCsv(typeStr),
            _escapeCsv(item.title),
            _escapeCsv(
              item.isIncome
                  ? 'Pemasukan'
                  : CategoryHelpers.labelForGroup(item.categoryGroup),
            ),
            _escapeCsv(item.categoryDetail ?? ''),
            _escapeCsv(accName),
            item.amount.round().toString(),
          ].join(','),
        );
      }

      final dir = await getTemporaryDirectory();
      final stamp = AppFormatters.isoDateOnly(DateTime.now());
      final file = File('${dir.path}/laporan-sadar-finance-$stamp.csv');
      await file.writeAsString(buf.toString(), flush: true);

      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'text/csv')],
        subject: 'Laporan Keuangan SADAR Finance ($stamp)',
        text: 'Laporan ${rows.length} catatan keuangan dari SADAR Finance.',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.danger,
            content: Text('Gagal mengekspor laporan: $e'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  Future<void> _shareSummaryReport(
    FinanceState finance,
    List<_HistoryItem> rows,
    double totalIn,
    double totalOut,
  ) async {
    final now = DateTime.now();
    final score = finance.healthScore?.overallScore ?? 0;
    final status = finance.healthScore?.status ?? 'Belum Dihitung';
    final buf = StringBuffer();
    buf.writeln('RINGKASAN LAPORAN KEUANGAN SADAR FINANCE');
    buf.writeln('Tanggal Cetak: ${AppFormatters.fullDate(now)}');
    buf.writeln('----------------------------------------');
    buf.writeln(
      'Total Saldo Gabungan (${finance.accounts.length} akun): ${AppFormatters.rupiah(finance.totalBalance)}',
    );
    buf.writeln('Total Pemasukan (Filter): ${AppFormatters.rupiah(totalIn)}');
    buf.writeln('Total Pengeluaran (Filter): ${AppFormatters.rupiah(totalOut)}');
    buf.writeln('Selisih Arus Kas: ${AppFormatters.rupiah(totalIn - totalOut)}');
    buf.writeln('Skor Kesehatan Finansial: $score / 100 ($status)');
    if (finance.savingsGoals.isNotEmpty) {
      buf.writeln('\nTARGET TABUNGAN:');
      for (final g in finance.savingsGoals) {
        buf.writeln(
          '- ${g.title}: ${AppFormatters.rupiah(g.currentAmount)} / ${AppFormatters.rupiah(g.targetAmount)} (${g.progressPercent}%)',
        );
      }
    }
    if (rows.isNotEmpty) {
      buf.writeln('\n10 CATATAN TERBARU:');
      for (final r in rows.take(10)) {
        final sign = r.isTransfer ? '' : (r.isIncome ? '+' : '-');
        buf.writeln(
          '- [${AppFormatters.shortDate(r.date)}] ${r.title}: $sign${AppFormatters.rupiah(r.amount)}',
        );
      }
    }
    await Share.share(
      buf.toString(),
      subject: 'Ringkasan Laporan SADAR Finance',
    );
  }

  Future<void> _showEditSheet(_HistoryItem item, List<AccountModel> accounts) async {
    final titleCtrl = TextEditingController(text: item.title);
    final amountCtrl = TextEditingController(
      text: AppFormatters.number(item.amount),
    );
    final detailCtrl = TextEditingController(text: item.categoryDetail ?? '');
    String? selectedAccountId = item.accountId ??
        (accounts.isNotEmpty ? accounts.first.id : null);
    String selectedGroup =
        CategoryHelpers.groups.contains(item.categoryGroup)
            ? item.categoryGroup
            : 'Needs';
    DateTime selectedDate = item.date;
    bool saving = false;

    await showModalBottomSheet(
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
                    Expanded(
                      child: Text(
                        item.isIncome ? 'Ubah Pemasukan' : 'Ubah Pengeluaran',
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
                const SizedBox(height: 12),
                if (accounts.isNotEmpty) ...[
                  DropdownButtonFormField<String>(
                    initialValue: accounts.any((a) => a.id == selectedAccountId)
                        ? selectedAccountId
                        : accounts.first.id,
                    decoration: const InputDecoration(
                      labelText: 'Akun / Rekening',
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
                    onChanged: (v) => setModalState(() => selectedAccountId = v),
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: const [CurrencyInputFormatter()],
                  decoration: const InputDecoration(
                    labelText: 'Nominal',
                    prefixText: 'Rp ',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    labelText:
                        item.isIncome ? 'Sumber Pemasukan' : 'Merchant / Catatan',
                    prefixIcon: const Icon(Icons.notes_rounded),
                  ),
                ),
                if (!item.isIncome) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: CategoryHelpers.groups.map((g) {
                      return ChoiceChip(
                        label: Text(CategoryHelpers.labelForGroup(g)),
                        selected: selectedGroup == g,
                        onSelected: (_) =>
                            setModalState(() => selectedGroup = g),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: detailCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Kategori Detail (Opsional)',
                      prefixIcon: Icon(Icons.label_outline_rounded),
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: selectedDate,
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (picked != null) {
                      setModalState(() => selectedDate = picked);
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Tanggal',
                      prefixIcon: Icon(Icons.calendar_today_rounded),
                    ),
                    child: Text(AppFormatters.fullDate(selectedDate)),
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: saving
                        ? null
                        : () async {
                            final amount =
                                AppFormatters.parseAmount(amountCtrl.text);
                            if (amount <= 0 || titleCtrl.text.trim().isEmpty) {
                              return;
                            }
                            setModalState(() => saving = true);
                            try {
                              if (item.isIncome) {
                                await ref
                                    .read(financeProvider.notifier)
                                    .updateIncome(
                                      item.id,
                                      accountId: selectedAccountId,
                                      amount: amount,
                                      incomeDate: selectedDate,
                                      source: titleCtrl.text.trim(),
                                    );
                              } else {
                                await ref
                                    .read(financeProvider.notifier)
                                    .updateTransaction(
                                      item.id,
                                      accountId: selectedAccountId,
                                      categoryGroup: selectedGroup,
                                      categoryDetail: detailCtrl.text.trim(),
                                      transactionDate: selectedDate,
                                      description: titleCtrl.text.trim(),
                                      amount: amount,
                                    );
                              }
                              if (ctx.mounted) Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: AppColors.success,
                                    content: Text(
                                      'Catatan berhasil diperbarui & saldo disesuaikan!',
                                    ),
                                  ),
                                );
                              }
                            } catch (e) {
                              setModalState(() => saving = false);
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
                    child: saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Simpan Perubahan'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmDelete(_HistoryItem item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Catatan?'),
        content: Text(
          'Hapus "${item.title}" sebesar ${AppFormatters.rupiah(item.amount)}? Saldo akun terkait akan disesuaikan otomatis.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      if (item.isTransfer) {
        await ref.read(financeProvider.notifier).deleteTransferLog(item.id);
      } else if (item.isIncome) {
        await ref.read(financeProvider.notifier).deleteIncome(item.id);
      } else {
        await ref.read(financeProvider.notifier).deleteTransaction(item.id);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Catatan berhasil dihapus.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppColors.danger, content: Text('$e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final finance = ref.watch(financeProvider);
    final hidden = ref.watch(uiPreferencesProvider).hideBalances;
    final query = _searchCtrl.text.trim().toLowerCase();

    final items = <_HistoryItem>[
      if (_typeFilter != 'income' && _typeFilter != 'transfer')
        ...finance.transactions.map((t) {
          final acc = t.accountName ?? finance.accountNameById(t.accountId);
          return _HistoryItem(
            id: t.id,
            isIncome: false,
            accountId: t.accountId,
            title: t.displayTitle,
            subtitle: '${t.categoryLabel} - $acc',
            categoryGroup: t.categoryGroup,
            categoryDetail: t.categoryDetail,
            amount: t.amount,
            date: t.transactionDate,
          );
        }),
      if (_typeFilter != 'expense' &&
          _typeFilter != 'transfer' &&
          _categoryFilter == 'all')
        ...finance.incomes.map((i) {
          final acc = i.accountName ?? finance.accountNameById(i.accountId);
          return _HistoryItem(
            id: i.id,
            isIncome: true,
            accountId: i.accountId,
            title: i.source,
            subtitle: 'Pemasukan - $acc',
            categoryGroup: 'Income',
            amount: i.amount,
            date: i.incomeDate,
          );
        }),
      if ((_typeFilter == 'all' || _typeFilter == 'transfer') &&
          _categoryFilter == 'all')
        ...finance.transfers.map((tr) {
          return _HistoryItem(
            id: tr.id,
            isIncome: false,
            isTransfer: true,
            accountId: tr.fromAccountId,
            title: 'Transfer: ${tr.fromAccountName} ke ${tr.toAccountName}',
            subtitle: tr.note.isNotEmpty
                ? 'Mutasi Saldo - ${tr.note}'
                : 'Mutasi Saldo Antar Akun',
            categoryGroup: 'Transfer',
            amount: tr.amount,
            date: tr.date,
          );
        }),
    ];

    final now = DateTime.now();
    final lastMonth = DateTime(now.year, now.month - 1, 1);

    final filtered = items.where((item) {
      if (_categoryFilter != 'all' && item.categoryGroup != _categoryFilter) {
        return false;
      }
      if (_accountFilter != 'all' && item.accountId != _accountFilter) {
        return false;
      }
      if (_periodFilter == 'this_month') {
        if (item.date.year != now.year || item.date.month != now.month) {
          return false;
        }
      } else if (_periodFilter == 'last_month') {
        if (item.date.year != lastMonth.year ||
            item.date.month != lastMonth.month) {
          return false;
        }
      } else if (_periodFilter == 'custom' && _customRange != null) {
        final d = DateTime(item.date.year, item.date.month, item.date.day);
        final start = DateTime(
          _customRange!.start.year,
          _customRange!.start.month,
          _customRange!.start.day,
        );
        final end = DateTime(
          _customRange!.end.year,
          _customRange!.end.month,
          _customRange!.end.day,
        );
        if (d.isBefore(start) || d.isAfter(end)) return false;
      }
      if (query.isNotEmpty) {
        final hay = '${item.title} ${item.subtitle}'.toLowerCase();
        if (!hay.contains(query)) return false;
      }
      return true;
    }).toList()
      ..sort((a, b) => b.date.compareTo(a.date));

    final filteredIn = filtered
        .where((i) => i.isIncome)
        .fold<double>(0, (sum, i) => sum + i.amount);
    final filteredOut = filtered
        .where((i) => !i.isIncome && !i.isTransfer)
        .fold<double>(0, (sum, i) => sum + i.amount);

    final customLabel = _customRange != null
        ? '${AppFormatters.shortDate(_customRange!.start)} - ${AppFormatters.shortDate(_customRange!.end)}'
        : 'Rentang Tanggal';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Keuangan'),
        actions: [
          IconButton(
            tooltip: 'Bagikan Ringkasan Laporan',
            onPressed: () =>
                _shareSummaryReport(finance, filtered, filteredIn, filteredOut),
            icon: const Icon(Icons.assessment_outlined),
          ),
          IconButton(
            tooltip: 'Ekspor Laporan CSV',
            onPressed: _exporting ? null : () => _exportCsv(filtered),
            icon: _exporting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.file_download_outlined),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.surfaceOf(context),
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Cari merchant, kategori, atau akun...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            onPressed: () {
                              _searchCtrl.clear();
                              setState(() {});
                            },
                            icon: const Icon(Icons.close_rounded),
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: const Text('Semua'),
                        selected: _typeFilter == 'all',
                        onSelected: (_) => setState(() => _typeFilter = 'all'),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Pengeluaran'),
                        selected: _typeFilter == 'expense',
                        onSelected: (_) =>
                            setState(() => _typeFilter = 'expense'),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Pemasukan'),
                        selected: _typeFilter == 'income',
                        onSelected: (_) => setState(() {
                          _typeFilter = 'income';
                          _categoryFilter = 'all';
                        }),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Transfer'),
                        selected: _typeFilter == 'transfer',
                        onSelected: (_) => setState(() {
                          _typeFilter = 'transfer';
                          _categoryFilter = 'all';
                        }),
                      ),
                      if (_typeFilter != 'income' &&
                          _typeFilter != 'transfer') ...[
                        const SizedBox(width: 12),
                        ...CategoryHelpers.groups.map(
                          (g) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(CategoryHelpers.labelForGroup(g)),
                              selected: _categoryFilter == g,
                              onSelected: (sel) => setState(
                                () => _categoryFilter = sel ? g : 'all',
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: const Text('Semua Waktu'),
                        selected: _periodFilter == 'all',
                        onSelected: (_) => setState(() => _periodFilter = 'all'),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Bulan Ini'),
                        selected: _periodFilter == 'this_month',
                        onSelected: (_) =>
                            setState(() => _periodFilter = 'this_month'),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Bulan Lalu'),
                        selected: _periodFilter == 'last_month',
                        onSelected: (_) =>
                            setState(() => _periodFilter = 'last_month'),
                      ),
                      const SizedBox(width: 8),
                      ActionChip(
                        avatar: Icon(
                          Icons.date_range_rounded,
                          size: 16,
                          color: _periodFilter == 'custom'
                              ? AppColors.primaryOf(context)
                              : AppColors.textSecondaryOf(context),
                        ),
                        label: Text(customLabel),
                        onPressed: _pickCustomRange,
                      ),
                      if (finance.accounts.isNotEmpty) ...[
                        const SizedBox(width: 12),
                        ChoiceChip(
                          label: const Text('Semua Akun'),
                          selected: _accountFilter == 'all',
                          onSelected: (_) =>
                              setState(() => _accountFilter = 'all'),
                        ),
                        const SizedBox(width: 8),
                        ...finance.accounts.map(
                          (acc) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(acc.name),
                              selected: _accountFilter == acc.id,
                              onSelected: (sel) => setState(
                                () => _accountFilter = sel ? acc.id : 'all',
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.subtleOf(context),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderOf(context)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _MiniSummary(
                          label: 'Masuk',
                          value: hidden
                              ? 'Rp ••••'
                              : AppFormatters.compactRupiah(filteredIn),
                          color: AppColors.success,
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 26,
                        color: AppColors.borderOf(context),
                      ),
                      Expanded(
                        child: _MiniSummary(
                          label: 'Keluar',
                          value: hidden
                              ? 'Rp ••••'
                              : AppFormatters.compactRupiah(filteredOut),
                          color: AppColors.danger,
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 26,
                        color: AppColors.borderOf(context),
                      ),
                      Expanded(
                        child: _MiniSummary(
                          label: 'Total Data',
                          value: '${filtered.length} item',
                          color: AppColors.primaryLight,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(financeProvider.notifier).loadAll(),
              child: filtered.isEmpty
                  ? ListView(
                      children: const [
                        EmptyStateWidget(
                          icon: Icons.receipt_long_outlined,
                          title: 'Tidak Ada Data',
                          message:
                              'Belum ada riwayat keuangan yang cocok dengan pencarian atau filter ini.',
                        ),
                      ],
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount:
                          filtered.length + (finance.hasMoreHistory ? 1 : 0),
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (ctx, index) {
                        if (index >= filtered.length) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: OutlinedButton.icon(
                                onPressed: finance.isLoadingMore
                                    ? null
                                    : () => ref
                                        .read(financeProvider.notifier)
                                        .loadMoreHistory(),
                                icon: finance.isLoadingMore
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Icon(Icons.expand_more_rounded),
                                label: Text(
                                  finance.isLoadingMore
                                      ? 'Memuat data...'
                                      : 'Muat Riwayat Lebih Lama',
                                ),
                              ),
                            ),
                          );
                        }
                        final item = filtered[index];
                        final color = item.isTransfer
                            ? AppColors.primaryLight
                            : item.isIncome
                                ? AppColors.success
                                : CategoryHelpers.colorForGroup(
                                    item.categoryGroup,
                                  );
                        return SadarCard(
                          onTap: item.isTransfer
                              ? null
                              : () => _showEditSheet(item, finance.accounts),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  item.isTransfer
                                      ? Icons.swap_horiz_rounded
                                      : item.isIncome
                                          ? Icons.arrow_downward_rounded
                                          : CategoryHelpers.iconForGroup(
                                              item.categoryGroup,
                                            ),
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
                                      item.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 14,
                                        color: AppColors.textPrimaryOf(context),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${item.subtitle} - ${AppFormatters.shortDate(item.date)}',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color:
                                            AppColors.textSecondaryOf(context),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    hidden
                                        ? 'Rp •••••'
                                        : item.isTransfer
                                            ? AppFormatters.rupiah(item.amount)
                                            : '${item.isIncome ? '+' : '-'}${AppFormatters.rupiah(item.amount)}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13.5,
                                      color: item.isTransfer
                                          ? AppColors.primaryOf(context)
                                          : item.isIncome
                                              ? AppColors.success
                                              : AppColors.danger,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (!item.isTransfer) ...[
                                        InkWell(
                                          onTap: () => _showEditSheet(
                                            item,
                                            finance.accounts,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.all(2),
                                            child: Icon(
                                              Icons.edit_outlined,
                                              size: 17,
                                              color:
                                                  AppColors.textMutedOf(context),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                      ],
                                      InkWell(
                                        onTap: () => _confirmDelete(item),
                                        child: Padding(
                                          padding: const EdgeInsets.all(2),
                                          child: Icon(
                                            Icons.delete_outline_rounded,
                                            size: 17,
                                            color:
                                                AppColors.textMutedOf(context),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniSummary extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniSummary({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            color: AppColors.textMutedOf(context),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
      ],
    );
  }
}
