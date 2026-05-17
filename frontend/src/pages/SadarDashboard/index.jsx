import React from "react";
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

import BreadCrumb from "../../Components/Common/BreadCrumb";
import "./sadar-dashboard.css";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const summaryCards = [
  {
    label: "Total saldo",
    value: rupiah(18450000),
    helper: "3 rekening aktif",
    icon: "ri-wallet-3-line",
    tone: "primary",
  },
  {
    label: "Pemasukan",
    value: rupiah(8200000),
    helper: "+12% dari bulan lalu",
    icon: "ri-arrow-down-circle-line",
    tone: "success",
  },
  {
    label: "Pengeluaran",
    value: rupiah(5150000),
    helper: "63% dari pemasukan",
    icon: "ri-arrow-up-circle-line",
    tone: "danger",
  },
  {
    label: "Sisa budget",
    value: rupiah(2350000),
    helper: "Aman untuk 12 hari",
    icon: "ri-pie-chart-2-line",
    tone: "info",
  },
  {
    label: "Transaksi",
    value: "128",
    helper: "34 minggu ini",
    icon: "ri-receipt-line",
    tone: "secondary",
  },
];

const accountBalances = [
  { name: "Mandiri Payroll", amount: 10250000, meta: "Utama", tone: "primary" },
  { name: "BCA Everyday", amount: 5830000, meta: "Harian", tone: "success" },
  { name: "E-wallet", amount: 2370000, meta: "Pocket", tone: "info" },
];

const cashflowSeries = [
  { name: "Pemasukan", data: [6.8, 7.2, 7.1, 8.2, 7.9, 8.2] },
  { name: "Pengeluaran", data: [4.9, 5.4, 4.8, 5.7, 5.2, 5.15] },
];

const expenseTrendSeries = [
  {
    name: "Pengeluaran",
    data: [280, 310, 295, 420, 380, 350, 610, 330, 310, 455, 390, 365],
  },
];

const categorySeries = [32, 21, 18, 14, 15];

const recentTransactions = [
  {
    name: "Belanja bulanan",
    category: "Makanan",
    account: "BCA Everyday",
    date: "16 Mei 2026",
    amount: -425000,
    status: "Tercatat",
  },
  {
    name: "Gaji bulanan",
    category: "Income",
    account: "Mandiri Payroll",
    date: "15 Mei 2026",
    amount: 8200000,
    status: "Masuk",
  },
  {
    name: "Transport online",
    category: "Transportasi",
    account: "E-wallet",
    date: "15 Mei 2026",
    amount: -54000,
    status: "Tercatat",
  },
  {
    name: "Kopi dan makan siang",
    category: "Makanan",
    account: "E-wallet",
    date: "14 Mei 2026",
    amount: -87000,
    status: "Tercatat",
  },
  {
    name: "Langganan musik",
    category: "Hiburan",
    account: "Kartu Debit",
    date: "13 Mei 2026",
    amount: -59000,
    status: "Tercatat",
  },
];

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
  colors: ["#2563eb", "#ef4444"],
  plotOptions: {
    bar: {
      borderRadius: 5,
      columnWidth: "38%",
    },
  },
  xaxis: {
    categories: ["Des", "Jan", "Feb", "Mar", "Apr", "Mei"],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#64748b" } },
  },
  yaxis: {
    labels: {
      style: { colors: "#64748b" },
      formatter: (value) => `${value} jt`,
    },
  },
};

const trendOptions = {
  ...chartBaseOptions,
  colors: ["#0f766e"],
  stroke: {
    width: 3,
    curve: "smooth",
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.18,
      opacityTo: 0.03,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#64748b" } },
  },
  yaxis: {
    labels: {
      style: { colors: "#64748b" },
      formatter: (value) => `${value} rb`,
    },
  },
  tooltip: {
    y: {
      formatter: (value) => `${value.toLocaleString("id-ID")} ribu`,
    },
  },
};

const categoryOptions = {
  chart: {
    type: "donut",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  labels: ["Makanan", "Transportasi", "Belanja", "Hiburan", "Lainnya"],
  colors: ["#2563eb", "#0f766e", "#f59e0b", "#ef4444", "#94a3b8"],
  legend: {
    position: "bottom",
    fontSize: "12px",
    itemMargin: { horizontal: 8, vertical: 4 },
  },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: "72%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Terbesar",
            formatter: () => "Makanan",
          },
        },
      },
    },
  },
};

