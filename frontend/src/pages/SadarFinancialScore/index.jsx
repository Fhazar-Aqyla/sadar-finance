import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Progress,
  Row,
} from "reactstrap";
import {
  analyticsApi,
  incomeApi,
  transactionApi,
} from "../../Components/services/api";

const sumBy = (rows, getValue) =>
  rows.reduce((total, row) => total + getValue(row), 0);

const toBudgetGroup = (category) => {
  const text = String(category || "").toLowerCase();
  if (/tabungan|invest|saving|dana darurat/.test(text)) return "Savings";
  if (
    /makan|food|transport|tagihan|utilit|kesehatan|pendidikan|groceries|utilities|health|education/.test(
      text,
    )
  )
    return "Needs";
  return "Wants";
};

const normalizeTransaction = (transaction) => ({
  id: transaction.transaction_id || transaction.id,
  account_id: transaction.account_id || transaction.accountId,
  category:
    transaction.category_group || transaction.categoryGroup || "Lainnya",
  amount: Number(transaction.amount || 0),
  date: String(
    transaction.transaction_date ||
      transaction.transactionDate ||
      transaction.date ||
      "",
  ).slice(0, 10),
});

const normalizeIncome = (income) => ({
  id: income.income_id || income.id,
  amount: Number(income.amount || 0),
  date: String(
    income.income_date || income.incomeDate || income.date || "",
  ).slice(0, 10),
});

import "../SadarShared/sadar-pages.css";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

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

const getBudgetTone = (usage) => {
  if (usage >= 100) return "danger";
  if (usage >= 80) return "warning";
  return "success";
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getBudgetHealthProgress = (usage) => {
  if (usage <= 80) return 100;
  if (usage <= 100) return Math.round(100 - ((usage - 80) / 20) * 40);
  return Math.round(clamp(60 - ((usage - 100) / 30) * 60, 0, 60));
};

const getExpenseHealthProgress = (ratio) => {
  if (ratio <= 70) return 100;
  if (ratio <= 100) return Math.round(100 - ((ratio - 70) / 30) * 50);
  return Math.round(clamp(50 - ((ratio - 100) / 30) * 50, 0, 50));
};

const periodOptions = [
  { key: "2w", label: "2 Minggu", months: 1 },
  { key: "1m", label: "1 Bulan", months: 1 },
  { key: "3m", label: "3 Bulan", months: 3 },
  { key: "6m", label: "6 Bulan", months: 6 },
  { key: "1y", label: "1 Tahun", months: 12 },
  { key: "all", label: "Semua", months: 24 },
];

const toPercent = (value) => Number((value * 100).toFixed(1));

const getPeriodOption = (periodKey) =>
  periodOptions.find((option) => option.key === periodKey) || periodOptions[2];

const getDateValue = (item) =>
  item.date || item.transaction_date || item.income_date || item.created_at;

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
  const score = Number(
    healthScore?.breakdown?.overallScore ?? healthScore?.score?.score ?? 0,
  );
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
        label: "Anggaran Terpakai",
        value: `${budgetUsage.toFixed(1)}%`,
        description:
          budgetUsage >= 80
            ? "Anggaran mendekati batas, beberapa kategori perlu dipantau."
            : "Penggunaan anggaran masih relatif aman.",
        progress: clamp(Number(breakdown.budgetScore || 0), 0, 100),
      },
      {
        label: "Konsistensi Pencatatan",
        value: `${Number(breakdown.consistencyScore || 0)}%`,
        description:
          Number(breakdown.consistencyScore || 0) >= 60
            ? "Data pemasukan dan transaksi cukup konsisten untuk dibaca."
            : "Data masih perlu dicatat lebih rutin agar skor makin akurat.",
        progress: clamp(Number(breakdown.consistencyScore || 0), 0, 100),
      },
      {
        label: "Alokasi 50/30/20",
        value: `${needsRatio.toFixed(0)} / ${wantsRatio.toFixed(0)} / ${savingsRatio.toFixed(0)}%`,
        description:
          "Perbandingan Kebutuhan, Keinginan, dan Tabungan terhadap pemasukan bulan ini.",
        progress: clamp(
          100 -
            Math.abs(50 - needsRatio) -
            Math.abs(30 - wantsRatio) -
            Math.abs(20 - savingsRatio),
          0,
          100,
        ),
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
            ? "Penggunaan anggaran sudah mendekati batas dan perlu dipantau."
            : "Penggunaan anggaran masih berada di area aman.",
          savingsRate < 20
            ? "Alokasi tabungan belum mencapai 20% dari pemasukan."
            : "Alokasi tabungan sudah mendekati prinsip 20%.",
        ],
    recommendations: healthScore?.recommendations?.length
      ? healthScore.recommendations
      : ["Tinjau anggaran mingguan agar pola pengeluaran tetap stabil."],
    ratioSeries: [needsRatio, wantsRatio, savingsRatio],
  };
};

