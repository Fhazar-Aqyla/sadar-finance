import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

import {
  currentUserId,
  formatShortDate,
  getDayName,
  getUserRows,
  groupSumBy,
  incomes,
  isWeekend,
  rupiah,
  sumBy,
  transactions,
} from "../SadarShared/mockData";
import "../SadarShared/sadar-pages.css";

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

const toDashboardCategoryRows = (byCategory) => {
  const rows = dashboardCategoryLabels.reduce((result, label) => {
    result[label] = 0;
    return result;
  }, {});

  Object.entries(byCategory).forEach(([category, value]) => {
    if (category in rows && category !== "Lainnya") {
      rows[category] += value;
      return;
    }
    rows.Lainnya += value;
  });

  return rows;
};

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

const BehaviorInsight = () => {
  document.title = "Behavior Insight | SADAR Finance";

  const data = useMemo(() => {
    const userTransactions = getUserRows(transactions, currentUserId);
    const expenseTransactions = userTransactions.filter((item) => item.budget_group !== "Savings");
    const userIncomes = getUserRows(incomes, currentUserId);
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
    };
  }, []);

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
                  <span className="sadar-card-icon warning"><i className="ri-alert-line"></i></span>
                </div>
                <h2>{data.wantsRatio > 30 ? "Perlu Dipantau" : "Terkendali"}</h2>
                <p>Keinginan memakai {data.wantsRatio.toFixed(1)}% dari pemasukan</p>
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
                  <p className="text-muted mb-0">Ringkasan pola yang terlihat dari transaksi</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-insight-list">
                  {data.insightItems.map((item) => (
                    <div className="sadar-insight-item" key={item.title}>
                      <span className={`sadar-dot ${item.type === "warning" ? "warning" : ""}`}></span>
                      <div>
                        <strong>{item.title}</strong>
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
                  <p className="text-muted mb-0">Saran sederhana untuk menjaga budget</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-recommend-list">
                  {data.recommendations.map((item) => (
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

export default BehaviorInsight;
