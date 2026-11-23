import 'package:flutter/material.dart';
import 'package:shorebird_code_push/shorebird_code_push.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/config/app_config.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';

enum UpdateCheckOutcome {
  upToDate,
  otaDownloadedRestartRequired,
  nativeUpdateAvailable,
  offlineOrUnavailable,
}

class AppUpdateCheckResult {
  final UpdateCheckOutcome outcome;
  final String message;
  final String? latestVersion;
  final int? latestBuildNumber;
  final bool forceUpdate;
  final List<String> releaseNotes;
  final String? downloadUrl;
  final int? currentPatchNumber;

  const AppUpdateCheckResult({
    required this.outcome,
    required this.message,
    this.latestVersion,
    this.latestBuildNumber,
    this.forceUpdate = false,
    this.releaseNotes = const [],
    this.downloadUrl,
    this.currentPatchNumber,
  });
}

/// Dual-layer Auto-Update Service:
/// 1) Shorebird Code Push OTA — updates Dart code silently WITHOUT reinstalling APK.
/// 2) Self-hosted backend `/api/v1/app/version` — detects major native APK releases.
class AppUpdateService {
  final ApiClient _client;
  final ShorebirdUpdater _shorebird = ShorebirdUpdater();

  AppUpdateService(this._client);

  bool get isOtaSupported {
    try {
      return _shorebird.isAvailable;
    } catch (_) {
      return false;
    }
  }

  Future<int?> getCurrentPatchNumber() async {
    try {
      if (!_shorebird.isAvailable) return null;
      final patch = await _shorebird.readCurrentPatch();
      return patch?.number;
    } catch (_) {
      return null;
    }
  }

  /// Silent background OTA patch download on app startup.
  /// Returns true if a new patch was downloaded and ready on next restart.
  Future<bool> checkSilentOtaOnLaunch() async {
    try {
      if (!_shorebird.isAvailable) return false;
      final status = await _shorebird.checkForUpdate();
      if (status == UpdateStatus.outdated) {
        await _shorebird.update();
        return true;
      }
      return status == UpdateStatus.restartRequired;
    } catch (_) {
      return false;
    }
  }

  /// Full manual check: tries Shorebird OTA first, then checks backend version metadata.
  Future<AppUpdateCheckResult> checkForUpdates() async {
    int? currentPatch;

    // 1. Check Shorebird OTA (zero-reinstall code push)
    try {
      if (_shorebird.isAvailable) {
        currentPatch = (await _shorebird.readCurrentPatch())?.number;
        final status = await _shorebird.checkForUpdate();
        if (status == UpdateStatus.outdated) {
          await _shorebird.update();
          return AppUpdateCheckResult(
            outcome: UpdateCheckOutcome.otaDownloadedRestartRequired,
            message:
                'Pembaruan otomatis berhasil diunduh tanpa perlu install ulang APK. Tutup dan buka kembali aplikasi untuk menerapkan versi terbaru.',
            currentPatchNumber: currentPatch,
          );
        }
        if (status == UpdateStatus.restartRequired) {
          return AppUpdateCheckResult(
            outcome: UpdateCheckOutcome.otaDownloadedRestartRequired,
            message:
                'Pembaruan sudah siap diterapkan. Tutup dan buka kembali aplikasi SADAR Finance.',
            currentPatchNumber: currentPatch,
          );
        }
      }
    } catch (_) {
      // Fall through to backend version check
    }

    // 2. Check backend release version metadata for native/APK updates
    try {
      final data = await _client.get('/app/version');
      if (data is Map) {
        final latestVersion =
            (data['latestVersion'] ?? AppConfig.appVersion).toString();
        final latestBuild =
            int.tryParse((data['buildNumber'] ?? '1').toString()) ?? 1;
        final forceUpdate = data['forceUpdate'] == true;
        final downloadUrl = data['downloadUrl']?.toString();
        final notes = (data['releaseNotes'] is List)
            ? (data['releaseNotes'] as List).map((e) => e.toString()).toList()
            : <String>[];

        final hasNewerBuild = latestBuild > AppConfig.appBuildNumber ||
            _compareSemver(latestVersion, AppConfig.appVersion) > 0;

        if (hasNewerBuild) {
          return AppUpdateCheckResult(
            outcome: UpdateCheckOutcome.nativeUpdateAvailable,
            message:
                'Versi terbaru v$latestVersion tersedia dengan peningkatan fitur dan stabilitas.',
            latestVersion: latestVersion,
            latestBuildNumber: latestBuild,
            forceUpdate: forceUpdate,
            releaseNotes: notes,
            downloadUrl: downloadUrl,
            currentPatchNumber: currentPatch,
          );
        }

        return AppUpdateCheckResult(
          outcome: UpdateCheckOutcome.upToDate,
          message: currentPatch != null
              ? 'Aplikasi sudah versi terbaru (v${AppConfig.appVersion} · Patch #$currentPatch).'
              : 'Aplikasi SADAR Finance sudah menggunakan versi terbaru (v${AppConfig.appVersion}).',
          latestVersion: latestVersion,
          latestBuildNumber: latestBuild,
          currentPatchNumber: currentPatch,
        );
      }
    } catch (_) {
      return AppUpdateCheckResult(
        outcome: UpdateCheckOutcome.offlineOrUnavailable,
        message:
            'Tidak dapat memeriksa pembaruan saat ini. Pastikan perangkat terhubung ke internet.',
        currentPatchNumber: currentPatch,
      );
    }

    return AppUpdateCheckResult(
      outcome: UpdateCheckOutcome.upToDate,
      message: 'Aplikasi sudah menggunakan versi terbaru (v${AppConfig.appVersion}).',
      currentPatchNumber: currentPatch,
    );
  }

