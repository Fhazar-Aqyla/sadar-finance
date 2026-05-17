import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";

import BreadCrumb from "../../Components/Common/BreadCrumb";

const pageCopy = {
  "/catat-keuangan": {
    title: "Catat Keuangan",
    text: "Form pencatatan transaksi, income, account, dan budget akan dikelola di halaman ini.",
    icon: "ri-add-circle-line",
  },
  "/behavior-insight": {
    title: "Behavior Insight",
    text: "Ringkasan pola pengeluaran dan kebiasaan transaksi user akan ditampilkan di halaman ini.",
    icon: "ri-lightbulb-flash-line",
  },
  "/financial-score": {
    title: "Financial Score",
    text: "Skor kesehatan keuangan, faktor penilaian, dan rekomendasi perbaikan akan ditampilkan di halaman ini.",
    icon: "ri-speed-up-line",
  },
  "/profile-account": {
    title: "Profile & Account",
    text: "Pengaturan profil, account keuangan, dan preferensi alert akan dikelola di halaman ini.",
    icon: "ri-user-settings-line",
  },
};

const SadarPlaceholder = () => {
  const config = pageCopy[window.location.pathname] || pageCopy["/catat-keuangan"];
  document.title = `${config.title} | SADAR Finance`;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title={config.title} pageTitle="SADAR Finance" />
        <Row className="justify-content-center">
          <Col xl={7}>
            <Card>
              <CardBody className="text-center p-5">
                <span className="avatar-lg mx-auto mb-4 rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center fs-1">
                  <i className={config.icon}></i>
                </span>
                <h4 className="mb-2">{config.title}</h4>
                <p className="text-muted mb-0">{config.text}</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SadarPlaceholder;
