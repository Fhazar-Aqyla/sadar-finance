/**
 * App Metadata & Auto-Update Version Endpoint
 * Public endpoint used by SADAR Finance mobile app to check for native APK updates.
 */
const fs = require('fs');
const path = require('path');
const { Router } = require('express');
const { success } = require('../utils/response');

const router = Router();
const BROADCASTS_PATH = path.join(__dirname, '../config/broadcasts.json');

function loadActiveBroadcasts() {
  try {
    const raw = fs.readFileSync(BROADCASTS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [];
    return list.filter((b) => b && b.active === true);
  } catch (_) {
    return [];
  }
}

router.get('/broadcasts', (_req, res) => {
  const broadcasts = loadActiveBroadcasts();
  return success(res, {
    message: 'Active app broadcasts',
    data: { broadcasts },
  });
});

router.get('/logo-light.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=604800');
  return res.sendFile(path.join(__dirname, '../assets/logo-sadar-light.png'));
});

router.get('/logo.png', (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=604800');
  return res.sendFile(path.join(__dirname, '../assets/sadar-logo.png'));
});

router.get('/banners/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename || '');
  const bannerPath = path.join(__dirname, '../assets/banners', safeName);
  if (!safeName || !fs.existsSync(bannerPath)) {
    return res.status(404).json({ success: false, message: 'Banner image not found' });
  }
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.sendFile(bannerPath);
});

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
        'Catatan Piutang Teman, Kalkulator Patungan (Split Bill) + Pengingat WA & Simulasi Dana Darurat',
      ];

  const broadcasts = loadActiveBroadcasts();

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
      broadcasts,
    },
  });
});

module.exports = router;
