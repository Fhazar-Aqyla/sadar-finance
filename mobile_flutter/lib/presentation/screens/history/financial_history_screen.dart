import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/category_helpers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/pdf_report_generator.dart';
import '../../../data/models/account_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/account_selector_field.dart';
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
  final String source;
  final String? receiptImageUrl;

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
    this.source = 'manual',
    this.receiptImageUrl,
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
  bool _calendarMode = false;
  DateTime _calendarMonth =
      DateTime(DateTime.now().year, DateTime.now().month, 1);
  int? _selectedCalendarDay;

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

  Future<void> _exportPdf(
    FinanceState finance,
    List<_HistoryItem> rows,
    double totalIn,
    double totalOut,
  ) async {
    if (rows.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak ada data untuk dicetak PDF pada filter ini.'),
        ),
      );
      return;
    }
    setState(() => _exporting = true);
    try {
      final user = ref.read(authProvider).user;
      final score = finance.healthScore?.overallScore ?? 0;
      final status = finance.healthScore?.status ?? 'Sehat';
      final net = totalIn - totalOut;

      double needs = 0;
      double wants = 0;
      double savings = 0;
      for (final r in rows.where((i) => !i.isIncome && !i.isTransfer)) {
        final g = CategoryHelpers.normalizeGroup(r.categoryGroup);
        if (g == 'Needs') {
          needs += r.amount;
        } else if (g == 'Wants') {
          wants += r.amount;
        } else {
          savings += r.amount;
        }
      }

      final pdfBytes = PdfReportGenerator.buildFinancialReportPdf(
        title: 'LAPORAN RIWAYAT KEUANGAN SADAR FINANCE',
        subtitle: 'Dokumen Resmi Rekapitulasi Transaksi & Mutasi Akun (V 2.0.0)',
        userName: user?.fullName ?? 'Pengguna SADAR',
        userEmail: user?.email ?? '-',
        periodLabel: _calendarMode
            ? AppFormatters.monthYear(_calendarMonth)
            : '${rows.length} Catatan Terfilter',
        totalIncome: AppFormatters.rupiah(totalIn),
        totalExpense: AppFormatters.rupiah(totalOut),
        netCashflow: '${net >= 0 ? "+" : ""}${AppFormatters.rupiah(net)}',
        healthScoreLabel: '$score / 100 ($status)',
        allocationRows: [
          ('Kebutuhan (50%)', AppFormatters.rupiah(needs)),
          ('Keinginan (30%)', AppFormatters.rupiah(wants)),
          ('Tabungan (20%)', AppFormatters.rupiah(savings)),
        ],
        accountRows: finance.accounts
            .map((a) => ('${a.name} (${a.type})', AppFormatters.rupiah(a.balance)))
            .toList(),
        transactionRows: rows
            .take(16)
            .map(
              (r) => (
                AppFormatters.shortDate(r.date),
                r.title,
                '${r.isTransfer ? "" : (r.isIncome ? "+" : "-")}${AppFormatters.rupiah(r.amount)}',
              ),
            )
            .toList(),
      );

      final dir = await getTemporaryDirectory();
      final stamp = AppFormatters.isoDateOnly(DateTime.now());
      final file = File('${dir.path}/Laporan-SADAR-Finance-$stamp.pdf');
      await file.writeAsBytes(pdfBytes, flush: true);

      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'application/pdf')],
        subject: 'Laporan PDF Resmi SADAR Finance ($stamp)',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.danger,
            content: Text('Gagal membuat PDF: $e'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  void _showReceiptZoomDialog(_HistoryItem item) {
    final apiBase = ref.read(authProvider).apiBaseUrl;
    String? rawUrl = item.receiptImageUrl;
    if (rawUrl != null && rawUrl.isNotEmpty && !rawUrl.startsWith('http')) {
      final host = apiBase.replaceFirst(RegExp(r'/api/v1/?$'), '');
      rawUrl = '$host${rawUrl.startsWith('/') ? '' : '/'}$rawUrl';
    }
    showDialog<void>(
      context: context,
      builder: (ctx) => Dialog(
        insetPadding: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.receipt_long_rounded,
                    color: AppColors.accent,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Bukti Struk & Rincian OCR',
                      style: TextStyle(
                        fontSize: 16,
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
              const SizedBox(height: 10),
              if (rawUrl != null && rawUrl.isNotEmpty)
                SizedBox(
                  height: 340,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: InteractiveViewer(
                      minScale: 0.8,
                      maxScale: 4.0,
                      child: Image.network(
                        rawUrl,
                        fit: BoxFit.contain,
                        errorBuilder: (_, _, _) => Center(
                          child: Text(
                            'Gambar struk tersimpan pada arsip OCR server.',
                            style: TextStyle(
                              color: AppColors.textSecondaryOf(ctx),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.subtleOf(ctx),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderOf(ctx)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.verified_rounded,
                            color: AppColors.success,
                            size: 18,
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Tercatat via Pindai Struk Otomatis (OCR AI)',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Merchant / Catatan: ${item.title}',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryOf(ctx),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Nominal Terbaca: ${AppFormatters.rupiah(item.amount)}',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryOf(ctx),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Tanggal Transaksi: ${AppFormatters.fullDate(item.date)}',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textSecondaryOf(ctx),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
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
                  AccountSelectorField(
                    label: 'Akun / Rekening',
                    selectedAccountId:
                        accounts.any((a) => a.id == selectedAccountId)
                            ? selectedAccountId
                            : accounts.first.id,
                    accounts: accounts,
                    onChanged: (v) =>
                        setModalState(() => selectedAccountId = v),
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
            source: t.source,
            receiptImageUrl: t.receiptImageUrl,
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
      if (_calendarMode) {
        if (item.date.year != _calendarMonth.year ||
            item.date.month != _calendarMonth.month) {
          return false;
        }
        if (_selectedCalendarDay != null &&
            item.date.day != _selectedCalendarDay) {
          return false;
        }
      } else if (_periodFilter == 'this_month') {
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
            tooltip: 'Unduh Laporan PDF (.pdf)',
            onPressed: _exporting
                ? null
                : () => _exportPdf(finance, filtered, filteredIn, filteredOut),
            icon: const Icon(Icons.picture_as_pdf_outlined),
          ),
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
                // View Mode Toggle: Daftar Transaksi vs Kalender Arus Kas
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.subtleOf(context),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderOf(context)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          borderRadius: BorderRadius.circular(9),
                          onTap: () => setState(() {
                            _calendarMode = false;
                            _selectedCalendarDay = null;
                          }),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: !_calendarMode
                                  ? AppColors.primaryOf(context)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(9),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.format_list_bulleted_rounded,
                                  size: 16,
                                  color: !_calendarMode
                                      ? Colors.white
                                      : AppColors.textSecondaryOf(context),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Mode Daftar',
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w800,
                                    color: !_calendarMode
                                        ? Colors.white
                                        : AppColors.textSecondaryOf(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: InkWell(
                          borderRadius: BorderRadius.circular(9),
                          onTap: () => setState(() => _calendarMode = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _calendarMode
                                  ? AppColors.primaryOf(context)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(9),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.calendar_month_rounded,
                                  size: 16,
                                  color: _calendarMode
                                      ? Colors.white
                                      : AppColors.textSecondaryOf(context),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Kalender Arus Kas',
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w800,
                                    color: _calendarMode
                                        ? Colors.white
                                        : AppColors.textSecondaryOf(context),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
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
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (_calendarMode) ...[
                    _buildCashflowCalendarCard(items, hidden),
                    const SizedBox(height: 14),
                  ],
                  if (filtered.isEmpty)
                    const EmptyStateWidget(
                      icon: Icons.receipt_long_outlined,
                      title: 'Tidak Ada Data',
                      message:
                          'Belum ada riwayat keuangan yang cocok dengan pencarian atau tanggal ini.',
                    )
                  else ...[
                    for (int index = 0; index < filtered.length; index++) ...[
                      if (index > 0) const SizedBox(height: 10),
                      Builder(
                        builder: (ctx) {
                          final item = filtered[index];
                          final color = item.isTransfer
                              ? AppColors.primaryLight
                              : item.isIncome
                                  ? AppColors.success
                                  : CategoryHelpers.colorForGroup(
                                      item.categoryGroup,
                                    );
                          final hasReceipt = item.source == 'ocr' ||
                              (item.receiptImageUrl != null &&
                                  item.receiptImageUrl!.isNotEmpty);
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              item.title,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 14,
                                                color: AppColors.textPrimaryOf(
                                                  context,
                                                ),
                                              ),
                                            ),
                                          ),
                                          if (hasReceipt) ...[
                                            const SizedBox(width: 6),
                                            InkWell(
                                              onTap: () =>
                                                  _showReceiptZoomDialog(item),
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  horizontal: 6,
                                                  vertical: 2,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: AppColors.accent
                                                      .withValues(alpha: 0.14),
                                                  borderRadius:
                                                      BorderRadius.circular(6),
                                                ),
                                                child: const Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    Icon(
                                                      Icons
                                                          .receipt_long_rounded,
                                                      size: 11,
                                                      color: AppColors.accent,
                                                    ),
                                                    SizedBox(width: 3),
                                                    Text(
                                                      'Struk',
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.w800,
                                                        color: AppColors.accent,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${item.subtitle} - ${AppFormatters.shortDate(item.date)}',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textSecondaryOf(
                                            context,
                                          ),
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
                                              ? AppFormatters.rupiah(
                                                  item.amount,
                                                )
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
                                        if (hasReceipt) ...[
                                          InkWell(
                                            onTap: () =>
                                                _showReceiptZoomDialog(item),
                                            child: Padding(
                                              padding: const EdgeInsets.all(2),
                                              child: Icon(
                                                Icons.visibility_outlined,
                                                size: 17,
                                                color:
                                                    AppColors.accentOf(context),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                        ],
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
                                                color: AppColors.textMutedOf(
                                                  context,
                                                ),
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
                                              color: AppColors.textMutedOf(
                                                context,
                                              ),
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
                    ],
                    if (finance.hasMoreHistory)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 12, bottom: 8),
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
                      ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCashflowCalendarCard(List<_HistoryItem> allItems, bool hidden) {
    final year = _calendarMonth.year;
    final month = _calendarMonth.month;
    final daysInMonth = DateTime(year, month + 1, 0).day;
    final firstWeekday = DateTime(year, month, 1).weekday; // 1 = Mon .. 7 = Sun

    final Map<int, double> dayIn = {};
    final Map<int, double> dayOut = {};
    for (final it in allItems) {
      if (it.date.year == year && it.date.month == month && !it.isTransfer) {
        final d = it.date.day;
        if (it.isIncome) {
          dayIn[d] = (dayIn[d] ?? 0) + it.amount;
        } else {
          dayOut[d] = (dayOut[d] ?? 0) + it.amount;
        }
      }
    }

    final cells = <Widget>[];
    for (int i = 1; i < firstWeekday; i++) {
      cells.add(const SizedBox.shrink());
    }
    for (int day = 1; day <= daysInMonth; day++) {
      final inc = dayIn[day] ?? 0;
      final exp = dayOut[day] ?? 0;
      final isSelected = _selectedCalendarDay == day;
      final hasActivity = inc > 0 || exp > 0;
      cells.add(
        InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            setState(() {
              _selectedCalendarDay = isSelected ? null : day;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 2),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.primaryOf(context)
                  : hasActivity
                      ? AppColors.subtleOf(context)
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSelected
                    ? AppColors.primaryOf(context)
                    : hasActivity
                        ? AppColors.borderOf(context)
                        : Colors.transparent,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$day',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight:
                        isSelected || hasActivity ? FontWeight.w800 : FontWeight.w500,
                    color: isSelected
                        ? Colors.white
                        : AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (inc > 0)
                      Container(
                        width: 6,
                        height: 6,
                        margin: const EdgeInsets.symmetric(horizontal: 1.5),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFF5EEAD4)
                              : AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                    if (exp > 0)
                      Container(
                        width: 6,
                        height: 6,
                        margin: const EdgeInsets.symmetric(horizontal: 1.5),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? const Color(0xFFFCA5A5)
                              : AppColors.danger,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    }

    const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return SadarCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppFormatters.monthYear(_calendarMonth),
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimaryOf(context),
                    ),
                  ),
                  Text(
                    _selectedCalendarDay != null
                        ? 'Filter aktif: Tanggal $_selectedCalendarDay (ketuk lagi untuk semua)'
                        : 'Ketuk tanggal untuk melihat rincian arus kas harian',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    onPressed: () {
                      setState(() {
                        _calendarMonth = DateTime(year, month - 1, 1);
                        _selectedCalendarDay = null;
                      });
                    },
                    icon: const Icon(Icons.chevron_left_rounded),
                  ),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    onPressed: () {
                      setState(() {
                        _calendarMonth = DateTime(year, month + 1, 1);
                        _selectedCalendarDay = null;
                      });
                    },
                    icon: const Icon(Icons.chevron_right_rounded),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: dayHeaders
                .map(
                  (d) => Expanded(
                    child: Center(
                      child: Text(
                        d,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMutedOf(context),
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 7,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            childAspectRatio: 1.0,
            children: cells,
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'Uang Masuk',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.danger,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'Uang Keluar',
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                ],
              ),
              if (_selectedCalendarDay != null)
                TextButton(
                  onPressed: () =>
                      setState(() => _selectedCalendarDay = null),
                  child: const Text(
                    'Tampilkan Sebulan',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
            ],
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
