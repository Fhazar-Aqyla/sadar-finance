import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class Avatar2DPreset {
  final String id; // e.g. 'avatar2d:si_hemat'
  final String name;
  final String roleTag;
  final int requiredLevel;
  final Color bgStart;
  final Color bgEnd;
  final Color skinColor;
  final Color hairColor;
  final Color shirtColor;
  final int hairStyle; // 0: short spiky, 1: bob, 2: hijab, 3: curly, 4: cap, 5: crown, 6: bun, 7: parted
  final int accessory; // 0: none, 1: round glasses, 2: sunglasses, 3: headset, 4: gold chain/badge
  final int expression; // 0: happy smile, 1: confident grin, 2: wink, 3: calm smile

  const Avatar2DPreset({
    required this.id,
    required this.name,
    required this.roleTag,
    this.requiredLevel = 1,
    required this.bgStart,
    required this.bgEnd,
    required this.skinColor,
    required this.hairColor,
    required this.shirtColor,
    required this.hairStyle,
    this.accessory = 0,
    this.expression = 0,
  });

  static const List<Avatar2DPreset> catalog = [
    Avatar2DPreset(
      id: 'avatar2d:si_hemat',
      name: 'Si Hemat',
      roleTag: 'Penjaga Anggaran',
      requiredLevel: 1,
      bgStart: Color(0xFFDBEAFE),
      bgEnd: Color(0xFF93C5FD),
      skinColor: Color(0xFFFAD2B8),
      hairColor: Color(0xFF1E293B),
      shirtColor: Color(0xFF1E3A8A),
      hairStyle: 0,
      accessory: 1,
      expression: 0,
    ),
    Avatar2DPreset(
      id: 'avatar2d:boss_cuan',
      name: 'Boss Cuan',
      roleTag: 'Strategis Arus Kas',
      requiredLevel: 1,
      bgStart: Color(0xFFCCFBF1),
      bgEnd: Color(0xFF5EEAD4),
      skinColor: Color(0xFFF3C6A5),
      hairColor: Color(0xFF0F172A),
      shirtColor: Color(0xFF0F766E),
      hairStyle: 7,
      accessory: 2,
      expression: 1,
    ),
    Avatar2DPreset(
      id: 'avatar2d:hijab_cerdas',
      name: 'Sadar Syariah',
      roleTag: 'Perencana Bijak',
      requiredLevel: 1,
      bgStart: Color(0xFFFCE7F3),
      bgEnd: Color(0xFFF9A8D4),
      skinColor: Color(0xFFFCE0C8),
      hairColor: Color(0xFF9D174D),
      shirtColor: Color(0xFFBE185D),
      hairStyle: 2,
      accessory: 1,
      expression: 0,
    ),
    Avatar2DPreset(
      id: 'avatar2d:mahasiswa_sadar',
      name: 'Mahasiswa Sadar',
      roleTag: 'Anti Boncos Akhir Bulan',
      requiredLevel: 1,
      bgStart: Color(0xFFFEF3C7),
      bgEnd: Color(0xFFFCD34D),
      skinColor: Color(0xFFF5CBA7),
      hairColor: Color(0xFF27272A),
      shirtColor: Color(0xFFD97706),
      hairStyle: 4,
      accessory: 3,
      expression: 2,
    ),
    Avatar2DPreset(
      id: 'avatar2d:ratu_budget',
      name: 'Ratu Budget',
      roleTag: 'Disiplin 50/30/20',
      requiredLevel: 1,
      bgStart: Color(0xFFEDE9FE),
      bgEnd: Color(0xFFC4B5FD),
      skinColor: Color(0xFFFAD7C0),
      hairColor: Color(0xFF3F2305),
      shirtColor: Color(0xFF6D28D9),
      hairStyle: 1,
      accessory: 0,
      expression: 0,
    ),
    Avatar2DPreset(
      id: 'avatar2d:freelancer',
      name: 'Kreator Mandiri',
      roleTag: 'Multi Sumber Income',
      requiredLevel: 1,
      bgStart: Color(0xFFE0E7FF),
      bgEnd: Color(0xFF818CF8),
      skinColor: Color(0xFFEAB69B),
      hairColor: Color(0xFF18181B),
      shirtColor: Color(0xFF3730A3),
      hairStyle: 3,
      accessory: 3,
      expression: 1,
    ),
    Avatar2DPreset(
      id: 'avatar2d:akuntan_rapi',
      name: 'Akuntan Rapi',
      roleTag: 'Pencatat Detail',
      requiredLevel: 1,
      bgStart: Color(0xFFD1FAE5),
      bgEnd: Color(0xFF6EE7B7),
      skinColor: Color(0xFFF8D5B8),
      hairColor: Color(0xFF1E293B),
      shirtColor: Color(0xFF047857),
      hairStyle: 6,
      accessory: 1,
      expression: 3,
    ),
    Avatar2DPreset(
      id: 'avatar2d:investor_muda',
      name: 'Investor Muda',
      roleTag: 'Fokus Tabungan 20%',
      requiredLevel: 1,
      bgStart: Color(0xFFE0F2FE),
      bgEnd: Color(0xFF38BDF8),
      skinColor: Color(0xFFF2C2A2),
      hairColor: Color(0xFF0F172A),
      shirtColor: Color(0xFF0369A1),
      hairStyle: 7,
      accessory: 0,
      expression: 1,
    ),
    Avatar2DPreset(
      id: 'avatar2d:pejuang_darurat',
      name: 'Pejuang Darurat',
      roleTag: 'Terbuka di Level 2',
      requiredLevel: 2,
      bgStart: Color(0xFFDCFCE7),
      bgEnd: Color(0xFF4ADE80),
      skinColor: Color(0xFFF5CBA7),
      hairColor: Color(0xFF065F46),
      shirtColor: Color(0xFF15803D),
      hairStyle: 2,
      accessory: 4,
      expression: 0,
    ),
    Avatar2DPreset(
      id: 'avatar2d:digital_nomad',
      name: 'Digital Nomad',
      roleTag: 'Terbuka di Level 2',
      requiredLevel: 2,
      bgStart: Color(0xFFFFEDD5),
      bgEnd: Color(0xFFFB923C),
      skinColor: Color(0xFFE8B49A),
      hairColor: Color(0xFF292524),
      shirtColor: Color(0xFFC2410C),
      hairStyle: 4,
      accessory: 2,
      expression: 2,
    ),
    Avatar2DPreset(
      id: 'avatar2d:raja_cashflow',
      name: 'Raja Cashflow',
      roleTag: 'Terbuka di Level 2',
      requiredLevel: 2,
      bgStart: Color(0xFFCFFAFE),
      bgEnd: Color(0xFF22D3EE),
      skinColor: Color(0xFFF3C6A5),
      hairColor: Color(0xFF0F172A),
      shirtColor: Color(0xFF0E7490),
      hairStyle: 0,
      accessory: 4,
      expression: 1,
    ),
    Avatar2DPreset(
      id: 'avatar2d:analis_muda',
      name: 'Analis Finansial',
      roleTag: 'Terbuka di Level 3',
      requiredLevel: 3,
      bgStart: Color(0xFFF3E8FF),
      bgEnd: Color(0xFFA855F7),
      skinColor: Color(0xFFFAD7C0),
      hairColor: Color(0xFF3B0764),
      shirtColor: Color(0xFF6B21A8),
      hairStyle: 6,
      accessory: 1,
      expression: 2,
    ),
    Avatar2DPreset(
      id: 'avatar2d:penabung_emas',
      name: 'Penabung Emas',
      roleTag: 'Terbuka di Level 3',
      requiredLevel: 3,
      bgStart: Color(0xFFFEF08A),
      bgEnd: Color(0xFFEAB308),
      skinColor: Color(0xFFF6CBA8),
      hairColor: Color(0xFF422006),
      shirtColor: Color(0xFFA16207),
      hairStyle: 1,
      accessory: 4,
      expression: 0,
    ),
    Avatar2DPreset(
      id: 'avatar2d:minimalis',
      name: 'Minimalis Tenang',
      roleTag: 'Terbuka di Level 3',
      requiredLevel: 3,
      bgStart: Color(0xFFE2E8F0),
      bgEnd: Color(0xFF94A3B8),
      skinColor: Color(0xFFF8D5B8),
      hairColor: Color(0xFF334155),
      shirtColor: Color(0xFF1E293B),
      hairStyle: 3,
      accessory: 1,
      expression: 3,
    ),
    Avatar2DPreset(
      id: 'avatar2d:sultan_sabar',
      name: 'Sultan Sabar',
      roleTag: 'Terbuka di Level 4',
      requiredLevel: 4,
      bgStart: Color(0xFFBAE6FD),
      bgEnd: Color(0xFF0284C7),
      skinColor: Color(0xFFF2C2A2),
      hairColor: Color(0xFF0F172A),
      shirtColor: Color(0xFF075985),
      hairStyle: 5,
      accessory: 2,
      expression: 1,
    ),
    Avatar2DPreset(
      id: 'avatar2d:master_503020',
      name: 'Master 50/30/20',
      roleTag: 'Avatar Legendaris Level 5',
      requiredLevel: 5,
      bgStart: Color(0xFFFDE68A),
      bgEnd: Color(0xFFF59E0B),
      skinColor: Color(0xFFFAD2B8),
      hairColor: Color(0xFF1E293B),
      shirtColor: Color(0xFF0F172A),
      hairStyle: 5,
      accessory: 4,
      expression: 1,
    ),
  ];

  static Avatar2DPreset? fromId(String? raw) {
    if (raw == null || !raw.startsWith('avatar2d:')) return null;
    for (final p in catalog) {
      if (p.id == raw) return p;
    }
    return catalog.first;
  }
}

