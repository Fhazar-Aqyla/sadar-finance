import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/sadar_card.dart';
import '../../widgets/sadar_logo.dart';
import '../../widgets/user_avatar.dart';

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
            tooltip: 'Bagikan Kartu Pencapaian (PNG)',
            onPressed: () => _showShareableScoreCardDialog(context, ref),
            icon: const Icon(Icons.ios_share_rounded),
          ),
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
                        textAlign: TextAlign.justify,
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
                    '0-40 Perlu Perhatian  |  41-70 Cukup Sehat  |  71-100 Sehat',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textMutedOf(context),
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          _showShareableScoreCardDialog(context, ref),
                      icon: const Icon(Icons.share_rounded, size: 17),
                      label: const Text(
                        'Bagikan Kartu Skor & Level (Tanpa Nominal)',
                        style: TextStyle(fontSize: 12.5),
                      ),
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

            // Checklist Aksi Konkret Naik Skor & Level (Item 6)
            SadarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(
                    title: 'Target Aksi Naik Skor & Level',
                    subtitle: 'Checklist kebiasaan finansial sehat bulan ini',
                  ),
                  const SizedBox(height: 12),
                  _ActionCheckRow(
                    title: 'Jaga Pengeluaran Kebutuhan <= 50%',
                    done: (score?.needsRatio ?? 0) <= 0.5 && overall > 0,
                  ),
                  _ActionCheckRow(
                    title: 'Batasi Pengeluaran Keinginan <= 30%',
                    done: (score?.wantsRatio ?? 0) <= 0.3 && overall > 0,
                  ),
                  _ActionCheckRow(
                    title: 'Sisihkan Tabungan & Dana Darurat >= 20%',
                    done: (score?.savingsRatio ?? 0) >= 0.2,
                  ),
                  _ActionCheckRow(
                    title: 'Pertahankan Streak Pencatatan >= 3 Hari',
                    done: finance.streakDays >= 3,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Score History with Visual Trend Bars (Item 6)
            if (finance.scoreHistory.isNotEmpty)
              SadarCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionHeader(
                      title: 'Tren & Riwayat Skor Finansial',
                      subtitle: 'Perkembangan evaluasi kesehatan finansial Anda',
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 92,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: finance.scoreHistory
                            .take(6)
                            .toList()
                            .reversed
                            .map((item) {
                          final ratio = (item.score / 100).clamp(0.12, 1.0);
                          final barColor = _toneColor(item.score);
                          return Expanded(
                            child: Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  Text(
                                    '${item.score}',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: barColor,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    height: 48 * ratio,
                                    decoration: BoxDecoration(
                                      color: barColor,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    AppFormatters.shortDate(item.createdAt)
                                        .split(' ')
                                        .take(2)
                                        .join(' '),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 9.5,
                                      color: AppColors.textMutedOf(context),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const Divider(height: 22),
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

  Future<void> _showShareableScoreCardDialog(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final boundaryKey = GlobalKey();
    final auth = ref.read(authProvider);
    final finance = ref.read(financeProvider);
    final user = auth.user;
    final overall = finance.healthScore?.overallScore ?? 0;
    final status = finance.healthScore?.status ?? 'Sehat';
    final toneColor = _toneColor(overall);
    bool sharing = false;

    await showDialog<void>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RepaintBoundary(
                key: boundaryKey,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E3A8A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFF5EEAD4).withValues(alpha: 0.35),
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
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
                              color: Colors.white.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Text(
                              'LV.${finance.financialLevel} • ${finance.streakDays} HARI',
                              style: const TextStyle(
                                color: Color(0xFF5EEAD4),
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      UserAvatar(
                        profilePicture: user?.profilePicture,
                        apiBaseUrl: auth.apiBaseUrl,
                        initials: user?.initials ?? 'S',
                        radius: 30,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        user?.fullName ?? 'Pengguna SADAR Finance',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        finance.financialLevelTitle,
                        style: const TextStyle(
                          color: Color(0xFF5EEAD4),
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 14,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.14),
                          ),
                        ),
                        child: Column(
                          children: [
                            const Text(
                              'SKOR KESEHATAN FINANSIAL',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$overall / 100',
                              style: TextStyle(
                                color: toneColor == AppColors.success
                                    ? const Color(0xFF5EEAD4)
                                    : Colors.white,
                                fontSize: 34,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Status: $status • Metode 50/30/20',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'sadar-finance.web.id • SADAR Finance V 2.0.0',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.65),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                      ),
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Tutup'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: sharing
                          ? null
                          : () async {
                              setDialogState(() => sharing = true);
                              try {
                                final boundary = boundaryKey.currentContext
                                        ?.findRenderObject()
                                    as RenderRepaintBoundary?;
                                if (boundary == null) return;
                                final img = await boundary.toImage(
                                  pixelRatio: 3.0,
                                );
                                final byteData = await img.toByteData(
                                  format: ui.ImageByteFormat.png,
                                );
                                if (byteData == null) return;
                                final pngBytes = byteData.buffer.asUint8List();
                                final dir = await getTemporaryDirectory();
                                final file = File(
                                  '${dir.path}/Kartu-Skor-SADAR-Finance-V2.png',
                                );
                                await file.writeAsBytes(pngBytes, flush: true);
                                await Share.shareXFiles(
                                  [XFile(file.path, mimeType: 'image/png')],
                                  subject:
                                      'Skor Finansial SADAR Finance V 2.0 ($overall/100)',
                                  text:
                                      'Skor Kesehatan Finansial saya di SADAR Finance V 2.0 adalah $overall/100 ($status)! #SADARFinance',
                                );
                              } finally {
                                if (ctx.mounted) {
                                  setDialogState(() => sharing = false);
                                }
                              }
                            },
                      icon: const Icon(Icons.share_rounded, size: 17),
                      label: Text(
                        sharing ? 'Menyiapkan...' : 'Bagikan Gambar',
                      ),
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
}

class _ActionCheckRow extends StatelessWidget {
  final String title;
  final bool done;

  const _ActionCheckRow({required this.title, required this.done});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            done
                ? Icons.check_circle_rounded
                : Icons.radio_button_unchecked_rounded,
            size: 18,
            color: done ? AppColors.success : AppColors.textMutedOf(context),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: done ? FontWeight.w700 : FontWeight.w500,
                color: AppColors.textPrimaryOf(context),
              ),
            ),
          ),
        ],
      ),
    );
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
              textAlign: TextAlign.justify,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondaryOf(context),
                height: 1.48,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
