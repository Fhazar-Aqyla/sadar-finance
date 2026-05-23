import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Progress,
  Row,
  Table,
} from "reactstrap";

import {
  accounts,
  budgets,
  currentUserId,
  getAccountName,
  getUserRows,
  groupSumBy,
  incomes,
  sumBy,
  transactions,
  userProfile,
} from "../SadarShared/mockData";
import "./sadar-dashboard.css";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const categoryLabels = ["Makanan", "Transportasi", "Belanja", "Hiburan", "Lainnya"];
const categoryColors = ["#1E3A8A", "#14B8A6", "#F59E0B", "#22C55E", "#94a3b8"];

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
    categories: ["Des", "Jan", "Feb", "Mar", "Apr", "Mei"],
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

const trendOptions = {
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
    categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
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
    max: 7000,
    tickAmount: 7,
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
};

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

const actionLinks = [
  { label: "Tambah Pengeluaran", icon: "ri-add-circle-line", link: "/catat-keuangan", color: "primary" },
  { label: "Tambah Pemasukan", icon: "ri-bank-card-line", link: "/catat-keuangan?type=income", color: "success" },
  { label: "Lihat Insight", icon: "ri-lightbulb-flash-line", link: "/behavior-insight", color: "teal" },
  { label: "Lihat Financial Score", icon: "ri-speed-up-line", link: "/financial-score", color: "warning" },
];

