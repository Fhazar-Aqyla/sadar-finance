import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { Button, ButtonGroup, Card, CardBody, CardHeader, Col, Container, Progress, Row } from "reactstrap";

import {
  alerts,
  budgets,
  currentUserId,
  getUserRows,
  groupSumBy,
  incomes,
  rupiah,
  sumBy,
  transactions,
} from "../SadarShared/mockData";
import "../SadarShared/sadar-pages.css";

const getScoreStatus = (score) => {
  if (score <= 40) return "Perlu Perhatian";
  if (score <= 70) return "Cukup Sehat";
  return "Sehat";
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://sadar-finance.up.railway.app/api/v1";

const periodOptions = [
  { key: "2w", label: "2 Minggu", months: 1 },
  { key: "1m", label: "1 Bulan", months: 1 },
  { key: "3m", label: "3 Bulan", months: 3 },
  { key: "6m", label: "6 Bulan", months: 6 },
  { key: "1y", label: "1 Tahun", months: 12 },
  { key: "all", label: "Semua", months: 24 },
];

const authHeaders = () => {
  const authUser = JSON.parse(sessionStorage.getItem("authUser") || "null");
  return authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {};
};

const toPercent = (value) => Number((value * 100).toFixed(1));

const getPeriodOption = (periodKey) =>
  periodOptions.find((option) => option.key === periodKey) || periodOptions[2];

const getDateValue = (item) => item.date || item.transaction_date || item.income_date || item.created_at;

const getPeriodStartDate = (periodKey, rows) => {
  if (periodKey === "all") return null;

  const validDates = rows
    .map((item) => new Date(`${getDateValue(item)}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()));
  const endDate = validDates.length
    ? new Date(Math.max(...validDates.map((date) => date.getTime())))
    : new Date();
  const startDate = new Date(endDate);

  if (periodKey === "2w") {
    startDate.setDate(startDate.getDate() - 14);
    return startDate;
  }

  startDate.setMonth(startDate.getMonth() - getPeriodOption(periodKey).months);
  return startDate;
};

const filterRowsByPeriod = (rows, periodKey) => {
  const startDate = getPeriodStartDate(periodKey, rows);
  if (!startDate) return rows;

  return rows.filter((item) => {
    const value = getDateValue(item);
    const itemDate = new Date(`${value}T00:00:00`);
    return !Number.isNaN(itemDate.getTime()) && itemDate >= startDate;
  });
};

const buildApiData = (healthScore) => {
  const score = Number(healthScore?.breakdown?.overallScore ?? healthScore?.score?.score ?? 0);
  const totalIncome = Number(healthScore?.financials?.totalIncome || 0);
  const totalExpense = Number(healthScore?.financials?.totalExpense || 0);
  const ratios = healthScore?.ratios || {};
  const breakdown = healthScore?.breakdown || {};
  const expenseRatio = toPercent(Number(ratios.expenseRatio || 0));
  const budgetUsage = toPercent(Number(ratios.budgetUsage || 0));
  const savingsRate = toPercent(Number(ratios.savingsRate || 0));
  const needsRatio = toPercent(Number(ratios.needsRatio || 0));
  const wantsRatio = toPercent(Number(ratios.wantsRatio || 0));
  const savingsRatio = toPercent(Number(ratios.savingsRatio || 0));

  return {
    score,
    status: healthScore?.status || getScoreStatus(score),
    totalIncome,
    totalExpense,
    budgetUsage,
    factors: [
      {
        label: "Pemasukan vs Pengeluaran",
        value: `${expenseRatio.toFixed(1)}%`,
        description:
          expenseRatio < 70
            ? "Pengeluaran masih berada di bawah pemasukan dengan ruang aman."
            : "Pengeluaran mulai tinggi dibanding pemasukan bulan ini.",
        progress: clamp(Number(breakdown.expenseScore || 0), 0, 100),
      },
      {
        label: "Budget Terpakai",
        value: `${budgetUsage.toFixed(1)}%`,
        description:
          budgetUsage >= 80
            ? "Budget mendekati batas, beberapa kategori perlu dipantau."
            : "Penggunaan budget masih relatif aman.",
        progress: clamp(Number(breakdown.budgetScore || 0), 0, 100),
      },
      {
        label: "Konsistensi Pencatatan",
        value: `${Number(breakdown.consistencyScore || 0)}%`,
        description:
          Number(breakdown.consistencyScore || 0) >= 60
            ? "Data pemasukan dan transaksi cukup konsisten untuk dibaca."
            : "Data masih perlu dicatat lebih rutin agar score makin akurat.",
        progress: clamp(Number(breakdown.consistencyScore || 0), 0, 100),
      },
      {
        label: "Alokasi 50/30/20",
        value: `${needsRatio.toFixed(0)} / ${wantsRatio.toFixed(0)} / ${savingsRatio.toFixed(0)}%`,
        description: "Perbandingan Kebutuhan, Keinginan, dan Tabungan terhadap pemasukan bulan ini.",
        progress: clamp(100 - Math.abs(50 - needsRatio) - Math.abs(30 - wantsRatio) - Math.abs(20 - savingsRatio), 0, 100),
      },
      {
        label: "Rasio Tabungan",
        value: `${savingsRate.toFixed(1)}%`,
        description:
          savingsRate >= 20
            ? "Tabungan sudah memenuhi target minimal 20%."
            : "Tabungan belum mencapai target minimal 20%.",
        progress: clamp(Number(breakdown.savingsScore || 0), 0, 100),
      },
    ],
    insights: healthScore?.insights?.length
      ? healthScore.insights
      : [
          totalExpense < totalIncome
            ? "Pengeluaran bulan ini masih berada di bawah pemasukan."
            : "Pengeluaran bulan ini sudah melewati pemasukan.",
          budgetUsage >= 80
            ? "Penggunaan budget sudah mendekati batas dan perlu dipantau."
            : "Penggunaan budget masih berada di area aman.",
          savingsRate < 20
            ? "Alokasi tabungan belum mencapai 20% dari pemasukan."
            : "Alokasi tabungan sudah mendekati prinsip 20%.",
        ],
    recommendations: healthScore?.recommendations?.length
      ? healthScore.recommendations
      : ["Review budget mingguan agar pola pengeluaran tetap stabil."],
    ratioSeries: [needsRatio, wantsRatio, savingsRatio],
  };
};

const buildFallbackData = (periodKey) => {
  const userTransactions = filterRowsByPeriod(getUserRows(transactions, currentUserId), periodKey);
  const expenseTransactions = userTransactions.filter((item) => item.budget_group !== "Savings");
  const userIncomes = filterRowsByPeriod(getUserRows(incomes, currentUserId), periodKey);
  const userBudgets = getUserRows(budgets, currentUserId);
  const userAlerts = getUserRows(alerts, currentUserId);

  const totalIncome = sumBy(userIncomes, (item) => item.amount);
  const totalExpense = sumBy(expenseTransactions, (item) => item.amount);
  const expenseRatio = totalIncome ? (totalExpense / totalIncome) * 100 : 0;
  const budgetUsed = sumBy(userBudgets, (item) => item.used);
  const budgetLimit = sumBy(userBudgets, (item) => item.limit);
  const budgetUsage = budgetLimit ? (budgetUsed / budgetLimit) * 100 : 0;
  const budgetByGroup = groupSumBy(userTransactions, "budget_group");
  const needsRatio = totalIncome ? ((budgetByGroup.Needs || 0) / totalIncome) * 100 : 0;
  const wantsRatio = totalIncome ? ((budgetByGroup.Wants || 0) / totalIncome) * 100 : 0;
  const savingsRatio = totalIncome ? ((budgetByGroup.Savings || 0) / totalIncome) * 100 : 0;

  const byDate = Object.values(
    expenseTransactions.reduce((result, item) => {
      result[item.date] = (result[item.date] || 0) + item.amount;
      return result;
    }, {}),
  );
  const dailyAverage = byDate.length ? sumBy(byDate, (item) => item) / byDate.length : 0;
  const spikeDays = byDate.filter((amount) => amount > dailyAverage * 1.65).length;

  let score = 100;
  score -= clamp(expenseRatio - 70, 0, 30) * 0.5;
  score -= clamp(budgetUsage - 80, 0, 35) * 0.6;
  score -= clamp(wantsRatio - 30, 0, 30) * 0.7;
  score -= clamp(20 - savingsRatio, 0, 20) * 0.9;
  score -= userAlerts.length * 4;
  score -= spikeDays * 2;
  score = Math.round(clamp(score, 0, 100));

  const factors = [
    {
      label: "Pemasukan vs Pengeluaran",
      value: `${expenseRatio.toFixed(1)}%`,
      description:
        expenseRatio < 70
          ? "Pengeluaran masih berada di bawah pemasukan dengan ruang aman."
          : "Pengeluaran mulai tinggi dibanding pemasukan bulan ini.",
      progress: clamp(expenseRatio, 0, 100),
    },
    {
      label: "Budget Terpakai",
      value: `${budgetUsage.toFixed(1)}%`,
      description:
        budgetUsage >= 80
          ? "Budget mendekati batas, beberapa kategori perlu dipantau."
          : "Penggunaan budget masih relatif aman.",
      progress: clamp(budgetUsage, 0, 100),
    },
    {
      label: "Konsistensi Pengeluaran",
      value: `${spikeDays} spike`,
      description:
        spikeDays > 0
          ? "Ada hari dengan pengeluaran jauh lebih tinggi dari rata-rata."
          : "Tidak ada lonjakan pengeluaran besar dalam periode ini.",
      progress: clamp(100 - spikeDays * 18, 0, 100),
    },
    {
      label: "Alokasi 50/30/20",
      value: `${needsRatio.toFixed(0)} / ${wantsRatio.toFixed(0)} / ${savingsRatio.toFixed(0)}%`,
      description: "Perbandingan Kebutuhan, Keinginan, dan Tabungan terhadap pemasukan bulan ini.",
      progress: clamp(100 - Math.abs(50 - needsRatio) - Math.abs(30 - wantsRatio) - Math.abs(20 - savingsRatio), 0, 100),
    },
    {
      label: "Alert Budget",
      value: `${userAlerts.length} alert`,
      description:
        userAlerts.length > 0
          ? "Ada kategori yang mendekati batas budget."
          : "Belum ada alert overspending aktif.",
      progress: clamp(100 - userAlerts.length * 22, 0, 100),
    },
  ];

  const insights = [
    totalExpense < totalIncome
      ? "Pengeluaran bulan ini masih berada di bawah pemasukan."
      : "Pengeluaran bulan ini sudah melewati pemasukan.",
    budgetUsage >= 80
      ? "Penggunaan budget sudah mendekati batas dan perlu dipantau."
      : "Penggunaan budget masih berada di area aman.",
    savingsRatio < 20
      ? "Alokasi tabungan belum mencapai 20% dari pemasukan."
      : "Alokasi tabungan sudah mendekati prinsip 20%.",
  ];

  const recommendations = [
    wantsRatio > 30
      ? "Kurangi pengeluaran kategori wants agar budget lebih aman."
      : "Pertahankan porsi keinginan agar tetap di sekitar 30% dari pemasukan.",
    savingsRatio < 20
      ? "Sisihkan minimal 20% dari pemasukan untuk tabungan atau dana darurat."
      : "Pertahankan kebiasaan menyisihkan dana untuk tabungan.",
    budgetUsage >= 80
      ? "Pantau kategori yang mendekati batas sebelum menambah transaksi baru."
      : "Review budget mingguan agar pola pengeluaran tetap stabil.",
  ];

  return {
    score,
    status: getScoreStatus(score),
    totalIncome,
    totalExpense,
    budgetUsage,
    factors,
    insights,
    recommendations,
    ratioSeries: [needsRatio, wantsRatio, savingsRatio],
  };
};

const FinancialScore = () => {
  document.title = "Financial Score | SADAR Finance";

  const [healthScore, setHealthScore] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("3m");

  useEffect(() => {
    let isMounted = true;

    const fetchHealthScore = async () => {
      const periodOption = getPeriodOption(selectedPeriod);
      try {
        const { data: response } = await axios.post(
          `${API_BASE_URL}/analytics/health-score`,
          { period: selectedPeriod, periodMonths: periodOption.months },
          { headers: authHeaders() },
        );

        if (isMounted) {
          setHealthScore(response?.data || null);
          setIsUsingFallback(false);
        }
      } catch (_error) {
        if (isMounted) {
          setHealthScore(null);
          setIsUsingFallback(true);
        }
      }
    };

    fetchHealthScore();

    return () => {
      isMounted = false;
    };
  }, [selectedPeriod]);

  const data = useMemo(
    () => (healthScore ? buildApiData(healthScore) : buildFallbackData(selectedPeriod)),
    [healthScore, selectedPeriod],
  );

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <Row className="g-3 sadar-score-row align-items-stretch">
          <Col xl={4} className="d-flex">
            <Card className="sadar-panel flex-fill">
              <CardBody className="sadar-score-main">
                <div className="sadar-score-heading">
                  <span>Financial Score</span>
                  <p>Ringkasan kesehatan keuangan bulan ini</p>
                </div>
                <ButtonGroup size="sm" className="flex-wrap justify-content-center mb-3">
                  {periodOptions.map((option) => (
                    <Button
                      color={selectedPeriod === option.key ? "primary" : "light"}
                      key={option.key}
                      onClick={() => setSelectedPeriod(option.key)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
                <ReactApexChart
                  type="radialBar"
                  height={250}
                  series={[data.score]}
                  options={{
                    chart: { sparkline: { enabled: true } },
                    colors: ["#1E3A8A"],
                    plotOptions: {
                      radialBar: {
                        hollow: { size: "70%" },
                        track: { background: "#e8edf5" },
                        dataLabels: { show: false },
                      },
                    },
                  }}
                />
                <div className="sadar-score-number">
                  {data.score}
                  <span>/100</span>
                </div>
                <span className="sadar-score-status">{data.status}</span>
                <p className="sadar-score-note">
                  {isUsingFallback
                    ? "Skor fallback ditampilkan sementara sampai data backend tersedia."
                    : "Skor ini membantu membaca pola pemasukan, pengeluaran, budget, dan tabunganmu."}
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col xl={8} className="d-flex">
            <div className="sadar-score-stack">
            <Row className="g-3 flex-shrink-0">
              <Col md={4}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      Pemasukan
                      <span className="sadar-card-icon teal"><i className="ri-arrow-down-circle-line"></i></span>
                    </div>
                    <h2>{rupiah(data.totalIncome)}</h2>
                    <p>Total pemasukan bulan ini</p>
                  </CardBody>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      Pengeluaran
                      <span className="sadar-card-icon"><i className="ri-arrow-up-circle-line"></i></span>
                    </div>
                    <h2>{rupiah(data.totalExpense)}</h2>
                    <p>Total pengeluaran bulan ini</p>
                  </CardBody>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="sadar-summary-card">
                  <CardBody>
                    <div className="sadar-summary-label">
                      Budget Terpakai
                      <span className="sadar-card-icon warning"><i className="ri-alert-line"></i></span>
                    </div>
                    <h2>{data.budgetUsage.toFixed(1)}%</h2>
                    <p>Warning muncul mulai 80%</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Card className="sadar-panel mt-3 flex-fill">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Alokasi 50/30/20</h4>
                  <p className="text-muted mb-0">Bandingkan alokasi aktual dengan target ideal</p>
                </div>
              </CardHeader>
              <CardBody className="sadar-score-chart-body">
                <ReactApexChart
                  type="bar"
                  height={270}
                  series={[
                    { name: "Aktual", data: data.ratioSeries },
                    { name: "Target", data: [50, 30, 20] },
                  ]}
                  options={{
                    chart: {
                      toolbar: { show: false },
                      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                    },
                    colors: ["#1E3A8A", "#14B8A6"],
                    plotOptions: { bar: { borderRadius: 7, columnWidth: "42%" } },
                    dataLabels: { enabled: false },
                    xaxis: { categories: ["Kebutuhan", "Keinginan", "Tabungan"] },
                    yaxis: { max: 60, labels: { formatter: (value) => `${value}%` } },
                    tooltip: { y: { formatter: (value) => `${value.toFixed(1)}%` } },
                    legend: { position: "top", horizontalAlign: "right" },
                    grid: { borderColor: "#edf2f7", strokeDashArray: 4 },
                  }}
                />
              </CardBody>
            </Card>
            </div>
          </Col>
        </Row>

        <Row className="g-3 mt-1 sadar-score-detail-row align-items-stretch">
          <Col xl={7} className="d-flex">
            <Card className="sadar-panel flex-fill mb-0">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Faktor Pembentuk Score</h4>
                  <p className="text-muted mb-0">Alasan utama yang memengaruhi skor bulan ini</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-factor-list">
                  {data.factors.map((factor) => (
                    <div className="sadar-factor-item" key={factor.label}>
                      <span className="sadar-dot"></span>
                      <div className="w-100">
                        <div className="d-flex justify-content-between gap-3">
                          <strong>{factor.label}</strong>
                          <strong>{factor.value}</strong>
                        </div>
                        <p>{factor.description}</p>
                        <Progress value={factor.progress} className="sadar-progress mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={5} className="d-flex">
            <div className="sadar-score-detail-stack">
            <Card className="sadar-panel mb-0">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Insight Score</h4>
                  <p className="text-muted mb-0">Penjelasan singkat dari kondisi keuangan</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-insight-list">
                  {data.insights.map((item) => (
                    <div className="sadar-insight-item" key={item}>
                      <span className="sadar-dot"></span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            <Card className="sadar-panel flex-fill mb-0">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Rekomendasi</h4>
                  <p className="text-muted mb-0">Langkah realistis yang bisa dilakukan</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-recommend-list">
                  {data.recommendations.map((item) => (
                    <div className="sadar-insight-item" key={item}>
                      <span className="sadar-dot warning"></span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FinancialScore;
