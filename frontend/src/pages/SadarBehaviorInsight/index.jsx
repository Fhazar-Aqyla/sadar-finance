import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { analyticsApi, incomeApi, transactionApi } from "../../Components/services/api";

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

const getDayName = (date) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date(`${date}T00:00:00`));

const isWeekend = (date) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

const formatShortDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`));

const chartBase = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  dataLabels: { enabled: false },
  grid: { borderColor: "#edf2f7", strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (value) => rupiah(value) },
  },
};

const getTopEntry = (object) =>
  Object.entries(object).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

const dashboardCategoryLabels = ["Makanan", "Transportasi", "Belanja", "Hiburan", "Lainnya"];
const dashboardCategoryColors = ["#1E3A8A", "#14B8A6", "#F59E0B", "#22C55E", "#94a3b8"];

const normalizeCategoryToDashboard = (category) => {
  const text = String(category || "").toLowerCase();
  if (/makan|food|beverage|restaurant|warung|cafe|kopi/.test(text)) return "Makanan";
  if (/transport|ojol|grab|gojek|bensin|fuel|taxi/.test(text)) return "Transportasi";
  if (/belanja|shop|groceries|minimarket|supermarket|retail|marketplace|mall/.test(text)) return "Belanja";
  if (/hiburan|entertainment|movie|bioskop|netflix|spotify|game|recreation/.test(text)) return "Hiburan";
  return "Lainnya";
};

const getRiskTone = (riskLevel) => {
  const normalizedRisk = String(riskLevel || "").toLowerCase();
  if (normalizedRisk === "high") return "danger";
  if (normalizedRisk === "medium") return "warning";
  if (normalizedRisk === "low") return "success";
  return "warning";
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
  if (/tagihan|makanan|transport|kesehatan|pendidikan/.test(text)) return "Needs";
  if (/tabungan|invest|dana darurat/.test(text)) return "Investment";
  return "Wants";
};

const EmptyBehaviorInsight = () => {
  document.title = "Insight Perilaku | SADAR Finance";

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <Card className="sadar-panel">
          <CardBody>
            <div className="sadar-empty-state sadar-empty-state-center">
              <span className="sadar-empty-state-icon">
                <i className="ri-line-chart-line"></i>
              </span>
              <h4>Belum Ada Pola yang Bisa Dianalisis</h4>
              <p>Insight akan muncul setelah kamu mulai mencatat transaksi secara rutin.</p>
              <div className="sadar-empty-state-note">Insight akan lebih akurat setelah tersedia data transaksi minimal 14 hari.</div>
              <Button color="primary" tag={Link} to="/catat-keuangan">
                Catat Transaksi Pertama
              </Button>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

const normalizeBackendTransaction = (row) => ({
  id: row.transaction_id || row.id,
  account_id: row.account_id,
  name: row.description || row.source || "Transaksi",
  category: row.category_group || "Lainnya",
  budget_group: toCategoryPrimary(row.category_group),
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
      formatter: (value) => rupiah(value * 1000),
    },
  },
});

const BehaviorInsightWithData = () => {
  document.title = "Insight Perilaku | SADAR Finance";
  const [backendTransactions, setBackendTransactions] = useState([]);
  const [backendIncomes, setBackendIncomes] = useState([]);
  const [behaviorPrediction, setBehaviorPrediction] = useState(null);

  const data = useMemo(() => {
    const expenseTransactions = backendTransactions.filter((item) => item.budget_group !== "Savings");
    const userIncomes = backendIncomes;
    const distinctDays = new Set(expenseTransactions.map((item) => item.date)).size;
    const totalExpense = sumBy(expenseTransactions, (item) => item.amount);
    const totalIncome = sumBy(userIncomes, (item) => item.amount);
    const byCategory = groupSumBy(expenseTransactions, "category");
    const [dominantCategory, dominantAmount] = getTopEntry(byCategory);

    const byDay = expenseTransactions.reduce((result, item) => {
      const day = getDayName(item.date);
      result[day] = (result[day] || 0) + 1;
      return result;
    }, {});
    const [mostActiveDay] = getTopEntry(byDay);

    const weekdayExpense = sumBy(
      expenseTransactions.filter((item) => !isWeekend(item.date)),
      (item) => item.amount,
    );
    const weekendExpense = sumBy(
      expenseTransactions.filter((item) => isWeekend(item.date)),
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
      expenseTransactions.filter((item) => item.budget_group === "Wants"),
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
        title: weekendExpense > weekdayExpense ? "Pengeluaran akhir pekan lebih tinggi" : "Pengeluaran hari kerja lebih dominan",
        description:
          weekendExpense > weekdayExpense
            ? `Pengeluaran akhir pekan mencapai ${rupiah(weekendExpense)}, lebih tinggi dari hari kerja.`
            : `Pengeluaran hari kerja mencapai ${rupiah(weekdayExpense)}, masih lebih besar dari akhir pekan.`,
        type: weekendExpense > weekdayExpense ? "warning" : "behavior",
      },
      {
        title: `Transaksi paling sering terjadi pada hari ${mostActiveDay}`,
        description: "Pola ini bisa membantu menentukan hari yang perlu lebih dipantau.",
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

    const behaviorCandidate = [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0] || null;
    const rolling7dSpending = behaviorCandidate
      ? sumBy(
          expenseTransactions.filter((item) => {
            const itemDate = new Date(`${item.date}T00:00:00`);
            const candidateDate = new Date(`${behaviorCandidate.date}T00:00:00`);
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
        const [rows, incomeRows] = await Promise.all([
          transactionApi.list({ limit: 100 }),
          incomeApi.list({ limit: 100 }),
        ]);
        if (isMounted) {
          setBackendTransactions((rows || []).map(normalizeBackendTransaction));
          setBackendIncomes((incomeRows || []).map(normalizeBackendIncome));
        }
      } catch (_error) {
        if (isMounted) {
          setBackendTransactions([]);
          setBackendIncomes([]);
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
      } catch (_error) {
        if (isMounted) {
          setBehaviorPrediction(null);
        }
      }
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [data.behaviorCandidate, data.rolling7dSpending, data.userTransactions.length]);

  const hasEnoughData = data.distinctDays >= 14;
  const categoryRows = toDashboardCategoryRows(data.byCategory);
  const categoryLabels = dashboardCategoryLabels;
  const categoryValues = categoryLabels.map((label) => categoryRows[label]);
  const trendSeriesData = data.trendRows.map((item) => Math.round(item.amount / 1000));
  const trendMaxValue = Math.max(100, Math.ceil((Math.max(...trendSeriesData, 0) * 1.2) / 500) * 500);
  const trendOptions = createTrendOptions(
    data.trendRows.map((item) => formatShortDate(item.date)),
    trendMaxValue,
  );
  const riskLabelMap = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
  };
  const modelRiskLabel = behaviorPrediction?.riskLevel
    ? riskLabelMap[String(behaviorPrediction.riskLevel).toLowerCase()] || "Sedang"
    : null;
  const predictionPercent = behaviorPrediction?.spikeProbability != null
    ? Math.round(behaviorPrediction.spikeProbability * 100)
    : null;
  const modelRiskTone = getRiskTone(behaviorPrediction?.riskLevel);
  const predictionSourceLabel = behaviorPrediction?.source === "ai-service"
    ? "Model AI"
    : behaviorPrediction?.source === "rule-based-fallback"
      ? "Cadangan berbasis aturan"
      : "Prediksi otomatis";
  const insightItems = behaviorPrediction
    ? [
        {
          title: `Prediksi perilaku membaca risiko ${modelRiskLabel}`,
          description: `${data.behaviorCandidate?.name || "Transaksi terbesar"} punya probabilitas lonjakan ${predictionPercent}%. ${behaviorPrediction.recommendation}`,
          type: modelRiskTone,
          sourceLabel: predictionSourceLabel,
        },
        ...data.insightItems,
      ]
    : data.insightItems;
  const recommendations = behaviorPrediction?.recommendation
    ? [behaviorPrediction.recommendation, ...data.recommendations]
    : data.recommendations;

  if (data.userTransactions.length === 0) {
    return <EmptyBehaviorInsight />;
  }

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        {!hasEnoughData && (
          <div className="sadar-empty-state mb-3">
            Insight akan lebih akurat setelah data transaksi minimal 14 hari tersedia.
          </div>
        )}

        <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-xl-4">
          <Col xl={3} md={6}>
            <Card className="sadar-summary-card">
              <CardBody>
                <div className="sadar-summary-label">
                  Kategori dominan
                  <span className="sadar-card-icon"><i className="ri-pie-chart-2-line"></i></span>
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
                  <span className="sadar-card-icon teal"><i className="ri-calendar-check-line"></i></span>
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
                  <span className="sadar-card-icon"><i className="ri-calendar-event-line"></i></span>
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
                  <span className={`sadar-card-icon ${modelRiskTone}`}><i className="ri-alert-line"></i></span>
                </div>
                <h2>{modelRiskLabel || (data.wantsRatio > 30 ? "Perlu Dipantau" : "Terkendali")}</h2>
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
                  <p className="text-muted mb-0">Distribusi pengeluaran bulan ini</p>
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
                  <p className="text-muted mb-0">Bandingkan waktu pengeluaran terbesar</p>
                </div>
              </CardHeader>
              <CardBody>
                <ReactApexChart
                  type="bar"
                  height={300}
                  series={[{ name: "Pengeluaran", data: [data.weekdayExpense, data.weekendExpense] }]}
                  options={{
                    ...chartBase,
                    colors: ["#14B8A6"],
                    xaxis: { categories: ["Hari Kerja", "Akhir Pekan"] },
                    plotOptions: { bar: { borderRadius: 8, columnWidth: "42%" } },
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
                  <p className="text-muted mb-0">Pantau pola pengeluaran dari transaksi terbaru</p>
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
                  <p className="text-muted mb-0">Ringkasan berbasis transaksi; badge AI muncul jika prediksi model tersedia</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-insight-list">
                  {insightItems.map((item) => (
                    <div className="sadar-insight-item" key={item.title}>
                      <span className={`sadar-dot ${["success", "warning", "danger"].includes(item.type) ? item.type : ""}`}></span>
                      <div>
                        <div className="sadar-insight-title-row">
                          <strong>{item.title}</strong>
                          {item.sourceLabel && (
                            <span className={`sadar-source-badge ${behaviorPrediction?.source === "ai-service" ? "ai" : "fallback"}`}>
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
                  <p className="text-muted mb-0">Saran otomatis dari pola transaksi dan anggaran</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-recommend-list">
                  {recommendations.map((item) => (
                    <div className="sadar-insight-item" key={item}>
                      <span className="sadar-dot"></span>
                      <p>{item}</p>
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

const BehaviorInsight = () => <BehaviorInsightWithData />;

export default BehaviorInsight;
