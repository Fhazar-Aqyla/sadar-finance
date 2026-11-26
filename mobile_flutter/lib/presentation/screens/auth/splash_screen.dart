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
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 520),
              curve: Curves.easeOutCubic,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Transform.scale(
                    scale: 0.90 + (0.10 * value),
                    child: child,
                  ),
                );
              },
              child: const SadarLogo(
                variant: SadarLogoVariant.adaptive,
                height: 38,
                showFinanceSubtitle: true,
                alignment: CrossAxisAlignment.center,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