const EmptyFinancialScore = ({ message = "" }) => {
  useEffect(() => {
    document.title = "Skor Finansial | SADAR Finance";
  }, []);

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <Card className="sadar-panel">
          <CardBody>
            <div className="sadar-empty-state sadar-empty-state-center">
              <span className="sadar-empty-state-icon">
                <i className="ri-speed-up-line"></i>
              </span>
              <h4>Skor Finansial Belum Tersedia</h4>
              <p>
                {message ||
                  "Skor akan dihitung setelah kamu menambahkan pemasukan, mengatur anggaran, dan mencatat transaksi."}
              </p>
              <div className="sadar-step-status-list">
                <span>Pemasukan belum ada</span>
                <span>Anggaran belum diatur</span>
                <span>Transaksi belum cukup</span>
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Button
                  color="success"
                  tag={Link}
                  to="/catat-keuangan?type=income"
                >
                  Catat Pemasukan
                </Button>
                <Button
                  color="primary"
                  tag={Link}
                  to="/profile-account#atur-budget"
                >
                  Atur Anggaran
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

const SadarLoadingScreen = () => {
  return (
    <div className="page-content sadar-page sadar-loading-screen d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
          <span className="visually-hidden">Memuat...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Memuat skor finansial...</p>
      </div>
    </div>
  );
};

const FinancialScoreWithData = () => {
  useEffect(() => {
    document.title = "Skor Finansial | SADAR Finance";
  }, []);

  const [healthScore, setHealthScore] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("2w");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHealthScore = async () => {
      const periodOption = getPeriodOption(selectedPeriod);
      try {
        const [healthScoreResponse, incomeRows, expenseRows, budgetResponse] =
          await Promise.all([
            analyticsApi.healthScore({
              period: selectedPeriod,
              periodMonths: periodOption.months,
            }),
            incomeApi.list({ limit: 100 }).catch(() => []),
            transactionApi.list({ limit: 100 }).catch(() => []),
            analyticsApi.latestBudget().catch(() => null),
          ]);

        if (!isMounted) return;

        const normalizedIncomes = (incomeRows || []).map(normalizeIncome);
        const normalizedTransactions = (expenseRows || []).map(
          normalizeTransaction,
        );

        const filteredIncomes = filterRowsByPeriod(
          normalizedIncomes,
          selectedPeriod,
        );
        const filteredTransactions = filterRowsByPeriod(
          normalizedTransactions,
          selectedPeriod,
        );

        const totalIncome = sumBy(filteredIncomes, (item) => item.amount);
        const totalExpense = sumBy(filteredTransactions, (item) => item.amount);

        let needsUsed = 0;
        let wantsUsed = 0;
        let savingsUsed = 0;

        filteredTransactions.forEach((t) => {
          const group = toBudgetGroup(t.category);
          if (group === "Needs") needsUsed += t.amount;
          else if (group === "Savings") savingsUsed += t.amount;
          else wantsUsed += t.amount;
        });

        const needsLimit = Number(
          budgetResponse?.needs_amount || budgetResponse?.needsAmount || 0,
        );
        const wantsLimit = Number(
          budgetResponse?.wants_amount || budgetResponse?.wantsAmount || 0,
        );
        const savingsLimit = Number(
          budgetResponse?.savings_amount || budgetResponse?.savingsAmount || 0,
        );
        const totalLimit = needsLimit + wantsLimit + savingsLimit;
        const totalUsed = needsUsed + wantsUsed + savingsUsed;

        // Calculate fallback ratios
        const calculatedRatios = {
          expenseRatio: totalIncome ? totalExpense / totalIncome : 0,
          budgetUsage: totalLimit ? totalUsed / totalLimit : 0,
          savingsRate: totalIncome ? savingsUsed / totalIncome : 0,
          needsRatio: totalIncome ? needsUsed / totalIncome : 0,
          wantsRatio: totalIncome ? wantsUsed / totalIncome : 0,
          savingsRatio: totalIncome ? savingsUsed / totalIncome : 0,
        };

        const expenseRatioPercent = calculatedRatios.expenseRatio * 100;
        const budgetUsagePercent = calculatedRatios.budgetUsage * 100;
        const savingsRatePercent = calculatedRatios.savingsRate * 100;
        const needsRatioPercent = calculatedRatios.needsRatio * 100;
        const wantsRatioPercent = calculatedRatios.wantsRatio * 100;
        const savingsRatioPercent = calculatedRatios.savingsRatio * 100;

        // Fallback breakdown scores
        const expenseScore = getExpenseHealthProgress(expenseRatioPercent);
        const budgetScore = getBudgetHealthProgress(budgetUsagePercent);
        const consistencyScore = healthScoreResponse?.breakdown
          ?.consistencyScore
          ? Number(healthScoreResponse.breakdown.consistencyScore)
          : filteredTransactions.length >= 5
            ? 100
            : filteredTransactions.length * 20;
        const allocationScore = Math.max(
          0,
          100 -
            Math.abs(50 - needsRatioPercent) -
            Math.abs(30 - wantsRatioPercent) -
            Math.abs(20 - savingsRatioPercent),
        );
        const savingsScore = Math.min(100, savingsRatePercent * 5);

        const calculatedOverallScore = Math.round(
          (expenseScore +
            budgetScore +
            consistencyScore +
            allocationScore +
            savingsScore) /
            5,
        );

        const fallbackHealthScore = {
          ...healthScoreResponse,
          financials: {
            totalIncome:
              totalIncome || healthScoreResponse?.financials?.totalIncome || 0,
            totalExpense:
              totalExpense ||
              healthScoreResponse?.financials?.totalExpense ||
              0,
          },
          ratios: {
            expenseRatio: calculatedRatios.expenseRatio,
            budgetUsage: calculatedRatios.budgetUsage,
            savingsRate: calculatedRatios.savingsRate,
            needsRatio: calculatedRatios.needsRatio,
            wantsRatio: calculatedRatios.wantsRatio,
            savingsRatio: calculatedRatios.savingsRatio,
          },
          breakdown: {
            overallScore:
              healthScoreResponse?.breakdown?.overallScore ||
              healthScoreResponse?.score?.score ||
              calculatedOverallScore,
            expenseScore:
              healthScoreResponse?.breakdown?.expenseScore || expenseScore,
            budgetScore:
              healthScoreResponse?.breakdown?.budgetScore || budgetScore,
            consistencyScore: consistencyScore,
            savingsScore:
              healthScoreResponse?.breakdown?.savingsScore || savingsScore,
          },
          score: {
            score: healthScoreResponse?.score?.score || calculatedOverallScore,
          },
        };

        setHealthScore(fallbackHealthScore);
        setLoadError("");
      } catch {
        if (isMounted) {
          setHealthScore(null);
          setLoadError(
            "Gagal memuat skor finansial. Silakan coba beberapa saat lagi.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHealthScore();

    return () => {
      isMounted = false;
    };
  }, [selectedPeriod]);

  const data = useMemo(
    () => (healthScore ? buildApiData(healthScore) : null),
    [healthScore],
  );

  if (isLoading) {
    return <SadarLoadingScreen />;
  }

  if (!data) {
    return <EmptyFinancialScore message={loadError} />;
  }
  const scoreTone = getScoreTone(data.score);
  const budgetTone = getBudgetTone(data.budgetUsage);

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <Row className="g-3 sadar-score-row align-items-stretch">
          <Col xl={4} className="d-flex">
            <Card className="sadar-panel flex-fill">
              <CardBody className="sadar-score-main">
                <div className="sadar-score-heading">
                  <span>Skor Finansial</span>
                  <p>Ringkasan kesehatan keuangan bulan ini</p>
                </div>
                <ButtonGroup
                  size="sm"
                  className="sadar-period-toggle flex-wrap justify-content-center mb-3"
                >
                  {periodOptions.map((option) => (
                    <Button
                      color={
                        selectedPeriod === option.key ? "primary" : "light"
                      }
                      key={option.key}
                      onClick={() => setSelectedPeriod(option.key)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
                <ReactApexChart
                  key={scoreTone.chartColor}
                  type="radialBar"
                  height={250}
                  series={[data.score]}
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
                  {data.score}
                  <span>/100</span>
                </div>
                <span className={`sadar-score-status ${scoreTone.className}`}>
                  {data.status}
                </span>
                <p className="sadar-score-note">
                  Skor ini membantu membaca pola pemasukan, pengeluaran,
                  anggaran, dan tabunganmu.
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
                        <span className="sadar-card-icon teal">
                          <i className="ri-arrow-down-circle-line"></i>
                        </span>
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
                        <span className="sadar-card-icon">
                          <i className="ri-arrow-up-circle-line"></i>
                        </span>
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
                        Anggaran Terpakai
                        <span className={`sadar-card-icon ${budgetTone}`}>
                          <i className="ri-alert-line"></i>
                        </span>
                      </div>
                      <h2 className={`sadar-semantic-value ${budgetTone}`}>
                        {data.budgetUsage.toFixed(1)}%
                      </h2>
                      <p>Peringatan muncul mulai 80%</p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <Card className="sadar-panel mt-3 flex-fill">
                <CardHeader>
                  <div>
                    <h4 className="card-title mb-1">Alokasi 50/30/20</h4>
                    <p className="text-muted mb-0">
                      Bandingkan alokasi aktual dengan target ideal
                    </p>
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
                        fontFamily:
                          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                      },
                      colors: ["#1E3A8A", "#14B8A6"],
                      plotOptions: {
                        bar: { borderRadius: 7, columnWidth: "42%" },
                      },
                      dataLabels: { enabled: false },
                      xaxis: {
                        categories: ["Kebutuhan", "Keinginan", "Tabungan"],
                      },
                      yaxis: {
                        max: 60,
                        labels: { formatter: (value) => `${value}%` },
                      },
                      tooltip: {
                        y: { formatter: (value) => `${value.toFixed(1)}%` },
                      },
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
                  <h4 className="card-title mb-1">Faktor Pembentuk Skor</h4>
                  <p className="text-muted mb-0">
                    Dihitung otomatis dari pemasukan, pengeluaran, anggaran, dan
                    tabungan
                  </p>
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
                        <Progress
                          value={factor.progress}
                          color={getScoreTone(factor.progress).progressColor}
                          className="sadar-progress mt-2"
                        />
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
                    <h4 className="card-title mb-1">Insight Skor</h4>
                    <p className="text-muted mb-0">
                      Ringkasan berbasis data dari kondisi keuangan
                    </p>
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
                    <p className="text-muted mb-0">
                      Saran otomatis dari pola anggaran dan transaksi
                    </p>
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

const FinancialScore = () => <FinancialScoreWithData />;

export default FinancialScore;
