/**
 * App Metadata & Auto-Update Version Endpoint
 * Public endpoint used by SADAR Finance mobile app to check for native APK updates.
 */
const { Router } = require('express');
const { success } = require('../utils/response');

const router = Router();

router.get('/version', (_req, res) => {
  const latestVersion = process.env.APP_LATEST_VERSION || '1.0.3';
  const buildNumber = Number(process.env.APP_BUILD_NUMBER || 4);
  const minVersion = process.env.APP_MIN_VERSION || '1.0.0';
  const forceUpdate = String(process.env.APP_FORCE_UPDATE || 'false').toLowerCase() === 'true';
  const downloadUrl =
    process.env.APP_DOWNLOAD_URL ||
    `https://sadar-finance.web.id/downloads/sadar-finance-v${latestVersion}.apk`;
  const rawNotes = process.env.APP_RELEASE_NOTES || '';
  const releaseNotes = rawNotes
    ? rawNotes.split('|').map((s) => s.trim()).filter(Boolean)
    : [
        'Fitur Transfer Antar Akun / Dompet tanpa merusak statistik pemasukan & pengeluaran',
        'Kunci Aplikasi Biometrik (Sidik Jari / Face Unlock) & auto-logout sesi kedaluwarsa',
        'Auto-format pemisah ribuan real-time, filter bulan/akun, dan Export Laporan CSV',
        'Navigasi 5 tab lebih mulus (posisi scroll terjaga) & APK lebih ramping bertanda tangan rilis',
      ];

  return success(res, {
    message: 'App version info',
    data: {
      latestVersion,
      buildNumber: Number.isFinite(buildNumber) ? buildNumber : 1,
      minVersion,
      forceUpdate,
      otaChannel: 'stable',
      releaseNotes,
      downloadUrl,
    },
  });
});

module.exports = router;
