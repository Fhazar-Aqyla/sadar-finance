/**
 * App Metadata & Auto-Update Version Endpoint
 * Public endpoint used by SADAR Finance mobile app to check for native APK updates.
 */
const { Router } = require('express');
const { success } = require('../utils/response');

const router = Router();

router.get('/version', (_req, res) => {
  const latestVersion = process.env.APP_LATEST_VERSION || '1.0.2';
  const buildNumber = Number(process.env.APP_BUILD_NUMBER || 3);
  const minVersion = process.env.APP_MIN_VERSION || '1.0.0';
  const forceUpdate = String(process.env.APP_FORCE_UPDATE || 'false').toLowerCase() === 'true';
  const downloadUrl =
    process.env.APP_DOWNLOAD_URL ||
    `https://sadar-finance.web.id/downloads/sadar-finance-v${latestVersion}.apk`;
  const rawNotes = process.env.APP_RELEASE_NOTES || '';
  const releaseNotes = rawNotes
    ? rawNotes.split('|').map((s) => s.trim()).filter(Boolean)
    : [
        'Perbaikan upload & tampilan foto profil agar tersimpan permanen dan tidak blank',
        'Perbaikan navigasi stabil saat edit profil, ganti tema, atau upload foto',
        'Tampilan Splash Screen bersih tanpa border & halaman perkenalan selaras landing page',
        'Ikon aplikasi resmi SADAR Finance ("A") & mode offline auto-sync',
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
