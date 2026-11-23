import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/category_helpers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/sadar_card.dart';

class BehaviorInsightScreen extends ConsumerWidget {
  const BehaviorInsightScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finance = ref.watch(financeProvider);
    final transactions = finance.transactions;

    double weekdayTotal = 0;
    int weekdayCount = 0;
    double weekendTotal = 0;
    int weekendCount = 0;

    final Map<String, double> byCategory = {};
    final Map<int, double> byDayOfWeek = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
    };

    for (final t in transactions) {
      if (AppFormatters.isWeekend(t.transactionDate)) {
        weekendTotal += t.amount;
        weekendCount++;
      } else {
        weekdayTotal += t.amount;
        weekdayCount++;
      }
      final label = t.categoryLabel;
      byCategory[label] = (byCategory[label] ?? 0) + t.amount;
      byDayOfWeek[t.transactionDate.weekday] =
          (byDayOfWeek[t.transactionDate.weekday] ?? 0) + t.amount;
    }

    final sortedCats = byCategory.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final topCategory =
        sortedCats.isNotEmpty ? sortedCats.first : const MapEntry('-', 0.0);

    final prediction = finance.behaviorPrediction;
    final forecast = finance.overspendingForecast;
    final riskTone = _riskColor(prediction?.riskLevel);
    final primaryColor = AppColors.primaryOf(context);
    final purpleColor = AppColors.purpleOf(context);
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);
    final textMuted = AppColors.textMutedOf(context);
    final borderColor = AppColors.borderOf(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Insight Perilaku'),
        actions: [
          IconButton(
            onPressed: () => ref
                .read(financeProvider.notifier)
                .refreshBehaviorAndOverspending(),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(financeProvider.notifier).loadAll(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (finance.isOffline) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.warning.withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.wifi_off_rounded,
                      color: AppColors.warning,
                      size: 18,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Mode Offline: Menampilkan analisis tersimpan. Pembaruan analisis AI membutuhkan internet.',
                        style: TextStyle(fontSize: 12, color: textPrimary),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            // AI Behavior Spike Prediction Card
            SadarCard(
              color: riskTone.withValues(
                alpha: AppColors.isDark(context) ? 0.14 : 0.08,
              ),
              borderColor: riskTone.withValues(alpha: 0.35),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.auto_graph_rounded, color: riskTone),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Analisis Risiko Lonjakan Belanja',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: textPrimary,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: riskTone,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _riskLabel(prediction?.riskLevel),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    prediction?.recommendation ??
                        'Pola belanjamu sedang dianalisis. Catat transaksi secara rutin untuk mendapatkan masukan yang lebih personal.',
                    style: TextStyle(
                      fontSize: 13.5,
                      color: textPrimary,
                      height: 1.45,
                    ),
                  ),
                  if (prediction?.spikeProbability != null) ...[
                    const SizedBox(height: 10),
                    Text(
                      'Probabilitas lonjakan: ${(prediction!.spikeProbability! * 100).toStringAsFixed(0)}%',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Weekend vs Weekday cards
            Row(
              children: [
                Expanded(
                  child: SadarCard(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hari Kerja (Sen–Jum)',
                          style: TextStyle(
                            fontSize: 12,
                            color: textSecondary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          AppFormatters.compactRupiah(weekdayTotal),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: primaryColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$weekdayCount transaksi',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: textMuted,
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Akhir Pekan (Sab–Min)',
                          style: TextStyle(
                            fontSize: 12,
                            color: textSecondary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          AppFormatters.compactRupiah(weekendTotal),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: purpleColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$weekendCount transaksi',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Spending by Day of Week Chart
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(
                    title: 'Pola Pengeluaran per Hari',
                    subtitle: 'Identifikasi hari dengan konsumsi tertinggi',
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    height: 170,
                    child: BarChart(
                      BarChartData(
                        maxY: (byDayOfWeek.values.reduce((a, b) => a > b ? a : b) *
                                1.25)
                            .clamp(100000, double.infinity),
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          getDrawingHorizontalLine: (_) =>
                              FlLine(color: borderColor, strokeWidth: 1),
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
                              reservedSize: 44,
                              getTitlesWidget: (v, _) => Text(
                                AppFormatters.compactRupiah(v)
                                    .replaceAll('Rp ', ''),
                                style: TextStyle(
                                  fontSize: 10,
                                  color: textMuted,
                                ),
                              ),
                            ),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (v, _) {
                                const labels = [
                                  'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min',
                                ];
                                final idx = v.toInt() - 1;
                                if (idx < 0 || idx >= labels.length) {
                                  return const SizedBox.shrink();
                                }
                                return Padding(
                                  padding: const EdgeInsets.only(top: 6),
                                  child: Text(
                                    labels[idx],
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: textSecondary,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                        barGroups: byDayOfWeek.entries.map((entry) {
                          final isWknd = entry.key >= 6;
                          return BarChartGroupData(
                            x: entry.key,
                            barRods: [
                              BarChartRodData(
                                toY: entry.value,
                                width: 16,
                                color: isWknd ? purpleColor : primaryColor,
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Dominant Category & Overspending Forecast
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(
                    title: 'Kategori Dominan & Proyeksi Akhir Bulan',
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: CategoryHelpers.colorForGroup(topCategory.key)
                              .withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          CategoryHelpers.iconForGroup(topCategory.key),
                          color: CategoryHelpers.colorForGroup(topCategory.key),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Terbesar: ${topCategory.key}',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: textPrimary,
                              ),
                            ),
                            Text(
                              AppFormatters.rupiah(topCategory.value),
                              style: TextStyle(
                                color: textSecondary,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (forecast != null) ...[
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Estimasi Akhir Bulan',
                          style: TextStyle(
                            fontSize: 13,
                            color: textSecondary,
                          ),
                        ),
                        Text(
                          AppFormatters.rupiah(forecast.predictedAmount),
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Risiko Overspending',
                          style: TextStyle(
                            fontSize: 13,
                            color: textSecondary,
                          ),
                        ),
                        Text(
                          _riskLabel(forecast.riskLevel),
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: _riskColor(forecast.riskLevel),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Saved AI Insights list
            if (finance.insights.isNotEmpty)
              SadarCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionHeader(title: 'Rekomendasi & Catatan Kebiasaan'),
                    const SizedBox(height: 12),
                    ...finance.insights.map(
                      (ins) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.check_circle_outline_rounded,
                              size: 18,
                              color: AppColors.accent,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ins.title,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13.5,
                                      color: textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    ins.description,
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      color: textSecondary,
                                      height: 1.35,
                                    ),
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
              ),
          ],
        ),
      ),
    );
  }

  Color _riskColor(String? risk) {
    switch ((risk ?? 'low').toLowerCase()) {
      case 'high':
      case 'critical':
        return AppColors.danger;
      case 'medium':
        return AppColors.warning;
      default:
        return AppColors.success;
    }
  }

  String _riskLabel(String? risk) {
    switch ((risk ?? 'low').toLowerCase()) {
      case 'critical':
        return 'Kritis';
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      default:
        return 'Terkendali';
    }
  }
}
