/**
 * App Metadata & Auto-Update Version Endpoint
 * Public endpoint used by SADAR Finance mobile app to check for native APK updates.
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const userRepository = require('../repositories/user.repository');
const { success } = require('../utils/response');

const router = Router();
const BROADCASTS_PATH = path.join(__dirname, '../config/broadcasts.json');
const BANNERS_DIR = path.join(__dirname, '../assets/banners');

if (!fs.existsSync(BANNERS_DIR)) {
  fs.mkdirSync(BANNERS_DIR, { recursive: true });
}

const bannerUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, BANNERS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg';
      const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.jpg';
      cb(null, `banner-${Date.now()}${safeExt}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(String(file.mimetype || '').toLowerCase())) {
      return cb(null, true);
    }
    return cb(new Error('Format file banner harus PNG, JPG, atau WEBP'));
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

function loadAllBroadcasts() {
  try {
    const raw = fs.readFileSync(BROADCASTS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [];
  } catch (_) {
    return [];
  }
}

function saveAllBroadcasts(list) {
  fs.writeFileSync(
    BROADCASTS_PATH,
    JSON.stringify({ broadcasts: list }, null, 2),
    'utf8'
  );
}

function loadActiveBroadcasts() {
  return loadAllBroadcasts().filter((b) => b && b.active === true);
}

async function requireAdminUser(req, res, next) {
  try {
    const user = await userRepository.findById(req.user.id);
    const adminEmails = (
      process.env.ADMIN_EMAILS || 'mhmdhabibrafi@gmail.com'
    )
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!user || !adminEmails.includes(String(user.email || '').toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Hanya Admin resmi SADAR Finance yang dapat mengelola broadcast.',
      });
    }
    req.adminUser = user;
    return next();
  } catch (err) {
    return next(err);
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
  let fileConfig = {};
  try {
    const versionFile = path.join(__dirname, '../config/app-version.json');
    if (fs.existsSync(versionFile)) {
      fileConfig = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    }
  } catch (_) {}

  const latestVersion =
    fileConfig.latestVersion || process.env.APP_LATEST_VERSION || '1.2.1';
  const buildNumber = Number(
    fileConfig.buildNumber || process.env.APP_BUILD_NUMBER || 7
  );
  const minVersion =
    fileConfig.minVersion || process.env.APP_MIN_VERSION || '1.0.0';
  const forceUpdate =
    String(
      fileConfig.forceUpdate ?? process.env.APP_FORCE_UPDATE ?? 'false'
    ).toLowerCase() === 'true';
  const downloadUrl =
    fileConfig.downloadUrl ||
    process.env.APP_DOWNLOAD_URL ||
    `https://sadar-finance.web.id/downloads/sadar-finance-v${latestVersion}.apk`;
  const rawNotes = process.env.APP_RELEASE_NOTES || '';
  const releaseNotes =
    Array.isArray(fileConfig.releaseNotes) && fileConfig.releaseNotes.length > 0
      ? fileConfig.releaseNotes
      : rawNotes
        ? rawNotes.split('|').map((s) => s.trim()).filter(Boolean)
        : [
            'Sinkronisasi Cloud Penuh untuk Target Tabungan, Tagihan Rutin, Utang/Piutang & Riwayat Transfer',
            'Laporan e-Statement Bulanan Resmi (Kirim ke Email & Cetak PDF)',
            'Integrasi Hybrid Hugging Face AI + Groq AI (OCR Struk, Klasifikasi 50/30/20 & Insight Perilaku)',
          ];

  const broadcasts = loadActiveBroadcasts();

  return success(res, {
    message: 'App version info',
    data: {
      latestVersion,
      buildNumber: Number.isFinite(buildNumber) ? buildNumber : 8,
      minVersion,
      forceUpdate,
      otaChannel: 'stable',
      releaseNotes,
      downloadUrl,
      broadcasts,
    },
  });
});

// ── ADMIN BROADCAST & BANNER MANAGEMENT ───────────────────────

router.get(
  '/admin/broadcasts',
  authenticate,
  requireAdminUser,
  (_req, res) => {
    return success(res, {
      message: 'All broadcasts retrieved',
      data: { broadcasts: loadAllBroadcasts() },
    });
  }
);

router.post(
  '/admin/broadcasts',
  authenticate,
  requireAdminUser,
  (req, res) => {
    const body = req.body || {};
    const list = loadAllBroadcasts();
    const id = String(body.id || `bcast-${Date.now()}`).trim();
    const resolvedBanner = String(body.imageUrl || body.bannerUrl || '').trim();
    const rawRoute = String(body.actionRoute || '').trim();
    const safeRoute = rawRoute.startsWith('/') ? rawRoute : '';
    const item = {
      id,
      active: body.active !== false,
      type: ['info', 'promo', 'maintenance', 'urgent'].includes(body.type)
        ? body.type
        : 'info',
      badge: String(body.badge || 'PENGUMUMAN RESMI').trim().slice(0, 80),
      title: String(body.title || 'Pengumuman SADAR Finance').trim().slice(0, 160),
      message: String(body.message || '').trim().slice(0, 1000),
      imageUrl: resolvedBanner,
      bannerUrl: resolvedBanner,
      actionLabel: String(body.actionLabel || '').trim().slice(0, 60),
      actionRoute: safeRoute,
      affectedFeature: String(body.affectedFeature || 'none').trim(),
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = list.findIndex((b) => b && b.id === id);
    if (existingIdx >= 0) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }
    saveAllBroadcasts(list);

    return success(res, {
      message: 'Broadcast berhasil disimpan',
      data: { broadcast: item, broadcasts: list },
    });
  }
);

router.delete(
  '/admin/broadcasts/:id',
  authenticate,
  requireAdminUser,
  (req, res) => {
    const targetId = String(req.params.id || '').trim();
    const nextList = loadAllBroadcasts().filter((b) => b && b.id !== targetId);
    saveAllBroadcasts(nextList);
    return success(res, {
      message: 'Broadcast berhasil dihapus',
      data: { broadcasts: nextList },
    });
  }
);

router.post(
  '/admin/banner-upload',
  authenticate,
  requireAdminUser,
  bannerUpload.any(),
  (req, res) => {
    const uploadedFile =
      req.file || (Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null);
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'File gambar banner wajib diunggah',
      });
    }
    const baseUrl =
      process.env.PUBLIC_API_BASE_URL || 'https://sadar-finance.web.id/api/v1';
    const imageUrl = `${baseUrl.replace(/\/$/, '')}/app/banners/${uploadedFile.filename}`;
    return success(res, {
      message: 'Gambar banner berhasil diunggah',
      data: {
        filename: uploadedFile.filename,
        imageUrl,
        bannerUrl: imageUrl,
      },
    });
  }
);

module.exports = router;
