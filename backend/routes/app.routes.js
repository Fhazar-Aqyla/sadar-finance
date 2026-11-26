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
const PUSH_FEED_PATH = path.join(__dirname, '../config/push-notifications.json');
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

function loadPushFeed() {
  try {
    if (!fs.existsSync(PUSH_FEED_PATH)) return [];
    const raw = fs.readFileSync(PUSH_FEED_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.notifications) ? parsed.notifications : [];
  } catch (_) {
    return [];
  }
}

function savePushFeed(list) {
  fs.writeFileSync(
    PUSH_FEED_PATH,
    JSON.stringify({ notifications: list.slice(0, 50) }, null, 2),
    'utf8'
  );
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

router.get('/push-feed', (_req, res) => {
  const notifications = loadPushFeed();
  return success(res, {
    message: 'Active push notification feed',
    data: {
      notifications,
      data: { notifications },
    },
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
    fileConfig.latestVersion || process.env.APP_LATEST_VERSION || '3.0.0';
  const buildNumber = Number(
    fileConfig.buildNumber || process.env.APP_BUILD_NUMBER || 14
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
            apiVersion: '3.0.0',
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
    const finalPath = path.join(APK_DIR, 'sadar-finance-v3.0.0.apk');
    const v2Path = path.join(APK_DIR, 'sadar-finance-v2.0.0.apk');
    const latestPath = path.join(APK_DIR, 'sadar-finance-latest.apk');
    fs.renameSync(uploadedFile.path, finalPath);
    fs.copyFileSync(finalPath, v2Path);
    fs.copyFileSync(finalPath, latestPath);
    const st = fs.statSync(finalPath);
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(finalPath));
    const sha256 = hash.digest('hex');

    return success(res, {
      message: 'Paket APK V 3.0.0 baru berhasil diunggah dan diaktifkan di server',
      data: {
        filename: 'sadar-finance-v3.0.0.apk',
        sizeBytes: st.size,
        sizeMb: Number((st.size / (1024 * 1024)).toFixed(2)),
        sha256,
        updatedAt: st.mtime.toISOString(),
      },
    });
  }
);

// ── REMOTE PUSH NOTIFICATION BLASTER (ANDROID APK + WEB) ──────

router.post(
  '/admin/push-send',
  authenticate,
  requireAdminUser,
  (req, res) => {
    const body = req.body || {};
    const title = String(body.title || 'Notifikasi SADAR Finance').trim().slice(0, 140);
    const message = String(body.body || body.message || '').trim().slice(0, 600);
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan isi pesan Push Notification wajib diisi',
      });
    }
    const target = ['all', 'android', 'web'].includes(body.target) ? body.target : 'all';
    const category = ['info', 'budget', 'recurring', 'debt', 'promo', 'urgent'].includes(
      body.category
    )
      ? body.category
      : 'info';
    const rawRoute = String(body.actionRoute || '/dashboard').trim();
    const actionRoute = rawRoute.startsWith('/') ? rawRoute : '/dashboard';

    const pushItem = {
      id: `push-${Date.now()}`,
      title,
      body: message,
      message,
      target,
      category,
      actionRoute,
      sentAt: new Date().toISOString(),
    };

    const feed = loadPushFeed();
    feed.unshift(pushItem);
    savePushFeed(feed);

    if (body.alsoBroadcast === true) {
      const bList = loadAllBroadcasts();
      bList.unshift({
        id: pushItem.id,
        active: true,
        type: category === 'urgent' ? 'urgent' : category === 'promo' ? 'promo' : 'info',
        badge:
          category === 'budget'
            ? 'PERINGATAN BUDGET 50/30/20'
            : category === 'recurring'
              ? 'PENGINGAT TAGIHAN RUTIN'
              : category === 'debt'
                ? 'PENGINGAT PIUTANG'
                : 'PUSH NOTIFICATION RESMI',
        title,
        message,
        imageUrl: '',
        bannerUrl: '',
        actionLabel: 'Lihat Detail',
        actionRoute,
        affectedFeature: 'none',
        updatedAt: pushItem.sentAt,
      });
      saveAllBroadcasts(bList);
    }

    return success(res, {
      message: 'Push Notification berhasil dikirim ke antrean perangkat Android & Web',
      data: {
        pushed: pushItem,
        notifications: feed,
      },
    });
  }
);

