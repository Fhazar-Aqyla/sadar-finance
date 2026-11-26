import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  HardDrive,
  RefreshCw,
  Rocket,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trash2,
  Users,
  Wrench,
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
  Nav,
  NavItem,
  NavLink,
  Progress,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { appApi, authApi } from "../../Components/services/api";
import { getStoredAuthUser } from "../../helpers/auth-storage";
import "../SadarShared/sadar-pages.css";

const AFFECTED_FEATURES = [
  { value: "none", label: "Tidak Ada (Pengumuman Biasa)" },
  { value: "ocr_scan", label: "Scan Struk OCR AI (Maintenance Gate)" },
  { value: "export_report", label: "Cetak / Kirim e-Statement (Maintenance Gate)" },
  { value: "cloud_plans", label: "Rencana & Piutang Cloud (Maintenance Gate)" },
  { value: "account_transfer", label: "Transfer Antar Akun (Maintenance Gate)" },
];

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
    document.title = "Panel Developer | SADAR Finance V 2.0";
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

  // OTA Version Manager state
  const [versionForm, setVersionForm] = useState({
    latestVersion: "2.0.0",
    buildNumber: 11,
    minVersion: "1.0.0",
    forceUpdate: false,
    downloadUrl:
      "https://sadar-finance.web.id/downloads/sadar-finance-v2.0.0.apk?v=2.0.0-b11",
    releaseNotesText: [
      "Rilis Utama SADAR Finance V 2.0.0: Pratinjau & Cetak e-Statement Bulanan Resmi di Dalam Aplikasi",
      "Push Notification Android Native untuk Broadcast, Budget 50/30/20, dan Tagihan Jatuh Tempo",
      "Kartu Posisi Kekayaan Bersih (Net Worth) & Indikator Batas Aman Belanja Harian",
      "Mode Kalender Arus Kas Bulanan Interaktif & Penjaga Duplikat Transaksi Pintar",
    ].join("\n"),
  });
  const [isSavingVersion, setIsSavingVersion] = useState(false);

  // Broadcast & Maintenance Gate state
  const [broadcasts, setBroadcasts] = useState([]);
  const [bcastForm, setBcastForm] = useState({
    id: `bcast-${Date.now()}`,
    badge: "PENGUMUMAN & FITUR BARU",
    title: "SADAR Finance V 2.0.0 Kini Tersedia!",
    message:
      "Dilengkapi Push Notification Android, Kartu Net Worth, Batas Aman Belanja Harian, Kalender Arus Kas, & e-Statement PDF.",
    type: "info",
    active: true,
    bannerUrl: "",
    actionLabel: "Buka Rencana & Piutang",
    actionRoute: "/financial-plans",
    affectedFeature: "none",
  });
  const [isSavingBcast, setIsSavingBcast] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Users Directory state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  const storedEmail = useMemo(() => {
    const authUser = getStoredAuthUser();
    const u = authUser?.user || authUser?.data?.user || {};
    return String(u.email || "").trim().toLowerCase();
  }, []);

  const loadAllDeveloperData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const me = await authApi.me().catch(() => null);
      const email = String(me?.email || storedEmail || "").trim().toLowerCase();
      if (email && email !== "mhmdhabibrafi@gmail.com") {
        setAccessDenied(true);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const [statusData, verData, bcastData, usersData] = await Promise.all([
        appApi.adminSystemStatus().catch(() => null),
        appApi.version().catch(() => null),
        appApi.adminBroadcasts().catch(() => null),
        appApi.adminUsers().catch(() => null),
      ]);

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
        if (bcastData.broadcasts.length > 0) {
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
  }, [storedEmail]);

  useEffect(() => {
    loadAllDeveloperData();
  }, [loadAllDeveloperData]);

  const handleRunDiagnostics = async () => {
    setIsPinging(true);
    setNotice(null);
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
      new Notification("SADAR Finance V 2.0 Developer Push", {
        body: "Notifikasi sistem Web & Broadcast SADAR Finance berfungsi normal!",
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
    } catch (err) {
      setNotice({
        color: "danger",
        text: err?.message || "Gagal menghapus broadcast.",
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
              <h5 className="mb-0">Memuat Panel Developer SADAR Finance V 2.0...</h5>
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
              Halaman Panel Developer hanya dapat diakses oleh akun Developer utama SADAR Finance.
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
            100,
        )
      : 35;

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        {/* Header Hero Panel Developer */}
        <Card
          className="sadar-panel mb-3 border-0 text-white"
          style={{
            background:
              "linear-gradient(135deg, #0F172A 0%, #1E3A8A 62%, #0D9488 100%)",
          }}
        >
          <CardBody className="p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: 52,
                    height: 52,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <Terminal size={26} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <h4 className="mb-0 text-white fw-bold">
                      Panel Developer & Control Center
                    </h4>
                    <Badge color="success" pill>
                      V {srv.apiVersion || "2.0.0"} Live
                    </Badge>
                    <Badge color="info" pill>
                      Developer Eksklusif
                    </Badge>
                  </div>
                  <p className="mb-0 mt-1 text-white-50 fs-13">
                    Pusat kendali OTA Update APK, Telemetri Server & PostgreSQL,
                    Status AI Engine, Feature Maintenance Gate, dan Broadcast
                    Real-Time.
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  color="light"
                  size="sm"
                  className="fw-semibold d-flex align-items-center gap-1"
                  onClick={handleTestWebPush}
                >
                  <Bell size={15} />
                  Tes Push Browser
                </Button>
                <Button
                  color="light"
                  size="sm"
                  className="fw-semibold d-flex align-items-center gap-1"
                  onClick={() => loadAllDeveloperData(true)}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    size={15}
                    className={isRefreshing ? "spin" : ""}
                  />
                  {isRefreshing ? "Menyegarkan..." : "Refresh Telemetri"}
                </Button>
                <Button
                  tag="a"
                  href="/api-docs"
                  target="_blank"
                  rel="noreferrer"
                  color="warning"
                  size="sm"
                  className="fw-semibold d-flex align-items-center gap-1 text-dark"
                >
                  <ExternalLink size={15} />
                  Swagger API Docs
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

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

        {/* Navigation Tabs */}
        <Card className="sadar-panel mb-3">
          <CardBody className="py-2 px-3">
            <Nav pills className="gap-2 flex-wrap">
              <NavItem>
                <NavLink
                  active={activeTab === "telemetry"}
                  onClick={() => setActiveTab("telemetry")}
                  style={{ cursor: "pointer" }}
                  className="d-flex align-items-center gap-2 fw-semibold"
                >
                  <Server size={16} />
                  Telemetri Server, DB & AI
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "ota"}
                  onClick={() => setActiveTab("ota")}
                  style={{ cursor: "pointer" }}
                  className="d-flex align-items-center gap-2 fw-semibold"
                >
                  <Rocket size={16} />
                  Manajemen Rilis OTA & APK
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "broadcast"}
                  onClick={() => setActiveTab("broadcast")}
                  style={{ cursor: "pointer" }}
                  className="d-flex align-items-center gap-2 fw-semibold"
                >
                  <Wrench size={16} />
                  Broadcast & Feature Maintenance Gate (
                  {storage.activeBroadcastsCount || 0})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "users"}
                  onClick={() => setActiveTab("users")}
                  style={{ cursor: "pointer" }}
                  className="d-flex align-items-center gap-2 fw-semibold"
                >
                  <Users size={16} />
                  Direktori Pengguna ({db.counts?.users || usersList.length})
                </NavLink>
              </NavItem>
            </Nav>
          </CardBody>
        </Card>

        {/* TAB 1: TELEMETRI SERVER, DB & AI ENGINE */}
        {activeTab === "telemetry" && (
          <>
            <Row className="g-3 mb-3">
              <Col md={3} sm={6}>
                <Card className="sadar-panel h-100">
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted fs-12 fw-semibold">
                        UPTIME SERVER NODE.JS
                      </span>
                      <Cpu size={18} className="text-primary" />
                    </div>
                    <h4 className="fw-bold mb-1">
                      {formatUptime(srv.uptimeSeconds)}
                    </h4>
                    <div className="text-muted fs-12">
                      {srv.nodeVersion || "Node.js"} • {srv.environment || "production"}
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3} sm={6}>
                <Card className="sadar-panel h-100">
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted fs-12 fw-semibold">
                        LATENSI POSTGRESQL
                      </span>
                      <Database size={18} className="text-success" />
                    </div>
                    <h4 className="fw-bold mb-1 text-success">
                      {db.latencyMs ?? 2} ms
                    </h4>
                    <div className="text-muted fs-12">
                      Status: <strong>{db.status || "healthy"}</strong> •{" "}
                      {(db.counts?.transactions || 0) +
                        (db.counts?.incomes || 0)}{" "}
                      total arus kas
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col md={3} sm={6}>
                <Card className="sadar-panel h-100">
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted fs-12 fw-semibold">
                        PENGGUNAAN RAM VPS
                      </span>
                      <HardDrive size={18} className="text-info" />
                    </div>
                    <h4 className="fw-bold mb-1">
                      {srv.memory?.rssMb || 0} MB{" "}
                      <span className="fs-12 fw-normal text-muted">
                        (Heap {srv.memory?.heapUsedMb || 0} MB)
                      </span>
                    </h4>
                    <Progress
                      value={memUsedPct}
                      color={memUsedPct > 85 ? "danger" : "info"}
                      style={{ height: 6 }}
                      className="mt-2"
                    />
                  </CardBody>
                </Card>
              </Col>

              <Col md={3} sm={6}>
                <Card className="sadar-panel h-100">
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted fs-12 fw-semibold">
                        STATUS HYBRID AI ENGINE
                      </span>
                      <Sparkles size={18} className="text-warning" />
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Badge
                        color={ai.groqConfigured ? "success" : "warning"}
                        pill
                      >
                        Groq AI: {ai.groqConfigured ? "Aktif" : "Fallback"}
                      </Badge>
                      <Badge
                        color={ai.hfOcrConfigured ? "success" : "info"}
                        pill
                      >
                        HF OCR: Aktif
                      </Badge>
                    </div>
                    <div className="text-muted fs-12 text-truncate">
                      Model: {ai.groqTextModel || "llama-3.3-70b"}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="g-3">
              {/* Database Counter Breakdown */}
              <Col lg={6}>
                <Card className="sadar-panel h-100">
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="card-title mb-0">
                        Statistik Tabel PostgreSQL & Penyimpanan APK
                      </h5>
                      <p className="text-muted fs-12 mb-0 mt-1">
                        Rekapitulasi data real-time di database produksi dan paket APK aktif
                      </p>
                    </div>
                    <Badge color="primary" pill>
                      PostgreSQL Live
                    </Badge>
                  </CardHeader>
                  <CardBody>
                    <Row className="g-2 mb-3">
                      {[
                        {
                          label: "Total Pengguna",
                          val: db.counts?.users ?? 0,
                        },
                        {
                          label: "Rekening & Dompet",
                          val: db.counts?.accounts ?? 0,
                        },
                        {
                          label: "Transaksi Pengeluaran",
                          val: db.counts?.transactions ?? 0,
                        },
                        {
                          label: "Catatan Pemasukan",
                          val: db.counts?.incomes ?? 0,
                        },
                        {
                          label: "Struk OCR Tersimpan",
                          val: db.counts?.ocrScans ?? 0,
                        },
                        {
                          label: "Sinkronisasi Cloud Plans",
                          val: db.counts?.cloudPlans ?? 0,
                        },
                      ].map((stat) => (
                        <Col sm={4} xs={6} key={stat.label}>
                          <div className="p-3 rounded-3 border bg-light-subtle">
                            <div className="text-muted fs-11">{stat.label}</div>
                            <div className="fs-18 fw-bold text-dark mt-1">
                              {stat.val}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    <h6 className="fw-bold fs-13 mb-2">
                      Paket Instalasi APK di Server (`/downloads`)
                    </h6>
                    {Array.isArray(storage.apkFiles) &&
                    storage.apkFiles.length > 0 ? (
                      storage.apkFiles.map((apk) => (
                        <div
                          key={apk.filename}
                          className="p-3 rounded-3 border mb-2 d-flex flex-column gap-1"
                        >
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <strong className="fs-13 text-primary">
                              {apk.filename}
                            </strong>
                            <div className="d-flex align-items-center gap-2">
                              <Badge color="success" pill>
                                {apk.sizeMb} MB ({apk.sizeBytes.toLocaleString("id-ID")} B)
                              </Badge>
                              <a
                                href={`/downloads/${apk.filename}`}
                                className="btn btn-sm btn-outline-primary py-0 px-2 fs-12"
                                download
                              >
                                <Download size={13} className="me-1" />
                                Unduh
                              </a>
                            </div>
                          </div>
                          <div className="text-muted fs-11 font-monospace text-break">
                            SHA-256: {apk.sha256 || "-"}
                          </div>
                          <div className="text-muted fs-11">
                            Terakhir diperbarui: {formatDateTime(apk.updatedAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted fs-13">
                        Belum ada file APK di direktori `/downloads`.
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              {/* Interactive API Diagnostics & Latency Tester */}
              <Col lg={6}>
                <Card className="sadar-panel h-100">
                  <CardHeader className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="card-title mb-0">
                        Penguji Endpoint & Diagnostik Latensi API
                      </h5>
                      <p className="text-muted fs-12 mb-0 mt-1">
                        Uji kesehatan endpoint utama SADAR Finance secara langsung dari browser
                      </p>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleRunDiagnostics}
                      disabled={isPinging}
                      className="d-flex align-items-center gap-1 fw-semibold"
                    >
                      <Activity size={15} />
                      {isPinging ? "Menguji..." : "Jalankan Ping Test"}
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <div className="p-3 rounded-3 border bg-light-subtle mb-3">
                      <div className="d-flex justify-content-between fs-12 mb-1">
                        <span className="text-muted">Platform OS Server:</span>
                        <strong className="text-dark">
                          {srv.platform || "Linux x64"}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between fs-12 mb-1">
                        <span className="text-muted">Groq Vision Model:</span>
                        <strong className="text-dark font-monospace">
                          {ai.groqVisionModel ||
                            "meta-llama/llama-4-scout-17b-16e-instruct"}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between fs-12">
                        <span className="text-muted">Hugging Face OCR Space:</span>
                        <strong className="text-dark font-monospace">
                          {ai.hfOcrUrl || "https://fhazara-sadar-ocr.hf.space"}
                        </strong>
                      </div>
                    </div>

                    {pingResult ? (
                      <div className="d-flex flex-column gap-2">
                        {pingResult.map((r) => (
                          <div
                            key={r.url}
                            className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between"
                          >
                            <div>
                              <div className="fw-semibold fs-13">{r.name}</div>
                              <div className="text-muted fs-11 font-monospace">
                                {r.url} • {r.summary}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Badge color={r.ok ? "success" : "danger"} pill>
                                HTTP {r.status}
                              </Badge>
                              <Badge color="info" pill>
                                {r.latencyMs} ms
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted fs-13">
                        Klik tombol <strong>Jalankan Ping Test</strong> di atas
                        untuk memeriksa latensi seluruh endpoint secara
                        real-time.
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* TAB 2: MANAJEMEN RILIS OTA & FORCE UPDATE */}
        {activeTab === "ota" && (
          <Card className="sadar-panel">
            <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h5 className="card-title mb-0">
                  Konfigurasi Rilis OTA Android (`app-version.json`)
                </h5>
                <p className="text-muted fs-12 mb-0 mt-1">
                  Atur versi APK terbaru, nomor build, catatan rilis, dan sakelar
                  Force Update yang dibaca otomatis oleh aplikasi Android &
                  Halaman Install.
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
                    ? "Force Update Wajib: AKTIF"
                    : "Force Update: Nonaktif (Opsional)"}
                </Label>
              </div>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSaveOtaVersion}>
                <Row className="g-3">
                  <Col md={4}>
                    <Label className="form-label fw-semibold">
                      Versi Terbaru (`latestVersion`)
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
                      Build Number (`buildNumber`)
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
                      Versi Minimum (`minVersion`)
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
                      URL Unduhan Langsung APK (`downloadUrl`)
                    </Label>
                    <Input
                      value={versionForm.downloadUrl}
                      onChange={(e) =>
                        setVersionForm((prev) => ({
                          ...prev,
                          downloadUrl: e.target.value,
                        }))
                      }
                      placeholder="https://sadar-finance.web.id/downloads/sadar-finance-v2.0.0.apk?v=2.0.0-b11"
                      required
                    />
                  </Col>

                  <Col md={12}>
                    <Label className="form-label fw-semibold">
                      Catatan Rilis / Release Notes (1 poin per baris)
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
                      placeholder="Tuliskan daftar pembaruan fitur (satu baris per poin)..."
                    />
                  </Col>

                  <Col xs={12} className="d-flex align-items-center gap-2">
                    <Button
                      type="submit"
                      color="primary"
                      className="px-4 fw-semibold"
                      disabled={isSavingVersion}
                    >
                      <CheckCircle2 size={16} className="me-1" />
                      {isSavingVersion
                        ? "Menyimpan..."
                        : "Simpan & Terbitkan Metadata OTA"}
                    </Button>
                    <Button
                      tag={Link}
                      to="/install"
                      color="light"
                      className="fw-semibold"
                    >
                      Lihat Halaman Install Publik
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        )}

        {/* TAB 3: BROADCAST, BANNER & FEATURE MAINTENANCE GATE */}
        {activeTab === "broadcast" && (
          <Row className="g-3">
            <Col lg={7}>
              <Card className="sadar-panel">
                <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <h5 className="card-title mb-0">
                      Editor Broadcast & Feature Maintenance Gate
                    </h5>
                    <p className="text-muted fs-12 mb-0 mt-1">
                      Kirim pengumuman pop-up/banner atau aktifkan Maintenance
                      Gate pada fitur tertentu di Web & Aplikasi Android.
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
                          placeholder="bcast-main-2026"
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
                          placeholder="PENGUMUMAN RESMI"
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
                          <option value="info">Info Resmi (Navy & Teal)</option>
                          <option value="promo">Update & Fitur (Hijau)</option>
                          <option value="maintenance">
                            Peringatan / Maintenance (Amber)
                          </option>
                          <option value="urgent">Penting / Darurat (Merah)</option>
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
                          Fitur Terdampak (Maintenance Gate)
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
                        <Label className="form-label">Isi Pesan Broadcast</Label>
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
                          placeholder="Buka Rencana & Piutang"
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
                          placeholder="/financial-plans"
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
                  <h5 className="card-title mb-0">
                    Daftar Broadcast Tersimpan ({broadcasts.length})
                  </h5>
                </CardHeader>
                <CardBody>
                  {broadcasts.length === 0 ? (
                    <div className="text-muted fs-13 text-center py-4">
                      Belum ada broadcast yang disimpan.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {broadcasts.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-3 border d-flex flex-column gap-2"
                        >
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <Badge
                                color={item.active ? "success" : "secondary"}
                                pill
                              >
                                {item.active ? "Aktif" : "Nonaktif"}
                              </Badge>
                              <Badge color="info" pill>
                                {item.type || "info"}
                              </Badge>
                              {item.affectedFeature &&
                                item.affectedFeature !== "none" && (
                                  <Badge color="warning" pill>
                                    Gate: {item.affectedFeature}
                                  </Badge>
                                )}
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <Button
                                size="sm"
                                color="light"
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
                                color="danger"
                                outline
                                onClick={() => handleDeleteBroadcast(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <strong className="fs-14 d-block">
                              {item.title}
                            </strong>
                            <p className="text-muted fs-12 mb-0 mt-1">
                              {item.message}
                            </p>
                          </div>
                          {(item.bannerUrl || item.imageUrl) && (
                            <img
                              src={item.bannerUrl || item.imageUrl}
                              alt={item.title}
                              className="rounded-2 border mt-1"
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
        )}

        {/* TAB 4: DIREKTORI PENGGUNA */}
        {activeTab === "users" && (
          <Card className="sadar-panel">
            <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h5 className="card-title mb-0">
                  Direktori Pengguna Terdaftar ({filteredUsers.length})
                </h5>
                <p className="text-muted fs-12 mb-0 mt-1">
                  Monitor akun pengguna terdaftar beserta aktivitas rekening &
                  transaksi mereka.
                </p>
              </div>
              <div style={{ minWidth: 260 }}>
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama, email, atau username..."
                />
              </div>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <Table className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nama Lengkap</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Pekerjaan</th>
                      <th className="text-center">Rekening</th>
                      <th className="text-center">Transaksi</th>
                      <th>Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const fullName =
                        [u.first_name, u.middle_name, u.last_name]
                          .filter((p) => p && p !== "User")
                          .join(" ") || "Pengguna SADAR";
                      return (
                        <tr key={u.id}>
                          <td className="fw-semibold">{fullName}</td>
                          <td>
                            {u.username ? (
                              <Badge color="light" className="text-dark">
                                @{u.username}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{u.email}</td>
                          <td>{u.occupation || "-"}</td>
                          <td className="text-center">
                            <Badge color="primary" pill>
                              {u.accounts_count || 0}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge color="success" pill>
                              {(Number(u.transactions_count) || 0) +
                                (Number(u.incomes_count) || 0)}
                            </Badge>
                          </td>
                          <td className="text-muted fs-12">
                            {formatDateTime(u.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default SadarDeveloperPanel;
