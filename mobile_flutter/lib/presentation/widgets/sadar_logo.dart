import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum SadarLogoVariant {
  /// White SADAR wordmark + green triangle (identical to landing page dark footer)
  light,

  /// Deep navy SADAR wordmark + green triangle (identical to landing page navbar)
  dark,

  /// Auto-adapts based on current Theme brightness
  adaptive,
}

/// Official SADAR Finance logo — 100% consistent with the Landing Page brand mark.
class SadarLogo extends StatelessWidget {
  final SadarLogoVariant variant;
  final double height;
  final bool showFinanceSubtitle;
  final CrossAxisAlignment alignment;

  const SadarLogo({
    super.key,
    this.variant = SadarLogoVariant.adaptive,
    this.height = 24,
    this.showFinanceSubtitle = false,
    this.alignment = CrossAxisAlignment.center,
  });

  @override
  Widget build(BuildContext context) {
    final isDarkTheme = Theme.of(context).brightness == Brightness.dark;
    final useLightAsset = switch (variant) {
      SadarLogoVariant.light => true,
      SadarLogoVariant.dark => false,
      SadarLogoVariant.adaptive => isDarkTheme,
    };

    final assetPath = useLightAsset
        ? 'assets/images/logo-sadar-light.png'
        : 'assets/images/sadar-logo.png';

    return Image.asset(
      assetPath,
      height: height,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      errorBuilder: (_, _, _) => Text(
        'SADAR',
        style: TextStyle(
          fontSize: height,
          fontWeight: FontWeight.w900,
          letterSpacing: 3.5,
          color: useLightAsset ? Colors.white : AppColors.brandNavy,
          height: 1.0,
        ),
      ),
    );
  }
}
