import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from "reactstrap";
import {
  analyticsApi,
  incomeApi,
  transactionApi,
} from "../../Components/services/api";

import "../SadarShared/sadar-pages.css";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const sumBy = (rows, getValue) =>
  rows.reduce((total, row) => total + getValue(row), 0);

const groupSumBy = (rows, key) =>
  rows.reduce((result, row) => {
    const groupKey = row[key] || "Lainnya";
    result[groupKey] = (result[groupKey] || 0) + row.amount;
    return result;
  }, {});

const getDayName = (date) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(
    new Date(`${date}T00:00:00`),
  );

const isWeekend = (date) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

const formatShortDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(
    new Date(`${date}T00:00:00`),
  );

const chartBase = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  dataLabels: { enabled: false },
  grid: { borderColor: "#edf2f7", strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (value) => rupiah(value) },
  },
};

const getTopEntry = (object) =>
  Object.entries(object).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

const dashboardCategoryLabels = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Lainnya",
];
const dashboardCategoryColors = [
  "#1E3A8A",
  "#14B8A6",
  "#F59E0B",
  "#22C55E",
  "#94a3b8",
];

const normalizeCategoryToDashboard = (category) => {
  const text = String(category || "").toLowerCase();
  if (
    /makan|food|dining|beverage|restaurant|warung|cafe|kopi|gacoan|starbucks/.test(
      text,
    )
  )
    return "Makanan";
  if (/transport|ojol|grab|gojek|bensin|fuel|taxi/.test(text))
    return "Transportasi";
  if (
    /belanja|shop|shopping|groceries|minimarket|supermarket|retail|marketplace|mall|uniqlo/.test(
      text,
    )
  )
    return "Belanja";
  if (
    /hiburan|entertainment|movie|bioskop|netflix|spotify|game|recreation/.test(
      text,
    )
  )
    return "Hiburan";
  return "Lainnya";
};

const isBudgetBucketCategory = (category) =>
  ["needs", "wants", "savings", "investment"].includes(
    String(category || "").toLowerCase(),
  );

const inferCategoryFromTransaction = (row) =>
  normalizeCategoryToDashboard(
    [
      row.description,
      row.name,
      row.merchant,
      row.source,
      row.category,
      row.category_name,
      row.categoryName,
    ]
      .filter(Boolean)
      .join(" "),
  );

const getTransactionCategory = (row) => {
  const explicitCategory =
    row.category_detail ||
    row.categoryDetail ||
    row.category_name ||
    row.categoryName ||
    row.category_group ||
    row.categoryGroup ||
    row.category ||
    "";

  if (!explicitCategory || isBudgetBucketCategory(explicitCategory)) {
    return inferCategoryFromTransaction(row);
  }

  return explicitCategory;
};

const getRiskTone = (riskLevel) => {
  const normalizedRisk = String(riskLevel || "").toLowerCase();
  if (normalizedRisk === "high") return "danger";
  if (normalizedRisk === "medium") return "warning";
  if (normalizedRisk === "low") return "success";
  return "warning";
};

const normalizePrediction = (prediction) => {
  if (!prediction) return null;

  const rawProbability =
    prediction.spikeProbability ??
    prediction.spike_probability ??
    prediction.probability ??
    prediction.overspending_probability ??
    null;
  const probabilityNumber =
    rawProbability == null ? null : Number(rawProbability);
  const spikeProbability =
    probabilityNumber == null || Number.isNaN(probabilityNumber)
      ? null
      : probabilityNumber > 1
        ? probabilityNumber / 100
        : probabilityNumber;

  return {
    riskLevel:
      prediction.riskLevel ||
      prediction.risk_level ||
      prediction.risk ||
      "medium",
    spikeProbability,
    recommendation:
      prediction.recommendation ||
      prediction.message ||
      prediction.insight ||
      "",
    source: prediction.source || prediction.model_source || "auto",
  };
};

