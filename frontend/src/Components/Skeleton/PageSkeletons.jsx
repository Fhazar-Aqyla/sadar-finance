import React from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Row, Table } from "reactstrap";
import { Skeleton, SkeletonCircle, SkeletonButton, SkeletonText } from "./Skeleton";
import "./skeleton.css";

// ── 1. DASHBOARD SKELETON (1:1 Exact Match) ─────────────────────────────────
export const DashboardSkeleton = () => (
  <div className="page-content sadar-dashboard">
    <Container fluid>
      {/* 1. Overview Section Banner */}
      <section className="sadar-overview">
        <div className="sadar-overview-main">
          <Skeleton width={140} height={22} borderRadius={12} className="mb-2" />
          <Skeleton width={260} height={34} className="mb-2" />
          <Skeleton width={320} height={16} className="mb-3" />
          <div className="sadar-overview-actions">
            <SkeletonButton width={160} height={38} />
            <SkeletonButton width={160} height={38} />
            <SkeletonButton width={130} height={38} />
          </div>
        </div>
        <div className="sadar-overview-note">
          <SkeletonCircle size={40} />
          <div className="sadar-alert-copy w-100">
            <Skeleton width={130} height={12} className="mb-1" />
            <Skeleton width="90%" height={14} className="mb-1" />
            <Skeleton width={70} height={12} />
          </div>
        </div>
      </section>

      {/* 2. 5 KPI Metric Cards */}
      <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-xl-5 mt-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Col key={idx}>
            <Card className="metric-card h-100">
              <CardBody>
                <div className="metric-card-top">
                  <SkeletonCircle size={36} />
                  <Skeleton width={80} height={14} />
                </div>
                <Skeleton width={130} height={26} className="my-2" />
                <Skeleton width={90} height={12} />
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 3. Row 1: Arus Kas Bulanan (8 cols) & Skor Finansial (4 cols) */}
      <Row className="g-3 mt-1">
        <Col xl={8}>
          <Card className="h-100 dashboard-panel">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <Skeleton width={160} height={20} className="mb-1" />
                <Skeleton width={260} height={13} />
              </div>
              <div className="sadar-chart-legend">
                <Skeleton width={80} height={14} />
                <Skeleton width={80} height={14} />
              </div>
            </CardHeader>
            <CardBody className="cashflow-chart-body" style={{ minHeight: "390px" }}>
              <div className="d-flex align-items-end justify-content-between gap-3 h-100 pt-4" style={{ height: "320px" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="d-flex flex-column align-items-center gap-2 flex-fill h-100 justify-content-end">
                    <div className="d-flex gap-2 align-items-end w-100 justify-content-center h-100">
                      <Skeleton width={24} height={`${45 + (i * 9) % 45}%`} borderRadius={4} />
                      <Skeleton width={24} height={`${30 + (i * 11) % 55}%`} borderRadius={4} />
                    </div>
                    <Skeleton width={40} height={12} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="h-100 dashboard-panel">
            <CardHeader>
              <Skeleton width={130} height={20} className="mb-1" />
              <Skeleton width={200} height={13} />
            </CardHeader>
            <CardBody className="sadar-score-main d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "390px" }}>
              <SkeletonCircle size={180} className="mb-3" />
              <Skeleton width={100} height={32} className="mb-2" />
              <Skeleton width={80} height={20} borderRadius={10} className="mb-2" />
              <Skeleton width={220} height={13} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 4. Row 2: Tren Pengeluaran (8 cols) & Kategori Pengeluaran (4 cols) */}
      <Row className="g-3 mt-1">
        <Col xl={8}>
          <Card className="h-100 dashboard-panel">
            <CardHeader className="expense-trend-header">
              <Skeleton width={160} height={20} className="mb-1" />
              <Skeleton width={240} height={13} />
            </CardHeader>
            <CardBody className="expense-trend-body" style={{ minHeight: "300px" }}>
              <div className="d-flex align-items-end justify-content-between h-100 pt-4" style={{ height: "240px" }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="d-flex flex-column align-items-center gap-2 flex-fill h-100 justify-content-end">
                    <Skeleton width={32} height={`${25 + (i * 12) % 65}%`} borderRadius={4} />
                    <Skeleton width={36} height={12} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="h-100 dashboard-panel">
            <CardHeader>
              <Skeleton width={160} height={20} className="mb-1" />
              <Skeleton width={140} height={13} />
            </CardHeader>
            <CardBody className="category-chart-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "300px" }}>
              <SkeletonCircle size={180} className="mb-3" />
              <div className="d-flex gap-3 mt-2">
                <Skeleton width={60} height={14} />
                <Skeleton width={60} height={14} />
                <Skeleton width={60} height={14} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 5. Riwayat Terbaru Table */}
      <Card className="dashboard-panel mt-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <Skeleton width={140} height={20} className="mb-1" />
            <Skeleton width={220} height={13} />
          </div>
          <SkeletonButton width={90} height={30} />
        </CardHeader>
        <CardBody className="pt-0">
          <div className="table-responsive sadar-table-wrap">
            <Table className="align-middle mb-0 sadar-table">
              <thead>
                <tr>
                  <th><Skeleton width={90} height={14} /></th>
                  <th><Skeleton width={70} height={14} /></th>
                  <th><Skeleton width={60} height={14} /></th>
                  <th><Skeleton width={70} height={14} /></th>
                  <th className="text-end"><Skeleton width={80} height={14} className="ms-auto" /></th>
                  <th><Skeleton width={60} height={14} /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton width={140} height={16} /></td>
                    <td><Skeleton width={80} height={14} /></td>
                    <td><Skeleton width={60} height={14} /></td>
                    <td><Skeleton width={90} height={14} /></td>
                    <td className="text-end"><Skeleton width={100} height={16} className="ms-auto" /></td>
                    <td><Skeleton width={70} height={22} borderRadius={11} /></td>
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

// ── 2. CATAT KEUANGAN (1:1 Exact Match) ─────────────────────────────────────
export const TransactionInputSkeleton = () => (
  <div className="page-content sadar-page sadar-transaction-page">
    <Container fluid>
      {/* 1. Tab Toggle Header */}
      <Row className="g-3">
        <Col xl={4}>
          <div className="sadar-entry-tabs mb-3 d-flex gap-2">
            <SkeletonButton width={140} height={42} />
            <SkeletonButton width={140} height={42} />
          </div>
        </Col>
      </Row>

      {/* 2. Form Grid (Left: 4 cols, Right: 8 cols) */}
      <Row className="g-3 align-items-stretch sadar-transaction-row">
        {/* Left Column: Metode Input / OCR */}
        <Col xl={4} className="d-flex flex-column">
          <Card className="sadar-panel sadar-input-card flex-fill">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <Skeleton width={120} height={20} className="mb-1" />
                <Skeleton width={180} height={13} />
              </div>
              <Skeleton width={60} height={22} borderRadius={11} />
            </CardHeader>
            <CardBody className="d-flex flex-column gap-3">
              <div className="d-flex gap-1 mb-2">
                <Skeleton width="50%" height={38} borderRadius={6} />
                <Skeleton width="50%" height={38} borderRadius={6} />
              </div>
              <div className="p-4 border border-dashed rounded-3 d-flex flex-column align-items-center justify-content-center gap-2" style={{ minHeight: "220px" }}>
                <SkeletonCircle size={48} />
                <Skeleton width={150} height={16} />
                <Skeleton width={180} height={12} />
              </div>
              <div className="d-flex justify-content-between">
                <Skeleton width={120} height={13} />
                <Skeleton width={60} height={13} />
              </div>
              <Skeleton width="100%" height={42} borderRadius={8} className="mt-auto" />
            </CardBody>
          </Card>
        </Col>

        {/* Right Column: Detail Transaksi Form */}
        <Col xl={8} className="d-flex flex-column">
          <Card className="sadar-panel sadar-form-card flex-fill">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <Skeleton width={150} height={20} className="mb-1" />
                <Skeleton width={240} height={13} />
              </div>
              <Skeleton width={70} height={22} borderRadius={11} />
            </CardHeader>
            <CardBody className="p-4">
              <Row className="g-3">
                <Col md={6}>
                  <Skeleton width={100} height={14} className="mb-2" />
                  <Skeleton width="100%" height={40} borderRadius={6} />
                </Col>
                <Col md={6}>
                  <Skeleton width={110} height={14} className="mb-2" />
                  <Skeleton width="100%" height={40} borderRadius={6} />
                </Col>
                <Col md={6}>
                  <Skeleton width={100} height={14} className="mb-2" />
                  <Skeleton width="100%" height={40} borderRadius={6} />
                </Col>
                <Col md={6}>
                  <Skeleton width={100} height={14} className="mb-2" />
                  <Skeleton width="100%" height={40} borderRadius={6} />
                </Col>
                <Col md={12}>
                  <Skeleton width={120} height={14} className="mb-2" />
                  <Skeleton width="100%" height={44} borderRadius={6} />
                </Col>
                <Col md={12}>
                  <Skeleton width={80} height={14} className="mb-2" />
                  <Skeleton width="100%" height={80} borderRadius={6} />
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <SkeletonButton width={100} height={40} />
                <SkeletonButton width={160} height={40} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);

// ── 3. INSIGHT PERILAKU (1:1 Exact Match) ───────────────────────────────────
export const BehaviorInsightSkeleton = () => (
  <div className="page-content sadar-page">
    <Container fluid>
      {/* 1. 4 Summary Metric Cards */}
      <Row className="g-3 row-cols-1 row-cols-md-2 row-cols-xl-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Col xl={3} md={6} key={idx}>
            <Card className="sadar-summary-card">
              <CardBody>
                <div className="sadar-summary-label">
                  <Skeleton width={110} height={14} />
                  <SkeletonCircle size={30} />
                </div>
                <Skeleton width={140} height={28} className="my-2" />
                <Skeleton width={160} height={13} />
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 2. Row 1: Kategori Donut (6 cols) & Hari Kerja vs Akhir Pekan (6 cols) */}
      <Row className="g-3 mt-1">
        <Col xl={6}>
          <Card className="sadar-chart-card sadar-panel h-100">
            <CardHeader>
              <Skeleton width={160} height={20} className="mb-1" />
              <Skeleton width={200} height={13} />
            </CardHeader>
            <CardBody className="category-chart-body d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "312px" }}>
              <SkeletonCircle size={180} className="mb-3" />
              <div className="d-flex gap-3">
                <Skeleton width={60} height={14} />
                <Skeleton width={60} height={14} />
                <Skeleton width={60} height={14} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="sadar-chart-card sadar-panel h-100">
            <CardHeader>
              <Skeleton width={180} height={20} className="mb-1" />
              <Skeleton width={220} height={13} />
            </CardHeader>
            <CardBody className="d-flex align-items-end justify-content-around" style={{ minHeight: "312px" }}>
              <div className="d-flex flex-column align-items-center gap-2">
                <Skeleton width={70} height={180} borderRadius={8} />
                <Skeleton width={80} height={14} />
              </div>
              <div className="d-flex flex-column align-items-center gap-2">
                <Skeleton width={70} height={120} borderRadius={8} />
                <Skeleton width={80} height={14} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 3. Row 2: Tren Pengeluaran (12 cols) */}
      <Row className="g-3 mt-1">
        <Col xl={12}>
          <Card className="sadar-chart-card sadar-panel h-100">
            <CardHeader>
              <Skeleton width={160} height={20} className="mb-1" />
              <Skeleton width={260} height={13} />
            </CardHeader>
            <CardBody className="sadar-expense-trend-body" style={{ minHeight: "300px" }}>
              <div className="d-flex align-items-end justify-content-between h-100 pt-4" style={{ height: "240px" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="d-flex flex-column align-items-center gap-2 flex-fill h-100 justify-content-end">
                    <Skeleton width={36} height={`${30 + (i * 10) % 60}%`} borderRadius={4} />
                    <Skeleton width={40} height={12} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 4. Row 3: Insight Perilaku (7 cols) & Rekomendasi Ringan (5 cols) */}
      <Row className="g-3 mt-1">
        <Col xl={7}>
          <Card className="sadar-panel h-100">
            <CardHeader>
              <Skeleton width={150} height={20} className="mb-1" />
              <Skeleton width={260} height={13} />
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="d-flex align-items-start gap-3 p-2">
                    <SkeletonCircle size={12} className="mt-1" />
                    <div className="w-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Skeleton width={160} height={16} />
                        <Skeleton width={70} height={18} borderRadius={9} />
                      </div>
                      <SkeletonText lines={2} lastLineWidth="80%" height={13} />
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
              <Skeleton width={160} height={20} className="mb-1" />
              <Skeleton width={220} height={13} />
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded-3 d-flex align-items-start gap-3">
                    <SkeletonCircle size={36} />
                    <div className="w-100">
                      <Skeleton width={140} height={16} className="mb-1" />
                      <SkeletonText lines={2} lastLineWidth="70%" height={12} />
                      <Skeleton width={90} height={13} className="mt-2" />
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

// ── 4. SKOR FINANSIAL (1:1 Exact Match) ─────────────────────────────────────
export const FinancialScoreSkeleton = () => (
  <div className="page-content sadar-page">
    <Container fluid>
      {/* 1. Main Score Section (4 cols gauge + 8 cols breakdown) */}
      <Row className="g-3 sadar-score-row align-items-stretch">
        <Col xl={4} className="d-flex">
          <Card className="sadar-panel flex-fill">
            <CardBody className="sadar-score-main d-flex flex-column align-items-center justify-content-center p-4">
              <div className="sadar-score-heading text-center mb-3 w-100">
                <Skeleton width={140} height={20} className="mx-auto mb-1" />
                <Skeleton width={220} height={13} className="mx-auto" />
              </div>
              <div className="d-flex gap-2 mb-3">
                <SkeletonButton width={70} height={28} />
                <SkeletonButton width={70} height={28} />
              </div>
              <SkeletonCircle size={180} className="mb-3" />
              <Skeleton width={110} height={36} className="mb-2" />
              <Skeleton width={90} height={22} borderRadius={11} className="mb-3" />
              <Skeleton width={240} height={13} />
            </CardBody>
          </Card>
        </Col>

        <Col xl={8} className="d-flex">
          <div className="sadar-score-stack w-100 d-flex flex-column">
            {/* 3 Summary Cards */}
            <Row className="g-3 flex-shrink-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <Col md={4} key={i}>
                  <Card className="sadar-summary-card h-100 m-0">
                    <CardBody>
                      <div className="sadar-summary-label">
                        <Skeleton width={80} height={14} />
                        <SkeletonCircle size={28} />
                      </div>
                      <Skeleton width={130} height={26} className="my-2" />
                      <Skeleton width={140} height={12} />
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 50/30/20 Chart */}
            <Card className="sadar-panel mt-3 flex-fill">
              <CardHeader>
                <Skeleton width={150} height={20} className="mb-1" />
                <Skeleton width={240} height={13} />
              </CardHeader>
              <CardBody className="sadar-score-chart-body" style={{ minHeight: "270px" }}>
                <div className="d-flex align-items-end justify-content-around h-100 pt-3" style={{ height: "210px" }}>
                  {["Kebutuhan (50%)", "Keinginan (30%)", "Tabungan (20%)"].map((label, idx) => (
                    <div key={idx} className="d-flex flex-column align-items-center gap-2">
                      <div className="d-flex gap-2 align-items-end">
                        <Skeleton width={28} height={`${120 - idx * 25}px`} borderRadius={6} />
                        <Skeleton width={28} height={`${110 - idx * 20}px`} borderRadius={6} />
                      </div>
                      <Skeleton width={80} height={12} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Col>
      </Row>

      {/* 2. Faktor Pembentuk (7 cols) & Langkah Peningkatan (5 cols) */}
      <Row className="g-3 mt-1 sadar-score-detail-row align-items-stretch">
        <Col xl={7} className="d-flex">
          <Card className="sadar-panel flex-fill mb-0">
            <CardHeader>
              <Skeleton width={180} height={20} className="mb-1" />
              <Skeleton width={280} height={13} />
            </CardHeader>
            <CardBody className="d-flex flex-column gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-3">
                  <div className="d-flex justify-content-between mb-2">
                    <Skeleton width={140} height={16} />
                    <Skeleton width={50} height={16} />
                  </div>
                  <Skeleton width="100%" height={8} borderRadius={4} className="mb-2" />
                  <Skeleton width="75%" height={12} />
                </div>
              ))}
            </CardBody>
          </Card>
        </Col>

        <Col xl={5} className="d-flex">
          <Card className="sadar-panel flex-fill mb-0">
            <CardHeader>
              <Skeleton width={190} height={20} className="mb-1" />
              <Skeleton width={220} height={13} />
            </CardHeader>
            <CardBody className="d-flex flex-column gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-3 d-flex align-items-start gap-3">
                  <SkeletonCircle size={32} />
                  <div className="w-100">
                    <Skeleton width={150} height={16} className="mb-1" />
                    <SkeletonText lines={2} lastLineWidth="80%" height={12} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);

