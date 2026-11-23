import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Official 4-color Google 'G' vector logo rendered via CustomPainter.
class GoogleLogoIcon extends StatelessWidget {
  final double size;
  final bool withBadgeBackground;

  const GoogleLogoIcon({
    super.key,
    this.size = 20,
    this.withBadgeBackground = false,
  });

  @override
  Widget build(BuildContext context) {
    final logo = SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
    if (!withBadgeBackground) return logo;
    return Container(
      width: size + 12,
      height: size + 12,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular((size + 12) * 0.32),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: logo,
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  static const Color _blue = Color(0xFF4285F4);
  static const Color _red = Color(0xFFEA4335);
  static const Color _yellow = Color(0xFFFBBC05);
  static const Color _green = Color(0xFF34A853);

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * 0.21;
    final radius = (size.width - stroke) / 2;
    final center = Offset(size.width / 2, size.height / 2);
    final rect = Rect.fromCircle(center: center, radius: radius);

    final arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt
      ..isAntiAlias = true;

    double deg(double d) => d * math.pi / 180.0;

    // Red top-left to top-right (-150 deg to -42 deg)
    arcPaint.color = _red;
    canvas.drawArc(rect, deg(-152), deg(110), false, arcPaint);

    // Yellow left (-152 deg down to 152 deg -> 148 to 208)
    arcPaint.color = _yellow;
    canvas.drawArc(rect, deg(148), deg(60), false, arcPaint);

    // Green bottom (42 deg to 148 deg)
    arcPaint.color = _green;
    canvas.drawArc(rect, deg(42), deg(106), false, arcPaint);

    // Blue right-bottom (-8 deg to 42 deg)
    arcPaint.color = _blue;
    canvas.drawArc(rect, deg(-10), deg(54), false, arcPaint);

    // Blue horizontal crossbar of the 'G'
    final barPaint = Paint()
      ..color = _blue
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;
    final barHeight = stroke * 0.92;
    final barRect = RRect.fromRectAndCorners(
      Rect.fromLTWH(
        center.dx,
        center.dy - barHeight * 0.48,
        radius + stroke * 0.48,
        barHeight,
      ),
      topRight: Radius.circular(stroke * 0.2),
      bottomRight: Radius.circular(stroke * 0.2),
    );
    canvas.drawRRect(barRect, barPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