const splitRecommendationText = (text) => {
  const cleanText = String(text || "").trim();
  const [firstSentence, ...rest] = cleanText.split(/(?<=\.)\s+/);

  if (!cleanText) {
    return {
      title: "Pantau pola berikutnya",
      description:
        "Tambahkan transaksi rutin agar rekomendasi bisa lebih spesifik.",
    };
  }

  if (firstSentence.length <= 180 && rest.length) {
    return {
      title: firstSentence.replace(/\.$/, ""),
      description: rest.join(" "),
    };
  }

  return {
    title:
      cleanText.length > 180
        ? `${cleanText.slice(0, 177).trim()}...`
        : cleanText,
    description:
      cleanText.length > 180
        ? cleanText
        : "Aksi ini bisa membantu menjaga arus kas tetap terkendali.",
  };
};

const toRecommendationCard = (item, index) => {
  if (typeof item === "object" && item) {
    return {
      title: item.title,
      description: item.description,
      action: item.action || "Cek detail",
      tone: item.tone || "teal",
      icon: item.icon || "ri-lightbulb-flash-line",
    };
  }

  const text = splitRecommendationText(item);
  const presets = [
    {
      action: "Prioritaskan minggu ini",
      tone: "teal",
      icon: "ri-focus-2-line",
    },
    {
      action: "Terapkan batas harian",
      tone: "warning",
      icon: "ri-calendar-check-line",
    },
    {
      action: "Review sebelum belanja",
      tone: "primary",
      icon: "ri-wallet-3-line",
    },
    { action: "Pantau ulang", tone: "success", icon: "ri-check-double-line" },
  ];

  return {
    ...text,
    ...presets[index % presets.length],
  };
};

const toDashboardCategoryRows = (byCategory) => {
  const rows = dashboardCategoryLabels.reduce((result, label) => {
    result[label] = 0;
    return result;
  }, {});

  Object.entries(byCategory).forEach(([category, value]) => {
    const mappedCategory = normalizeCategoryToDashboard(category);
    rows[mappedCategory] += value;
  });

  return rows;
};

const toCategoryPrimary = (category) => {
  const text = String(category || "").toLowerCase();
  if (/tagihan|makanan|transport|kesehatan|pendidikan/.test(text))
    return "Needs";
  if (/tabungan|invest|dana darurat/.test(text)) return "Investment";
  return "Wants";
};

const SadarLoadingScreen = () => {
  return (
    <div className="page-content sadar-page sadar-loading-screen d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "2.5rem", height: "2.5rem" }}
        >
          <span className="visually-hidden">Memuat...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">
          Memuat analisis perilaku...
        </p>
      </div>
    </div>
  );
};