const SadarDashboard = () => {
  document.title = "Dashboard | SADAR Finance";
  const [activeCategory, setActiveCategory] = useState({ label: "", color: "#1E3A8A" });

  const dashboardData = useMemo(() => {
    const userAccounts = getUserRows(accounts, currentUserId);
    const userTransactions = getUserRows(transactions, currentUserId);
    const userIncomes = getUserRows(incomes, currentUserId);
    const userBudgets = getUserRows(budgets, currentUserId);
    const expenseTransactions = userTransactions.filter((item) => item.budget_group !== "Savings");
    const totalSaldo = sumBy(userAccounts, (item) => item.balance);
    const totalIncome = sumBy(userIncomes, (item) => item.amount);
    const totalExpense = sumBy(expenseTransactions, (item) => item.amount);
    const budgetLimit = sumBy(userBudgets, (item) => item.limit);
    const budgetUsed = sumBy(userBudgets, (item) => item.used);
    const remainingBudget = Math.max(budgetLimit - budgetUsed, 0);
    const byCategory = groupSumBy(expenseTransactions, "category");
    const categoryRows = categoryLabels.reduce((result, label) => {
      result[label] = 0;
      return result;
    }, {});

    Object.entries(byCategory).forEach(([category, amount]) => {
      if (category in categoryRows && category !== "Lainnya") {
        categoryRows[category] += amount;
        return;
      }
      categoryRows.Lainnya += amount;
    });

    const incomeRows = userIncomes.map((income) => ({
      id: income.id,
      name: income.source,
      category: "Pemasukan",
      account: getAccountName(income.account_id),
      date: income.date,
      amount: income.amount,
      status: "Masuk",
    }));
    const expenseRows = userTransactions.map((transaction) => ({
      id: transaction.id,
      name: transaction.name,
      category: transaction.category,
      account: getAccountName(transaction.account_id),
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

    const monthlyIncome = Array.from({ length: 12 }, () => 0);
    const monthlyExpense = Array.from({ length: 12 }, () => 0);

    userIncomes.forEach((income) => {
      const monthIndex = new Date(`${income.date}T00:00:00`).getMonth();
      monthlyIncome[monthIndex] += income.amount;
    });

    expenseTransactions.forEach((transaction) => {
      const monthIndex = new Date(`${transaction.date}T00:00:00`).getMonth();
      monthlyExpense[monthIndex] += transaction.amount;
    });

    const cashflowMonthIndexes = [11, 0, 1, 2, 3, 4];

    return {
      totalSaldo,
      totalIncome,
      totalExpense,
      remainingBudget,
      transactionCount: userTransactions.length + userIncomes.length,
      accountCount: userAccounts.length,
      categorySeries: categoryLabels.map((label) => categoryRows[label]),
      recentRows,
      cashflowSeries: [
        { name: "Pemasukan", data: cashflowMonthIndexes.map((index) => Number((monthlyIncome[index] / 1000000).toFixed(2))) },
        { name: "Pengeluaran", data: cashflowMonthIndexes.map((index) => Number((monthlyExpense[index] / 1000000).toFixed(2))) },
      ],
      expenseTrendSeries: [
        { name: "Pengeluaran", data: monthlyExpense.map((amount) => Math.round(amount / 1000)) },
      ],
    };
  }, []);

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
      helper: `${((dashboardData.totalExpense / dashboardData.totalIncome) * 100 || 0).toFixed(1)}% dari pemasukan`,
      icon: "ri-arrow-up-circle-line",
      tone: "warning",
    },
    {
      label: "Sisa Budget",
      value: rupiah(dashboardData.remainingBudget),
      helper: "Dari alokasi bulan ini",
      icon: "ri-pie-chart-2-line",
      tone: "teal",
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

  return (
    <div className="page-content sadar-dashboard">
      <Container fluid>
        <section className="sadar-overview">
          <div className="sadar-overview-main">
            <Badge color="primary" className="bg-primary-subtle text-primary sadar-eyebrow">
              Ringkasan Mei 2026
            </Badge>
            <h1>Halo, {userProfile.name}</h1>
            <p>Yuk lihat kondisi keuanganmu hari ini.</p>
            <div className="sadar-overview-actions">
              <Button color="primary" tag={Link} to="/catat-keuangan">
                <i className="ri-add-line align-bottom me-1"></i>
                Tambah Pengeluaran
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
              <span className="sadar-section-label">Smart Alert</span>
              <p>Budget makanan sudah mencapai 80%. Coba tahan belanja ekstra sampai akhir minggu.</p>
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
                  <h4 className="card-title mb-1">Cashflow bulanan</h4>
                  <p className="text-muted mb-0">Pemasukan dan pengeluaran 6 bulan terakhir</p>
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
                <ReactApexChart options={cashflowOptions} series={dashboardData.cashflowSeries} type="bar" height={292} />
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

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="h-100 dashboard-panel">
              <CardHeader className="expense-trend-header">
                <div>
                  <h4 className="card-title mb-1">Tren Pengeluaran</h4>
                  <p className="text-muted mb-0">Pantau pola pengeluaran bulanan</p>
                </div>
              </CardHeader>
              <CardBody className="expense-trend-body">
                <ReactApexChart options={trendOptions} series={dashboardData.expenseTrendSeries} type="area" height={300} />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <div className="sadar-side-stack">
              <Card className="insight-card dashboard-panel">
                <CardBody>
                  <div className="sadar-note-icon bg-teal-subtle text-teal">
                    <i className="ri-lightbulb-flash-line"></i>
                  </div>
                  <h5>Smart Insight</h5>
                  <p>Pengeluaran makanan naik 18% dibanding minggu lalu.</p>
                  <span>Pengeluaran paling sering muncul di akhir pekan.</span>
                </CardBody>
              </Card>
              <Card className="alert-card dashboard-panel">
                <CardBody>
                  <div className="sadar-note-icon bg-warning-subtle text-warning">
                    <i className="ri-alert-line"></i>
                  </div>
                  <h5>Budget makanan</h5>
                  <p>Sudah mencapai 80% dari limit bulan ini.</p>
                  <Progress value={80} color="warning" className="sadar-progress" />
                  <span>Tahan belanja impulsif sampai akhir minggu.</span>
                </CardBody>
              </Card>
            </div>
          </Col>
        </Row>

        <Card className="dashboard-panel mt-3">
          <CardHeader>
            <div>
              <h4 className="card-title mb-1">Riwayat Terbaru</h4>
              <p className="text-muted mb-0">Preview 5 catatan keuangan terakhir</p>
            </div>
            <Button color="light" size="sm" className="sadar-table-action" tag={Link} to="/profile-account#riwayat-transaksi">
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
                    <th>Account</th>
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

        <Card className="dashboard-panel mt-3">
          <CardBody className="sadar-quick-actions">
            {actionLinks.map((action) => (
              <Link to={action.link} className={`sadar-action-link text-${action.color}`} key={action.label}>
                <i className={action.icon}></i>
                <span>{action.label}</span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default SadarDashboard;
