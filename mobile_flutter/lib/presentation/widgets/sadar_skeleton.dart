import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class SadarSkeletonBox extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SadarSkeletonBox({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 14,
  });

  @override
  State<SadarSkeletonBox> createState() => _SadarSkeletonBoxState();
}

class _SadarSkeletonBoxState extends State<SadarSkeletonBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = AppColors.isDark(context);
    final baseColor =
        isDark ? const Color(0xFF1E2B45) : const Color(0xFFE2E8F0);
    final highlightColor =
        isDark ? const Color(0xFF2B3D60) : const Color(0xFFF1F5F9);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: Color.lerp(baseColor, highlightColor, _controller.value),
            borderRadius: BorderRadius.circular(widget.borderRadius),
          ),
        );
      },
    );
  }
}

class DashboardSkeletonSection extends StatelessWidget {
  const DashboardSkeletonSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SadarSkeletonBox(height: 110, borderRadius: 18),
        SizedBox(height: 14),
        Row(
          children: [
            Expanded(child: SadarSkeletonBox(height: 86, borderRadius: 16)),
            SizedBox(width: 12),
            Expanded(child: SadarSkeletonBox(height: 86, borderRadius: 16)),
          ],
        ),
        SizedBox(height: 14),
        SadarSkeletonBox(height: 140, borderRadius: 18),
      ],
    );
  }
}
