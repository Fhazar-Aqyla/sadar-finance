/**
 * App Metadata & Auto-Update Version Endpoint
 * Public endpoint used by SADAR Finance mobile app to check for native APK updates.
 */
const { Router } = require('express');
const { success } = require('../utils/response');

const router = Router();

router.get('/version', (_req, res) => {
  const latestVersion = process.env.APP_LATEST_VERSION || '1.2.0';
  const buildNumber = Number(process.env.APP_BUILD_NUMBER || 6);
  const minVersion = process.env.APP_MIN_VERSION || '1.0.0';
  const forceUpdate = String(process.env.APP_FORCE_UPDATE || 'false').toLowerCase() === 'true';
  const downloadUrl =
    process.env.APP_DOWNLOAD_URL ||
    `https://sadar-finance.web.id/downloads/sadar-finance-v${latestVersion}.apk`;
  const rawNotes = process.env.APP_RELEASE_NOTES || '';
  const releaseNotes = rawNotes
    ? rawNotes.split('|').map((s) => s.trim()).filter(Boolean)
    : [
        'Katalog 16 Karakter Avatar 2D Eksklusif & Gamifikasi (Level 1-5, Streak Harian 🔥 & Lencana)',
        'Masuk/Tautkan Akun Google (Firebase Auth) & Verifikasi Email Kode OTP 6 Digit (Resend)',
        'Koneksi Otomatis E-Wallet & M-Banking (GoPay, DANA, OVO, ShopeePay, Livin, BCA, SeaBank, Jago)',
        'Catatan Piutang Teman, Kalkulator Patungan (Split Bill) + Pengingat WA & Simulasi Dana Darurat',
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
