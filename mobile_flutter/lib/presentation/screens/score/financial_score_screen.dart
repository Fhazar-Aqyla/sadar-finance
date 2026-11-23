import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/sadar_card.dart';

class FinancialScoreScreen extends ConsumerWidget {
  const FinancialScoreScreen({super.key});

  static const _periods = [
    ('2w', '2 Minggu'),
    ('1m', '1 Bulan'),
    ('3m', '3 Bulan'),
    ('6m', '6 Bulan'),
    ('1y', '1 Tahun'),
    ('all', 'Semua'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finance = ref.watch(financeProvider);
    final score = finance.healthScore;
    final overall = score?.overallScore ?? 0;
    final status = score?.status ?? 'Belum Dihitung';
    final toneColor = _toneColor(overall);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Skor Finansial'),
        actions: [
          IconButton(
            onPressed: () => ref
                .read(financeProvider.notifier)
                .refreshHealthScore(period: finance.scorePeriod),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref
            .read(financeProvider.notifier)
            .refreshHealthScore(period: finance.scorePeriod),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (finance.isOffline)
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
                        'Mode Offline: Menampilkan skor terakhir yang tersimpan di perangkat.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textPrimaryOf(context),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            // Period filter chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _periods.map((p) {
                  final selected = finance.scorePeriod == p.$1;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(p.$2),
                      selected: selected,
                      onSelected: (_) => ref
                          .read(financeProvider.notifier)
                          .refreshHealthScore(period: p.$1),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),

            // Score Gauge Card
            SadarCard(
              child: Column(
                children: [
                  SizedBox(
                    width: 168,
                    height: 168,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 156,
                          height: 156,
                          child: CircularProgressIndicator(
                            value: (overall / 100).clamp(0.0, 1.0),
                            strokeWidth: 14,
                            backgroundColor: AppColors.borderOf(context),
                            strokeCap: StrokeCap.round,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(toneColor),
                          ),
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '$overall',
                              style: TextStyle(
                                fontSize: 42,
                                fontWeight: FontWeight.w800,
                                color: toneColor,
                                height: 1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'dari 100',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textMutedOf(context),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: toneColor.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(
                        color: toneColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '0–40 Perlu Perhatian · 41–70 Cukup Sehat · 71–100 Sehat',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textMutedOf(context),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 50/30/20 Evaluation
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(
                    title: 'Evaluasi Formula 50 / 30 / 20',
                    subtitle: 'Realisasi terhadap standar keuangan ideal',
                  ),
                  const SizedBox(height: 14),
                  _RatioBar(
                    label: 'Kebutuhan (Target ≤ 50%)',
                    actualPct: (score?.needsRatio ?? 0) * 100,
                    targetPct: 50,
                    color: AppColors.primaryOf(context),
                  ),
                  const SizedBox(height: 12),
                  _RatioBar(
                    label: 'Keinginan (Target ≤ 30%)',
                    actualPct: (score?.wantsRatio ?? 0) * 100,
                    targetPct: 30,
                    color: AppColors.purpleOf(context),
                  ),
                  const SizedBox(height: 12),
                  _RatioBar(
                    label: 'Tabungan & Investasi (Target ≥ 20%)',
                    actualPct: (score?.savingsRatio ?? 0) * 100,
                    targetPct: 20,
                    color: AppColors.success,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Breakdown Factors
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: 'Faktor Pembentuk Skor'),
                  const SizedBox(height: 14),
                  _FactorRow(
                    label: 'Rasio Tabungan (35%)',
                    score: score?.savingsScore ?? 0,
                  ),
                  _FactorRow(
                    label: 'Kontrol Pengeluaran (30%)',
                    score: score?.expenseScore ?? 0,
                  ),
                  _FactorRow(
                    label: 'Kepatuhan Anggaran (25%)',
                    score: score?.budgetScore ?? 0,
                  ),
                  _FactorRow(
                    label: 'Konsistensi Pencatatan (10%)',
                    score: score?.consistencyScore ?? 0,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Insights & Recommendations
            if (score != null &&
                (score.insights.isNotEmpty || score.recommendations.isNotEmpty))
              SadarCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionHeader(title: 'Ringkasan & Rekomendasi'),
                    const SizedBox(height: 12),
                    ...score.insights.map(
                      (item) => _BulletItem(
                        icon: Icons.info_outline_rounded,
                        color: AppColors.primaryOf(context),
                        text: item,
                      ),
                    ),
                    ...score.recommendations.map(
                      (item) => _BulletItem(
                        icon: Icons.tips_and_updates_outlined,
                        color: AppColors.accent,
                        text: item,
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),

            // Score History
            if (finance.scoreHistory.isNotEmpty)
              SadarCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionHeader(title: 'Riwayat Skor'),
                    const SizedBox(height: 10),
                    ...finance.scoreHistory.take(6).map(
                          (item) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            dense: true,
                            leading: CircleAvatar(
                              backgroundColor:
                                  _toneColor(item.score).withValues(alpha: 0.16),
                              child: Text(
                                '${item.score}',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  color: _toneColor(item.score),
                                ),
                              ),
                            ),
                            title: Text(
                              item.score <= 40
                                  ? 'Perlu Perhatian'
                                  : item.score <= 70
                                      ? 'Cukup Sehat'
                                      : 'Sehat',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimaryOf(context),
                              ),
                            ),
                            trailing: Text(
                              AppFormatters.shortDate(item.createdAt),
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textMutedOf(context),
                              ),
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

  Color _toneColor(int score) {
    if (score <= 40) return AppColors.danger;
    if (score <= 70) return AppColors.warning;
    return AppColors.success;
  }
}

class _RatioBar extends StatelessWidget {
  final String label;
  final double actualPct;
  final double targetPct;
  final Color color;

  const _RatioBar({
    required this.label,
    required this.actualPct,
    required this.targetPct,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
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
              '${actualPct.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            minHeight: 8,
            value: (actualPct / 100).clamp(0.0, 1.0),
            backgroundColor: AppColors.borderOf(context),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}

class _FactorRow extends StatelessWidget {
  final String label;
  final int score;

  const _FactorRow({required this.label, required this.score});

  @override
  Widget build(BuildContext context) {
    final color = score <= 40
        ? AppColors.danger
        : score <= 70
            ? AppColors.warning
            : AppColors.success;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textPrimaryOf(context),
                ),
              ),
              Text(
                '$score / 100',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              minHeight: 6,
              value: (score / 100).clamp(0.0, 1.0),
              backgroundColor: AppColors.borderOf(context),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }
}

class _BulletItem extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;

  const _BulletItem({
    required this.icon,
    required this.color,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondaryOf(context),
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