// ── 5. RIWAYAT KEUANGAN (1:1 Exact Match) ───────────────────────────────────
export const FinancialHistorySkeleton = () => (
  <div className="page-content sadar-page">
    <Container fluid>
      <Row className="g-3">
        <Col xl={12}>
          <Card className="sadar-panel">
            <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <Skeleton width={170} height={22} className="mb-1" />
                <Skeleton width={260} height={13} />
              </div>
              <div className="sadar-table-search">
                <Skeleton width={260} height={38} borderRadius={6} />
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {/* Pagination & Filter Header */}
              <div className="sadar-table-pagination d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                  <Skeleton width={180} height={14} />
                  <SkeletonButton width={120} height={32} />
                </div>
                <div className="d-flex gap-1">
                  <SkeletonButton width={32} height={32} />
                  <SkeletonButton width={32} height={32} />
                  <SkeletonButton width={32} height={32} />
                </div>
              </div>

              {/* Transaction Table */}
              <div className="table-responsive sadar-table-wrap">
                <Table className="sadar-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th><Skeleton width={100} height={14} /></th>
                      <th><Skeleton width={80} height={14} /></th>
                      <th><Skeleton width={70} height={14} /></th>
                      <th><Skeleton width={80} height={14} /></th>
                      <th className="text-end"><Skeleton width={80} height={14} className="ms-auto" /></th>
                      <th><Skeleton width={60} height={14} /></th>
                      <th className="text-end"><Skeleton width={40} height={14} className="ms-auto" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td><Skeleton width={150} height={16} /></td>
                        <td><Skeleton width={90} height={14} /></td>
                        <td><Skeleton width={70} height={14} /></td>
                        <td><Skeleton width={100} height={14} /></td>
                        <td className="text-end"><Skeleton width={110} height={16} className="ms-auto" /></td>
                        <td><Skeleton width={70} height={22} borderRadius={11} /></td>
                        <td className="text-end"><SkeletonCircle size={28} className="ms-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);

// ── 6. PROFIL & AKUN (1:1 Exact Match) ──────────────────────────────────────
export const ProfileAccountSkeleton = () => (
  <div className="page-content sadar-page">
    <Container fluid>
      {/* 1. Profile Info (5 cols) & Kelola Akun (7 cols) */}
      <Row className="g-3">
        {/* Left: Data Profil */}
        <Col xl={5}>
          <Card className="sadar-panel sadar-profile-panel h-100">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <div>
                <Skeleton width={110} height={20} className="mb-1" />
                <Skeleton width={200} height={13} />
              </div>
              <SkeletonButton width={32} height={32} />
            </CardHeader>
            <CardBody className="sadar-profile-body">
              <div className="sadar-profile-photo-row d-flex align-items-center gap-3 mb-4">
                <SkeletonCircle size={56} />
                <div className="sadar-profile-photo-copy">
                  <Skeleton width={150} height={20} className="mb-1" />
                  <Skeleton width={190} height={14} />
                </div>
              </div>
              <div className="sadar-profile-summary-grid d-flex gap-3">
                <div className="sadar-profile-summary-item flex-fill p-3 border rounded-3">
                  <Skeleton width={50} height={13} className="mb-2" />
                  <Skeleton width={30} height={24} />
                </div>
                <div className="sadar-profile-summary-item flex-fill p-3 border rounded-3">
                  <Skeleton width={70} height={13} className="mb-2" />
                  <Skeleton width={120} height={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Right: Kelola Akun */}
        <Col xl={7}>
          <Card className="sadar-panel h-100">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <div>
                <Skeleton width={120} height={20} className="mb-1" />
                <Skeleton width={240} height={13} />
              </div>
              <SkeletonButton width={120} height={32} />
            </CardHeader>
            <CardBody className="sadar-account-body">
              <div className="sadar-insight-list sadar-account-list d-flex flex-column gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="sadar-insight-item sadar-account-item d-flex align-items-center justify-content-between gap-3 p-3 rounded-3 border"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <SkeletonCircle size={36} />
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Skeleton width={90} height={16} />
                          <Skeleton width={45} height={18} borderRadius={9} />
                        </div>
                        <Skeleton width={140} height={12} />
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="text-end">
                        <Skeleton width={70} height={11} className="mb-1 ms-auto" />
                        <Skeleton width={110} height={16} className="ms-auto" />
                      </div>
                      <SkeletonCircle size={28} />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 2. Atur Anggaran (12 cols) */}
      <Row className="g-3 mt-1">
        <Col xl={12}>
          <Card className="sadar-panel">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <div>
                <Skeleton width={130} height={20} className="mb-1" />
                <Skeleton width={280} height={13} />
              </div>
              <SkeletonButton width={140} height={34} />
            </CardHeader>
            <CardBody className="p-4 d-flex flex-column gap-4">
              <Row className="g-4">
                {["Kebutuhan (50%)", "Keinginan (30%)", "Tabungan & Investasi (20%)"].map((label, idx) => (
                  <Col md={4} key={idx}>
                    <div className="p-3 border rounded-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Skeleton width={120} height={16} />
                        <Skeleton width={40} height={16} />
                      </div>
                      <Skeleton width="100%" height={8} borderRadius={4} className="mb-3" />
                      <Skeleton width={90} height={12} className="mb-1" />
                      <Skeleton width="100%" height={38} borderRadius={6} />
                    </div>
                  </Col>
                ))}
              </Row>
              <div>
                <SkeletonButton width={150} height={40} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);
