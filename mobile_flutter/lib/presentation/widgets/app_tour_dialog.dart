import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'sadar_logo.dart';

class _TourStep {
  final IconData icon;
  final Color color;
  final String badge;
  final String title;
  final String description;

  const _TourStep({
    required this.icon,
    required this.color,
    required this.badge,
    required this.title,
    required this.description,
  });
}

/// Interactive Tour Guide for newly registered / first-time users.
/// Adapts seamlessly to Dark Mode and Light Mode.
class AppTourDialog extends StatefulWidget {
  final VoidCallback? onSetupAccount;

  const AppTourDialog({super.key, this.onSetupAccount});

  static Future<void> show(
    BuildContext context, {
    VoidCallback? onSetupAccount,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AppTourDialog(onSetupAccount: onSetupAccount),
    );
  }

  @override
  State<AppTourDialog> createState() => _AppTourDialogState();
}

class _AppTourDialogState extends State<AppTourDialog> {
  int _step = 0;

  static const _steps = [
    _TourStep(
      icon: Icons.account_balance_wallet_rounded,
      color: AppColors.primaryLight,
      badge: 'LANGKAH 1 DARI 4',
      title: 'Pantau Saldo & Rekening',
      description:
          'Di halaman Beranda, lihat total saldo gabungan, arus kas bulanan, serta geser kartu dompet/rekening. Gunakan ikon mata di kanan atas untuk menyembunyikan nominal.',
    ),
    _TourStep(
      icon: Icons.document_scanner_rounded,
      color: AppColors.accent,
      badge: 'LANGKAH 2 DARI 4',
      title: 'Catat Cepat & Scan Struk',
      description:
          'Tekan tombol "+ Catat" di tengah bawah untuk mencatat pengeluaran/pemasukan manual atau memindai struk belanja secara otomatis.',
    ),
    _TourStep(
      icon: Icons.insights_rounded,
      color: AppColors.purple,
      badge: 'LANGKAH 3 DARI 4',
      title: 'Insight Perilaku & Skor 50/30/20',
      description:
          'Buka tab Insight dan Skor untuk melihat kebiasaan belanja harian, prediksi akhir bulan, serta evaluasi skor kesehatan finansial 0–100.',
    ),
    _TourStep(
      icon: Icons.cloud_sync_rounded,
      color: AppColors.success,
      badge: 'LANGKAH 4 DARI 4',
      title: 'Offline-Ready & Pengaturan',
      description:
          'Data transaksimu tersimpan lokal di perangkat dan sinkron otomatis saat online. Untuk mengubah kata sandi, tema Gelap/Terang, atau cek pembaruan aplikasi, buka menu Pengaturan di tab Profil.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final current = _steps[_step];
    final isLast = _step == _steps.length - 1;
    final surface = AppColors.surfaceOf(context);
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);

    return Dialog(
      backgroundColor: surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: AppColors.borderOf(context)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SadarLogo(
                  variant: SadarLogoVariant.adaptive,
                  height: 16,
                  showFinanceSubtitle: false,
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    minimumSize: const Size(0, 32),
                  ),
                  child: Text(
                    'Lewati',
                    style: TextStyle(
                      color: AppColors.textMutedOf(context),
                      fontSize: 12.5,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: current.color.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: current.color.withValues(alpha: 0.35),
                ),
              ),
              child: Icon(current.icon, size: 36, color: current.color),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: current.color.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                current.badge,
                style: TextStyle(
                  color: current.color,
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              current.title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              current.description,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                color: textSecondary,
                height: 1.48,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_steps.length, (i) {
                final active = i == _step;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  margin: const EdgeInsets.symmetric(horizontal: 3.5),
                  width: active ? 22 : 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: active ? current.color : AppColors.borderOf(context),
                    borderRadius: BorderRadius.circular(99),
                  ),
                );
              }),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                if (_step > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _step--),
                      child: const Text('Kembali'),
                    ),
                  ),
                if (_step > 0) const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () {
                      if (!isLast) {
                        setState(() => _step++);
                      } else {
                        Navigator.pop(context);
                        widget.onSetupAccount?.call();
                      }
                    },
                    child: Text(isLast ? 'Mulai Sekarang' : 'Lanjut'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
