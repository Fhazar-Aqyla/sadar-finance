import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/sadar_logo.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);

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
                    Color(0xFFEFF6FF),
                    Color(0xFFF8FAFC),
                  ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SadarLogo(
                    variant: SadarLogoVariant.adaptive,
                    height: 38,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Kelola Keuangan Pribadi Lebih Sadar',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textSecondaryOf(context),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 36),
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.primaryOf(context),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
