import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/constants/category_helpers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/utils/pdf_report_generator.dart';
import '../../providers/auth_provider.dart';
import '../../providers/finance_provider.dart';
import 'sadar_logo.dart';

class EStatementPreviewSheet extends ConsumerStatefulWidget {
  const EStatementPreviewSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const EStatementPreviewSheet(),
    );
  }

  @override
  ConsumerState<EStatementPreviewSheet> createState() =>
      _EStatementPreviewSheetState();
}

class _EStatementPreviewSheetState
    extends ConsumerState<EStatementPreviewSheet> {
  late DateTime _selectedMonth;
  bool _sendingEmail = false;
  bool _sharingDoc = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedMonth = DateTime(now.year, now.month, 1);
  }

  String get _monthKey =>
      '${_selectedMonth.year}-${_selectedMonth.month.toString().padLeft(2, '0')}';

  Future<void> _sendToEmail(String userEmail) async {
    setState(() => _sendingEmail = true);
    try {
      final res = await ref
          .read(sadarApiServiceProvider)
          .sendMonthlyStatementEmail(month: _monthKey);
      if (!mounted) return;
      final period =
          (res['periodLabel'] ?? AppFormatters.monthYear(_selectedMonth))
              .toString();
      final email = (res['email'] ?? userEmail).toString();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.success,
          content: Text(
            'e-Statement Resmi ($period) berhasil dikirim ke $email!',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.danger,
          content: Text('Gagal mengirim e-Statement: $e'),
        ),
      );
    } finally {
      if (mounted) setState(() => _sendingEmail = false);
    }
  }

  Future<void> _shareOfficialDocument() async {
    setState(() => _sharingDoc = true);
    try {
      final auth = ref.read(authProvider);
      final finance = ref.read(financeProvider);
      final user = auth.user;

      final monthTx = finance.transactions.where((t) {
        return t.transactionDate.year == _selectedMonth.year &&
            t.transactionDate.month == _selectedMonth.month;
      }).toList();
      final monthInc = finance.incomes.where((i) {
        return i.incomeDate.year == _selectedMonth.year &&
            i.incomeDate.month == _selectedMonth.month;
      }).toList();

      final totalIn = monthInc.fold<double>(0, (s, i) => s + i.amount);
      final totalOut = monthTx.fold<double>(0, (s, t) => s + t.amount);
      final netFlow = totalIn - totalOut;

      double needsOut = 0;
      double wantsOut = 0;
      double savingsOut = 0;
      for (final t in monthTx) {
        final g = CategoryHelpers.normalizeGroup(t.categoryGroup);
        if (g == 'Needs') {
          needsOut += t.amount;
        } else if (g == 'Wants') {
          wantsOut += t.amount;
        } else {
          savingsOut += t.amount;
        }
      }
      final topTx = [...monthTx]..sort((a, b) => b.amount.compareTo(a.amount));
      final score = finance.healthScore?.overallScore ?? 0;
      final status = finance.healthScore?.status ?? 'Sehat';

      final pdfBytes = PdfReportGenerator.buildFinancialReportPdf(
        title: 'SADAR FINANCE - E-STATEMENT RESMI',
        subtitle:
            'Laporan Ringkasan Eksekutif & Alokasi 50/30/20 Bulanan',
        userName: user?.fullName ?? 'Pengguna SADAR',
        userEmail: user?.email ?? '-',
        periodLabel: AppFormatters.monthYear(_selectedMonth),
        totalIncome: AppFormatters.rupiah(totalIn),
        totalExpense: AppFormatters.rupiah(totalOut),
        netCashflow:
            '${netFlow >= 0 ? "+" : ""}${AppFormatters.rupiah(netFlow)}',
        healthScoreLabel: '$score / 100 ($status)',
        allocationRows: [
          ('Kebutuhan (Target 50%)', AppFormatters.rupiah(needsOut)),
          ('Keinginan (Target 30%)', AppFormatters.rupiah(wantsOut)),
          ('Tabungan & Investasi (Target 20%)', AppFormatters.rupiah(savingsOut)),
        ],
        accountRows: finance.accounts
            .map((a) => ('${a.name} (${a.type})', AppFormatters.rupiah(a.balance)))
            .toList(),
        transactionRows: topTx
            .take(12)
            .map(
              (t) => (
                AppFormatters.shortDate(t.transactionDate),
                t.displayTitle,
                '-${AppFormatters.rupiah(t.amount)}',
              ),
            )
            .toList(),
      );

      final dir = await getTemporaryDirectory();
      final file = File(
        '${dir.path}/e-Statement-SADAR-Finance-$_monthKey.pdf',
      );
      await file.writeAsBytes(pdfBytes, flush: true);
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'application/pdf')],
        subject:
            'e-Statement PDF Resmi SADAR Finance (${AppFormatters.monthYear(_selectedMonth)})',
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.danger,
          content: Text('Gagal menyiapkan PDF e-Statement: $e'),
        ),
      );
    } finally {
      if (mounted) setState(() => _sharingDoc = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final finance = ref.watch(financeProvider);
    final user = auth.user;
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);

    final monthTx = finance.transactions.where((t) {
      return t.transactionDate.year == _selectedMonth.year &&
          t.transactionDate.month == _selectedMonth.month;
    }).toList();
    final monthInc = finance.incomes.where((i) {
      return i.incomeDate.year == _selectedMonth.year &&
          i.incomeDate.month == _selectedMonth.month;
    }).toList();

    final totalIn = monthInc.fold<double>(0, (s, i) => s + i.amount);
    final totalOut = monthTx.fold<double>(0, (s, t) => s + t.amount);
    final netFlow = totalIn - totalOut;

    double needsOut = 0;
    double wantsOut = 0;
    double savingsOut = 0;
    for (final t in monthTx) {
      final g = CategoryHelpers.normalizeGroup(t.categoryGroup);
      if (g == 'Needs') {
        needsOut += t.amount;
      } else if (g == 'Wants') {
        wantsOut += t.amount;
      } else {
        savingsOut += t.amount;
      }
    }

    final topTx = [...monthTx]..sort((a, b) => b.amount.compareTo(a.amount));
    final score = finance.healthScore?.overallScore ?? 0;

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.6,
      maxChildSize: 0.95,
      builder: (ctx, scrollCtrl) => Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceOf(ctx),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 10),
            Container(
              width: 42,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderOf(ctx),
                borderRadius: BorderRadius.circular(99),
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollCtrl,
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
                children: [
                  // Executive Statement Banner Header
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F172A), Color(0xFF1E3A8A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const SadarLogo(
                              variant: SadarLogoVariant.light,
                              height: 20,
                              showFinanceSubtitle: true,
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.accent.withValues(alpha: 0.22),
                                borderRadius: BorderRadius.circular(99),
                                border: Border.all(
                                  color:
                                      AppColors.accent.withValues(alpha: 0.5),
                                ),
                              ),
                              child: const Text(
                                'E-STATEMENT RESMI',
                                style: TextStyle(
                                  color: Color(0xFF5EEAD4),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.7,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          user?.fullName ?? 'Pengguna SADAR Finance',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${user?.email ?? "-"} • @${user?.effectiveUsername ?? "sadar"}',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.78),
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Periode: ${AppFormatters.monthYear(_selectedMonth)}',
                              style: const TextStyle(
                                color: Color(0xFF5EEAD4),
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: () {
                                    setState(() {
                                      _selectedMonth = DateTime(
                                        _selectedMonth.year,
                                        _selectedMonth.month - 1,
                                        1,
                                      );
                                    });
                                  },
                                  icon: const Icon(
                                    Icons.chevron_left_rounded,
                                    color: Colors.white,
                                  ),
                                ),
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: () {
                                    final now = DateTime.now();
                                    final next = DateTime(
                                      _selectedMonth.year,
                                      _selectedMonth.month + 1,
                                      1,
                                    );
                                    if (!next.isAfter(
                                      DateTime(now.year, now.month, 1),
                                    )) {
                                      setState(() => _selectedMonth = next);
                                    }
                                  },
                                  icon: const Icon(
                                    Icons.chevron_right_rounded,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 2x2 Summary KPI Grid
                  Row(
                    children: [
                      Expanded(
                        child: _StatementKpiTile(
                          label: 'Total Pemasukan',
                          value: AppFormatters.rupiah(totalIn),
                          color: AppColors.success,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _StatementKpiTile(
                          label: 'Total Pengeluaran',
                          value: AppFormatters.rupiah(totalOut),
                          color: AppColors.danger,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _StatementKpiTile(
                          label: 'Arus Kas Bersih',
                          value:
                              '${netFlow >= 0 ? "+" : ""}${AppFormatters.rupiah(netFlow)}',
                          color: netFlow >= 0
                              ? AppColors.accentOf(ctx)
                              : AppColors.warning,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _StatementKpiTile(
                          label: 'Skor Finansial & Saldo',
                          value:
                              '$score/100 • ${AppFormatters.compactRupiah(finance.totalBalance)}',
                          color: AppColors.primaryOf(ctx),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // 50/30/20 Breakdown
                  Text(
                    'Realisasi Alokasi 50/30/20',
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.subtleOf(ctx),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderOf(ctx)),
                    ),
                    child: Column(
                      children: [
                        _AllocationBarRow(
                          label: 'Kebutuhan (Target 50%)',
                          amount: needsOut,
                          total: totalOut,
                          color: AppColors.primaryOf(ctx),
                        ),
                        const SizedBox(height: 10),
                        _AllocationBarRow(
                          label: 'Keinginan (Target 30%)',
                          amount: wantsOut,
                          total: totalOut,
                          color: AppColors.purpleOf(ctx),
                        ),
                        const SizedBox(height: 10),
                        _AllocationBarRow(
                          label: 'Tabungan (Target 20%)',
                          amount: savingsOut,
                          total: totalOut,
                          color: AppColors.success,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Active Accounts Summary
                  Text(
                    'Posisi Saldo Rekening & Dompet (${finance.accounts.length})',
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...finance.accounts.map(
                    (acc) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.subtleOf(ctx),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderOf(ctx)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${acc.name} (${acc.type})',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                                color: textPrimary,
                              ),
                            ),
                          ),
                          Text(
                            AppFormatters.rupiah(acc.balance),
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                              color: textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  if (topTx.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    Text(
                      '5 Pengeluaran Terbesar Periode Ini',
                      style: TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...topTx.take(5).map(
                          (t) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    '• ${t.displayTitle} (${AppFormatters.shortDate(t.transactionDate)})',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      color: textSecondary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  AppFormatters.rupiah(t.amount),
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                  ],
                ],
              ),
            ),
            SafeArea(
              top: false,
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceOf(ctx),
                  border: Border(
                    top: BorderSide(color: AppColors.borderOf(ctx)),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _sharingDoc ? null : _shareOfficialDocument,
                        icon: _sharingDoc
                            ? const SizedBox(
                                width: 15,
                                height: 15,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.picture_as_pdf_rounded, size: 17),
                        label: const Text(
                          'Unduh PDF (.pdf)',
                          style: TextStyle(fontSize: 12.5),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _sendingEmail
                            ? null
                            : () => _sendToEmail(user?.email ?? ''),
                        icon: _sendingEmail
                            ? const SizedBox(
                                width: 15,
                                height: 15,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.send_rounded, size: 17),
                        label: const Text(
                          'Kirim ke Email',
                          style: TextStyle(fontSize: 12.5),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatementKpiTile extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatementKpiTile({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.subtleOf(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderOf(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textMutedOf(context),
            ),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AllocationBarRow extends StatelessWidget {
  final String label;
  final double amount;
  final double total;
  final Color color;

  const _AllocationBarRow({
    required this.label,
    required this.amount,
    required this.total,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final ratio = total > 0 ? (amount / total).clamp(0.0, 1.0) : 0.0;
    final pct = (ratio * 100).toStringAsFixed(1);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimaryOf(context),
              ),
            ),
            Text(
              '${AppFormatters.rupiah(amount)} ($pct%)',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 5),
        ClipRRect(
          borderRadius: BorderRadius.circular(99),
          child: LinearProgressIndicator(
            value: ratio,
            minHeight: 6,
            backgroundColor: AppColors.borderOf(context),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}
