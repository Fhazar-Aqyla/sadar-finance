import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import { BarChart3, LineChart, PieChart, Receipt } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  Table,
} from "reactstrap";
import { accountApi, analyticsApi, authApi, incomeApi, transactionApi } from "../../Components/services/api";

import "./sadar-dashboard.css";
import "../SadarShared/sadar-pages.css";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const sumBy = (rows, getValue) => rows.reduce((total, row) => total + getValue(row), 0);

const groupSumBy = (rows, key) =>
  rows.reduce((result, row) => {
    const groupKey = row[key] || "Lainnya";
    result[groupKey] = (result[groupKey] || 0) + row.amount;
    return result;
  }, {});

const formatShortDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`));

const categoryLabels = ["Makanan", "Transportasi", "Belanja", "Hiburan", "Lainnya"];
const categoryColors = ["#1E3A8A", "#14B8A6", "#F59E0B", "#22C55E", "#94a3b8"];

const normalizeCategoryToDashboard = (category) => {
  const text = String(category || "").toLowerCase();
  if (/makan|food|dining|beverage|restaurant|warung|cafe|kopi|gacoan|starbucks/.test(text)) return "Makanan";
  if (/transport|ojol|grab|gojek|bensin|fuel|taxi/.test(text)) return "Transportasi";
  if (/belanja|shop|shopping|groceries|minimarket|supermarket|retail|marketplace|mall|uniqlo/.test(text)) return "Belanja";
  if (/hiburan|entertainment|movie|bioskop|netflix|spotify|game|recreation/.test(text)) return "Hiburan";
  return "Lainnya";
};

const isBudgetBucketCategory = (category) =>
  ["needs", "wants", "savings", "investment"].includes(String(category || "").toLowerCase());

const inferCategoryFromTransaction = (transaction) =>
  normalizeCategoryToDashboard(
    [
      transaction.description,
      transaction.merchant,
      transaction.source,
      transaction.category,
      transaction.category_name,
      transaction.categoryName,
    ].filter(Boolean).join(" "),
  );

const getTransactionCategory = (transaction) => {
  const explicitCategory =
    transaction.category_group ||
    transaction.categoryGroup ||
    transaction.category ||
    transaction.category_name ||
    transaction.categoryName ||
    "";

  if (!explicitCategory || isBudgetBucketCategory(explicitCategory)) {
    return inferCategoryFromTransaction(transaction);
  }

  return explicitCategory;
};

const getBudgetTone = (usage) => {
  if (usage >= 100) return "danger";
  if (usage >= 80) return "warning";
  return "success";
};

const getExpenseTone = (ratio) => {
  if (ratio >= 100) return "danger";
  if (ratio >= 70) return "warning";
  return "success";
};

const getScoreStatus = (score) => {
  if (score <= 40) return "Perlu Perhatian";
  if (score <= 70) return "Cukup Sehat";
  return "Sehat";
};

const getScoreTone = (score) => {
  if (score <= 40) {
    return {
      className: "danger",
      chartColor: "#ef4444",
      progressColor: "danger",
    };
  }

  if (score <= 70) {
    return {
      className: "warning",
      chartColor: "#f59e0b",
      progressColor: "warning",
    };
  }

  return {
    className: "success",
    chartColor: "#22c55e",
    progressColor: "success",
  };
};

const getLastSixMonths = () => {
  const formatter = new Intl.DateTimeFormat("id-ID", { month: "short" });
  const currentDate = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
    const label = formatter.format(date).replace(".", "");

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    };
  });
};

const getMonthKey = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getCurrentPeriodLabel = () =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());

const normalizeAccount = (account) => ({
  id: account.account_id || account.id,
  name: account.account_name || account.name || "Akun",
  balance: Number(account.balance || 0),
});

const normalizeIncome = (income) => ({
  id: income.income_id || income.id,
  account_id: income.account_id || income.accountId,
  source: income.source || "Pemasukan",
  amount: Number(income.amount || 0),
  date: String(income.income_date || income.incomeDate || income.date || "").slice(0, 10),
});

const toBudgetGroup = (category) => {
  const text = String(category || "").toLowerCase();
  if (/tabungan|invest|saving|dana darurat/.test(text)) return "Savings";
  if (/makan|food|transport|tagihan|utilit|kesehatan|pendidikan/.test(text)) return "Needs";
  return "Wants";
};

const normalizeTransaction = (transaction) => ({
  id: transaction.transaction_id || transaction.id,
  account_id: transaction.account_id || transaction.accountId,
  name: transaction.description || transaction.merchant || "Pengeluaran",
  category: getTransactionCategory(transaction),
  budget_group: toBudgetGroup(getTransactionCategory(transaction)),
  amount: Number(transaction.amount || 0),
  date: String(transaction.transaction_date || transaction.transactionDate || transaction.date || "").slice(0, 10),
  status: "Tercatat",
});

const buildBudgetRows = (budget, transactions = []) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(`${t.date}T00:00:00`);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  let needsUsed = 0;
  let wantsUsed = 0;
  let savingsUsed = 0;

  currentMonthTransactions.forEach((t) => {
    const group = toBudgetGroup(t.category);
    if (group === "Needs") needsUsed += t.amount;
    else if (group === "Savings") savingsUsed += t.amount;
    else wantsUsed += t.amount;
  });

  const budgetObj = budget || { needs_amount: 0, wants_amount: 0, savings_amount: 0 };
  
  let needsApiUsed = Number(budgetObj.needs_used || budgetObj.needsUsed || 0);
  let wantsApiUsed = Number(budgetObj.wants_used || budgetObj.wantsUsed || 0);
  let savingsApiUsed = Number(budgetObj.savings_used || budgetObj.savingsUsed || 0);

  if (needsApiUsed === 0) needsApiUsed = needsUsed;
  if (wantsApiUsed === 0) wantsApiUsed = wantsUsed;
  if (savingsApiUsed === 0) savingsApiUsed = savingsUsed;

  return [
    {
      id: "api_needs",
      category: "Needs",
      label: "Kebutuhan",
      limit: Number(budgetObj.needs_amount || budgetObj.needsAmount || 0),
      used: needsApiUsed,
    },
    {
      id: "api_wants",
      category: "Wants",
      label: "Keinginan",
      limit: Number(budgetObj.wants_amount || budgetObj.wantsAmount || 0),
      used: wantsApiUsed,
    },
    {
      id: "api_savings",
      category: "Savings",
      label: "Tabungan",
      limit: Number(budgetObj.savings_amount || budgetObj.savingsAmount || 0),
      used: savingsApiUsed,
    },
  ];
};

const getStoredProfile = () => {
  try {
    const authUser = JSON.parse(sessionStorage.getItem("authUser") || "null");
    const user = authUser?.user || authUser?.data || authUser || {};
    const name = user?.first_name || user?.username || user?.name || user?.email || "SADAR";

    return {
      name: String(name || "SADAR").trim(),
    };
  } catch {
    return { name: "SADAR" };
  }
};

const newUserSummaryCards = [
  {
    label: "Total Saldo",
    value: "Rp 0",
    helper: "Belum ada akun",
    icon: "ri-wallet-3-line",
    tone: "primary",
  },
  {
    label: "Pemasukan Bulan Ini",
    value: "Rp 0",
    helper: "Pemasukan belum dicatat",
    icon: "ri-arrow-down-circle-line",
    tone: "success",
  },
  {
    label: "Pengeluaran Bulan Ini",
    value: "Rp 0",
    helper: "Belum ada transaksi",
    icon: "ri-arrow-up-circle-line",
    tone: "warning",
  },
  {
    label: "Sisa Anggaran",
    value: "Belum diatur",
    helper: "Atur anggaran 50/30/20",
    icon: "ri-pie-chart-2-line",
    tone: "teal",
  },
  {
    label: "Jumlah Transaksi",
    value: "0",
    helper: "Belum ada catatan",
    icon: "ri-file-list-3-line",
    tone: "sand",
  },
];

const setupSteps = [
  {
    title: "Tambahkan Akun Pertama",
    checklistLabel: "Tambahkan Akun",
    description: "Akun digunakan untuk mencatat sumber uangmu, seperti tunai, bank, atau dompet digital.",
    cta: "Tambah Akun",
    to: "/profile-account#kelola-account",
    icon: "ri-wallet-3-line",
  },
  {
    title: "Catat Pemasukan Pertama",
    checklistLabel: "Catat Pemasukan Pertama",
    description: "Masukkan pemasukan pertamamu agar SADAR bisa membantu menghitung saldo dan rekomendasi anggaran awal.",
    cta: "Catat Pemasukan",
    to: "/catat-keuangan?type=income",
    icon: "ri-arrow-down-circle-line",
  },
  {
    title: "Atur Anggaran 50/30/20",
    checklistLabel: "Atur Anggaran 50/30/20",
    description: "Bagi pemasukanmu menjadi 50% kebutuhan, 30% keinginan, dan 20% tabungan agar pengeluaran lebih terarah.",
    cta: "Atur Anggaran",
    to: "/profile-account#atur-budget",
    icon: "ri-pie-chart-2-line",
  },
  {
    title: "Catat Transaksi Pertama",
    checklistLabel: "Catat Transaksi Pertama",
    description: "Mulai catat pengeluaran pertamamu agar dashboard, insight, dan peringatan bisa mulai bekerja.",
    cta: "Catat Transaksi",
    to: "/catat-keuangan",
    icon: "ri-receipt-line",
  },
  {
    title: "Dashboard Kamu Siap Digunakan",
    checklistLabel: "Lihat Dashboard",
    description: "Setelah data mulai terisi, SADAR akan membantu menampilkan ringkasan keuangan, pola pengeluaran, skor finansial, dan peringatan secara bertahap.",
    cta: "Lihat Dashboard",
    to: "/dashboard",
    icon: "ri-dashboard-3-line",
  },
];

const getSetupWizardStorageKey = () => {
  if (typeof window === "undefined") return "sadar_setup_wizard_api";

  try {
    const authUser = JSON.parse(sessionStorage.getItem("authUser") || "null");
    const user = authUser?.user || authUser?.data?.user || authUser?.data || authUser || {};
    const userId = user?.id || user?.user_id || user?.email || user?.username || "guest";
    return `sadar_setup_wizard_api_${userId}`;
  } catch {
    return "sadar_setup_wizard_api";
  }
};

const defaultSetupWizardState = {
  completed: false,
  skipped: false,
};

const getStoredSetupWizardState = () => {
  if (typeof window === "undefined") return defaultSetupWizardState;

  try {
    const key = getSetupWizardStorageKey();
    const savedState = window.localStorage.getItem(key);
    return savedState ? { ...defaultSetupWizardState, ...JSON.parse(savedState) } : defaultSetupWizardState;
  } catch {
    return defaultSetupWizardState;
  }
};

const saveSetupWizardState = (state) => {
  if (typeof window === "undefined") return;
  const key = getSetupWizardStorageKey();
  window.localStorage.setItem(key, JSON.stringify(state));
};

const LucideIconMap = {
  "ri-bar-chart-grouped-line": BarChart3,
  "ri-line-chart-line": LineChart,
  "ri-pie-chart-2-line": PieChart,
  "ri-receipt-line": Receipt,
};

const EmptyDashboardCard = ({ icon, title, description, action }) => {
  const IconComponent = LucideIconMap[icon];
  return (
    <div className="sadar-empty-card">
      <span className="sadar-empty-icon">
        {IconComponent ? <IconComponent className="h-5 w-5" /> : <i className={icon}></i>}
      </span>
      <h5>{title}</h5>
      <p>{description}</p>
      {action}
    </div>
  );
};

const SetupGuideModal = ({ isOpen, onComplete, onSkip }) => {
  const [activeStep, setActiveStep] = useState(0);
  const step = setupSteps[activeStep];
  const isFinalStep = activeStep === setupSteps.length - 1;

  const goNext = () => {
    if (isFinalStep) {
      onComplete();
      setActiveStep(0);
      return;
    }
    setActiveStep((current) => current + 1);
  };

  const handleSkip = () => {
    onSkip();
    setActiveStep(0);
  };

  return (
    <Modal isOpen={isOpen} centered className="sadar-setup-modal" backdrop="static" keyboard={false}>
      <ModalHeader>Mulai Pengaturan SADAR</ModalHeader>
      <ModalBody>
        <div className="sadar-stepper-count">
          Langkah {Math.min(activeStep + 1, 4)} dari 4
        </div>
        <div className="sadar-stepper-progress" aria-hidden="true">
          {setupSteps.slice(0, 4).map((item, index) => (
            <span className={index <= activeStep ? "is-active" : ""} key={item.title}></span>
          ))}
        </div>
        <div className="sadar-stepper-content">
          <span className="sadar-stepper-badge">{isFinalStep ? "OK" : `0${activeStep + 1}`}</span>
          <h4>{step.title}</h4>
          <p>{step.description}</p>
        </div>
      </ModalBody>
      <ModalFooter className="sadar-stepper-footer">
        <Button color="link" className="sadar-stepper-skip" onClick={handleSkip}>
          Lewati Dulu
        </Button>
        <div className="d-flex gap-2">
          {activeStep > 0 && (
            <Button
              color="light"
              className="sadar-table-action"
              onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}
            >
              Kembali
            </Button>
          )}
          <Button color="primary" onClick={goNext}>
            {isFinalStep ? "Selesai" : "Lanjut"}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

const NewUserDashboard = ({ profileName = "SADAR" }) => {
  const [wizardState, setWizardState] = useState(getStoredSetupWizardState);
  const shouldAutoOpenWizard = !wizardState.completed && !wizardState.skipped;
  const [isGuideOpen, setIsGuideOpen] = useState(shouldAutoOpenWizard);
  const hasDismissedSetup = wizardState.completed || wizardState.skipped;

  const updateWizardState = (nextState) => {
    saveSetupWizardState(nextState);
    setWizardState(nextState);
  };

  const skipSetupWizard = () => {
    updateWizardState({ completed: false, skipped: true });
    setIsGuideOpen(false);
  };

  const completeSetupWizard = () => {
    updateWizardState({ completed: true, skipped: false });
    setIsGuideOpen(false);
  };

  return (
    <div className="page-content sadar-dashboard">
      <Container fluid>
        <section className="sadar-overview sadar-new-user-overview">
          <div className="sadar-overview-main">
            <Badge color="primary" className="bg-primary-subtle text-primary sadar-eyebrow">
              Dashboard awal
            </Badge>
            <h1>Halo, {profileName}</h1>
            <p>Dashboard kamu masih kosong. Mulai catat akun, pemasukan, anggaran, dan transaksi agar ringkasan keuangan mulai terbaca.</p>
            {!hasDismissedSetup && (
              <div className="sadar-overview-actions">
                <Button color="primary" onClick={() => setIsGuideOpen(true)}>
                  <i className="ri-play-circle-line align-bottom me-1"></i>
                  Mulai Pengaturan
                </Button>
                <Button color="light" className="sadar-ghost-btn" onClick={skipSetupWizard}>
                  Lewati Dulu
                </Button>
              </div>
            )}
          </div>
          <div className="sadar-overview-note sadar-new-user-note">
            <span className="sadar-note-icon bg-teal-subtle text-teal">
              <i className="ri-information-line"></i>
            </span>
            <div className="sadar-alert-copy">
              <span className="sadar-section-label">Langkah pertama</span>
              <p>Tambahkan account dulu supaya pemasukan dan transaksi bisa tercatat ke sumber uang yang benar.</p>
            </div>
          </div>
        </section>

        <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-xl-5 mt-3">
          {newUserSummaryCards.map((item) => (
            <Col key={item.label}>
              <Card className="metric-card h-100">
                <CardBody>
                  <div className="metric-card-top">
                    <span className={`metric-icon bg-${item.tone}-subtle text-${item.tone}`}>
                      <i className={item.icon}></i>
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <h2>{item.value}</h2>
                  <p>{item.helper}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Arus Kas Bulanan</h4>
                  <p className="text-muted mb-0">Diambil dari catatan pemasukan dan pengeluaran 6 bulan terakhir</p>
                </div>
              </CardHeader>
              <CardBody>
                <EmptyDashboardCard
                  icon="ri-bar-chart-grouped-line"
                  title="Belum ada data cashflow"
                  description="Grafik akan muncul setelah kamu mulai mencatat pemasukan dan pengeluaran."
                />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Skor Finansial</h4>
                  <p className="text-muted mb-0">Ringkasan kesehatan keuangan saat ini</p>
                </div>
              </CardHeader>
              <CardBody className="sadar-score-main d-flex flex-column align-items-center justify-content-center">
                <ReactApexChart
                  type="radialBar"
                  height={250}
                  series={[0]}
                  options={{
                    chart: { sparkline: { enabled: true } },
                    colors: ["#e8edf5"],
                    plotOptions: {
                      radialBar: {
                        hollow: { size: "70%" },
                        track: { background: "#e8edf5" },
                        dataLabels: { show: false },
                      },
                    },
                  }}
                />
                <div className="sadar-score-number text-muted">
                  -
                  <span>/100</span>
                </div>
                <span className="sadar-score-status text-muted">Belum Tersedia</span>
                <p className="sadar-score-note text-center mt-2 mb-0">
                  Skor akan dihitung otomatis setelah data mulai terisi.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="h-100 dashboard-panel">
              <CardHeader className="expense-trend-header">
                <div>
                  <h4 className="card-title mb-1">Tren Pengeluaran</h4>
                  <p className="text-muted mb-0">Pantau pola pengeluaran bulanan</p>
                </div>
              </CardHeader>
              <CardBody>
                <EmptyDashboardCard
                  icon="ri-line-chart-line"
                  title="Tren belum tersedia"
                  description="Grafik akan muncul setelah kamu mulai mencatat pemasukan dan pengeluaran."
                />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Kategori Pengeluaran</h4>
                  <p className="text-muted mb-0">Distribusi bulan ini</p>
                </div>
              </CardHeader>
              <CardBody>
                <EmptyDashboardCard
                  icon="ri-pie-chart-2-line"
                  title="Belum ada distribusi kategori"
                  description="Grafik akan muncul setelah kamu mulai mencatat pemasukan dan pengeluaran."
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-panel mt-3">
          <CardHeader>
            <div>
              <h4 className="card-title mb-1">Riwayat Terbaru</h4>
              <p className="text-muted mb-0">Pratinjau 5 catatan keuangan terakhir</p>
            </div>
          </CardHeader>
          <CardBody>
            <EmptyDashboardCard
              icon="ri-receipt-line"
              title="Belum ada transaksi."
              description="Catat transaksi pertama agar riwayat keuangan mulai tersusun."
              action={(
                <Button color="primary" size="sm" tag={Link} to="/catat-keuangan">
                  Catat Transaksi Pertama
                </Button>
              )}
            />
          </CardBody>
        </Card>
      </Container>
      <SetupGuideModal
        isOpen={isGuideOpen}
        onComplete={completeSetupWizard}
        onSkip={skipSetupWizard}
      />
    </div>
  );
};

const chartBaseOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: "#e8edf5",
    strokeDashArray: 3,
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    markers: { radius: 12 },
  },
  tooltip: {
    y: {
      formatter: (value) => `${value.toLocaleString("id-ID")} jt`,
    },
  },
};

const cashflowOptions = {
  ...chartBaseOptions,
  chart: {
    ...chartBaseOptions.chart,
    id: "sadar-cashflow-chart",
    parentHeightOffset: 0,
  },
  colors: ["#22C55E", "#1E3A8A"],
  plotOptions: {
    bar: {
      borderRadius: 8,
      borderRadiusApplication: "end",
      columnWidth: "34%",
      dataLabels: {
        position: "top",
      },
    },
  },
  fill: {
    opacity: 0.94,
  },
  grid: {
    borderColor: "#edf2f7",
    strokeDashArray: 4,
    padding: {
      top: 4,
      right: 8,
      bottom: 0,
      left: 8,
    },
  },
  legend: {
    show: false,
  },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      offsetY: 6,
      style: {
        colors: "#64748b",
        fontSize: "12px",
        fontWeight: 600,
      },
    },
  },
  yaxis: {
    min: 0,
    max: 10,
    tickAmount: 5,
    labels: {
      offsetX: -4,
      style: {
        colors: "#64748b",
        fontSize: "12px",
        fontWeight: 600,
      },
      formatter: (value) => `${value} jt`,
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    marker: { show: true },
    y: {
      formatter: (value) => rupiah(value * 1000000),
    },
  },
  states: {
    hover: {
      filter: {
        type: "lighten",
        value: 0.05,
      },
    },
    active: {
      filter: {
        type: "none",
      },
    },
  },
};

const createTrendOptions = (categories, maxValue) => ({
  ...chartBaseOptions,
  colors: ["#14B8A6"],
  chart: {
    ...chartBaseOptions.chart,
    id: "sadar-expense-trend-chart",
    sparkline: { enabled: false },
    parentHeightOffset: 0,
  },
  stroke: {
    width: 2.5,
    curve: "smooth",
  },
  markers: {
    size: 4.5,
    colors: ["#14B8A6"],
    strokeColors: "#ffffff",
    strokeWidth: 2,
    hover: { size: 6 },
  },
  fill: {
    type: "gradient",
    gradient: {
      type: "vertical",
      shadeIntensity: 0,
      gradientToColors: ["#ccfbf1"],
      opacityFrom: 0.55,
      opacityTo: 0.03,
      stops: [0, 72, 100],
    },
  },
  grid: {
    show: false,
    padding: {
      top: 6,
      right: 18,
      bottom: 10,
      left: 20,
    },
  },
  xaxis: {
    categories,
    tickPlacement: "between",
    axisBorder: {
      show: true,
      color: "#d7dee8",
      height: 1,
    },
    axisTicks: {
      show: true,
      color: "#172033",
      height: 4,
    },
    labels: {
      offsetY: 8,
      style: {
        colors: "#596374",
        fontSize: "13px",
        fontWeight: 600,
      },
    },
  },
  yaxis: {
    min: 0,
    max: maxValue,
    tickAmount: 5,
    labels: {
      offsetX: -4,
      style: {
        colors: "#687385",
        fontSize: "13px",
        fontWeight: 700,
      },
      formatter: (value) => Math.round(value).toLocaleString("id-ID"),
    },
    axisBorder: {
      show: true,
      color: "#d7dee8",
    },
    axisTicks: {
      show: true,
      color: "#172033",
      width: 4,
    },
  },
  tooltip: {
    marker: { show: false },
    y: {
      formatter: (value) => rupiah(value * 100),
    },
  },
});

const createCategoryOptions = (labels, colors, setActiveCategory) => ({
  chart: {
    id: "sadar-category-chart",
    type: "donut",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    toolbar: { show: false },
    events: {
      dataPointMouseEnter: (_event, _chartContext, config) => {
        setActiveCategory({
          label: labels[config.dataPointIndex] || "",
          color: colors[config.dataPointIndex] || "#1E3A8A",
        });
      },
      dataPointSelection: (_event, _chartContext, config) => {
        setActiveCategory({
          label: labels[config.dataPointIndex] || "",
          color: colors[config.dataPointIndex] || "#1E3A8A",
        });
      },
    },
  },
  labels,
  colors,
  fill: {
    colors,
    opacity: 1,
  },
  legend: {
    position: "bottom",
    fontSize: "12px",
    itemMargin: { horizontal: 8, vertical: 4 },
  },
  dataLabels: { enabled: false },
  stroke: {
    width: 4,
    colors: ["#ffffff"],
  },
  plotOptions: {
    pie: {
      donut: {
        size: "72%",
        labels: {
          show: false,
          name: {
            show: false,
            color: "#1E3A8A",
            fontSize: "18px",
            fontWeight: 800,
            offsetY: 6,
          },
          value: {
            show: false,
          },
          total: {
            show: false,
          },
        },
      },
    },
  },
});

const DashboardWithData = () => {
  useEffect(() => {
    document.title = "Dashboard | SADAR Finance";
  }, []);
  const [activeCategory, setActiveCategory] = useState({ label: "", color: "#1E3A8A" });
  const [apiRows, setApiRows] = useState({
    accounts: [],
    incomes: [],
    transactions: [],
    budgets: [],
    profile: getStoredProfile(),
    healthScore: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const displayProfile = apiRows.profile;

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [profileResponse, accountRows, incomeRows, transactionRows, budgetResponse, healthScoreResponse] = await Promise.all([
          authApi.me(),
          accountApi.list(),
          incomeApi.list({ limit: 100 }),
          transactionApi.list({ limit: 100 }),
          analyticsApi.latestBudget().catch(() => null),
          analyticsApi.healthScore({ period: "all", periodMonths: 24 }).catch(() => null),
        ]);

        if (!isMounted) return;

        const firstName = profileResponse?.first_name || profileResponse?.firstName || "";
        const lastName = profileResponse?.last_name || profileResponse?.lastName || "";
        const cleanLastName = (lastName === "User" || lastName === "user") ? "" : lastName;
        const normalizedTransactions = (transactionRows || []).map(normalizeTransaction);
        setApiRows({
          accounts: (accountRows || []).map(normalizeAccount),
          incomes: (incomeRows || []).map(normalizeIncome),
          transactions: normalizedTransactions,
          budgets: buildBudgetRows(budgetResponse, normalizedTransactions),
          profile: {
            name: `${firstName} ${cleanLastName}`.trim() || profileResponse?.email || getStoredProfile().name,
          },
          healthScore: healthScoreResponse || null,
        });
        setLoadError("");
      } catch {
        if (isMounted) {
          setApiRows({
            accounts: [],
            incomes: [],
            transactions: [],
            budgets: [],
            profile: getStoredProfile(),
            healthScore: null,
          });
          setLoadError("Gagal memuat data dashboard. Silakan coba beberapa saat lagi.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardData = useMemo(() => {
    const userAccounts = apiRows.accounts;
    const userTransactions = apiRows.transactions;
    const userIncomes = apiRows.incomes;
    const userBudgets = apiRows.budgets;
    const healthScore = apiRows.healthScore;
    const expenseTransactions = userTransactions.filter((item) => item.budget_group !== "Savings");
    const totalSaldo = sumBy(userAccounts, (item) => item.balance);
    const totalIncome = sumBy(userIncomes, (item) => item.amount);
    const totalExpense = sumBy(expenseTransactions, (item) => item.amount);
    const budgetLimit = sumBy(userBudgets, (item) => item.limit);
    const budgetUsed = sumBy(userBudgets, (item) => item.used);
    const budgetUsage = budgetLimit ? (budgetUsed / budgetLimit) * 100 : 0;
    const expenseRatio = totalIncome ? (totalExpense / totalIncome) * 100 : 0;
    const remainingBudget = Math.max(budgetLimit - budgetUsed, 0);
    const mostUsedBudget = userBudgets
      .map((budget) => ({
        ...budget,
        usage: budget.limit ? (budget.used / budget.limit) * 100 : 0,
      }))
      .sort((a, b) => b.usage - a.usage)[0];
    const byCategory = groupSumBy(expenseTransactions, "category");
    const categoryRows = categoryLabels.reduce((result, label) => {
      result[label] = 0;
      return result;
    }, {});

    Object.entries(byCategory).forEach(([category, amount]) => {
      const mappedCategory = normalizeCategoryToDashboard(category);
      categoryRows[mappedCategory] += amount;
    });

    const incomeRows = userIncomes.map((income) => ({
      id: income.id,
      name: income.source,
      category: "Pemasukan",
      account: userAccounts.find((account) => account.id === income.account_id)?.name || "-",
      date: income.date,
      amount: income.amount,
      status: "Masuk",
    }));
    const expenseRows = userTransactions.map((transaction) => ({
      id: transaction.id,
      name: transaction.name,
      category: transaction.category,
      account: userAccounts.find((account) => account.id === transaction.account_id)?.name || "-",
      date: transaction.date,
      amount: -transaction.amount,
      status: transaction.status,
    }));

    const recentRows = [...incomeRows, ...expenseRows]
      .sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`))
      .slice(0, 5)
      .map((item) => ({
        ...item,
        formattedDate: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${item.date}T00:00:00`)),
      }));

    const cashflowMonths = getLastSixMonths();
    const monthlyIncome = Object.fromEntries(cashflowMonths.map((month) => [month.key, 0]));
    const monthlyExpense = Object.fromEntries(cashflowMonths.map((month) => [month.key, 0]));

    userIncomes.forEach((income) => {
      const monthKey = getMonthKey(income.date);
      if (monthKey in monthlyIncome) {
        monthlyIncome[monthKey] += income.amount;
      }
    });

    expenseTransactions.forEach((transaction) => {
      const monthKey = getMonthKey(transaction.date);
      if (monthKey in monthlyExpense) {
        monthlyExpense[monthKey] += transaction.amount;
      }
    });

    const cashflowIncomeData = cashflowMonths.map((month) => Number((monthlyIncome[month.key] / 1000000).toFixed(2)));
    const cashflowExpenseData = cashflowMonths.map((month) => Number((monthlyExpense[month.key] / 1000000).toFixed(2)));
    const cashflowMax = Math.max(10, Math.ceil(Math.max(...cashflowIncomeData, ...cashflowExpenseData) / 2) * 2);
    const trendRows = Object.entries(
      expenseTransactions.reduce((result, transaction) => {
        result[transaction.date] = (result[transaction.date] || 0) + transaction.amount;
        return result;
      }, {}),
    )
      .sort(([a], [b]) => new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`))
      .map(([date, amount]) => ({ date, amount }));
    const trendSeriesData = trendRows.map((item) => Math.round(item.amount / 1000));
    const trendMaxValue = Math.max(100, Math.ceil((Math.max(...trendSeriesData, 0) * 1.2) / 500) * 500);
    const dominantCategoryEntry = Object.entries(categoryRows).sort((a, b) => b[1] - a[1])[0] || ["-", 0];
    const dominantCategory = {
      label: dominantCategoryEntry[0],
      amount: dominantCategoryEntry[1],
      percent: totalExpense ? (dominantCategoryEntry[1] / totalExpense) * 100 : 0,
    };
    const budgetAlert = mostUsedBudget
      ? {
          label: mostUsedBudget.label || mostUsedBudget.category,
          usage: mostUsedBudget.usage,
          tone: getBudgetTone(mostUsedBudget.usage),
        }
      : null;

    const score = healthScore ? Number(healthScore?.breakdown?.overallScore ?? healthScore?.score?.score ?? 0) : 0;
    const scoreStatus = healthScore ? (healthScore?.status || getScoreStatus(score)) : "Belum Tersedia";

    return {
      totalSaldo,
      totalIncome,
      totalExpense,
      budgetUsage,
      expenseRatio,
      remainingBudget,
      transactionCount: userTransactions.length + userIncomes.length,
      accountCount: userAccounts.length,
      categorySeries: categoryLabels.map((label) => categoryRows[label]),
      dominantCategory,
      budgetAlert,
      recentRows,
      cashflowCategories: cashflowMonths.map((month) => month.label),
      cashflowMax,
      cashflowSeries: [
        { name: "Pemasukan", data: cashflowIncomeData },
        { name: "Pengeluaran", data: cashflowExpenseData },
      ],
      expenseTrendSeries: [
        { name: "Pengeluaran", data: trendSeriesData },
      ],
      expenseTrendCategories: trendRows.map((item) => formatShortDate(item.date)),
      expenseTrendMax: trendMaxValue,
      score,
      scoreStatus,
      hasScore: !!healthScore,
    };
  }, [apiRows]);

  const summaryCards = [
    {
      label: "Total Saldo",
      value: rupiah(dashboardData.totalSaldo),
      helper: `${dashboardData.accountCount} account aktif`,
      icon: "ri-wallet-3-line",
      tone: "primary",
    },
    {
      label: "Pemasukan Bulan Ini",
      value: rupiah(dashboardData.totalIncome),
      helper: "Dari pemasukan yang tercatat",
      icon: "ri-arrow-down-circle-line",
      tone: "success",
    },
    {
      label: "Pengeluaran Bulan Ini",
      value: rupiah(dashboardData.totalExpense),
      helper: `${dashboardData.expenseRatio.toFixed(1)}% dari pemasukan`,
      icon: "ri-arrow-up-circle-line",
      tone: getExpenseTone(dashboardData.expenseRatio),
    },
    {
      label: "Sisa Anggaran",
      value: rupiah(dashboardData.remainingBudget),
      helper: "Dari alokasi bulan ini",
      icon: "ri-pie-chart-2-line",
      tone: getBudgetTone(dashboardData.budgetUsage),
    },
    {
      label: "Jumlah Catatan",
      value: `${dashboardData.transactionCount} catatan`,
      helper: "Pemasukan dan pengeluaran",
      icon: "ri-file-list-3-line",
      tone: "sand",
    },
  ];

  const categoryOptions = useMemo(
    () => createCategoryOptions(categoryLabels, categoryColors, setActiveCategory),
    [],
  );
  const dynamicCashflowOptions = useMemo(
    () => ({
      ...cashflowOptions,
      xaxis: {
        ...cashflowOptions.xaxis,
        categories: dashboardData.cashflowCategories,
      },
      yaxis: {
        ...cashflowOptions.yaxis,
        max: dashboardData.cashflowMax,
      },
    }),
    [dashboardData.cashflowCategories, dashboardData.cashflowMax],
  );
  const dynamicTrendOptions = useMemo(
    () => createTrendOptions(dashboardData.expenseTrendCategories, dashboardData.expenseTrendMax),
    [dashboardData.expenseTrendCategories, dashboardData.expenseTrendMax],
  );
  const dashboardAlert = dashboardData.budgetAlert
    ? {
        title: `Anggaran ${dashboardData.budgetAlert.label}`,
        message: `${dashboardData.budgetAlert.usage.toFixed(1)}% dari batas bulan ini.`,
        progress: Math.min(dashboardData.budgetAlert.usage, 100),
        tone: dashboardData.budgetAlert.tone,
        detail: dashboardData.budgetAlert.usage >= 80
          ? "Mulai tahan pengeluaran tambahan di kategori ini."
          : "Masih dalam batas aman, tetap pantau pemakaiannya.",
      }
    : {
        title: "Anggaran belum tersedia",
        message: "Atur anggaran 50/30/20 untuk melihat peringatan.",
        progress: 0,
        tone: "success",
        detail: "Anggaran membantu memberi sinyal sebelum pengeluaran melewati batas.",
      };

  if (!isLoading && (loadError || dashboardData.transactionCount === 0)) {
    return <NewUserDashboard profileName={displayProfile.name} />;
  }

  return (
    <div className="page-content sadar-dashboard">
      <Container fluid>
        <section className="sadar-overview">
          <div className="sadar-overview-main">
            <Badge color="primary" className="bg-primary-subtle text-primary sadar-eyebrow">
              Ringkasan {getCurrentPeriodLabel()}
            </Badge>
            <h1>Halo, {displayProfile.name}</h1>
            <p>Yuk lihat kondisi keuanganmu hari ini.</p>
            <div className="sadar-overview-actions">
              <Button color="primary" tag={Link} to="/catat-keuangan">
                <i className="ri-add-line align-bottom me-1"></i>
                Tambah Pengeluaran
              </Button>
              <Button color="success" tag={Link} to="/catat-keuangan?type=income">
                <i className="ri-bank-card-line align-bottom me-1"></i>
                Tambah Pemasukan
              </Button>
              <Button color="light" className="sadar-ghost-btn" tag={Link} to="/behavior-insight">
                <i className="ri-lightbulb-flash-line align-bottom me-1"></i>
                Lihat Insight
              </Button>
            </div>
          </div>
          <div className="sadar-overview-note">
            <span className="sadar-note-icon bg-warning-subtle text-warning">
              <i className="ri-alert-line"></i>
            </span>
            <div className="sadar-alert-copy">
              <span className="sadar-section-label">Peringatan Anggaran</span>
              <p>{dashboardAlert.title}: {dashboardAlert.message}</p>
              <Link to="/behavior-insight">Lihat detail</Link>
            </div>
          </div>
        </section>

        <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-xl-5 mt-3">
          {summaryCards.map((item) => (
            <Col key={item.label}>
              <Card className="metric-card h-100">
                <CardBody>
                  <div className="metric-card-top">
                    <span className={`metric-icon bg-${item.tone}-subtle text-${item.tone}`}>
                      <i className={item.icon}></i>
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <h2>{item.value}</h2>
                  <p>{item.helper}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Arus Kas Bulanan</h4>
                  <p className="text-muted mb-0">Diambil dari catatan pemasukan dan pengeluaran 6 bulan terakhir</p>
                </div>
                <div className="sadar-chart-legend" aria-label="Legenda cashflow">
                  <span>
                    <i className="legend-dot legend-income"></i>
                    Pemasukan
                  </span>
                  <span>
                    <i className="legend-dot legend-expense"></i>
                    Pengeluaran
                  </span>
                </div>
              </CardHeader>
              <CardBody className="cashflow-chart-body">
                <ReactApexChart options={dynamicCashflowOptions} series={dashboardData.cashflowSeries} type="bar" height={390} />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            {dashboardData.hasScore ? (
              (() => {
                const scoreTone = getScoreTone(dashboardData.score);
                return (
                  <Card className="h-100 dashboard-panel">
                    <CardHeader>
                      <div>
                        <h4 className="card-title mb-1">Skor Finansial</h4>
                        <p className="text-muted mb-0">Ringkasan kesehatan keuangan saat ini</p>
                      </div>
                    </CardHeader>
                    <CardBody className="sadar-score-main d-flex flex-column align-items-center justify-content-center">
                      <ReactApexChart
                        key={scoreTone.chartColor}
                        type="radialBar"
                        height={250}
                        series={[dashboardData.score]}
                        options={{
                          chart: { sparkline: { enabled: true } },
                          colors: [scoreTone.chartColor],
                          plotOptions: {
                            radialBar: {
                              hollow: { size: "70%" },
                              track: { background: "#e8edf5" },
                              dataLabels: { show: false },
                            },
                          },
                        }}
                      />
                      <div className={`sadar-score-number ${scoreTone.className}`}>
                        {dashboardData.score}
                        <span>/100</span>
                      </div>
                      <span className={`sadar-score-status ${scoreTone.className}`}>{dashboardData.scoreStatus}</span>
                      <p className="sadar-score-note text-center mt-2 mb-0">
                        Skor ini membantu membaca pola pemasukan, pengeluaran, anggaran, dan tabunganmu.
                      </p>
                    </CardBody>
                  </Card>
                );
              })()
            ) : (
              <Card className="h-100 dashboard-panel">
                <CardHeader>
                  <div>
                    <h4 className="card-title mb-1">Skor Finansial</h4>
                    <p className="text-muted mb-0">Ringkasan kesehatan keuangan saat ini</p>
                  </div>
                </CardHeader>
                <CardBody className="sadar-score-main d-flex flex-column align-items-center justify-content-center">
                  <ReactApexChart
                    type="radialBar"
                    height={250}
                    series={[0]}
                    options={{
                      chart: { sparkline: { enabled: true } },
                      colors: ["#e8edf5"],
                      plotOptions: {
                        radialBar: {
                          hollow: { size: "70%" },
                          track: { background: "#e8edf5" },
                          dataLabels: { show: false },
                        },
                      },
                    }}
                  />
                  <div className="sadar-score-number text-muted">
                    -
                    <span>/100</span>
                  </div>
                  <span className="sadar-score-status text-muted">Belum Tersedia</span>
                  <p className="sadar-score-note text-center mt-2 mb-0">
                    Skor akan dihitung otomatis setelah data mulai terisi.
                  </p>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="h-100 dashboard-panel">
              <CardHeader className="expense-trend-header">
                <div>
                  <h4 className="card-title mb-1">Tren Pengeluaran</h4>
                  <p className="text-muted mb-0">Pantau pola pengeluaran dari transaksi terbaru</p>
                </div>
              </CardHeader>
              <CardBody className="expense-trend-body">
                <ReactApexChart options={dynamicTrendOptions} series={dashboardData.expenseTrendSeries} type="area" height={300} />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Kategori Pengeluaran</h4>
                  <p className="text-muted mb-0">Distribusi bulan ini</p>
                </div>
              </CardHeader>
              <CardBody className="category-chart-body">
                <div className="category-chart-wrap" onMouseLeave={() => setActiveCategory({ label: "", color: "#1E3A8A" })}>
                  <ReactApexChart key="sadar-category-chart" options={categoryOptions} series={dashboardData.categorySeries} type="donut" height={312} />
                  <div
                    className={`category-center-label ${activeCategory.label ? "is-visible" : ""}`}
                    style={{ color: activeCategory.color }}
                  >
                    {activeCategory.label}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-panel mt-3">
          <CardHeader>
            <div>
              <h4 className="card-title mb-1">Riwayat Terbaru</h4>
              <p className="text-muted mb-0">Pratinjau 5 catatan keuangan terakhir</p>
            </div>
            <Button color="light" size="sm" className="sadar-table-action" tag={Link} to="/financial-history">
              Lihat Semua
            </Button>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="table-responsive sadar-table-wrap">
              <Table className="align-middle mb-0 sadar-table">
                <thead>
                  <tr>
                    <th>Nama Catatan</th>
                    <th>Kategori</th>
                    <th>Akun</th>
                    <th>Tanggal</th>
                    <th className="text-end">Nominal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentRows.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="fw-semibold text-dark">{transaction.name}</div>
                      </td>
                      <td>{transaction.category}</td>
                      <td>{transaction.account}</td>
                      <td>{transaction.formattedDate}</td>
                      <td className={`text-end fw-semibold ${transaction.amount > 0 ? "text-success" : "text-danger"}`}>
                        {transaction.amount > 0 ? "+" : "-"}
                        {rupiah(Math.abs(transaction.amount))}
                      </td>
                      <td>
                        <Badge color={transaction.amount > 0 ? "success" : "secondary"} className={`bg-${transaction.amount > 0 ? "success" : "secondary"}-subtle text-${transaction.amount > 0 ? "success" : "secondary"}`}>
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

const SadarDashboard = () => {
  useEffect(() => {
    document.title = "Dashboard | SADAR Finance";
  }, []);

  return <DashboardWithData />;
};

export default SadarDashboard;