/// Renders a crisp 2D Flat Vector Character Avatar at any size.
class Avatar2DWidget extends StatelessWidget {
  final Avatar2DPreset preset;
  final double size;

  const Avatar2DWidget({
    super.key,
    required this.preset,
    this.size = 64,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _Avatar2DPainter(preset),
      ),
    );
  }
}

class _Avatar2DPainter extends CustomPainter {
  final Avatar2DPreset p;

  const _Avatar2DPainter(this.p);

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final cx = w / 2;
    final cy = h / 2;
    final rect = Offset.zero & size;

    // 1. 2D Circular Gradient Background
    final bgPaint = Paint()
      ..shader = LinearGradient(
        colors: [p.bgStart, p.bgEnd],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(rect);
    canvas.drawCircle(Offset(cx, cy), w / 2, bgPaint);

    canvas.save();
    canvas.clipPath(Path()..addOval(rect));

    // 2. Back hair for long/bob/hijab/bun styles
    final hairPaint = Paint()..color = p.hairColor;
    if (p.hairStyle == 1) {
      // Bob back hair
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(cx, h * 0.48),
            width: w * 0.56,
            height: h * 0.46,
          ),
          Radius.circular(w * 0.22),
        ),
        hairPaint,
      );
    } else if (p.hairStyle == 2) {
      // 2D Hijab outer wrap
      canvas.drawOval(
        Rect.fromCenter(
          center: Offset(cx, h * 0.50),
          width: w * 0.62,
          height: h * 0.62,
        ),
        hairPaint,
      );
    } else if (p.hairStyle == 6) {
      // Top bun
      canvas.drawCircle(Offset(cx, h * 0.16), w * 0.12, hairPaint);
    }

    // 3. Shoulders & Shirt (2D Flat style)
    final shirtPaint = Paint()..color = p.shirtColor;
    canvas.drawRRect(
      RRect.fromRectAndCorners(
        Rect.fromLTWH(w * 0.16, h * 0.68, w * 0.68, h * 0.40),
        topLeft: Radius.circular(w * 0.24),
        topRight: Radius.circular(w * 0.24),
      ),
      shirtPaint,
    );

    // Shirt collar / V-neck detail
    final collarPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.85)
      ..style = PaintingStyle.fill;
    final collarPath = Path()
      ..moveTo(cx - w * 0.10, h * 0.68)
      ..lineTo(cx, h * 0.79)
      ..lineTo(cx + w * 0.10, h * 0.68)
      ..close();
    canvas.drawPath(collarPath, collarPaint);

    // Gold chain / badge accessory on shirt
    if (p.accessory == 4) {
      final goldPaint = Paint()
        ..color = const Color(0xFFFACC15)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.032;
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(cx, h * 0.72),
          width: w * 0.24,
          height: h * 0.16,
        ),
        0.2,
        2.74,
        false,
        goldPaint,
      );
    }

    // 4. Neck
    final skinPaint = Paint()..color = p.skinColor;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(cx, h * 0.65),
          width: w * 0.16,
          height: h * 0.16,
        ),
        Radius.circular(w * 0.06),
      ),
      skinPaint,
    );

    // Neck shadow
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(cx, h * 0.61),
        width: w * 0.16,
        height: h * 0.10,
      ),
      0,
      3.14,
      true,
      Paint()..color = Colors.black.withValues(alpha: 0.10),
    );

    // 5. Ears
    if (p.hairStyle != 2) {
      canvas.drawCircle(Offset(cx - w * 0.23, h * 0.45), w * 0.055, skinPaint);
      canvas.drawCircle(Offset(cx + w * 0.23, h * 0.45), w * 0.055, skinPaint);
    }

    // 6. Head (2D rounded oval)
    final headRect = Rect.fromCenter(
      center: Offset(cx, h * 0.44),
      width: w * 0.45,
      height: h * 0.48,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(headRect, Radius.circular(w * 0.20)),
      skinPaint,
    );

    // Subtle 2D Rosy Cheeks
    final cheekPaint = Paint()
      ..color = const Color(0xFFF43F5E).withValues(alpha: 0.22);
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx - w * 0.12, h * 0.49),
        width: w * 0.075,
        height: h * 0.045,
      ),
      cheekPaint,
    );
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx + w * 0.12, h * 0.49),
        width: w * 0.075,
        height: h * 0.045,
      ),
      cheekPaint,
    );

    // 7. Front Hair / Cap / Crown
    if (p.hairStyle == 0 || p.hairStyle == 7 || p.hairStyle == 6) {
      // Clean parted / spiky 2D top hair
      final topHair = Path()
        ..moveTo(cx - w * 0.23, h * 0.40)
        ..quadraticBezierTo(cx - w * 0.24, h * 0.17, cx, h * 0.18)
        ..quadraticBezierTo(cx + w * 0.24, h * 0.17, cx + w * 0.23, h * 0.40)
        ..quadraticBezierTo(cx + w * 0.08, h * 0.27, cx - w * 0.06, h * 0.30)
        ..close();
      canvas.drawPath(topHair, hairPaint);
    } else if (p.hairStyle == 1) {
      // Bob bangs
      final bangs = Path()
        ..moveTo(cx - w * 0.24, h * 0.38)
        ..quadraticBezierTo(cx, h * 0.16, cx + w * 0.24, h * 0.38)
        ..quadraticBezierTo(cx, h * 0.28, cx - w * 0.24, h * 0.38)
        ..close();
      canvas.drawPath(bangs, hairPaint);
    } else if (p.hairStyle == 3) {
      // Curly puffs
      for (final dx in [-0.16, -0.06, 0.06, 0.16]) {
        canvas.drawCircle(
          Offset(cx + w * dx, h * 0.24),
          w * 0.095,
          hairPaint,
        );
      }
    } else if (p.hairStyle == 4) {
      // 2D Cap / Visor Hat
      final capPaint = Paint()..color = p.shirtColor;
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(cx, h * 0.34),
          width: w * 0.48,
          height: h * 0.34,
        ),
        3.14,
        3.14,
        true,
        capPaint,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(cx + w * 0.05, h * 0.33),
            width: w * 0.54,
            height: h * 0.06,
          ),
          Radius.circular(w * 0.03),
        ),
        capPaint,
      );
    } else if (p.hairStyle == 5) {
      // Hair + Gold Crown
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(cx, h * 0.34),
          width: w * 0.46,
          height: h * 0.30,
        ),
        3.14,
        3.14,
        true,
        hairPaint,
      );
      final crownPaint = Paint()..color = const Color(0xFFFACC15);
      final crown = Path()
        ..moveTo(cx - w * 0.15, h * 0.23)
        ..lineTo(cx - w * 0.17, h * 0.11)
        ..lineTo(cx - w * 0.07, h * 0.17)
        ..lineTo(cx, h * 0.09)
        ..lineTo(cx + w * 0.07, h * 0.17)
        ..lineTo(cx + w * 0.17, h * 0.11)
        ..lineTo(cx + w * 0.15, h * 0.23)
        ..close();
      canvas.drawPath(crown, crownPaint);
    }

    // 8. Eyes & Eyebrows
    final eyePaint = Paint()..color = const Color(0xFF0F172A);
    final eyeY = h * 0.43;
    final leftEyeX = cx - w * 0.095;
    final rightEyeX = cx + w * 0.095;

    // Left eye
    canvas.drawCircle(Offset(leftEyeX, eyeY), w * 0.028, eyePaint);
    canvas.drawCircle(
      Offset(leftEyeX - w * 0.008, eyeY - h * 0.008),
      w * 0.009,
      Paint()..color = Colors.white,
    );

    // Right eye (wink if expression == 2)
    if (p.expression == 2) {
      final winkPaint = Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.026
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(rightEyeX, eyeY),
          width: w * 0.06,
          height: h * 0.04,
        ),
        3.4,
        2.6,
        false,
        winkPaint,
      );
    } else {
      canvas.drawCircle(Offset(rightEyeX, eyeY), w * 0.028, eyePaint);
      canvas.drawCircle(
        Offset(rightEyeX - w * 0.008, eyeY - h * 0.008),
        w * 0.009,
        Paint()..color = Colors.white,
      );
    }

    // 9. Mouth / Smile
    final mouthPaint = Paint()
      ..color = const Color(0xFF0F172A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.026
      ..strokeCap = StrokeCap.round;

    if (p.expression == 1) {
      // Confident white grin
      final grinRect = Rect.fromCenter(
        center: Offset(cx, h * 0.52),
        width: w * 0.15,
        height: h * 0.08,
      );
      canvas.drawArc(grinRect, 0, 3.14, true, Paint()..color = Colors.white);
      canvas.drawArc(grinRect, 0, 3.14, true, mouthPaint);
    } else {
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(cx, h * 0.51),
          width: w * 0.13,
          height: h * 0.07,
        ),
        0.2,
        2.74,
        false,
        mouthPaint,
      );
    }

    // 10. Accessories (Glasses / Sunglasses / Headset)
    if (p.accessory == 1) {
      // 2D Round Glasses
      final glassPaint = Paint()
        ..color = const Color(0xFF1E293B)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.022;
      canvas.drawCircle(Offset(leftEyeX, eyeY), w * 0.065, glassPaint);
      canvas.drawCircle(Offset(rightEyeX, eyeY), w * 0.065, glassPaint);
      canvas.drawLine(
        Offset(leftEyeX + w * 0.065, eyeY),
        Offset(rightEyeX - w * 0.065, eyeY),
        glassPaint,
      );
    } else if (p.accessory == 2) {
      // Cool 2D Sunglasses
      final sunFill = Paint()..color = const Color(0xFF0F172A);
      final leftLens = RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(leftEyeX, eyeY),
          width: w * 0.14,
          height: h * 0.09,
        ),
        Radius.circular(w * 0.025),
      );
      final rightLens = RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(rightEyeX, eyeY),
          width: w * 0.14,
          height: h * 0.09,
        ),
        Radius.circular(w * 0.025),
      );
      canvas.drawRRect(leftLens, sunFill);
      canvas.drawRRect(rightLens, sunFill);
      canvas.drawLine(
        Offset(leftEyeX - w * 0.07, eyeY - h * 0.01),
        Offset(rightEyeX + w * 0.07, eyeY - h * 0.01),
        Paint()
          ..color = const Color(0xFFFACC15)
          ..strokeWidth = w * 0.022,
      );
    } else if (p.accessory == 3) {
      // 2D Headset
      final hsPaint = Paint()
        ..color = const Color(0xFF0F172A)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.032;
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(cx, h * 0.43),
          width: w * 0.52,
          height: h * 0.50,
        ),
        3.14,
        3.14,
        false,
        hsPaint,
      );
      final earCupPaint = Paint()..color = AppColors.accent;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(cx - w * 0.25, h * 0.45),
            width: w * 0.07,
            height: h * 0.13,
          ),
          Radius.circular(w * 0.03),
        ),
        earCupPaint,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(cx + w * 0.25, h * 0.45),
            width: w * 0.07,
            height: h * 0.13,
          ),
          Radius.circular(w * 0.03),
        ),
        earCupPaint,
      );
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _Avatar2DPainter oldDelegate) =>
      oldDelegate.p.id != p.id;
}
