import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/app_theme.dart';
import 'avatar_2d_preset.dart';

/// Displays a user's avatar from:
/// 1) Local File preview (while uploading),
/// 2) Base64 Data URI (`data:image/...;base64,...`) returned by SADAR backend,
/// 3) HTTP/HTTPS or `/uploads/...` URL,
/// 4) Fallback crisp initials circle (never blanks on error).
class UserAvatar extends StatelessWidget {
  final String? profilePicture;
  final String apiBaseUrl;
  final String initials;
  final double radius;
  final File? localFile;
  final bool isLoading;

  const UserAvatar({
    super.key,
    required this.profilePicture,
    required this.apiBaseUrl,
    required this.initials,
    this.radius = 30,
    this.localFile,
    this.isLoading = false,
  });

  Uint8List? _tryDecodeDataUri(String raw) {
    final commaIdx = raw.indexOf(',');
    if (commaIdx < 0) return null;
    try {
      return base64Decode(raw.substring(commaIdx + 1).trim());
    } catch (_) {
      return null;
    }
  }

  Widget _buildInitials(BuildContext context) {
    final primary = AppColors.primaryOf(context);
    return Center(
      child: Text(
        initials,
        style: TextStyle(
          fontSize: radius * 0.65,
          fontWeight: FontWeight.w800,
          color: primary,
        ),
      ),
    );
  }

  Widget _buildImage(BuildContext context) {
    if (localFile != null && localFile!.existsSync()) {
      return Image.file(
        localFile!,
        width: radius * 2,
        height: radius * 2,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _buildInitials(context),
      );
    }

    final raw = profilePicture?.trim() ?? '';
    if (raw.isEmpty) return _buildInitials(context);

    if (raw.startsWith('avatar2d:')) {
      final preset = Avatar2DPreset.fromId(raw) ?? Avatar2DPreset.catalog.first;
      return Avatar2DWidget(preset: preset, size: radius * 2);
    }

    if (raw.startsWith('data:')) {
      final bytes = _tryDecodeDataUri(raw);
      if (bytes != null && bytes.isNotEmpty) {
        return Image.memory(
          bytes,
          width: radius * 2,
          height: radius * 2,
          fit: BoxFit.cover,
          gaplessPlayback: true,
          errorBuilder: (_, _, _) => _buildInitials(context),
        );
      }
      return _buildInitials(context);
    }

    final resolved = AppConfig.resolveUploadUrl(raw, apiBaseUrl);
    if (resolved.isEmpty) return _buildInitials(context);

    return Image.network(
      resolved,
      width: radius * 2,
      height: radius * 2,
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => _buildInitials(context),
      loadingBuilder: (_, child, progress) {
        if (progress == null) return child;
        return _buildInitials(context);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final primary = AppColors.primaryOf(context);
    final size = radius * 2;

    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: primary.withValues(alpha: 0.14),
            border: Border.all(
              color: AppColors.borderOf(context),
              width: 1.5,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: _buildImage(context),
        ),
        if (isLoading)
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.black.withValues(alpha: 0.45),
            ),
            child: const Center(
              child: SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  color: Colors.white,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
