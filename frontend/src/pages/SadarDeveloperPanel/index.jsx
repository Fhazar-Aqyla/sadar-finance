import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  CheckCircle2,
  Copy,
  Cpu,
  Database,
  Download,
  Edit3,
  ExternalLink,
  HardDrive,
  RefreshCw,
  Rocket,
  Server,
  ShieldAlert,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  Wrench,
  Send,
  Mail,
  Smartphone,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { analyticsApi, appApi, authApi } from "../../Components/services/api";
import { getStoredAuthUser } from "../../helpers/auth-storage";
import "../SadarShared/sadar-pages.css";

const AFFECTED_FEATURES = [
  {
    value: "none",
    label: "Tidak Ada (Pengumuman Biasa)",
    shortLabel: "Pengumuman",
  },
  {
    value: "ocr_scan",
    label: "Scan Struk OCR AI (Maintenance Gate)",
    shortLabel: "Scan Struk OCR",
    desc: "Menampilkan status pemeliharaan pada fitur pemindaian struk AI.",
  },
  {
    value: "export_report",
    label: "Cetak / Kirim e-Statement (Maintenance Gate)",
    shortLabel: "e-Statement PDF",
    desc: "Menampilkan status pemeliharaan pada fitur ekspor laporan bulanan.",
  },
  {
    value: "cloud_plans",
    label: "Rencana & Piutang Cloud (Maintenance Gate)",
    shortLabel: "Rencana & Piutang",
    desc: "Menampilkan status pemeliharaan pada modul tabungan & piutang.",
  },
  {
    value: "account_transfer",
    label: "Transfer Antar Akun (Maintenance Gate)",
    shortLabel: "Transfer Akun",
    desc: "Menampilkan status pemeliharaan pada fitur mutasi antar rekening.",
  },
];

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatUptime = (seconds = 0) => {
  const s = Math.max(0, Number(seconds) || 0);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  if (days > 0) return `${days}h ${hours}j ${mins}m`;
  if (hours > 0) return `${hours}j ${mins}m ${secs}d`;
  return `${mins}m ${secs}d`;
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const SadarDeveloperPanel = () => {
  useEffect(() => {
    document.title = "Panel Developer | SADAR Finance V 3.0";
  }, []);

  const [activeTab, setActiveTab] = useState("telemetry");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notice, setNotice] = useState(null);

  // Telemetry state
  const [sysStatus, setSysStatus] = useState(null);
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  // OTA Version Manager & APK Upload state
  const [versionForm, setVersionForm] = useState({
    latestVersion: "3.0.0",
    buildNumber: 14,
    minVersion: "1.0.0",
    forceUpdate: false,
    downloadUrl:
      "https://sadar-finance.web.id/downloads/sadar-finance-v3.0.0.apk?v=3.0.0-b14",
    releaseNotesText: [
      "Rilis Utama SADAR Finance V 3.0.0 Stable: Push Notification Android Native dengan Deep-Link Navigasi Instan",
      "Mesin Pengingat Otomatis Terjadwal (Tagihan Rutin & Jatuh Tempo Piutang) + Kartu Pencapaian Skor Finansial (PNG)",
      "Kartu Posisi Kekayaan Bersih (Net Worth Tracker), Batas Aman Belanja Harian, & Mode Kalender Arus Kas Interaktif",
      "Panel Developer V 3.0 Penuh: Live API Request Logs, 1-Klik Backup Database JSON, & Pengujian Push Real-Time",
    ].join("\n"),
  });
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [apkUploadProgress, setApkUploadProgress] = useState(0);
  const [isUploadingApk, setIsUploadingApk] = useState(false);

  // Broadcast & Maintenance Gate state
  const [broadcasts, setBroadcasts] = useState([]);
  const [bcastForm, setBcastForm] = useState({
    id: `bcast-${Date.now()}`,
    badge: "RILIS UTAMA V 2.0.0",
    title: "SADAR Finance V 2.0.0 Resmi Hadir di Web & Android!",
    message:
      "Kini dilengkapi Push Notification Android, Kartu Posisi Kekayaan Bersih (Net Worth), Batas Aman Belanja Harian, Mode Kalender Arus Kas, & Cetak e-Statement PDF.",
    type: "promo",
    active: true,
    bannerUrl: "",
    actionLabel: "Jelajahi Rencana & Piutang",
    actionRoute: "/financial-plans",
    affectedFeature: "none",
  });
  const [isSavingBcast, setIsSavingBcast] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Users Directory & Edit Modal state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Remote Push Notification Blaster & Sandbox Testing Lab state
  const [pushHistory, setPushHistory] = useState([]);
  const [pushForm, setPushForm] = useState({
    title: "Peringatan Budget 50/30/20 SADAR Finance",
    body: "Kuota Keinginan (30%) Anda bulan ini sudah menyentuh 88%. Yuk tahan belanja impulsif agar target tabungan tetap aman!",
    category: "budget",
    target: "all",
    actionRoute: "/behavior-insight",
    alsoBroadcast: false,
  });
  const [isSendingPush, setIsSendingPush] = useState(false);

  // AI Categorizer & Email e-Statement Sandbox state
  const [aiTestInput, setAiTestInput] = useState({
    description: "Kopi Kenangan Gula Aren & Croissant",
    amount: "48000",
  });
  const [aiTestResult, setAiTestResult] = useState(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);

  const storedEmail = useMemo(() => {
    const authUser = getStoredAuthUser();
    const u = authUser?.user || authUser?.data?.user || {};
    return String(u.email || "").trim().toLowerCase();
  }, []);

  const handleRunDiagnostics = useCallback(async () => {
    setIsPinging(true);
    const checks = [
      { name: "API Health (/health)", url: "/health" },
      { name: "PostgreSQL DB (/health/db)", url: "/health/db" },
      { name: "OTA Version (/api/v1/app/version)", url: "/api/v1/app/version" },
      { name: "Live Broadcasts (/api/v1/app/broadcasts)", url: "/api/v1/app/broadcasts" },
    ];
    const results = [];
    for (const item of checks) {
      const t0 = performance.now();
      try {
        const res = await fetch(item.url, { cache: "no-store" });
        const ms = Math.round(performance.now() - t0);
        const json = await res.json().catch(() => ({}));
        results.push({
          ...item,
          ok: res.ok,
          status: res.status,
          latencyMs: ms,
          summary: json?.message || "OK",
        });
      } catch (e) {
        results.push({
          ...item,
          ok: false,
          status: 0,
          latencyMs: Math.round(performance.now() - t0),
          summary: e?.message || "Unreachable",
        });
      }
    }
    setPingResult(results);
    setIsPinging(false);
  }, []);

  const loadAllDeveloperData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const me = await authApi.me().catch(() => null);
        const email = String(me?.email || storedEmail || "")
          .trim()
          .toLowerCase();
        if (email && email !== "mhmdhabibrafi@gmail.com") {
          setAccessDenied(true);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        const [statusData, verData, bcastData, usersData, pushData, logsData] =
          await Promise.all([
            appApi.adminSystemStatus().catch(() => null),
            appApi.version().catch(() => null),
            appApi.adminBroadcasts().catch(() => null),
            appApi.adminUsers().catch(() => null),
            appApi.pushFeed().catch(() => null),
            appApi.adminApiLogs().catch(() => null),
          ]);

        if (logsData && Array.isArray(logsData.logs)) {
          setApiLogs(logsData.logs);
        }

        if (pushData && Array.isArray(pushData.notifications)) {
          setPushHistory(pushData.notifications);
        }

        if (statusData) {
          setSysStatus(statusData);
        }
        if (verData) {
          setVersionForm({
            latestVersion: verData.latestVersion || "2.0.0",
            buildNumber: Number(verData.buildNumber || 11),
            minVersion: verData.minVersion || "1.0.0",
            forceUpdate: Boolean(verData.forceUpdate),
            downloadUrl:
              verData.downloadUrl ||
              "https://sadar-finance.web.id/downloads/sadar-finance-v2.0.0.apk",
            releaseNotesText: Array.isArray(verData.releaseNotes)
              ? verData.releaseNotes.join("\n")
              : "",
          });
        }
        if (bcastData && Array.isArray(bcastData.broadcasts)) {
          setBroadcasts(bcastData.broadcasts);
          if (bcastData.broadcasts.length > 0 && !silent) {
            const first = bcastData.broadcasts[0];
            setBcastForm({
              id: first.id || `bcast-${Date.now()}`,
              badge: first.badge || "PENGUMUMAN RESMI",
              title: first.title || "",
              message: first.message || "",
              type: first.type || "info",
              active: first.active !== false,
              bannerUrl: first.bannerUrl || first.imageUrl || "",
              actionLabel: first.actionLabel || "",
              actionRoute: first.actionRoute || "/financial-plans",
              affectedFeature: first.affectedFeature || "none",
            });
          }
        }
        if (usersData && Array.isArray(usersData.users)) {
          setUsersList(usersData.users);
        }
      } catch (err) {
        setNotice({
          color: "danger",
          text: err?.message || "Gagal memuat data Panel Developer.",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [storedEmail]
  );

  useEffect(() => {
    loadAllDeveloperData();
    handleRunDiagnostics();
  }, [loadAllDeveloperData, handleRunDiagnostics]);

  const handleSendRemotePush = async (customPayload = null) => {
    const payload = customPayload || pushForm;
    if (!payload.title?.trim() || !payload.body?.trim()) {
      setNotice({
        color: "warning",
        text: "Judul dan isi pesan Push Notification wajib diisi.",
      });
      return;
    }
    setIsSendingPush(true);
    setNotice(null);
    try {
      const res = await appApi.adminSendPush(payload);
      if (Array.isArray(res?.notifications)) {
        setPushHistory(res.notifications);
      }
      // Also trigger local browser notification immediately if target includes web/all
      if (payload.target !== "android" && "Notification" in window) {
        let perm = Notification.permission;
        if (perm !== "granted") {
          perm = await Notification.requestPermission();
        }
        if (perm === "granted") {
          new Notification(payload.title, {
            body: payload.body,
            icon: "/favicon.png",
          });
        }
      }
      window.dispatchEvent(new CustomEvent("sadar-push-sent"));
      setNotice({
        color: "success",
        text: `Push Notification "${payload.title}" berhasil dikirim ke antrean ${
          payload.target === "all"
            ? "Android APK & Web Browser"
            : payload.target === "android"
              ? "Android APK"
              : "Web Browser"
        }!`,
      });
      if (payload.alsoBroadcast) {
        loadAllDeveloperData(true);
      }
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal mengirim Push Notification.",
      });
    } finally {
      setIsSendingPush(false);
    }
  };

  const handleDeletePushItem = async (id) => {
    try {
      const res = await appApi.adminDeletePush(id);
      if (Array.isArray(res?.notifications)) {
        setPushHistory(res.notifications);
      }
      window.dispatchEvent(new CustomEvent("sadar-push-sent"));
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal menghapus riwayat push.",
      });
    }
  };

  const handleRunAiSandboxTest = async (e) => {
    if (e) e.preventDefault();
    if (!aiTestInput.description.trim()) return;
    setIsTestingAi(true);
    const t0 = performance.now();
    try {
      const res = await analyticsApi.categorize({
        description: aiTestInput.description.trim(),
        amount: Number(String(aiTestInput.amount).replace(/\D/g, "")) || 25000,
      });
      const ms = Math.round(performance.now() - t0);
      setAiTestResult({
        ok: true,
        latencyMs: ms,
        data: res,
      });
    } catch (err) {
      setAiTestResult({
        ok: false,
        latencyMs: Math.round(performance.now() - t0),
        error: err?.message || "Gagal menguji AI Categorizer.",
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleRunEmailStatementTest = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);
    const t0 = performance.now();
    try {
      const res = await analyticsApi.sendStatementEmail();
      setEmailTestResult({
        ok: true,
        latencyMs: Math.round(performance.now() - t0),
        message: `e-Statement ${
          res?.periodLabel || "Bulan Ini"
        } berhasil dikirim ke ${res?.email || "email terdaftar"}!`,
      });
    } catch (err) {
      setEmailTestResult({
        ok: false,
        latencyMs: Math.round(performance.now() - t0),
        message: err?.message || "Gagal mengirim e-Statement email.",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestWebPush = async () => {
    if (!("Notification" in window)) {
      setNotice({
        color: "warning",
        text: "Browser ini tidak mendukung Web Notification API.",
      });
      return;
    }
    let perm = Notification.permission;
    if (perm !== "granted") {
      perm = await Notification.requestPermission();
    }
    if (perm === "granted") {
      new Notification("SADAR Finance V 3.0 Developer Push", {
        body: "Notifikasi sistem Web & Broadcast SADAR Finance V 3.0 berfungsi normal!",
        icon: "/favicon.png",
      });
      setNotice({
        color: "success",
        text: "Notifikasi uji coba berhasil dikirim ke desktop/browser Anda!",
      });
    } else {
      setNotice({
        color: "warning",
        text: "Izin notifikasi browser belum diberikan.",
      });
    }
  };

  const handleRunCronReminders = async () => {
    setIsRunningCron(true);
    setNotice(null);
    try {
      const res = await appApi.adminRunReminders();
      if (Array.isArray(res?.notifications)) {
        setPushHistory(res.notifications);
      }
      window.dispatchEvent(new CustomEvent("sadar-push-sent"));
      setNotice({
        color: "success",
        text: `Mesin Cron Pengingat Otomatis selesai memeriksa ${res?.scannedUsers ?? 0} akun pengguna dan mengirim ${res?.dispatchedCount ?? 0} notifikasi ke Android & Web!`,
      });
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal menjalankan mesin pengingat otomatis.",
      });
    } finally {
      setIsRunningCron(false);
    }
  };

  const handleExportDbBackup = async () => {
    setIsExportingBackup(true);
    setNotice(null);
    try {
      const backup = await appApi.adminDbBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SADAR-Finance-V3-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice({
        color: "success",
        text: "Snapshot Backup Database & Konfigurasi (JSON) berhasil diunduh!",
      });
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal mengekspor backup database.",
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleSaveOtaVersion = async (e) => {
    e.preventDefault();
    setIsSavingVersion(true);
    setNotice(null);
    try {
      const notes = versionForm.releaseNotesText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      await appApi.adminUpdateVersion({
        latestVersion: versionForm.latestVersion.trim(),
        buildNumber: Number(versionForm.buildNumber || 11),
        minVersion: versionForm.minVersion.trim(),
        forceUpdate: Boolean(versionForm.forceUpdate),
        downloadUrl: versionForm.downloadUrl.trim(),
        releaseNotes: notes,
      });
      setNotice({
        color: "success",
        text: `Konfigurasi OTA Release v${versionForm.latestVersion} (Build #${versionForm.buildNumber}) berhasil disimpan!`,
      });
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal memperbarui konfigurasi OTA.",
      });
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleUploadApkFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingApk(true);
    setApkUploadProgress(0);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("apk", file);
      const res = await appApi.adminUploadApk(fd, (evt) => {
        if (evt.total) {
          setApkUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      });
      setNotice({
        color: "success",
        text: `Paket APK baru (${res?.sizeMb || 0} MB • SHA-256: ${String(
          res?.sha256 || ""
        ).slice(0, 12)}...) berhasil diunggah ke server!`,
      });
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal mengunggah paket APK.",
      });
    } finally {
      setIsUploadingApk(false);
      setApkUploadProgress(0);
    }
  };

  const handleUploadBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    setNotice(null);
    try {
      const fd = new FormData();
      fd.append("banner", file);
      const res = await appApi.uploadBanner(fd);
      if (res?.bannerUrl) {
        setBcastForm((prev) => ({ ...prev, bannerUrl: res.bannerUrl }));
        setNotice({
          color: "success",
          text: "Foto banner berhasil diunggah ke server!",
        });
      }
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal mengunggah foto banner.",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSaveBroadcast = async (e) => {
    e.preventDefault();
    if (!bcastForm.title.trim() || !bcastForm.message.trim()) {
      setNotice({
        color: "warning",
        text: "Judul dan isi pesan broadcast wajib diisi.",
      });
      return;
    }
    setIsSavingBcast(true);
    setNotice(null);
    try {
      const res = await appApi.saveBroadcast({
        ...bcastForm,
        imageUrl: bcastForm.bannerUrl.trim(),
        bannerUrl: bcastForm.bannerUrl.trim(),
      });
      if (Array.isArray(res?.broadcasts)) {
        setBroadcasts(res.broadcasts);
      }
      setNotice({
        color: "success",
        text: "Broadcast & Feature Gate berhasil disimpan dan ditayangkan ke Web & Aplikasi Android!",
      });
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal menyimpan broadcast.",
      });
    } finally {
      setIsSavingBcast(false);
    }
  };

  const handleToggleBroadcastActive = async (item) => {
    try {
      const res = await appApi.saveBroadcast({
        ...item,
        active: !item.active,
      });
      if (Array.isArray(res?.broadcasts)) {
        setBroadcasts(res.broadcasts);
      }
      setNotice({
        color: "success",
        text: `Status broadcast "${item.title}" diubah menjadi ${
          !item.active ? "Aktif" : "Nonaktif"
        }.`,
      });
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal mengubah status broadcast.",
      });
    }
  };

  const handleQuickToggleFeatureGate = async (featureObj) => {
    const existingGate = broadcasts.find(
      (b) => b.affectedFeature === featureObj.value
    );
    try {
      if (existingGate) {
        const res = await appApi.saveBroadcast({
          ...existingGate,
          active: !existingGate.active,
        });
        if (Array.isArray(res?.broadcasts)) setBroadcasts(res.broadcasts);
        setNotice({
          color: "info",
          text: `Maintenance Gate "${featureObj.shortLabel}" kini ${
            !existingGate.active ? "AKTIF (Pemeliharaan)" : "NONAKTIF (Normal)"
          }.`,
        });
      } else {
        const res = await appApi.saveBroadcast({
          id: `gate-${featureObj.value}`,
          badge: "PEMELIHARAAN FITUR",
          title: `Pemeliharaan Modul ${featureObj.shortLabel}`,
          message: `Fitur ${featureObj.shortLabel} sedang dalam optimalisasi berkala dan akan segera kembali normal.`,
          type: "maintenance",
          active: true,
          affectedFeature: featureObj.value,
          actionLabel: "",
          actionRoute: "",
        });
        if (Array.isArray(res?.broadcasts)) setBroadcasts(res.broadcasts);
        setNotice({
          color: "warning",
          text: `Maintenance Gate untuk "${featureObj.shortLabel}" telah DIAKTIFKAN.`,
        });
      }
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal memperbarui Maintenance Gate.",
      });
    }
  };

  const handleDeleteBroadcast = async (id) => {
    try {
      const res = await appApi.deleteBroadcast(id);
      if (Array.isArray(res?.broadcasts)) {
        setBroadcasts(res.broadcasts);
      }
      setNotice({
        color: "info",
        text: `Broadcast ${id} beserta file banner yatim berhasil dihapus.`,
      });
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal menghapus broadcast.",
      });
    }
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      await appApi.adminUpdateUser(editingUser.id, {
        status: editingUser.status,
        financial_level: Number(editingUser.financial_level) || 1,
        xp_points: Number(editingUser.xp_points) || 0,
        streak_days: Number(editingUser.streak_days) || 1,
        occupation: editingUser.occupation || "",
      });
      setNotice({
        color: "success",
        text: `Data pengguna ${editingUser.email} berhasil diperbarui!`,
      });
      setEditingUser(null);
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal memperbarui pengguna.",
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      String(user.email || "").toLowerCase() === "mhmdhabibrafi@gmail.com"
    ) {
      setNotice({
        color: "warning",
        text: "Akun Developer Utama tidak dapat dihapus.",
      });
      return;
    }
    const ok = window.confirm(
      `Hapus akun pengguna "${user.email}" beserta seluruh data transaksinya? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!ok) return;
    try {
      await appApi.adminDeleteUser(user.id);
      setNotice({
        color: "info",
        text: `Akun pengguna ${user.email} berhasil dihapus.`,
      });
      loadAllDeveloperData(true);
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal menghapus pengguna.",
      });
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return usersList;
    return usersList.filter((u) => {
      const fullName = [u.first_name, u.middle_name, u.last_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        fullName.includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.username || "").toLowerCase().includes(q)
      );
    });
  }, [usersList, userSearch]);

  if (isLoading) {
    return (
      <div className="page-content sadar-page">
        <Container fluid>
          <Card className="sadar-panel p-5 text-center">
            <div className="d-flex flex-column align-items-center gap-3">
              <Spinner color="primary" />
              <h5 className="mb-0">
                Memuat Panel Developer SADAR Finance V 2.0...
              </h5>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="page-content sadar-page">
        <Container fluid>
          <Card className="sadar-panel p-5 text-center">
            <ShieldAlert className="mx-auto text-danger mb-3" size={44} />
            <h4>Akses Ditolak — Khusus Developer Resmi</h4>
            <p className="text-muted">
              Halaman Panel Developer hanya dapat diakses oleh akun Developer
              utama SADAR Finance.
            </p>
            <div>
              <Button tag={Link} to="/dashboard" color="primary">
                Kembali ke Dashboard
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const srv = sysStatus?.server || {};
  const db = sysStatus?.database || {};
  const ai = sysStatus?.aiEngine || {};
  const storage = sysStatus?.storage || {};
  const memUsedPct =
    srv.memory?.systemTotalMb > 0
      ? Math.round(
          ((srv.memory.systemTotalMb - srv.memory.systemFreeMb) /
            srv.memory.systemTotalMb) *
            100
        )
      : 35;

  const tabs = [
    {
      id: "telemetry",
      label: "Telemetri & Server",
      icon: Server,
    },
    {
      id: "pushlab",
      label: `Push Notif & Testing Lab (${pushHistory.length})`,
      icon: Bell,
    },
    {
      id: "ota",
      label: `Rilis OTA & APK (v${versionForm.latestVersion})`,
      icon: Rocket,
    },
    {
      id: "broadcast",
      label: `Broadcast & Gate (${broadcasts.filter((b) => b.active).length})`,
      icon: Wrench,
    },
    {
      id: "users",
      label: `Manajemen Pengguna (${usersList.length || db.counts?.users || 0})`,
      icon: Users,
    },
  ];

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        {/* Header Panel Developer — Clean, Single-Row Actions */}
        <div className="sadar-page-header align-items-center mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
              <Badge color="primary" className="bg-primary-subtle text-primary">
                SADAR Finance V {srv.apiVersion || "2.0.0"}
              </Badge>
              <Badge color="success" className="bg-success-subtle text-success">
                Developer Control Center
              </Badge>
            </div>
            <h1>Panel Developer &amp; Pusat Kendali</h1>
            <p className="mb-0">
              Kelola OTA Update APK, Telemetri Server &amp; PostgreSQL,
              Maintenance Gate Fitur, Broadcast Banner, dan Akun Pengguna secara
              real-time.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-shrink-0 flex-wrap">
            <Button
              color="light"
              size="sm"
              className="sadar-table-action fw-semibold d-inline-flex align-items-center gap-1"
              onClick={handleRunCronReminders}
              disabled={isRunningCron}
            >
              <Sparkles size={14} className="text-warning" />
              <span>{isRunningCron ? "Memeriksa..." : "Jalankan Cron Reminder"}</span>
            </Button>
            <Button
              color="light"
              size="sm"
              className="sadar-table-action fw-semibold d-inline-flex align-items-center gap-1"
              onClick={handleExportDbBackup}
              disabled={isExportingBackup}
            >
              <Download size={14} className="text-primary" />
              <span>{isExportingBackup ? "Mengekspor..." : "Backup DB (JSON)"}</span>
            </Button>
            <Button
              color="light"
              size="sm"
              className="sadar-table-action fw-semibold d-inline-flex align-items-center gap-1"
              onClick={handleTestWebPush}
            >
              <Bell size={14} />
              <span>Tes Push Browser</span>
            </Button>
            <Button
              color="light"
              size="sm"
              className="sadar-table-action fw-semibold d-inline-flex align-items-center gap-1"
              onClick={() => {
                loadAllDeveloperData(true);
                handleRunDiagnostics();
              }}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "spin" : ""}
              />
              <span>{isRefreshing ? "Menyegarkan..." : "Refresh"}</span>
            </Button>
            <Button
              tag="a"
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              color="primary"
              size="sm"
              className="fw-semibold d-inline-flex align-items-center gap-1"
            >
              <ExternalLink size={14} />
              <span>Swagger API Docs</span>
            </Button>
          </div>
        </div>

        {notice && (
          <Alert
            color={notice.color}
            className="d-flex align-items-center justify-content-between py-2 px-3 mb-3"
          >
            <span>{notice.text}</span>
            <Button
              close
              onClick={() => setNotice(null)}
              aria-label="Tutup pesan"
            />
          </Alert>
        )}

        {/* Symmetrical 4-Column Segmented Navigation Bar */}
        <div
          className="sadar-mode-toggle mb-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "0.35rem",
            padding: "0.35rem",
          }}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isAct = activeTab === t.id;
            return (
              <Button
                key={t.id}
                type="button"
                className={`d-flex align-items-center justify-content-center gap-2 py-2 px-3 ${
                  isAct ? "active" : ""
                }`}
                onClick={() => setActiveTab(t.id)}
              >
                <Icon size={15} />
                <span className="text-truncate">{t.label}</span>
              </Button>
            );
          })}
        </div>

        {/* TAB 1: TELEMETRI SERVER, DB & AI ENGINE */}
        {activeTab === "telemetry" && (
          <>
            <Row className="g-3 mb-3">
              <Col xl={3} md={6}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      <span>Uptime Server Node.js</span>
                      <span className="sadar-card-icon">
                        <Cpu size={17} />
                      </span>
                    </div>
                    <h2>{formatUptime(srv.uptimeSeconds)}</h2>
                    <p>
                      {srv.nodeVersion || "Node.js"} •{" "}
                      {srv.environment || "production"} ({srv.cpuCount || 1} vCPU)
                    </p>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={3} md={6}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      <span>PostgreSQL &amp; Latensi</span>
                      <span className="sadar-card-icon success">
                        <Database size={17} />
                      </span>
                    </div>
                    <h2 className="text-success">{db.latencyMs ?? 2} ms</h2>
                    <p>
                      Status: <strong>Sehat</strong> •{" "}
                      {(db.counts?.transactions || 0) +
                        (db.counts?.incomes || 0)}{" "}
                      mutasi tercatat
                    </p>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={3} md={6}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      <span>Penggunaan RAM VPS</span>
                      <span className="sadar-card-icon teal">
                        <HardDrive size={17} />
                      </span>
                    </div>
                    <h2>
                      {srv.memory?.rssMb || 0} MB{" "}
                      <span className="fs-12 fw-normal text-muted">
                        / Heap {srv.memory?.heapUsedMb || 0} MB
                      </span>
                    </h2>
                    <Progress
                      value={memUsedPct}
                      color={memUsedPct > 85 ? "danger" : "info"}
                      style={{ height: 6 }}
                      className="mt-2"
                    />
                  </CardBody>
                </Card>
              </Col>

              <Col xl={3} md={6}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      <span>Hybrid AI Engine</span>
                      <span className="sadar-card-icon warning">
                        <Sparkles size={17} />
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2 my-2">
                      <Badge
                        color={ai.groqConfigured ? "success" : "warning"}
                        className={`bg-${
                          ai.groqConfigured ? "success" : "warning"
                        }-subtle text-${
                          ai.groqConfigured ? "success" : "warning"
                        }`}
                      >
                        Groq AI: {ai.groqConfigured ? "Aktif" : "Fallback"}
                      </Badge>
                      <Badge
                        color="primary"
                        className="bg-primary-subtle text-primary"
                      >
                        HF OCR: Aktif
                      </Badge>
                    </div>
                    <p className="text-truncate">
                      Model: {ai.groqTextModel || "llama-3.3-70b-versatile"}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="g-3">
              {/* Database Counter Breakdown & APK Checksum */}
              <Col lg={6}>
                <Card className="sadar-panel h-100">
                  <CardHeader>
                    <div>
                      <h4 className="card-title mb-1">
                        Statistik Tabel PostgreSQL &amp; Paket APK Aktif
                      </h4>
                      <p className="text-muted mb-0">
                        Rekapitulasi baris database produksi dan integritas file
                        instalasi Android
                      </p>
                    </div>
                    <Badge
                      color="primary"
                      className="bg-primary-subtle text-primary"
                    >
                      Live DB
                    </Badge>
                  </CardHeader>
                  <CardBody>
                    <Row className="g-2 mb-3">
                      {[
                        {
                          label: "Pengguna Terdaftar",
                          val: db.counts?.users ?? usersList.length,
                        },
                        {
                          label: "Rekening & Dompet",
                          val: db.counts?.accounts ?? 0,
                        },
                        {
                          label: "Transaksi Keluar",
                          val: db.counts?.transactions ?? 0,
                        },
                        {
                          label: "Catatan Pemasukan",
                          val: db.counts?.incomes ?? 0,
                        },
                        {
                          label: "Struk OCR AI",
                          val: db.counts?.ocrScans ?? 0,
                        },
                        {
                          label: "Rencana Cloud",
                          val: db.counts?.cloudPlans ?? 0,
                        },
                      ].map((stat) => (
                        <Col sm={4} xs={6} key={stat.label}>
                          <div className="sadar-insight-item d-block p-2.5">
                            <span className="text-muted fs-11 d-block">
                              {stat.label}
                            </span>
                            <strong className="fs-18 text-dark mt-1">
                              {stat.val}
                            </strong>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <strong className="fs-13">
                        File APK di Direktori `/downloads`
                      </strong>
                      <Button
                        size="sm"
                        color="light"
                        className="sadar-table-action py-1 px-2 fs-12"
                        onClick={() => setActiveTab("ota")}
                      >
                        Kelola / Upload APK →
                      </Button>
                    </div>
                    {Array.isArray(storage.apkFiles) &&
                    storage.apkFiles.length > 0 ? (
                      storage.apkFiles.map((apk) => (
                        <div
                          key={apk.filename}
                          className="sadar-insight-item d-block mb-2"
                        >
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                            <strong className="fs-13 text-primary mb-0">
                              {apk.filename}
                            </strong>
                            <div className="d-flex align-items-center gap-1.5">
                              <Badge
                                color="success"
                                className="bg-success-subtle text-success"
                              >
                                {apk.sizeMb} MB
                              </Badge>
                              {apk.sha256 && (
                                <Button
                                  size="sm"
                                  color="light"
                                  className="sadar-table-action py-0 px-2 fs-11"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(apk.sha256);
                                    setNotice({
                                      color: "info",
                                      text: `SHA-256 ${apk.filename} disalin ke clipboard!`,
                                    });
                                  }}
                                >
                                  <Copy size={12} className="me-1" />
                                  Salin SHA-256
                                </Button>
                              )}
                              <a
                                href={`/downloads/${apk.filename}`}
                                className="btn btn-sm btn-primary py-0 px-2 fs-11"
                                download
                              >
                                <Download size={12} className="me-1" />
                                Unduh
                              </a>
                            </div>
                          </div>
                          <div className="text-muted fs-11 font-monospace text-truncate">
                            SHA-256: {apk.sha256 || "-"}
                          </div>
                          <div className="text-muted fs-11 mt-0.5">
                            Diperbarui: {formatDateTime(apk.updatedAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="sadar-empty-state">
                        Belum ada file APK di direktori `/downloads`.
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              {/* Interactive API Diagnostics & Latency Tester */}
              <Col lg={6}>
                <Card className="sadar-panel h-100">
                  <CardHeader>
                    <div>
                      <h4 className="card-title mb-1">
                        Diagnostik Endpoint &amp; Konfigurasi AI
                      </h4>
                      <p className="text-muted mb-0">
                        Status kesehatan dan waktu respons (latensi) endpoint
                        produksi
                      </p>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleRunDiagnostics}
                      disabled={isPinging}
                      className="d-inline-flex align-items-center gap-1 fw-semibold"
                    >
                      <Activity size={14} />
                      <span>{isPinging ? "Menguji..." : "Uji Ulang"}</span>
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <div className="sadar-insight-item d-block mb-3">
                      <div className="d-flex justify-content-between fs-12 mb-1.5">
                        <span className="text-muted">Sistem Operasi VPS:</span>
                        <strong className="mb-0">
                          {srv.platform || "Linux x64"}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between fs-12 mb-1.5">
                        <span className="text-muted">Groq Vision Model:</span>
                        <strong className="mb-0 font-monospace">
                          {ai.groqVisionModel ||
                            "meta-llama/llama-4-scout-17b-16e-instruct"}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between fs-12">
                        <span className="text-muted">
                          Hugging Face OCR Space:
                        </span>
                        <strong className="mb-0 font-monospace">
                          {ai.hfOcrUrl || "https://fhazara-sadar-ocr.hf.space"}
                        </strong>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {(pingResult || []).map((r) => (
                        <div
                          key={r.url}
                          className="sadar-insight-item d-flex align-items-center justify-content-between py-2.5 px-3"
                        >
                          <div>
                            <strong className="fs-13 mb-0">{r.name}</strong>
                            <span className="text-muted fs-11 font-monospace d-block">
                              {r.url} • {r.summary}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Badge
                              color={r.ok ? "success" : "danger"}
                              className={`bg-${
                                r.ok ? "success" : "danger"
                              }-subtle text-${r.ok ? "success" : "danger"}`}
                            >
                              HTTP {r.status}
                            </Badge>
                            <Badge
                              color="primary"
                              className="bg-primary-subtle text-primary"
                            >
                              {r.latencyMs} ms
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Live API Request Telemetry Log Table (V 3.0) */}
            <Card className="sadar-panel mt-3">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">
                    Log Aktivitas Request API Real-Time ({apiLogs.length})
                  </h4>
                  <p className="text-muted mb-0">
                    Rekaman trafik langsung dari Aplikasi Android APK &amp; Web
                    Browser ke server produksi
                  </p>
                </div>
                <Badge color="info" className="bg-info-subtle text-info">
                  Ring Buffer (80 Terakhir)
                </Badge>
              </CardHeader>
              <CardBody className="p-0">
                <div
                  className="table-responsive"
                  style={{ maxHeight: 320, overflowY: "auto" }}
                >
                  <Table className="table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Waktu</th>
                        <th>Klien</th>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th className="pe-3 text-end">Latensi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiLogs.length > 0 ? (
                        apiLogs.slice(0, 25).map((log) => (
                          <tr key={log.id}>
                            <td className="ps-3 fs-12 text-muted">
                              {formatDateTime(log.timestamp)}
                            </td>
                            <td>
                              <Badge
                                color={
                                  log.client === "Android APK"
                                    ? "success"
                                    : "primary"
                                }
                                className={`bg-${
                                  log.client === "Android APK"
                                    ? "success"
                                    : "primary"
                                }-subtle text-${
                                  log.client === "Android APK"
                                    ? "success"
                                    : "primary"
                                }`}
                              >
                                {log.client}
                              </Badge>
                            </td>
                            <td>
                              <span className="font-monospace fw-bold fs-12">
                                {log.method}
                              </span>
                            </td>
                            <td className="font-monospace fs-12">
                              {log.path}
                            </td>
                            <td>
                              <Badge
                                color={
                                  log.status < 400 ? "success" : "danger"
                                }
                                className={`bg-${
                                  log.status < 400 ? "success" : "danger"
                                }-subtle text-${
                                  log.status < 400 ? "success" : "danger"
                                }`}
                              >
                                HTTP {log.status}
                              </Badge>
                            </td>
                            <td className="pe-3 text-end font-monospace fs-12">
                              {log.latencyMs} ms
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-muted py-4"
                          >
                            Belum ada log request API yang tercatat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* TAB 2: MANAJEMEN RILIS OTA & UPLOAD APK */}
        {activeTab === "ota" && (
          <Row className="g-3">
            <Col lg={7}>
              <Card className="sadar-panel h-100">
                <CardHeader>
                  <div>
                    <h4 className="card-title mb-1">
                      Konfigurasi Metadata OTA (`app-version.json`)
                    </h4>
                    <p className="text-muted mb-0">
                      Perbarui versi rilis, nomor build, catatan rilis, dan
                      sakelar Force Update aplikasi Android
                    </p>
                  </div>
                  <div className="form-check form-switch">
                    <Input
                      type="switch"
                      id="ota-force-update-switch"
                      checked={versionForm.forceUpdate}
                      onChange={(e) =>
                        setVersionForm((prev) => ({
                          ...prev,
                          forceUpdate: e.target.checked,
                        }))
                      }
                    />
                    <Label
                      className="form-check-label fw-bold text-danger"
                      htmlFor="ota-force-update-switch"
                    >
                      {versionForm.forceUpdate
                        ? "Force Update: AKTIF"
                        : "Force Update: Nonaktif"}
                    </Label>
                  </div>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleSaveOtaVersion}>
                    <Row className="g-3">
                      <Col md={4}>
                        <Label className="form-label fw-semibold">
                          Versi Terbaru
                        </Label>
                        <Input
                          value={versionForm.latestVersion}
                          onChange={(e) =>
                            setVersionForm((prev) => ({
                              ...prev,
                              latestVersion: e.target.value,
                            }))
                          }
                          placeholder="2.0.0"
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Label className="form-label fw-semibold">
                          Build Number
                        </Label>
                        <Input
                          type="number"
                          value={versionForm.buildNumber}
                          onChange={(e) =>
                            setVersionForm((prev) => ({
                              ...prev,
                              buildNumber: e.target.value,
                            }))
                          }
                          placeholder="11"
                          required
                        />
                      </Col>
                      <Col md={4}>
                        <Label className="form-label fw-semibold">
                          Versi Minimum
                        </Label>
                        <Input
                          value={versionForm.minVersion}
                          onChange={(e) =>
                            setVersionForm((prev) => ({
                              ...prev,
                              minVersion: e.target.value,
                            }))
                          }
                          placeholder="1.0.0"
                          required
                        />
                      </Col>

                      <Col md={12}>
                        <Label className="form-label fw-semibold">
                          URL Unduhan APK (`downloadUrl`)
                        </Label>
                        <Input
                          value={versionForm.downloadUrl}
                          onChange={(e) =>
                            setVersionForm((prev) => ({
                              ...prev,
                              downloadUrl: e.target.value,
                            }))
                          }
                          required
                        />
                      </Col>

                      <Col md={12}>
                        <Label className="form-label fw-semibold">
                          Catatan Rilis (1 poin per baris)
                        </Label>
                        <Input
                          type="textarea"
                          rows={5}
                          value={versionForm.releaseNotesText}
                          onChange={(e) =>
                            setVersionForm((prev) => ({
                              ...prev,
                              releaseNotesText: e.target.value,
                            }))
                          }
                        />
                      </Col>

                      <Col
                        xs={12}
                        className="d-flex align-items-center gap-2 flex-wrap"
                      >
                        <Button
                          type="submit"
                          color="primary"
                          className="px-4 fw-semibold"
                          disabled={isSavingVersion}
                        >
                          <CheckCircle2 size={15} className="me-1" />
                          {isSavingVersion
                            ? "Menyimpan..."
                            : "Simpan Metadata OTA"}
                        </Button>
                        <Button
                          tag={Link}
                          to="/install"
                          color="light"
                          className="sadar-table-action fw-semibold"
                        >
                          Buka Halaman Install Publik
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="sadar-panel h-100">
                <CardHeader>
                  <div>
                    <h4 className="card-title mb-1">
                      Unggah Paket APK Baru (`.apk`)
                    </h4>
                    <p className="text-muted mb-0">
                      Unggah file `.apk` langsung dari browser ke server
                      `/downloads/sadar-finance-v2.0.0.apk`
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="sadar-insight-item d-block text-center p-4 mb-3">
                    <UploadCloud size={36} className="text-primary mb-2" />
                    <strong className="fs-14">
                      Pilih File `app-release.apk`
                    </strong>
                    <p className="text-muted fs-12 mt-1 mb-3">
                      Server akan otomatis memperbarui `sadar-finance-v2.0.0.apk`
                      dan `sadar-finance-latest.apk` serta menghitung SHA-256
                      baru.
                    </p>
                    <Input
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleUploadApkFile}
                      disabled={isUploadingApk}
                    />
                    {isUploadingApk && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between fs-12 mb-1">
                          <span>Mengunggah paket APK...</span>
                          <strong>{apkUploadProgress}%</strong>
                        </div>
                        <Progress
                          value={apkUploadProgress}
                          color="primary"
                          animated
                        />
                      </div>
                    )}
                  </div>

                  <h6 className="fw-bold fs-13 mb-2">
                    Status Paket APK Aktif Saat Ini
                  </h6>
                  {(storage.apkFiles || []).map((apk) => (
                    <div
                      key={apk.filename}
                      className="sadar-insight-item d-block mb-2"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="fs-13 text-primary mb-0">
                          {apk.filename}
                        </strong>
                        <Badge
                          color="success"
                          className="bg-success-subtle text-success"
                        >
                          {apk.sizeMb} MB
                        </Badge>
                      </div>
                      <div className="text-muted fs-11 font-monospace text-truncate mt-1">
                        SHA-256: {apk.sha256}
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* TAB 3: BROADCAST, BANNER & FEATURE MAINTENANCE GATE */}
        {activeTab === "broadcast" && (
          <>
            {/* 1-Click Feature Maintenance Gate Bar */}
            <Card className="sadar-panel mb-3">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">
                    Sakelar Cepat Feature Maintenance Gate
                  </h4>
                  <p className="text-muted mb-0">
                    Aktifkan atau matikan mode pemeliharaan pada fitur spesifik
                    di Web &amp; Aplikasi Android hanya dengan 1 klik
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  {AFFECTED_FEATURES.filter((f) => f.value !== "none").map(
                    (feat) => {
                      const activeGate = broadcasts.find(
                        (b) =>
                          b.affectedFeature === feat.value && b.active === true
                      );
                      return (
                        <Col xl={3} md={6} key={feat.value}>
                          <div className="sadar-insight-item d-block h-100">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <strong className="fs-14 mb-0">
                                {feat.shortLabel}
                              </strong>
                              <div className="form-check form-switch m-0">
                                <Input
                                  type="switch"
                                  checked={Boolean(activeGate)}
                                  onChange={() =>
                                    handleQuickToggleFeatureGate(feat)
                                  }
                                />
                              </div>
                            </div>
                            <p className="text-muted fs-12 mb-2">{feat.desc}</p>
                            <Badge
                              color={activeGate ? "warning" : "success"}
                              className={`bg-${
                                activeGate ? "warning" : "success"
                              }-subtle text-${
                                activeGate ? "warning" : "success"
                              }`}
                            >
                              {activeGate
                                ? "Mode Maintenance Aktif"
                                : "Berjalan Normal"}
                            </Badge>
                          </div>
                        </Col>
                      );
                    }
                  )}
                </Row>
              </CardBody>
            </Card>

            <Row className="g-3">
              <Col lg={7}>
                <Card className="sadar-panel h-100">
                  <CardHeader>
                    <div>
                      <h4 className="card-title mb-1">
                        Editor Broadcast &amp; Foto Banner
                      </h4>
                      <p className="text-muted mb-0">
                        Tayangkan pengumuman pop-up/banner secara real-time ke
                        seluruh pengguna
                      </p>
                    </div>
                    <div className="form-check form-switch">
                      <Input
                        type="switch"
                        id="dev-bcast-active"
                        checked={bcastForm.active}
                        onChange={(e) =>
                          setBcastForm((prev) => ({
                            ...prev,
                            active: e.target.checked,
                          }))
                        }
                      />
                      <Label
                        className="form-check-label fw-semibold"
                        htmlFor="dev-bcast-active"
                      >
                        {bcastForm.active ? "Broadcast Aktif" : "Nonaktif"}
                      </Label>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleSaveBroadcast}>
                      <Row className="g-3">
                        <Col md={4}>
                          <Label className="form-label">ID Broadcast</Label>
                          <Input
                            value={bcastForm.id}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                id: e.target.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Label className="form-label">Label Badge</Label>
                          <Input
                            value={bcastForm.badge}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                badge: e.target.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Label className="form-label">Tema Warna</Label>
                          <Input
                            type="select"
                            value={bcastForm.type}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                          >
                            <option value="info">
                              Info Resmi (Navy &amp; Teal)
                            </option>
                            <option value="promo">
                              Update &amp; Fitur (Hijau)
                            </option>
                            <option value="maintenance">
                              Peringatan / Maintenance (Amber)
                            </option>
                            <option value="urgent">
                              Penting / Darurat (Merah)
                            </option>
                          </Input>
                        </Col>

                        <Col md={6}>
                          <Label className="form-label">Judul Pengumuman</Label>
                          <Input
                            value={bcastForm.title}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            required
                          />
                        </Col>
                        <Col md={6}>
                          <Label className="form-label">
                            Fitur Terdampak (Gate)
                          </Label>
                          <Input
                            type="select"
                            value={bcastForm.affectedFeature}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                affectedFeature: e.target.value,
                              }))
                            }
                          >
                            {AFFECTED_FEATURES.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </Input>
                        </Col>

                        <Col md={12}>
                          <Label className="form-label">
                            Isi Pesan Broadcast
                          </Label>
                          <Input
                            type="textarea"
                            rows={3}
                            value={bcastForm.message}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                message: e.target.value,
                              }))
                            }
                            required
                          />
                        </Col>

                        <Col md={6}>
                          <Label className="form-label">
                            Unggah Foto Banner (PNG/JPG/WEBP)
                          </Label>
                          <Input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleUploadBanner}
                            disabled={isUploadingBanner}
                          />
                        </Col>
                        <Col md={6}>
                          <Label className="form-label">URL Foto Banner</Label>
                          <Input
                            value={bcastForm.bannerUrl}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                bannerUrl: e.target.value,
                              }))
                            }
                            placeholder="https://sadar-finance.web.id/api/v1/app/banners/..."
                          />
                        </Col>

                        <Col md={6}>
                          <Label className="form-label">Teks Tombol Aksi</Label>
                          <Input
                            value={bcastForm.actionLabel}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                actionLabel: e.target.value,
                              }))
                            }
                          />
                        </Col>
                        <Col md={6}>
                          <Label className="form-label">Rute Tombol Aksi</Label>
                          <Input
                            value={bcastForm.actionRoute}
                            onChange={(e) =>
                              setBcastForm((prev) => ({
                                ...prev,
                                actionRoute: e.target.value,
                              }))
                            }
                          />
                        </Col>

                        <Col xs={12} className="d-flex flex-wrap gap-2">
                          <Button
                            type="submit"
                            color="primary"
                            className="fw-semibold"
                            disabled={isSavingBcast || isUploadingBanner}
                          >
                            {isSavingBcast
                              ? "Menyimpan..."
                              : "Simpan & Tayangkan Broadcast"}
                          </Button>
                          <Button
                            type="button"
                            color="light"
                            className="sadar-table-action"
                            onClick={() =>
                              setBcastForm({
                                id: `bcast-${Date.now()}`,
                                badge: "PENGUMUMAN BARU",
                                title: "",
                                message: "",
                                type: "info",
                                active: true,
                                bannerUrl: "",
                                actionLabel: "",
                                actionRoute: "/dashboard",
                                affectedFeature: "none",
                              })
                            }
                          >
                            + Buat Broadcast Baru
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="sadar-panel h-100">
                  <CardHeader>
                    <div>
                      <h4 className="card-title mb-1">
                        Daftar Broadcast Tersimpan ({broadcasts.length})
                      </h4>
                      <p className="text-muted mb-0">
                        Kelola status tayang atau hapus pengumuman lama
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {broadcasts.length === 0 ? (
                      <div className="sadar-empty-state text-center py-4">
                        Belum ada broadcast yang disimpan.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {broadcasts.map((item) => (
                          <div
                            key={item.id}
                            className="sadar-insight-item d-block"
                          >
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <Badge
                                  color={item.active ? "success" : "secondary"}
                                  className={`bg-${
                                    item.active ? "success" : "secondary"
                                  }-subtle text-${
                                    item.active ? "success" : "secondary"
                                  }`}
                                >
                                  {item.active ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <Badge
                                  color="primary"
                                  className="bg-primary-subtle text-primary"
                                >
                                  {item.type || "info"}
                                </Badge>
                                {item.affectedFeature &&
                                  item.affectedFeature !== "none" && (
                                    <Badge
                                      color="warning"
                                      className="bg-warning-subtle text-warning"
                                    >
                                      Gate: {item.affectedFeature}
                                    </Badge>
                                  )}
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <Button
                                  size="sm"
                                  color="light"
                                  className="sadar-table-action py-0 px-2 fs-12"
                                  onClick={() =>
                                    handleToggleBroadcastActive(item)
                                  }
                                >
                                  {item.active ? "Matikan" : "Aktifkan"}
                                </Button>
                                <Button
                                  size="sm"
                                  color="light"
                                  className="sadar-table-action py-0 px-2 fs-12"
                                  onClick={() =>
                                    setBcastForm({
                                      id: item.id,
                                      badge: item.badge || "PENGUMUMAN RESMI",
                                      title: item.title || "",
                                      message: item.message || "",
                                      type: item.type || "info",
                                      active: item.active !== false,
                                      bannerUrl:
                                        item.bannerUrl || item.imageUrl || "",
                                      actionLabel: item.actionLabel || "",
                                      actionRoute:
                                        item.actionRoute || "/dashboard",
                                      affectedFeature:
                                        item.affectedFeature || "none",
                                    })
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-danger py-0 px-2"
                                  onClick={() => handleDeleteBroadcast(item.id)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </div>
                            <strong className="fs-14 d-block">
                              {item.title}
                            </strong>
                            <p className="text-muted fs-12 mb-0 mt-1">
                              {item.message}
                            </p>
                            {(item.bannerUrl || item.imageUrl) && (
                              <img
                                src={item.bannerUrl || item.imageUrl}
                                alt={item.title}
                                className="rounded-2 border mt-2"
                                style={{
                                  maxHeight: 110,
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* TAB 4: MANAJEMEN PENGGUNA TERDAFTAR */}
        {activeTab === "users" && (
          <Card className="sadar-panel">
            <CardHeader>
              <div>
                <h4 className="card-title mb-1">
                  Manajemen Pengguna Terdaftar ({filteredUsers.length})
                </h4>
                <p className="text-muted mb-0">
                  Pantau rekening, saldo, transaksi, serta kelola Level, XP, dan
                  status akun pengguna
                </p>
              </div>
              <div className="sadar-table-search">
                <i className="ri-search-line"></i>
                <Input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama, email, atau username..."
                />
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="table-responsive sadar-table-wrap">
                <Table className="sadar-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Username &amp; Email</th>
                      <th>Profesi &amp; Kota</th>
                      <th>Level &amp; Streak</th>
                      <th className="text-end">Rekening &amp; Saldo</th>
                      <th className="text-center">Mutasi</th>
                      <th>Status</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-4 text-muted"
                        >
                          Tidak ada pengguna yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const fullName =
                          [u.first_name, u.middle_name, u.last_name]
                            .filter((p) => p && p !== "User")
                            .join(" ") || "Pengguna SADAR";
                        const isPrimaryDev =
                          String(u.email || "").toLowerCase() ===
                          "mhmdhabibrafi@gmail.com";
                        return (
                          <tr key={u.id}>
                            <td>
                              <div className="fw-bold text-dark">
                                {fullName}
                              </div>
                              <div className="text-muted fs-11">
                                Bergabung: {formatDateTime(u.created_at)}
                              </div>
                            </td>
                            <td>
                              <div className="text-primary fw-semibold fs-13">
                                @{u.username || "sadar"}
                              </div>
                              <div className="text-muted fs-12">{u.email}</div>
                            </td>
                            <td>
                              <div className="fs-13">
                                {u.occupation || "-"}
                              </div>
                              <div className="text-muted fs-11">
                                {u.city || ""}
                              </div>
                            </td>
                            <td>
                              <Badge
                                color="primary"
                                className="bg-primary-subtle text-primary me-1"
                              >
                                LV.{u.financial_level || 1}
                              </Badge>
                              <span className="text-warning fw-bold fs-12">
                                {u.streak_days || 1} Hr ({u.xp_points || 50} XP)
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="fw-bold text-dark">
                                {rupiah(u.total_balance || 0)}
                              </div>
                              <div className="text-muted fs-11">
                                {u.accounts_count || 0} rekening
                              </div>
                            </td>
                            <td className="text-center">
                              <Badge
                                color="success"
                                className="bg-success-subtle text-success"
                              >
                                {(Number(u.transactions_count) || 0) +
                                  (Number(u.incomes_count) || 0)}{" "}
                                catatan
                              </Badge>
                            </td>
                            <td>
                              <Badge
                                color={
                                  u.status === "suspended"
                                    ? "danger"
                                    : "success"
                                }
                                className={`bg-${
                                  u.status === "suspended"
                                    ? "danger"
                                    : "success"
                                }-subtle text-${
                                  u.status === "suspended"
                                    ? "danger"
                                    : "success"
                                }`}
                              >
                                {u.status === "suspended"
                                  ? "Suspended"
                                  : "Aktif"}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex align-items-center gap-1">
                                <Button
                                  size="sm"
                                  color="light"
                                  className="sadar-table-action py-1 px-2"
                                  onClick={() =>
                                    setEditingUser({
                                      ...u,
                                      fullName,
                                    })
                                  }
                                  title="Edit Pengguna"
                                >
                                  <Edit3 size={14} />
                                </Button>
                                {!isPrimaryDev && (
                                  <Button
                                    size="sm"
                                    color="light"
                                    className="text-danger py-1 px-2"
                                    onClick={() => handleDeleteUser(u)}
                                    title="Hapus Pengguna"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* TAB 5: PUSH NOTIFICATION BLASTER & SANDBOX TESTING LAB */}
        {activeTab === "pushlab" && (
          <>
            {/* 4 Quick 1-Click Push Simulation Presets */}
            <Card className="sadar-panel mb-3">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">
                    Simulasi Cepat Push Notification 1-Klik (Android APK &amp; Web)
                  </h4>
                  <p className="text-muted mb-0">
                    Uji coba pengiriman pop-up notifikasi bilah status HP Android,
                    Notifikasi Desktop Browser, dan Lonceng Web App secara
                    instan
                  </p>
                </div>
                <Badge color="primary" className="bg-primary-subtle text-primary">
                  Real-Time Push Queue
                </Badge>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  {[
                    {
                      badge: "Budget 50/30/20",
                      tone: "danger",
                      title: "Waspada Anggaran 50/30/20 (92%)",
                      body: "Pengeluaran Keinginan (30%) Anda sudah mencapai 92% dari batas bulan ini. Yuk jaga batas aman belanja harianmu!",
                      category: "budget",
                      actionRoute: "/behavior-insight",
                    },
                    {
                      badge: "Tagihan Rutin",
                      tone: "warning",
                      title: "Pengingat Tagihan Rutin: Listrik & WiFi",
                      body: "Jadwal tagihan rutin bulanan sebesar Rp 450.000 jatuh tempo besok. Ketuk untuk mencatat pembayaran 1-klik.",
                      category: "recurring",
                      actionRoute: "/financial-plans",
                    },
                    {
                      badge: "Piutang & Split Bill",
                      tone: "primary",
                      title: "Jatuh Tempo Piutang: Patungan Makan Malam",
                      body: "Catatan piutang patungan sebesar Rp 125.000 jatuh tempo hari ini. Kirim pengingat WhatsApp dari menu Piutang.",
                      category: "debt",
                      actionRoute: "/financial-plans",
                    },
                    {
                      badge: "Pengumuman Resmi",
                      tone: "success",
                      title: "SADAR Finance V 2.0.0 Aktif!",
                      body: "Selamat! Fitur Kartu Net Worth, Kalender Arus Kas, Cetak e-Statement PDF, dan Push Notification siap digunakan.",
                      category: "promo",
                      actionRoute: "/dashboard",
                    },
                  ].map((preset) => (
                    <Col xl={3} md={6} key={preset.title}>
                      <div className="sadar-insight-item d-flex flex-column justify-content-between h-100">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <Badge
                              color={preset.tone}
                              className={`bg-${preset.tone}-subtle text-${preset.tone}`}
                            >
                              {preset.badge}
                            </Badge>
                            <Smartphone size={15} className="text-muted" />
                          </div>
                          <strong className="fs-13 d-block mb-1">
                            {preset.title}
                          </strong>
                          <p className="text-muted fs-12 mb-3">{preset.body}</p>
                        </div>
                        <Button
                          color="primary"
                          size="sm"
                          className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
                          disabled={isSendingPush}
                          onClick={() =>
                            handleSendRemotePush({
                              title: preset.title,
                              body: preset.body,
                              category: preset.category,
                              target: "all",
                              actionRoute: preset.actionRoute,
                              alsoBroadcast: false,
                            })
                          }
                        >
                          <Send size={13} />
                          <span>Kirim Simulasi ke HP &amp; Web</span>
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>

            <Row className="g-3 mb-3">
              {/* Custom Push Notification Blaster Form */}
              <Col lg={7}>
                <Card className="sadar-panel h-100">
                  <CardHeader>
                    <div>
                      <h4 className="card-title mb-1">
                        Kirim Push Notification Kustom (Blaster)
                      </h4>
                      <p className="text-muted mb-0">
                        Tulis dan kirimkan Push Notification khusus ke seluruh
                        perangkat Android APK &amp; Web Browser yang aktif
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendRemotePush();
                      }}
                    >
                      <Row className="g-3">
                        <Col md={4}>
                          <Label className="form-label">Target Perangkat</Label>
                          <Input
                            type="select"
                            value={pushForm.target}
                            onChange={(e) =>
                              setPushForm((prev) => ({
                                ...prev,
                                target: e.target.value,
                              }))
                            }
                          >
                            <option value="all">
                              Android APK + Web Browser
                            </option>
                            <option value="android">
                              Khusus Aplikasi Android (APK)
                            </option>
                            <option value="web">
                              Khusus Web Browser &amp; Lonceng
                            </option>
                          </Input>
                        </Col>
                        <Col md={4}>
                          <Label className="form-label">
                            Kategori Notifikasi
                          </Label>
                          <Input
                            type="select"
                            value={pushForm.category}
                            onChange={(e) =>
                              setPushForm((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                          >
                            <option value="info">Informasi Umum</option>
                            <option value="budget">
                              Peringatan Budget 50/30/20
                            </option>
                            <option value="recurring">
                              Tagihan &amp; Gaji Rutin
                            </option>
                            <option value="debt">
                              Piutang &amp; Split Bill
                            </option>
                            <option value="promo">Rilis Fitur / Promo</option>
                            <option value="urgent">Darurat / Keamanan</option>
                          </Input>
                        </Col>
                        <Col md={4}>
                          <Label className="form-label">
                            Rute Tujuan Saat Diklik
                          </Label>
                          <Input
                            value={pushForm.actionRoute}
                            onChange={(e) =>
                              setPushForm((prev) => ({
                                ...prev,
                                actionRoute: e.target.value,
                              }))
                            }
                            placeholder="/dashboard"
                          />
                        </Col>

                        <Col md={12}>
                          <Label className="form-label">
                            Judul Push Notification
                          </Label>
                          <Input
                            value={pushForm.title}
                            onChange={(e) =>
                              setPushForm((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Contoh: Peringatan Budget 50/30/20 Bulanan"
                            required
                          />
                        </Col>

                        <Col md={12}>
                          <Label className="form-label">
                            Isi Pesan Push Notification
                          </Label>
                          <Input
                            type="textarea"
                            rows={3}
                            value={pushForm.body}
                            onChange={(e) =>
                              setPushForm((prev) => ({
                                ...prev,
                                body: e.target.value,
                              }))
                            }
                            placeholder="Tulis isi pesan yang akan tampil di bilah status HP Android dan pop-up browser..."
                            required
                          />
                        </Col>

                        <Col md={12}>
                          <div className="form-check">
                            <Input
                              type="checkbox"
                              id="also-pin-broadcast"
                              checked={pushForm.alsoBroadcast}
                              onChange={(e) =>
                                setPushForm((prev) => ({
                                  ...prev,
                                  alsoBroadcast: e.target.checked,
                                }))
                              }
                            />
                            <Label
                              className="form-check-label fs-13"
                              htmlFor="also-pin-broadcast"
                            >
                              Sematkan juga sebagai Banner Pengumuman di atas
                              Beranda Dashboard Web &amp; Android
                            </Label>
                          </div>
                        </Col>

                        <Col xs={12} className="d-flex flex-wrap gap-2">
                          <Button
                            type="submit"
                            color="primary"
                            className="px-4 fw-semibold d-inline-flex align-items-center gap-1.5"
                            disabled={isSendingPush}
                          >
                            <Send size={15} />
                            <span>
                              {isSendingPush
                                ? "Mengirim Push..."
                                : "Kirim Push Notification Sekarang"}
                            </span>
                          </Button>
                          <Button
                            type="button"
                            color="light"
                            className="sadar-table-action fw-semibold"
                            onClick={handleTestWebPush}
                          >
                            Tes Izin Notifikasi Browser Lokal
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              </Col>

              {/* Sandbox Testing Lab: AI Categorizer 50/30/20 & Email e-Statement SMTP */}
              <Col lg={5}>
                <Card className="sadar-panel h-100">
                  <CardHeader>
                    <div>
                      <h4 className="card-title mb-1">
                        Sandbox Testing Lab (AI 50/30/20 &amp; Email SMTP)
                      </h4>
                      <p className="text-muted mb-0">
                        Uji mesin klasifikasi transaksi AI dan pengiriman
                        e-Statement email secara langsung
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleRunAiSandboxTest} className="mb-3">
                      <strong className="fs-13 d-block mb-2">
                        1. Penguji Klasifikasi AI 50/30/20 (`/analytics/categorize`)
                      </strong>
                      <Row className="g-2 mb-2">
                        <Col sm={7}>
                          <Input
                            value={aiTestInput.description}
                            onChange={(e) =>
                              setAiTestInput((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Nama transaksi (misal: Kopi Kenangan)"
                          />
                        </Col>
                        <Col sm={5}>
                          <Input
                            value={aiTestInput.amount}
                            onChange={(e) =>
                              setAiTestInput((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            placeholder="Nominal (Rp)"
                          />
                        </Col>
                      </Row>
                      <Button
                        type="submit"
                        color="primary"
                        size="sm"
                        className="w-100 fw-semibold"
                        disabled={isTestingAi}
                      >
                        <Sparkles size={14} className="me-1" />
                        {isTestingAi
                          ? "Memproses Klasifikasi AI..."
                          : "Uji Klasifikasi AI 50/30/20"}
                      </Button>
                    </Form>

                    {aiTestResult && (
                      <div className="sadar-insight-item d-block mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Badge
                            color={aiTestResult.ok ? "success" : "danger"}
                            className={`bg-${
                              aiTestResult.ok ? "success" : "danger"
                            }-subtle text-${
                              aiTestResult.ok ? "success" : "danger"
                            }`}
                          >
                            {aiTestResult.ok ? "AI Berhasil" : "Gagal"}
                          </Badge>
                          <span className="text-muted fs-11">
                            Latensi: {aiTestResult.latencyMs} ms
                          </span>
                        </div>
                        {aiTestResult.ok ? (
                          <div className="fs-12">
                            <div>
                              Kelompok 50/30/20:{" "}
                              <strong className="text-primary d-inline">
                                {aiTestResult.data?.category_group ||
                                  aiTestResult.data?.categoryGroup ||
                                  aiTestResult.data?.budget_group ||
                                  "Wants (Keinginan)"}
                              </strong>
                            </div>
                            <div className="text-muted mt-0.5">
                              Sub-Kategori:{" "}
                              {aiTestResult.data?.category_detail ||
                                aiTestResult.data?.categoryDetail ||
                                aiTestResult.data?.category ||
                                "Makanan & Minuman"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-danger fs-12">
                            {aiTestResult.error}
                          </div>
                        )}
                      </div>
                    )}

                    <hr className="my-3" />

                    <div>
                      <strong className="fs-13 d-block mb-1">
                        2. Penguji Pengiriman Email e-Statement (`/statement/email`)
                      </strong>
                      <p className="text-muted fs-12 mb-2">
                        Kirim laporan e-Statement resmi bulan berjalan ke email
                        Developer untuk memastikan layanan email berfungsi.
                      </p>
                      <Button
                        color="light"
                        size="sm"
                        className="sadar-table-action w-100 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                        onClick={handleRunEmailStatementTest}
                        disabled={isTestingEmail}
                      >
                        <Mail size={14} />
                        <span>
                          {isTestingEmail
                            ? "Mengirim e-Statement..."
                            : "Tes Kirim e-Statement ke Email"}
                        </span>
                      </Button>
                      {emailTestResult && (
                        <div
                          className={`mt-2 p-2 rounded-2 fs-12 ${
                            emailTestResult.ok
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}
                        >
                          {emailTestResult.message} ({emailTestResult.latencyMs}{" "}
                          ms)
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Sent Push Notifications Log Table */}
            <Card className="sadar-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">
                    Riwayat Push Notification Terkirim ({pushHistory.length})
                  </h4>
                  <p className="text-muted mb-0">
                    Daftar antrean Push Notification aktif yang diambil otomatis
                    oleh Aplikasi Android V 2.0 dan Lonceng Web App
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="table-responsive sadar-table-wrap">
                  <Table className="sadar-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Waktu Kirim</th>
                        <th>Target</th>
                        <th>Kategori</th>
                        <th>Judul &amp; Isi Pesan Push</th>
                        <th>Rute</th>
                        <th className="text-end">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pushHistory.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-4 text-muted"
                          >
                            Belum ada riwayat Push Notification. Klik salah satu
                            tombol Simulasi di atas untuk mengirim uji coba!
                          </td>
                        </tr>
                      ) : (
                        pushHistory.map((p) => (
                          <tr key={p.id}>
                            <td className="text-muted fs-12 whitespace-nowrap">
                              {formatDateTime(p.sentAt)}
                            </td>
                            <td>
                              <Badge
                                color="primary"
                                className="bg-primary-subtle text-primary"
                              >
                                {p.target === "all"
                                  ? "Android + Web"
                                  : p.target === "android"
                                    ? "Android APK"
                                    : "Web Browser"}
                              </Badge>
                            </td>
                            <td>
                              <Badge
                                color={
                                  p.category === "budget" ||
                                  p.category === "urgent"
                                    ? "danger"
                                    : p.category === "recurring"
                                      ? "warning"
                                      : "success"
                                }
                                className={`bg-${
                                  p.category === "budget" ||
                                  p.category === "urgent"
                                    ? "danger"
                                    : p.category === "recurring"
                                      ? "warning"
                                      : "success"
                                }-subtle text-${
                                  p.category === "budget" ||
                                  p.category === "urgent"
                                    ? "danger"
                                    : p.category === "recurring"
                                      ? "warning"
                                      : "success"
                                }`}
                              >
                                {p.category || "info"}
                              </Badge>
                            </td>
                            <td>
                              <div className="fw-bold text-dark fs-13">
                                {p.title}
                              </div>
                              <div className="text-muted fs-12">
                                {p.body || p.message}
                              </div>
                            </td>
                            <td className="font-monospace fs-12 text-muted">
                              {p.actionRoute || "/dashboard"}
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex align-items-center gap-1">
                                <Button
                                  size="sm"
                                  color="light"
                                  className="sadar-table-action py-1 px-2 fs-12"
                                  onClick={() =>
                                    handleSendRemotePush({
                                      title: p.title,
                                      body: p.body || p.message,
                                      category: p.category,
                                      target: p.target,
                                      actionRoute: p.actionRoute,
                                      alsoBroadcast: false,
                                    })
                                  }
                                  disabled={isSendingPush}
                                >
                                  Kirim Ulang
                                </Button>
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-danger py-1 px-2"
                                  onClick={() => handleDeletePushItem(p.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </Container>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        toggle={() => setEditingUser(null)}
        centered
      >
        <ModalHeader toggle={() => setEditingUser(null)}>
          Kelola Pengguna: {editingUser?.fullName}
        </ModalHeader>
        <Form onSubmit={handleSaveUserEdit}>
          <ModalBody>
            {editingUser && (
              <Row className="g-3">
                <Col md={12}>
                  <Label className="form-label">Email Pengguna</Label>
                  <Input value={editingUser.email || ""} disabled />
                </Col>
                <Col md={6}>
                  <Label className="form-label">Status Akun</Label>
                  <Input
                    type="select"
                    value={editingUser.status || "active"}
                    onChange={(e) =>
                      setEditingUser((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="active">Aktif (Normal)</option>
                    <option value="suspended">Suspended (Dibekukan)</option>
                  </Input>
                </Col>
                <Col md={6}>
                  <Label className="form-label">Profesi / Pekerjaan</Label>
                  <Input
                    value={editingUser.occupation || ""}
                    onChange={(e) =>
                      setEditingUser((prev) => ({
                        ...prev,
                        occupation: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col md={4}>
                  <Label className="form-label">Financial Level</Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={editingUser.financial_level || 1}
                    onChange={(e) =>
                      setEditingUser((prev) => ({
                        ...prev,
                        financial_level: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col md={4}>
                  <Label className="form-label">Streak (Hari)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingUser.streak_days ?? 1}
                    onChange={(e) =>
                      setEditingUser((prev) => ({
                        ...prev,
                        streak_days: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col md={4}>
                  <Label className="form-label">XP Points</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingUser.xp_points ?? 50}
                    onChange={(e) =>
                      setEditingUser((prev) => ({
                        ...prev,
                        xp_points: e.target.value,
                      }))
                    }
                  />
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="light"
              onClick={() => setEditingUser(null)}
            >
              Batal
            </Button>
            <Button type="submit" color="primary" disabled={isSavingUser}>
              {isSavingUser ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default SadarDeveloperPanel;