router.delete(
  '/admin/push-send/:id',
  authenticate,
  requireAdminUser,
  (req, res) => {
    const targetId = String(req.params.id || '').trim();
    const nextFeed = loadPushFeed().filter((p) => p && p.id !== targetId);
    savePushFeed(nextFeed);
    return success(res, {
      message: 'Riwayat push notification dihapus',
      data: { notifications: nextFeed },
    });
  }
);

// ── AUTOMATED DAILY REMINDER ENGINE, API LOGS & DB BACKUP (V 3.0) ───

async function runAutomatedDailyReminders({ force = false } = {}) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthKey = todayStr.slice(0, 7);
  const currentDay = now.getDate();

  let rows = [];
  try {
    const res = await dbQuery(`
      SELECT p.user_id, p.recurring_items, p.debts, u.first_name, u.email
      FROM user_financial_plans p
      LEFT JOIN users u ON u.users_id = p.user_id
    `);
    rows = res.rows || [];
  } catch (_) {
    rows = [];
  }

  const feed = loadPushFeed();
  const existingAutoKeys = new Set(
    feed.map((f) => String(f?.autoKey || '')).filter(Boolean)
  );
  const dispatched = [];

  for (const row of rows) {
    const recurringList = Array.isArray(row.recurring_items) ? row.recurring_items : [];
    const debtList = Array.isArray(row.debts) ? row.debts : [];

    for (const rec of recurringList) {
      if (!rec || rec.lastPaidPeriod === currentMonthKey) continue;
      const dayOfMonth = Number(rec.dayOfMonth || 1);
      const diff = dayOfMonth - currentDay;
      if (diff >= -1 && diff <= 2) {
        const autoKey = `auto_rec_${rec.id || rec.title}_${todayStr}`;
        if (!force && existingAutoKeys.has(autoKey)) continue;
        const amt = new Intl.NumberFormat('id-ID').format(Number(rec.amount || 0));
        const item = {
          id: `push-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          autoKey,
          title: `Pengingat ${rec.isIncome ? 'Jadwal Pemasukan' : 'Tagihan Rutin'}: ${rec.title || 'Bulanan'}`,
          body: `Jadwal tanggal ${dayOfMonth} sebesar Rp ${amt} belum dicatat bulan ini. Ketuk untuk catat 1-klik.`,
          message: `Jadwal tanggal ${dayOfMonth} sebesar Rp ${amt} belum dicatat bulan ini. Ketuk untuk catat 1-klik.`,
          target: 'all',
          category: 'recurring',
          actionRoute: '/financial-plans',
          sentAt: new Date().toISOString(),
        };
        feed.unshift(item);
        existingAutoKeys.add(autoKey);
        dispatched.push(item);
      }
    }

    for (const d of debtList) {
      if (!d || d.isSettled || !d.dueDate) continue;
      const dueStr = String(d.dueDate).slice(0, 10);
      const dueDate = new Date(`${dueStr}T00:00:00`);
      if (Number.isNaN(dueDate.getTime())) continue;
      const todayDate = new Date(`${todayStr}T00:00:00`);
      const diffDays = Math.round((dueDate - todayDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= -3 && diffDays <= 3) {
        const autoKey = `auto_debt_${d.id || d.personName}_${todayStr}`;
        if (!force && existingAutoKeys.has(autoKey)) continue;
        const amt = new Intl.NumberFormat('id-ID').format(Number(d.amount || 0));
        const label = d.isReceivable !== false ? 'Piutang' : 'Utang';
        const item = {
          id: `push-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          autoKey,
          title: `Jatuh Tempo ${label}: ${d.personName || 'Kontak'}`,
          body: `Catatan ${label.toLowerCase()} Rp ${amt} ${diffDays < 0 ? `terlambat ${Math.abs(diffDays)} hari` : diffDays === 0 ? 'jatuh tempo HARI INI' : `jatuh tempo ${diffDays} hari lagi`} (${dueStr}).`,
          message: `Catatan ${label.toLowerCase()} Rp ${amt} (${dueStr}) segera jatuh tempo.`,
          target: 'all',
          category: 'debt',
          actionRoute: '/financial-plans',
          sentAt: new Date().toISOString(),
        };
        feed.unshift(item);
        existingAutoKeys.add(autoKey);
        dispatched.push(item);
      }
    }
  }

  // If force-triggered from Developer Panel and no user items matched today, dispatch a smart daily check notification
  if (force && dispatched.length === 0) {
    const item = {
      id: `push-cron-${Date.now()}`,
      autoKey: `auto_daily_${todayStr}_${Date.now()}`,
      title: 'Pemeriksaan Harian Otomatis SADAR V 3.0',
      body: 'Semua jadwal tagihan rutin & piutang sudah diperiksa. Yuk cek batas aman belanja harian 50/30/20 Anda hari ini!',
      message: 'Semua jadwal tagihan rutin & piutang sudah diperiksa. Yuk cek batas aman belanja harian 50/30/20 Anda hari ini!',
      target: 'all',
      category: 'info',
      actionRoute: '/dashboard',
      sentAt: new Date().toISOString(),
    };
    feed.unshift(item);
    dispatched.push(item);
  }

  if (dispatched.length > 0) {
    savePushFeed(feed);
  }

  return {
    scannedUsers: rows.length,
    dispatchedCount: dispatched.length,
    dispatched,
    notifications: feed,
  };
}