const EmptyBehaviorInsight = ({ hasIncome, hasBudget, hasTransactions }) => {
  useEffect(() => {
    document.title = "Insight Perilaku | SADAR Finance";
  }, []);

  const completedSteps = [hasIncome, hasBudget, hasTransactions].filter(Boolean).length;
  const totalSteps = 3;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const steps = [
    {
      key: "income",
      title: "Catat Pemasukan",
      description: "Tambahkan pemasukan agar SADAR dapat memahami arus uang yang masuk.",
      completed: hasIncome,
      ctaLabel: "Catat Pemasukan",
      to: "/catat-keuangan?type=income",
      icon: "ri-arrow-down-circle-line",
    },
    {
      key: "budget",
      title: "Atur Anggaran",
      description: "Tentukan batas pengeluaran untuk membantu mengukur kesehatan pengelolaan keuanganmu.",
      completed: hasBudget,
      ctaLabel: "Atur Anggaran",
      to: "/profile-account#atur-budget",
      icon: "ri-wallet-line",
    },
    {
      key: "transactions",
      title: "Catat Transaksi",
      description: "Bangun riwayat transaksi agar pola pengeluaranmu dapat dianalisis.",
      completed: hasTransactions,
      ctaLabel: "Catat Transaksi",
      to: "/catat-keuangan?type=expense",
      icon: "ri-exchange-dollar-line",
    },
  ];

  // Find the first uncompleted step to set as nextStep (priority CTA)
  const nextStep = steps.find((step) => !step.completed);

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <div className="sadar-page-header">
          <div>
            <h1>Lengkapi Data untuk Melihat Insight Perilaku</h1>
            <p>
              Insight dan analisis perilaku keuanganmu akan tersedia setelah data mencukupi.
            </p>
          </div>
          <div className="sadar-header-icon">
            <i className="ri-line-chart-line"></i>
          </div>
        </div>

        <Row className="g-3 align-items-stretch">
          <Col lg={7} xl={8} className="d-flex">
            <Card className="sadar-panel flex-fill">
              <CardBody className="d-flex flex-column justify-content-between p-4">
                <div>
                  {/* Onboarding Progress */}
                  <div className="sadar-onboarding-progress-section mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold text-muted font-size-13">Langkah Penyelesaian</span>
                      <span className="fw-bold text-primary font-size-13">{completedSteps} dari {totalSteps} langkah selesai</span>
                    </div>
                    <div className="sadar-progress-bar-track">
                      <div
                        className="sadar-progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Checklist cards */}
                  <div className="sadar-step-cards-list d-flex flex-column gap-3">
                    {steps.map((step) => {
                      const isNext = nextStep && nextStep.key === step.key;
                      return (
                        <div
                          key={step.key}
                          className={`sadar-step-card ${step.completed ? "completed" : ""} ${isNext ? "active" : ""}`}
                        >
                          <div className="d-flex align-items-start gap-3 w-100">
                            <div className="sadar-step-icon-wrapper">
                              {step.completed ? (
                                <span className="sadar-step-status-icon success-icon">
                                  <i className="ri-checkbox-circle-fill"></i>
                                </span>
                              ) : (
                                <span className={`sadar-step-status-icon pending-icon ${isNext ? "pulse" : ""}`}>
                                  <i className="ri-checkbox-blank-circle-line"></i>
                                </span>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h5 className="sadar-step-title mb-1 fw-bold">
                                  {step.title}
                                </h5>
                                {step.completed ? (
                                  <span className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill fw-bold font-size-12">
                                    Sudah Selesai
                                  </span>
                                ) : (
                                  <Button
                                    tag={Link}
                                    to={step.to}
                                    color={isNext ? "primary" : "outline-secondary"}
                                    size="sm"
                                    className="sadar-step-cta px-3 font-size-12 fw-semibold"
                                  >
                                    {step.ctaLabel}
                                  </Button>
                                )}
                              </div>
                              <p className="sadar-step-desc text-muted mb-0 font-size-13 mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={5} xl={4} className="d-flex">
            <Card className="sadar-panel flex-fill">
              <CardBody className="d-flex flex-column justify-content-between p-4">
                <div>
                  <h4 className="fw-bold mb-3">Apa yang dideteksi oleh Insight Perilaku?</h4>
                  <p className="text-muted mb-4 font-size-13">
                    Insight Perilaku memantau kebiasaan transaksimu secara real-time dan memberikan analisis mendalam.
                  </p>

                  <div className="sadar-factor-mini-list d-flex flex-column gap-3 mb-4">
                    <div className="d-flex align-items-start gap-3">
                      <div className="sadar-factor-icon-wrapper teal">
                        <i className="ri-pie-chart-2-line"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Kategori Dominan</h6>
                        <p className="text-muted mb-0 font-size-12">Mendeteksi ke mana sebagian besar pengeluaranmu mengalir.</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="sadar-factor-icon-wrapper blue">
                        <i className="ri-calendar-check-line"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Rata-rata & Frekuensi Harian</h6>
                        <p className="text-muted mb-0 font-size-12">Menemukan hari belanja teraktifmu secara otomatis.</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="sadar-factor-icon-wrapper orange">
                        <i className="ri-mind-map"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Prediksi Risiko & Spike AI</h6>
                        <p className="text-muted mb-0 font-size-12">Peringatan dini dari model AI jika terdapat indikasi pengeluaran berlebih.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-3 mt-3">
                  <h6 className="fw-bold mb-2">Konsistensi & Keakuratan</h6>
                  <p className="text-muted mb-0 font-size-12 leading-relaxed">
                    Prediksi perilaku dan rekomendasi akan menjadi jauh lebih akurat setelah kamu memiliki catatan transaksi minimal selama <strong>14 hari</strong> secara rutin.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const normalizeBackendTransaction = (row) => ({
  id: row.transaction_id || row.id,
  account_id: row.account_id,
  name: row.description || row.source || "Transaksi",
  category: getTransactionCategory(row),
  budget_group: toCategoryPrimary(getTransactionCategory(row)),
  amount: Number(row.amount || 0),
  date: String(row.transaction_date || row.date || "").slice(0, 10),
  status: "Tercatat",
});

const normalizeBackendIncome = (row) => ({
  id: row.income_id || row.id,
  amount: Number(row.amount || 0),
  date: String(row.income_date || row.date || "").slice(0, 10),
});

const createTrendOptions = (categories, maxValue) => ({
  ...chartBase,
  colors: ["#14B8A6"],
  chart: {
    ...chartBase.chart,
    id: "sadar-behavior-expense-trend-chart",
    parentHeightOffset: 0,
    sparkline: { enabled: false },
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
    tickAmount: 8,
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
      show: true,
      rotate: -45,
      rotateAlways: false,
      hideOverlappingLabels: true,
      offsetY: 8,
      style: {
        colors: "#596374",
        fontSize: "11px",
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
      formatter: (value) => rupiah(value * 1000),
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: {
          height: 250,
        },
        xaxis: {
          tickAmount: 5,
          labels: {
            rotate: 0,
            rotateAlways: false,
            style: {
              fontSize: "10px",
            },
          },
        },
        yaxis: {
          tickAmount: 3,
          labels: {
            style: {
              fontSize: "10px",
            },
          },
        },
      },
    },
  ],
});

const BehaviorInsightWithData = () => {
  const [backendTransactions, setBackendTransactions] = useState([]);
  const [backendIncomes, setBackendIncomes] = useState([]);
  const [behaviorPrediction, setBehaviorPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checklist, setChecklist] = useState({
    hasIncome: false,
    hasBudget: false,
    hasTransactions: false,
  });

  const data = useMemo(() => {
    const expenseTransactions = backendTransactions.filter(
      (item) => item.budget_group !== "Savings",
    );
    const userIncomes = backendIncomes;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthIncomes = userIncomes.filter((item) => {
      const d = new Date(`${item.date}T00:00:00`);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const currentMonthExpenses = expenseTransactions.filter((item) => {
      const d = new Date(`${item.date}T00:00:00`);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const activeExpenses = currentMonthExpenses.length >= 3 ? currentMonthExpenses : expenseTransactions;
    const activeIncomes = currentMonthIncomes.length > 0 ? currentMonthIncomes : userIncomes;

    const distinctDays = new Set(activeExpenses.map((item) => item.date)).size;
    const totalExpense = sumBy(activeExpenses, (item) => item.amount);
    const totalIncome = sumBy(activeIncomes, (item) => item.amount);
    const byCategory = groupSumBy(activeExpenses, "category");
    const [dominantCategory, dominantAmount] = getTopEntry(byCategory);

    const byDay = activeExpenses.reduce((result, item) => {
      const day = getDayName(item.date);
      result[day] = (result[day] || 0) + 1;
      return result;
    }, {});
    const [mostActiveDay] = getTopEntry(byDay);

    const weekdayExpense = sumBy(
      activeExpenses.filter((item) => !isWeekend(item.date)),
      (item) => item.amount,
    );
    const weekendExpense = sumBy(
      activeExpenses.filter((item) => isWeekend(item.date)),
      (item) => item.amount,
    );

    const byDate = expenseTransactions.reduce((result, item) => {
      result[item.date] = (result[item.date] || 0) + item.amount;
      return result;
    }, {});
    const trendRows = Object.entries(byDate)
      .sort(([a], [b]) => new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`))
      .map(([date, amount]) => ({ date, amount }));

    const wantsExpense = sumBy(
      currentMonthExpenses.filter((item) => item.budget_group === "Wants"),
      (item) => item.amount,
    );
    const wantsRatio = totalIncome ? (wantsExpense / totalIncome) * 100 : 0;
    const dailyAverage = distinctDays ? totalExpense / distinctDays : 0;

    const insightItems = [
      {
        title: `${dominantCategory} menjadi kategori dominan`,
        description: `Kategori ini memakai ${rupiah(dominantAmount)} atau porsi terbesar dari pengeluaran periode ini.`,
        type: "behavior",
      },
      {
        title:
          weekendExpense > weekdayExpense
            ? "Pengeluaran akhir pekan lebih tinggi"
            : "Pengeluaran hari kerja lebih dominan",
        description:
          weekendExpense > weekdayExpense
            ? `Pengeluaran akhir pekan mencapai ${rupiah(weekendExpense)}, lebih tinggi dari hari kerja.`
            : `Pengeluaran hari kerja mencapai ${rupiah(weekdayExpense)}, masih lebih besar dari akhir pekan.`,
        type: weekendExpense > weekdayExpense ? "warning" : "behavior",
      },
      {
        title: `Transaksi paling sering terjadi pada hari ${mostActiveDay}`,
        description:
          "Pola ini bisa membantu menentukan hari yang perlu lebih dipantau.",
        type: "behavior",
      },
    ];

    if (wantsRatio > 30) {
      insightItems.push({
        title: "Kategori keinginan melewati 30% dari pemasukan",
        description: `Porsi keinginan saat ini ${wantsRatio.toFixed(1)}% dari pemasukan bulan ini.`,
        type: "warning",
      });
    }

    const recommendations = [
      `Pantau kategori ${dominantCategory} karena menjadi pengeluaran terbesar bulan ini.`,
      weekendExpense > weekdayExpense
        ? "Coba batasi pengeluaran makanan dan hiburan di akhir pekan."
        : "Pertahankan kontrol pengeluaran akhir pekan, lalu rapikan transaksi kecil di hari kerja.",
      wantsRatio > 30
        ? "Kurangi pengeluaran kategori keinginan agar kembali dekat dengan alokasi 30%."
        : "Porsi keinginan masih terkendali, tetap cek sebelum melakukan belanja tambahan.",
    ];

    const behaviorCandidate =
      [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0] || null;
    const rolling7dSpending = behaviorCandidate
      ? sumBy(
          expenseTransactions.filter((item) => {
            const itemDate = new Date(`${item.date}T00:00:00`);
            const candidateDate = new Date(
              `${behaviorCandidate.date}T00:00:00`,
            );
            const diffDays = (candidateDate - itemDate) / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
          }),
          (item) => item.amount,
        )
      : 0;

    return {
      userTransactions: expenseTransactions,
      distinctDays,
      totalExpense,
      dailyAverage,
      dominantCategory,
      dominantAmount,
      mostActiveDay,
      wantsRatio,
      byCategory,
      weekendExpense,
      weekdayExpense,
      trendRows,
      insightItems,
      recommendations,
      behaviorCandidate,
      rolling7dSpending,
    };
  }, [backendIncomes, backendTransactions]);

  useEffect(() => {
    let isMounted = true;

    const fetchApiData = async () => {
      try {
        const [rows, incomeRows, budgetResponse] = await Promise.all([
          transactionApi.list({ limit: 100 }).catch(() => []),
          incomeApi.list({ limit: 100 }).catch(() => []),
          analyticsApi.latestBudget().catch(() => null),
        ]);
        if (isMounted) {
          const mappedTransactions = (rows || []).map(normalizeBackendTransaction);
          const mappedIncomes = (incomeRows || []).map(normalizeBackendIncome);
          
          setBackendTransactions(mappedTransactions);
          setBackendIncomes(mappedIncomes);

          const hasIncome = mappedIncomes.length > 0;
          const hasBudget = budgetResponse !== null && (
            Number(budgetResponse.needs_amount || budgetResponse.needsAmount || 0) > 0 ||
            Number(budgetResponse.wants_amount || budgetResponse.wantsAmount || 0) > 0 ||
            Number(budgetResponse.savings_amount || budgetResponse.savingsAmount || 0) > 0
          );
          const hasTransactions = mappedTransactions.length > 0;

          setChecklist({
            hasIncome,
            hasBudget,
            hasTransactions,
          });
        }
      } catch (err) {
        console.error("fetchApiData error:", err);
        if (isMounted) {
          setBackendTransactions([]);
          setBackendIncomes([]);
          setChecklist({
            hasIncome: false,
            hasBudget: false,
            hasTransactions: false,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchApiData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPrediction = async () => {
      if (!data.behaviorCandidate) return;

      try {
        const candidate = data.behaviorCandidate;
        const response = await analyticsApi.behaviorPredict({
          amount: candidate.amount,
          date: candidate.date,
          merchant: candidate.name,
          categoryGroup: candidate.category,
          categoryPrimary: candidate.budget_group,
          categoryDetail: candidate.category,
          rolling7dSpending: data.rolling7dSpending,
          transactionCount: data.userTransactions.length,
        });

        if (isMounted) {
          setBehaviorPrediction(response || null);
        }
      } catch {
        if (isMounted) {
          setBehaviorPrediction(null);
        }
      }
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [
    data.behaviorCandidate,
    data.rolling7dSpending,
    data.userTransactions.length,
  ]);

  const hasEnoughData = data.distinctDays >= 14;
  const categoryRows = toDashboardCategoryRows(data.byCategory);
  const categoryLabels = dashboardCategoryLabels;
  const categoryValues = categoryLabels.map((label) => categoryRows[label]);
  const trendSeriesData = data.trendRows.map((item) =>
    Math.round(item.amount / 1000),
  );
  const trendMaxValue = Math.max(
    100,
    Math.ceil((Math.max(...trendSeriesData, 0) * 1.2) / 500) * 500,
  );
  const trendOptions = createTrendOptions(
    data.trendRows.map((item) => formatShortDate(item.date)),
    trendMaxValue,
  );
  const riskLabelMap = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
  };
  const normalizedPrediction = normalizePrediction(behaviorPrediction);
  const modelRiskLabel = normalizedPrediction?.riskLevel
    ? riskLabelMap[String(normalizedPrediction.riskLevel).toLowerCase()] ||
      "Sedang"
    : null;
  const predictionPercent =
    normalizedPrediction?.spikeProbability != null
      ? Math.round(normalizedPrediction.spikeProbability * 100)
      : null;
  const modelRiskTone = getRiskTone(normalizedPrediction?.riskLevel);
  const predictionSourceLabel =
    normalizedPrediction?.source === "ai-service"
      ? "Model AI"
      : normalizedPrediction?.source === "rule-based-fallback"
        ? "Cadangan berbasis aturan"
        : "Prediksi otomatis";
  const insightItems = normalizedPrediction
    ? [
        {
          title: `Prediksi perilaku membaca risiko ${modelRiskLabel}`,
          description:
            predictionPercent != null
              ? `${data.behaviorCandidate?.name || "Transaksi terbesar"} memiliki probabilitas lonjakan sebesar ${predictionPercent}%.`
              : normalizedPrediction.recommendation ||
                "Model membaca pola transaksi terbaru untuk memberi sinyal risiko.",
          type: modelRiskTone,
          sourceLabel: predictionSourceLabel,
        },
        ...data.insightItems,
      ]
    : data.insightItems;
  const recommendations = normalizedPrediction?.recommendation
    ? [normalizedPrediction.recommendation, ...data.recommendations]
    : data.recommendations;
  const recommendationCards = recommendations.map(toRecommendationCard);

  if (isLoading) {
    return <SadarLoadingScreen />;
  }

  const isInsufficient = !checklist.hasIncome || !checklist.hasBudget || !checklist.hasTransactions;
  if (isInsufficient) {
    return (
      <EmptyBehaviorInsight
        hasIncome={checklist.hasIncome}
        hasBudget={checklist.hasBudget}
        hasTransactions={checklist.hasTransactions}
      />
    );
  }

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        {!hasEnoughData && (
          <div className="sadar-empty-state mb-3">
            Insight akan lebih akurat setelah data transaksi minimal 14 hari
            tersedia.
          </div>
        )}

        <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-xl-4">
          <Col xl={3} md={6}>
            <Card className="sadar-summary-card">
              <CardBody>
                <div className="sadar-summary-label">
                  Kategori dominan
                  <span className="sadar-card-icon">
                    <i className="ri-pie-chart-2-line"></i>
                  </span>
                </div>
                <h2>{data.dominantCategory}</h2>
                <p>{rupiah(data.dominantAmount)} bulan ini</p>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="sadar-summary-card">
              <CardBody>
                <div className="sadar-summary-label">
                  Rata-rata harian
                  <span className="sadar-card-icon teal">
                    <i className="ri-calendar-check-line"></i>
                  </span>
                </div>
                <h2>{rupiah(data.dailyAverage)}</h2>
                <p>Berdasarkan {data.distinctDays} hari transaksi</p>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="sadar-summary-card">
              <CardBody>
                <div className="sadar-summary-label">
                  Hari tersering
                  <span className="sadar-card-icon">
                    <i className="ri-calendar-event-line"></i>
                  </span>
                </div>
                <h2>{data.mostActiveDay}</h2>
                <p>Hari dengan frekuensi transaksi tertinggi</p>
              </CardBody>
            </Card>
          </Col>
          <Col xl={3} md={6}>
            <Card className="sadar-summary-card">
              <CardBody>
                <div className="sadar-summary-label">
                  Potensi boros
                  <span className={`sadar-card-icon ${modelRiskTone}`}>
                    <i className="ri-alert-line"></i>
                  </span>
                </div>
                <h2>
                  {modelRiskLabel ||
                    (data.wantsRatio > 30 ? "Perlu Dipantau" : "Terkendali")}
                </h2>
                <p>
                  {predictionPercent != null
                    ? `Spike probability ${predictionPercent}% dari model AI`
                    : `Keinginan memakai ${data.wantsRatio.toFixed(1)}% dari pemasukan`}
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={6}>
            <Card className="sadar-chart-card sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Kategori Pengeluaran</h4>
                  <p className="text-muted mb-0">
                    Distribusi pengeluaran bulan ini
                  </p>
                </div>
              </CardHeader>
              <CardBody className="category-chart-body">
                <div className="category-chart-wrap">
                  <ReactApexChart
                    type="donut"
                    height={312}
                    series={categoryValues}
                    options={{
                      ...chartBase,
                      labels: categoryLabels,
                      colors: dashboardCategoryColors,
                      fill: {
                        colors: dashboardCategoryColors,
                        opacity: 1,
                      },
                      legend: {
                        position: "bottom",
                        fontSize: "12px",
                        itemMargin: { horizontal: 8, vertical: 4 },
                      },
                      stroke: {
                        width: 4,
                        colors: ["#ffffff"],
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "72%",
                            labels: { show: false },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card className="sadar-chart-card sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Hari Kerja vs Akhir Pekan</h4>
                  <p className="text-muted mb-0">
                    Bandingkan waktu pengeluaran terbesar
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <ReactApexChart
                  type="bar"
                  height={300}
                  series={[
                    {
                      name: "Pengeluaran",
                      data: [data.weekdayExpense, data.weekendExpense],
                    },
                  ]}
                  options={{
                    ...chartBase,
                    colors: ["#14B8A6"],
                    xaxis: { categories: ["Hari Kerja", "Akhir Pekan"] },
                    plotOptions: {
                      bar: { borderRadius: 8, columnWidth: "42%" },
                    },
                  }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={12}>
            <Card className="sadar-chart-card sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Tren Pengeluaran</h4>
                  <p className="text-muted mb-0">
                    Pantau pola pengeluaran dari transaksi terbaru
                  </p>
                </div>
              </CardHeader>
              <CardBody className="sadar-expense-trend-body">
                <ReactApexChart
                  type="area"
                  height={300}
                  series={[{ name: "Pengeluaran", data: trendSeriesData }]}
                  options={trendOptions}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={7}>
            <Card className="sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Insight Perilaku</h4>
                  <p className="text-muted mb-0">
                    Ringkasan berbasis transaksi; badge AI muncul jika prediksi
                    model tersedia
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-insight-list">
                  {insightItems.map((item) => (
                    <div className="sadar-insight-item" key={item.title}>
                      <span
                        className={`sadar-dot ${["success", "warning", "danger"].includes(item.type) ? item.type : ""}`}
                      ></span>
                      <div>
                        <div className="sadar-insight-title-row">
                          <strong>{item.title}</strong>
                          {item.sourceLabel && (
                            <span
                              className={`sadar-source-badge ${normalizedPrediction?.source === "ai-service" ? "ai" : "fallback"}`}
                            >
                              {item.sourceLabel}
                            </span>
                          )}
                        </div>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={5}>
            <Card className="sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Rekomendasi Ringan</h4>
                  <p className="text-muted mb-0">
                    Saran otomatis dari pola transaksi dan anggaran
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-recommend-list">
                  {recommendationCards.map((item, index) => (
                    <div
                      className="sadar-recommend-card"
                      key={`${item.title}-${index}`}
                    >
                      <span className={`sadar-recommend-icon ${item.tone}`}>
                        <i className={item.icon}></i>
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                        <span>{item.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const BehaviorInsight = () => {
  useEffect(() => {
    document.title = "Insight Perilaku | SADAR Finance";
  }, []);

  return <BehaviorInsightWithData />;
};

export default BehaviorInsight;