const actionLinks = [
  { label: "Tambah transaksi", icon: "ri-add-circle-line", link: "/catat-keuangan", color: "primary" },
  { label: "Tambah income", icon: "ri-bank-card-line", link: "/catat-keuangan", color: "success" },
  { label: "Insight", icon: "ri-lightbulb-flash-line", link: "/behavior-insight", color: "info" },
  { label: "Financial score", icon: "ri-speed-up-line", link: "/financial-score", color: "warning" },
];

const SadarDashboard = () => {
  document.title = "Dashboard | SADAR Finance";

  return (
    <div className="page-content sadar-dashboard">
      <Container fluid>
        <BreadCrumb title="Dashboard" pageTitle="SADAR Finance" />

        <section className="sadar-overview">
          <div className="sadar-overview-main">
            <Badge color="primary" className="bg-primary-subtle text-primary sadar-eyebrow">
              Ringkasan Mei 2026
            </Badge>
            <h1>Halo, Aqyla</h1>
            <p>Saldo masih sehat, tapi budget makanan perlu dijaga sampai akhir minggu.</p>
            <div className="sadar-overview-actions">
              <Button color="primary">
                <i className="ri-add-line align-bottom me-1"></i>
                Tambah transaksi
              </Button>
              <Button color="light" className="sadar-ghost-btn">
                <i className="ri-file-list-3-line align-bottom me-1"></i>
                Review budget
              </Button>
            </div>
          </div>
          <div className="sadar-score-panel">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div>
                <span className="sadar-section-label">Financial score</span>
                <strong>82</strong>
              </div>
              <span className="sadar-score-icon">
                <i className="ri-shield-check-line"></i>
              </span>
            </div>
            <Progress value={82} color="success" className="sadar-progress" />
            <p>Stabil. Pertahankan rasio pengeluaran di bawah 70% pemasukan.</p>
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
              </CardHeader>
              <CardBody>
                <ReactApexChart options={cashflowOptions} series={cashflowSeries} type="bar" height={312} />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Kategori pengeluaran</h4>
                  <p className="text-muted mb-0">Distribusi bulan ini</p>
                </div>
              </CardHeader>
              <CardBody>
                <ReactApexChart options={categoryOptions} series={categorySeries} type="donut" height={312} />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Transaksi terakhir</h4>
                  <p className="text-muted mb-0">Aktivitas rekening terbaru</p>
                </div>
                <Button color="light" size="sm" className="sadar-table-action">
                  Lihat semua
                </Button>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="table-responsive sadar-table-wrap">
                  <Table className="align-middle mb-0 sadar-table">
                    <thead>
                      <tr>
                        <th>Transaksi</th>
                        <th>Kategori</th>
                        <th>Rekening</th>
                        <th>Tanggal</th>
                        <th className="text-end">Nominal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={`${transaction.name}-${transaction.date}`}>
                          <td>
                            <div className="fw-semibold text-dark">{transaction.name}</div>
                          </td>
                          <td>{transaction.category}</td>
                          <td>{transaction.account}</td>
                          <td>{transaction.date}</td>
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
          </Col>
          <Col xl={4}>
            <Card className="dashboard-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Saldo rekening</h4>
                  <p className="text-muted mb-0">Total dana per account</p>
                </div>
              </CardHeader>
              <CardBody className="sadar-account-list">
                {accountBalances.map((account) => (
                  <div className="sadar-account-item" key={account.name}>
                    <span className={`sadar-account-mark bg-${account.tone}`}></span>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">{account.name}</div>
                      <small className="text-muted">{account.meta}</small>
                    </div>
                    <strong>{rupiah(account.amount)}</strong>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={8}>
            <Card className="h-100 dashboard-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Tren pengeluaran</h4>
                  <p className="text-muted mb-0">Pantau lonjakan transaksi harian</p>
                </div>
              </CardHeader>
              <CardBody>
                <ReactApexChart options={trendOptions} series={expenseTrendSeries} type="area" height={292} />
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <div className="sadar-side-stack">
              <Card className="insight-card dashboard-panel">
                <CardBody>
                  <div className="sadar-note-icon bg-info-subtle text-info">
                    <i className="ri-lightbulb-flash-line"></i>
                  </div>
                  <h5>Smart insight</h5>
                  <p>Pengeluaran makanan naik 18% dibanding minggu lalu.</p>
                  <span>Transaksi paling sering muncul di akhir pekan.</span>
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