// Automatically run scheduled reminders every 6 hours in background
setInterval(() => {
  runAutomatedDailyReminders({ force: false }).catch(() => {});
}, 6 * 60 * 60 * 1000);

router.post(
  '/admin/run-reminders',
  authenticate,
  requireAdminUser,
  async (_req, res, next) => {
    try {
      const result = await runAutomatedDailyReminders({ force: true });
      return success(res, {
        message: `Mesin Cron Pengingat Otomatis selesai memeriksa ${result.scannedUsers} akun dan mengirim ${result.dispatchedCount} notifikasi.`,
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/admin/api-logs',
  authenticate,
  requireAdminUser,
  (_req, res) => {
    const logs = Array.isArray(global.__sadarApiLogs) ? global.__sadarApiLogs : [];
    return success(res, {
      message: 'Recent API request telemetry logs',
      data: { logs },
    });
  }
);

router.get(
  '/admin/db-backup',
  authenticate,
  requireAdminUser,
  async (_req, res, next) => {
    try {
      const [usersRes, accountsRes, plansRes, txCountRes, incCountRes] = await Promise.all([
        dbQuery('SELECT users_id, first_name, middle_name, last_name, username, email, occupation, city, status, streak_days, xp_points, financial_level, created_at FROM users ORDER BY created_at DESC').catch(() => ({ rows: [] })),
        dbQuery('SELECT account_id, user_id, account_name, account_type, balance, created_at FROM accounts ORDER BY created_at DESC').catch(() => ({ rows: [] })),
        dbQuery('SELECT user_id, savings_goals, recurring_items, debts, transfers, updated_at FROM user_financial_plans').catch(() => ({ rows: [] })),
        dbQuery('SELECT COUNT(*)::int AS cnt, COALESCE(SUM(amount),0)::numeric AS total FROM transactions').catch(() => ({ rows: [{ cnt: 0, total: 0 }] })),
        dbQuery('SELECT COUNT(*)::int AS cnt, COALESCE(SUM(amount),0)::numeric AS total FROM incomes').catch(() => ({ rows: [{ cnt: 0, total: 0 }] })),
      ]);

      return success(res, {
        message: 'Database & configuration snapshot exported',
        data: {
          exportedAt: new Date().toISOString(),
          version: '3.0.0',
          summary: {
            usersCount: usersRes.rows.length,
            accountsCount: accountsRes.rows.length,
            plansCount: plansRes.rows.length,
            transactionsCount: txCountRes.rows[0]?.cnt || 0,
            transactionsTotal: Number(txCountRes.rows[0]?.total || 0),
            incomesCount: incCountRes.rows[0]?.cnt || 0,
            incomesTotal: Number(incCountRes.rows[0]?.total || 0),
          },
          users: usersRes.rows,
          accounts: accountsRes.rows,
          financialPlans: plansRes.rows,
          broadcasts: loadAllBroadcasts(),
          pushFeed: loadPushFeed(),
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
