import React, { useState } from "react";
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from "reactstrap";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";

const notifications = [
  {
    icon: "ri-alert-line",
    tone: "warning",
    title: "Budget makanan mencapai 80%",
    time: "Baru saja",
  },
  {
    icon: "ri-lightbulb-flash-line",
    tone: "info",
    title: "Pengeluaran akhir pekan naik dibanding minggu lalu",
    time: "25 menit lalu",
  },
  {
    icon: "ri-shield-check-line",
    tone: "success",
    title: "Financial score stabil di angka 82",
    time: "Hari ini",
  },
];

const NotificationDropdown = () => {
  const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
  const toggleNotificationDropdown = () => {
    setIsNotificationDropdown(!isNotificationDropdown);
  };

  return (
    <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown header-item sadar-notification">
      <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
        <i className="bx bx-bell fs-22"></i>
        <span className="position-absolute topbar-badge translate-middle badge rounded-pill bg-danger">
          3<span className="visually-hidden">notifikasi belum dibaca</span>
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end p-0 sadar-notification-menu">
        <div className="dropdown-head bg-primary bg-pattern rounded-top">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fs-16 fw-semibold text-white">Notifikasi Keuangan</h6>
              </Col>
              <div className="col-auto">
                <span className="badge bg-light-subtle text-body fs-13">3 Baru</span>
              </div>
            </Row>
          </div>
        </div>

        <SimpleBar style={{ maxHeight: "300px" }} className="py-2">
          {notifications.map((item) => (
            <Link to="/dashboard" className="text-reset notification-item sadar-notification-item d-block dropdown-item position-relative" key={item.title}>
              <div className="d-flex align-items-start">
                <div className="avatar-xs me-3 flex-shrink-0">
                  <span className={`avatar-title bg-${item.tone}-subtle text-${item.tone} rounded-circle fs-16`}>
                    <i className={item.icon}></i>
                  </span>
                </div>
                <div className="flex-grow-1 min-width-0">
                  <h6 className="mt-0 mb-1 lh-base">{item.title}</h6>
                  <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                    <i className="mdi mdi-clock-outline"></i> {item.time}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          <div className="my-3 text-center">
            <Link to="/behavior-insight" className="btn btn-soft-primary btn-sm">
              Lihat Insight <i className="ri-arrow-right-line align-middle"></i>
            </Link>
          </div>
        </SimpleBar>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationDropdown;