  static int _compareSemver(String a, String b) {
    final pa = a.split('.').map((e) => int.tryParse(e) ?? 0).toList();
    final pb = b.split('.').map((e) => int.tryParse(e) ?? 0).toList();
    final len = pa.length > pb.length ? pa.length : pb.length;
    for (int i = 0; i < len; i++) {
      final va = i < pa.length ? pa[i] : 0;
      final vb = i < pb.length ? pb[i] : 0;
      if (va != vb) return va.compareTo(vb);
    }
    return 0;
  }

  static Future<void> showUpdateDialog(
    BuildContext context,
    AppUpdateCheckResult result,
  ) async {
    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);

    await showDialog<void>(
      context: context,
      barrierDismissible: !result.forceUpdate,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Icon(
              result.outcome == UpdateCheckOutcome.otaDownloadedRestartRequired
                  ? Icons.system_update_alt_rounded
                  : result.outcome == UpdateCheckOutcome.nativeUpdateAvailable
                      ? Icons.new_releases_rounded
                      : Icons.verified_rounded,
              color: result.outcome == UpdateCheckOutcome.upToDate
                  ? AppColors.success
                  : AppColors.accent,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                result.outcome ==
                        UpdateCheckOutcome.otaDownloadedRestartRequired
                    ? 'Pembaruan Siap Diterapkan'
                    : result.outcome == UpdateCheckOutcome.nativeUpdateAvailable
                        ? 'Pembaruan Tersedia'
                        : 'Status Pembaruan',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              result.message,
              style: TextStyle(fontSize: 13.5, color: textSecondary, height: 1.45),
            ),
            if (result.releaseNotes.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'Yang Baru:',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              ...result.releaseNotes.map(
                (note) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ', style: TextStyle(color: AppColors.accent)),
                      Expanded(
                        child: Text(
                          note,
                          style: TextStyle(fontSize: 12.5, color: textSecondary),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (!result.forceUpdate)
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                result.outcome == UpdateCheckOutcome.nativeUpdateAvailable
                    ? 'Nanti'
                    : 'Tutup',
              ),
            ),
          if (result.outcome == UpdateCheckOutcome.nativeUpdateAvailable &&
              result.downloadUrl != null &&
              result.downloadUrl!.isNotEmpty)
            ElevatedButton.icon(
              onPressed: () async {
                final uri = Uri.tryParse(result.downloadUrl!);
                if (uri != null) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
                if (ctx.mounted && !result.forceUpdate) Navigator.pop(ctx);
              },
              icon: const Icon(Icons.download_rounded, size: 18),
              label: const Text('Unduh Pembaruan'),
            ),
        ],
      ),
    );
  }
}
