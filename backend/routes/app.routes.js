/**
 * App Metadata & Auto-Update Version Endpoint
 * Public endpoint used by SADAR Finance mobile app to check for native APK updates.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const userRepository = require('../repositories/user.repository');
const { query: dbQuery } = require('../config/database');
const { success } = require('../utils/response');

const router = Router();
const BROADCASTS_PATH = path.join(__dirname, '../config/broadcasts.json');
const BANNERS_DIR = path.join(__dirname, '../assets/banners');

const APK_DIR = path.join(__dirname, '../downloads');
if (!fs.existsSync(APK_DIR)) {
  fs.mkdirSync(APK_DIR, { recursive: true });
}

const apkUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, APK_DIR),
    filename: (_req, _file, cb) => cb(null, 'sadar-finance-v2.0.0.apk.upload.tmp'),
  }),
  limits: { fileSize: 150 * 1024 * 1024 },
});

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

function extractLocalBannerFilename(bannerUrl) {
  const raw = String(bannerUrl || '').trim();
  if (!raw || !raw.includes('/app/banners/')) return '';
  const tail = raw.split('/app/banners/').pop() || '';
  const clean = path.basename(tail.split('?')[0]);
  return /^banner-\d+\.(png|jpg|jpeg|webp)$/i.test(clean) ? clean : '';
}

function cleanupOrphanBannerFile(bannerUrl, remainingBroadcasts) {
  try {
    const filename = extractLocalBannerFilename(bannerUrl);
    if (!filename) return;
    const stillUsed = (remainingBroadcasts || []).some((b) => {
      const candidate = extractLocalBannerFilename(b?.imageUrl || b?.bannerUrl);
      return candidate === filename;
    });
    if (stillUsed) return;
    const targetPath = path.join(BANNERS_DIR, filename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  } catch (_) {}
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
    fileConfig.latestVersion || process.env.APP_LATEST_VERSION || '2.0.0';
  const buildNumber = Number(
    fileConfig.buildNumber || process.env.APP_BUILD_NUMBER || 11
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
    const oldBannerUrl =
      existingIdx >= 0
        ? list[existingIdx]?.imageUrl || list[existingIdx]?.bannerUrl || ''
        : '';
    if (existingIdx >= 0) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }
    saveAllBroadcasts(list);
    if (oldBannerUrl && oldBannerUrl !== resolvedBanner) {
      cleanupOrphanBannerFile(oldBannerUrl, list);
    }

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
    const allList = loadAllBroadcasts();
    const removed = allList.find((b) => b && b.id === targetId);
    const nextList = allList.filter((b) => b && b.id !== targetId);
    saveAllBroadcasts(nextList);
    if (removed) {
      cleanupOrphanBannerFile(removed.imageUrl || removed.bannerUrl, nextList);
    }
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

// ── DEVELOPER PANEL TELEMETRY, OTA VERSION & USER INSPECTOR ────

router.get(
  '/admin/system-status',
  authenticate,
  requireAdminUser,
  async (_req, res, next) => {
    try {
      const dbStart = Date.now();
      const countQuery = async (sql) => {
        try {
          const r = await dbQuery(sql);
          return Number(r.rows?.[0]?.cnt || 0);
        } catch (_) {
          return 0;
        }
      };

      const [
        totalUsers,
        totalAccounts,
        totalTransactions,
        totalIncomes,
        totalOcrScans,
        totalPlans,
      ] = await Promise.all([
        countQuery('SELECT COUNT(*)::int AS cnt FROM users'),
        countQuery('SELECT COUNT(*)::int AS cnt FROM accounts'),
        countQuery('SELECT COUNT(*)::int AS cnt FROM transactions'),
        countQuery('SELECT COUNT(*)::int AS cnt FROM incomes'),
        countQuery('SELECT COUNT(*)::int AS cnt FROM ocr_results'),
        countQuery('SELECT COUNT(*)::int AS cnt FROM user_financial_plans'),
      ]);
      const dbLatencyMs = Date.now() - dbStart;

      const mem = process.memoryUsage();
      const downloadsDir = path.join(__dirname, '../downloads');
      const apkFiles = [];
      if (fs.existsSync(downloadsDir)) {
        const entries = fs.readdirSync(downloadsDir).filter((f) => f.endsWith('.apk'));
        for (const fname of entries) {
          const fpath = path.join(downloadsDir, fname);
          const st = fs.statSync(fpath);
          let sha256 = '';
          try {
            const hash = crypto.createHash('sha256');
            hash.update(fs.readFileSync(fpath));
            sha256 = hash.digest('hex');
          } catch (_) {}
          apkFiles.push({
            filename: fname,
            sizeBytes: st.size,
            sizeMb: Number((st.size / (1024 * 1024)).toFixed(2)),
            updatedAt: st.mtime.toISOString(),
            sha256,
          });
        }
      }

      const bannersCount = fs.existsSync(BANNERS_DIR)
        ? fs.readdirSync(BANNERS_DIR).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f)).length
        : 0;

      return success(res, {
        message: 'Developer system status',
        data: {
          server: {
            apiVersion: '2.0.0',
            nodeVersion: process.version,
            platform: `${os.type()} ${os.release()} (${os.arch()})`,
            environment: process.env.NODE_ENV || 'development',
            uptimeSeconds: Math.floor(process.uptime()),
            cpuCount: os.cpus()?.length || 1,
            loadAvg: os.loadavg(),
            memory: {
              rssMb: Number((mem.rss / (1024 * 1024)).toFixed(1)),
              heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(1)),
              heapTotalMb: Number((mem.heapTotal / (1024 * 1024)).toFixed(1)),
              systemFreeMb: Number((os.freemem() / (1024 * 1024)).toFixed(0)),
              systemTotalMb: Number((os.totalmem() / (1024 * 1024)).toFixed(0)),
            },
            timestamp: new Date().toISOString(),
          },
          database: {
            status: 'healthy',
            latencyMs: dbLatencyMs,
            counts: {
              users: totalUsers,
              accounts: totalAccounts,
              transactions: totalTransactions,
              incomes: totalIncomes,
              ocrScans: totalOcrScans,
              cloudPlans: totalPlans,
            },
          },
          aiEngine: {
            groqConfigured: Boolean(process.env.GROQ_API_KEY),
            groqTextModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            groqVisionModel:
              process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
            hfOcrConfigured: Boolean(process.env.HF_OCR_URL || process.env.HF_SPACE_URL),
            hfOcrUrl:
              process.env.HF_OCR_URL ||
              process.env.HF_SPACE_URL ||
              'https://fhazara-sadar-ocr.hf.space',
          },
          storage: {
            apkFiles,
            bannersCount,
            activeBroadcastsCount: loadActiveBroadcasts().length,
            totalBroadcastsCount: loadAllBroadcasts().length,
          },
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/admin/version',
  authenticate,
  requireAdminUser,
  (req, res) => {
    const body = req.body || {};
    const versionFile = path.join(__dirname, '../config/app-version.json');
    let current = {};
    try {
      if (fs.existsSync(versionFile)) {
        current = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      }
    } catch (_) {}

    const latestVersion = String(body.latestVersion || current.latestVersion || '2.0.0')
      .trim()
      .slice(0, 32);
    const buildNumber = Number(body.buildNumber ?? current.buildNumber ?? 11);
    const minVersion = String(body.minVersion || current.minVersion || '1.0.0')
      .trim()
      .slice(0, 32);
    const forceUpdate = Boolean(body.forceUpdate ?? current.forceUpdate ?? false);
    const downloadUrl = String(
      body.downloadUrl ||
        current.downloadUrl ||
        `https://sadar-finance.web.id/downloads/sadar-finance-v${latestVersion}.apk`
    )
      .trim()
      .slice(0, 300);

    let releaseNotes = current.releaseNotes || [];
    if (Array.isArray(body.releaseNotes)) {
      releaseNotes = body.releaseNotes
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .slice(0, 15);
    } else if (typeof body.releaseNotes === 'string') {
      releaseNotes = body.releaseNotes
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 15);
    }

    const nextConfig = {
      latestVersion,
      buildNumber: Number.isFinite(buildNumber) ? buildNumber : 11,
      minVersion,
      forceUpdate,
      downloadUrl,
      releaseNotes,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(versionFile, JSON.stringify(nextConfig, null, 2), 'utf8');

    return success(res, {
      message: 'Konfigurasi rilis OTA berhasil diperbarui',
      data: nextConfig,
    });
  }
);

router.get(
  '/admin/users',
  authenticate,
  requireAdminUser,
  async (_req, res, next) => {
    try {
      await userRepository._ensureColumns();
      const result = await dbQuery(`
        SELECT
          u.users_id AS id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.username,
          u.email,
          u.occupation,
          u.city,
          COALESCE(u.status, 'active') AS status,
          COALESCE(u.streak_days, 1)::int AS streak_days,
          COALESCE(u.xp_points, 50)::int AS xp_points,
          COALESCE(u.financial_level, 1)::int AS financial_level,
          u.created_at,
          (SELECT COUNT(*)::int FROM accounts a WHERE a.user_id = u.users_id) AS accounts_count,
          COALESCE((SELECT SUM(a.balance)::numeric FROM accounts a WHERE a.user_id = u.users_id), 0) AS total_balance,
          (SELECT COUNT(*)::int FROM transactions t WHERE t.user_id = u.users_id) AS transactions_count,
          (SELECT COUNT(*)::int FROM incomes i WHERE i.user_id = u.users_id) AS incomes_count
        FROM users u
        ORDER BY u.created_at DESC
        LIMIT 100
      `);
      return success(res, {
        message: 'Registered users list',
        data: { users: result.rows || [] },
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/admin/users/:id',
  authenticate,
  requireAdminUser,
  async (req, res, next) => {
    try {
      await userRepository._ensureColumns();
      const targetId = String(req.params.id || '').trim();
      const body = req.body || {};
      const status = ['active', 'suspended'].includes(body.status) ? body.status : 'active';
      const level = Math.max(1, Math.min(99, Number(body.financial_level) || 1));
      const xp = Math.max(0, Number(body.xp_points) || 0);
      const streak = Math.max(0, Number(body.streak_days) || 0);
      const occupation = body.occupation !== undefined ? String(body.occupation || '').trim().slice(0, 120) : null;

      const updated = await dbQuery(
        `UPDATE users
         SET status = $2,
             financial_level = $3,
             xp_points = $4,
             streak_days = $5,
             occupation = COALESCE($6, occupation),
             updated_at = NOW()
         WHERE users_id = $1
         RETURNING users_id AS id, first_name, middle_name, last_name, username, email, occupation, status, streak_days, xp_points, financial_level`,
        [targetId, status, level, xp, streak, occupation]
      );
      if (updated.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      }
      return success(res, {
        message: 'Data pengguna berhasil diperbarui',
        data: { user: updated.rows[0] },
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  '/admin/users/:id',
  authenticate,
  requireAdminUser,
  async (req, res, next) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const targetUser = await userRepository.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
      }
      if (String(targetUser.email || '').toLowerCase() === 'mhmdhabibrafi@gmail.com') {
        return res.status(400).json({
          success: false,
          message: 'Akun Developer Utama tidak dapat dihapus.',
        });
      }
      await dbQuery('DELETE FROM users WHERE users_id = $1', [targetId]);
      return success(res, {
        message: `Akun pengguna ${targetUser.email} berhasil dihapus`,
        data: { deletedId: targetId },
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/admin/apk-upload',
  authenticate,
  requireAdminUser,
  apkUpload.any(),
  (req, res) => {
    const uploadedFile =
      req.file || (Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null);
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'File paket .apk wajib dipilih',
      });
    }
    const finalPath = path.join(APK_DIR, 'sadar-finance-v2.0.0.apk');
    const latestPath = path.join(APK_DIR, 'sadar-finance-latest.apk');
    fs.renameSync(uploadedFile.path, finalPath);
    fs.copyFileSync(finalPath, latestPath);
    const st = fs.statSync(finalPath);
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(finalPath));
    const sha256 = hash.digest('hex');

    return success(res, {
      message: 'Paket APK baru berhasil diunggah dan diaktifkan di server',
      data: {
        filename: 'sadar-finance-v2.0.0.apk',
        sizeBytes: st.size,
        sizeMb: Number((st.size / (1024 * 1024)).toFixed(2)),
        sha256,
        updatedAt: st.mtime.toISOString(),
      },
    });
  }
);

module.exports = router;
