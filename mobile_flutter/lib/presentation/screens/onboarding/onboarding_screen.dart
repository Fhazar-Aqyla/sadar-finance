import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/sadar_logo.dart';

class _SlideData {
  final IconData icon;
  final Color iconBgLight;
  final Color iconColorLight;
  final Color iconColorDark;
  final String eyebrow;
  final String title;
  final String highlightWord;
  final String description;
  final List<String> highlights;

  const _SlideData({
    required this.icon,
    required this.iconBgLight,
    required this.iconColorLight,
    required this.iconColorDark,
    required this.eyebrow,
    required this.title,
    required this.highlightWord,
    required this.description,
    required this.highlights,
  });
}

/// Clean Welcome / Introduction Slides matching the official SADAR Finance
/// web landing page style (airy sky-blue gradient + crisp white cards + #1E3A8A CTA).
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _pageIndex = 0;

  static const _slides = [
    _SlideData(
      icon: Icons.account_balance_wallet_outlined,
      iconBgLight: Color(0xFFEFF6FF),
      iconColorLight: AppColors.primary,
      iconColorDark: AppColors.darkPrimary,
      eyebrow: 'MANAJEMEN ARUS KAS',
      title: 'Bikin kamu lebih sadar sama',
      highlightWord: 'budget',
      description:
          'Kelola pemasukan, pengeluaran, rekening bank, dan e-wallet dalam satu tempat supaya mudah melihat ke mana uang berjalan.',
      highlights: [
        'Total saldo gabungan real-time di semua akun',
        'Grafik arus kas bulanan & tren belanja 7 hari',
      ],
    ),
    _SlideData(
      icon: Icons.document_scanner_outlined,
      iconBgLight: Color(0xFFF0F9FF),
      iconColorLight: Color(0xFF0284C7),
      iconColorDark: Color(0xFF38BDF8),
      eyebrow: 'PENCATATAN CERDAS',
      title: 'Catat transaksi & pindai',
      highlightWord: 'struk otomatis',
      description:
          'Foto struk belanja atau catat manual dalam hitungan detik dengan pengelompokan otomatis metode 50 / 30 / 20.',
      highlights: [
        'Ekstraksi nominal, merchant & tanggal otomatis',
        'Kontrol batas Kebutuhan, Keinginan & Tabungan',
      ],
    ),
    _SlideData(
      icon: Icons.insights_outlined,
      iconBgLight: Color(0xFFECFDF5),
      iconColorLight: Color(0xFF059669),
      iconColorDark: Color(0xFF34D399),
      eyebrow: 'SKOR & ANALITIK PERILAKU',
      title: 'Pahami pola belanja & jaga',
      highlightWord: 'skor finansial',
      description:
          'Deteksi kebiasaan belanja boros lebih awal, pantau proyeksi akhir bulan, dan bangun kesehatan finansial yang lebih tenang.',
      highlights: [
        'Skor kesehatan finansial objektif 0–100',
        'Peringatan dini sebelum anggaran melampaui batas',
      ],
    ),
    _SlideData(
      icon: Icons.cloud_done_outlined,
      iconBgLight: Color(0xFFEFF6FF),
      iconColorLight: AppColors.primary,
      iconColorDark: AppColors.darkPrimary,
      eyebrow: 'SIAP ONLINE & OFFLINE',
      title: 'Data tersimpan aman &',
      highlightWord: 'sinkron otomatis',
      description:
          'Tetap bisa membuka aplikasi dan mencatat transaksi walau sedang tanpa internet. Data otomatis dikirim ke server saat kembali online.',
      highlights: [
        'Penyimpanan lokal terenkripsi di perangkat Anda',
        'Sinkronisasi otomatis begitu koneksi terhubung',
      ],
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finishToLogin() async {
    await ref.read(uiPreferencesProvider.notifier).markOnboardingSeen();
    if (!mounted) return;
    final loggedIn = ref.read(authProvider).status == AuthStatus.authenticated;
    if (loggedIn) {
      context.go('/dashboard');
    } else {
      context.go('/login');
    }
  }

  Future<void> _finishToRegister() async {
    await ref.read(uiPreferencesProvider.notifier).markOnboardingSeen();
    if (!mounted) return;
    context.go('/login');
    context.push('/register');
  }

  void _nextSlide() {
    if (_pageIndex < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final isLast = _pageIndex == _slides.length - 1;
    final loggedIn = ref.watch(authProvider).status == AuthStatus.authenticated;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isDark
                ? const [
                    Color(0xFF0B1120),
                    Color(0xFF0F1B33),
                    Color(0xFF0B1120),
                  ]
                : const [
                    Color(0xFFDBEAFE),
                    Color(0xFFEEF2FF),
                    Color(0xFFF8FAFC),
                  ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Top bar: Official Landing-Page SADAR Logo + Lewati
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 14, 14, 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SadarLogo(
                      variant: SadarLogoVariant.adaptive,
                      height: 24,
                    ),
                    TextButton(
                      onPressed: _finishToLogin,
                      child: Text(
                        loggedIn ? 'Tutup' : (isLast ? '' : 'Lewati'),
                        style: TextStyle(
                          color: AppColors.textSecondaryOf(context),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Slides
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: _slides.length,
                  onPageChanged: (i) => setState(() => _pageIndex = i),
                  itemBuilder: (context, index) {
                    final slide = _slides[index];
                    final iconColor =
                        isDark ? slide.iconColorDark : slide.iconColorLight;
                    final iconBg = isDark
                        ? slide.iconColorDark.withValues(alpha: 0.14)
                        : slide.iconBgLight;

                    return LayoutBuilder(
                      builder: (context, constraints) => SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(
                            minHeight: (constraints.maxHeight - 24)
                                .clamp(0, double.infinity),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Clean Landing-Style Card Emblem
                              Container(
                                width: 88,
                                height: 88,
                                decoration: BoxDecoration(
                                  color: iconBg,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: iconColor.withValues(alpha: 0.2),
                                  ),
                                  boxShadow: isDark
                                      ? null
                                      : [
                                          BoxShadow(
                                            color: iconColor
                                                .withValues(alpha: 0.1),
                                            blurRadius: 20,
                                            offset: const Offset(0, 8),
                                          ),
                                        ],
                                ),
                                child: Icon(
                                  slide.icon,
                                  size: 42,
                                  color: iconColor,
                                ),
                              ),
                              const SizedBox(height: 22),

                              // Subtle Eyebrow Pill (matching web landing)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? AppColors.darkSurface
                                      : Colors.white.withValues(alpha: 0.85),
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(
                                    color: AppColors.borderOf(context),
                                  ),
                                ),
                                child: Text(
                                  slide.eyebrow,
                                  style: TextStyle(
                                    color: AppColors.primaryOf(context),
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Headline matching Landing Page two-tone typography
                              Text.rich(
                                TextSpan(
                                  text: '${slide.title}\n',
                                  style: TextStyle(
                                    color: AppColors.textPrimaryOf(context),
                                    fontSize: 26,
                                    fontWeight: FontWeight.w800,
                                    height: 1.2,
                                    letterSpacing: -0.5,
                                  ),
                                  children: [
                                    TextSpan(
                                      text: slide.highlightWord,
                                      style: TextStyle(
                                        color: isDark
                                            ? AppColors.darkAccent
                                            : AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 12),

                              Text(
                                slide.description,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: AppColors.textSecondaryOf(context),
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 22),

                              // Clean White Info Card (matching Landing Page Bento cards)
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceOf(context),
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(
                                    color: AppColors.borderOf(context),
                                  ),
                                  boxShadow: isDark
                                      ? null
                                      : [
                                          BoxShadow(
                                            color: const Color(0xFF0F172A)
                                                .withValues(alpha: 0.04),
                                            blurRadius: 16,
                                            offset: const Offset(0, 6),
                                          ),
                                        ],
                                ),
                                child: Column(
                                  children: slide.highlights
                                      .map(
                                        (h) => Padding(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 5,
                                          ),
                                          child: Row(
                                            children: [
                                              const Icon(
                                                Icons.check_circle_rounded,
                                                size: 18,
                                                color: AppColors.success,
                                              ),
                                              const SizedBox(width: 10),
                                              Expanded(
                                                child: Text(
                                                  h,
                                                  style: TextStyle(
                                                    color: AppColors
                                                        .textPrimaryOf(context),
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      )
                                      .toList(),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Bottom Controls
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_slides.length, (i) {
                        final active = i == _pageIndex;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 240),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: active ? 26 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: active
                                ? AppColors.primaryOf(context)
                                : AppColors.borderOf(context),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 20),
                    if (!isLast)
                      SizedBox(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _nextSlide,
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Lanjut'),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward_rounded, size: 19),
                            ],
                          ),
                        ),
                      )
                    else if (loggedIn)
                      SizedBox(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _finishToLogin,
                          child: const Text('Kembali ke Beranda'),
                        ),
                      )
                    else ...[
                      SizedBox(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _finishToLogin,
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Mulai Sekarang'),
                              SizedBox(width: 8),
                              Icon(Icons.arrow_forward_rounded, size: 19),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 48,
                        child: OutlinedButton(
                          onPressed: _finishToRegister,
                          style: OutlinedButton.styleFrom(
                            backgroundColor: AppColors.surfaceOf(context),
                          ),
                          child: const Text('Buat Akun Baru'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
