import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Col, Dropdown, DropdownMenu, Row } from "reactstrap";
import { useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";

import { analyticsApi } from "../services/api";

const translateMessage = (msg) => {
  if (!msg) return "";
  let cleanMsg = msg;
  cleanMsg = cleanMsg.replace("Your Food & Dining spending is 10% higher than last month.", "Pengeluaran Makanan & Minuman Anda 10% lebih tinggi dibandingkan bulan lalu.");
  cleanMsg = cleanMsg.replace("You are approaching your monthly budget limit (85% used).", "Pengeluaran Anda mendekati batas anggaran bulanan (85% terpakai).");
  cleanMsg = cleanMsg.replace(/Predicted spending for (.*?) is Rp (.*?), which exceeds your budget of Rp (.*?) by (.*?)\./i, "Perkiraan pengeluaran untuk $1 adalah Rp $2, melebihi batas anggaran Anda sebesar Rp $3 sekitar $4.");
  cleanMsg = cleanMsg.replace(/spending \(Rp (.*?)\) exceeds 30% of your budget\./i, " (Rp $1) melebihi 30% dari total anggaran Anda.");
  cleanMsg = cleanMsg.replace(/You are approaching your budget limit for (.*?)\. Predicted: Rp (.*?), Budget: Rp (.*?)\./i, "Pengeluaran Anda mendekati batas anggaran bulanan untuk $1. Perkiraan: Rp $2, Anggaran: Rp $3.");
  cleanMsg = cleanMsg.replace("Food & Dining", "Makanan & Minuman");
  cleanMsg = cleanMsg.replace("Transportation", "Transportasi");
  cleanMsg = cleanMsg.replace("Shopping", "Belanja");
  cleanMsg = cleanMsg.replace("Entertainment", "Hiburan");
  cleanMsg = cleanMsg.replace("Bills & Utilities", "Tagihan & Utilitas");
  return cleanMsg;
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 575.98px)").matches);

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdown((isOpen) => !isOpen);
  };

  const closeNotifications = (event) => {
    event?.stopPropagation();
    setIsNotificationDropdown(false);
  };

  const openInsight = (event, notification = null) => {
    event.preventDefault();
    event.stopPropagation();
    setIsNotificationDropdown(false);
    navigate("/behavior-insight", {
      state: notification
        ? { source: "notification", notification }
        : { source: "notification-center" },
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const response = await analyticsApi.alerts();
        const rawAlerts = response?.data || response || [];
        if (!isMounted) return;

        if (Array.isArray(rawAlerts)) {
          const mapped = rawAlerts.map((alert, index) => {
            const severity = alert.alert_type || alert.alertType || alert.level || "info";
            const isWarning = severity === "warning";
            return {
              id: alert.alert_id || alert.alertId || alert.id || `notification-${index}`,
              icon: isWarning ? "ri-alert-line" : "ri-information-line",
              tone: isWarning ? "warning" : "info",
              title: isWarning ? "Peringatan Anggaran" : "Informasi Keuangan",
              message: translateMessage(alert.message || ""),
              time: alert.created_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(new Date(alert.created_at)) : "Baru saja",
            };
          });
          setNotifications(mapped);
        }
      } catch {
        if (!isMounted) return;
        setNotifications([]);
      }
    };
    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 575.98px)");
    const syncViewport = (event) => setIsMobile(event.matches);

    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobile || !isNotificationDropdown) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsNotificationDropdown(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobile, isNotificationDropdown]);

  const notificationContent = (
    <>
      <div className="dropdown-head bg-primary bg-pattern rounded-top">
        <div className="p-3">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0 fs-16 fw-semibold text-white">Notifikasi Keuangan</h6>
            </Col>
            <div className="col-auto d-flex align-items-center gap-2">
              <span className="badge bg-light-subtle text-body fs-13">{notifications.length} Baru</span>
              <button
                type="button"
                className="sadar-notification-close"
                onClick={closeNotifications}
                aria-label="Tutup notifikasi"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </Row>
        </div>
      </div>

      <SimpleBar className="py-2 sadar-notification-list">
        {notifications.length > 0 ? notifications.map((item) => (
          <button
            type="button"
            onClick={(event) => openInsight(event, item)}
            className="text-reset notification-item sadar-notification-item d-block dropdown-item position-relative"
            key={item.id}
            aria-label={`${item.title}. ${item.message}. Buka Insight Perilaku`}
          >
            <div className="d-flex align-items-start">
              <div className="avatar-xs me-3 flex-shrink-0">
                <span className={`avatar-title bg-${item.tone}-subtle text-${item.tone} rounded-circle fs-16`}>
                  <i className={item.icon}></i>
                </span>
              </div>
              <div className="flex-grow-1 min-width-0">
                <h6 className="mt-0 mb-1 lh-base">{item.title}</h6>
                <p className="mb-1 fs-12 text-muted">{item.message}</p>
                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                  <i className="mdi mdi-clock-outline"></i> {item.time}
                </p>
              </div>
              <i className="ri-arrow-right-s-line sadar-notification-item-arrow" aria-hidden="true"></i>
            </div>
          </button>
        )) : (
          <div className="sadar-notification-empty">
            <span className="sadar-notification-empty-icon" aria-hidden="true">
              <i className="ri-notification-off-line"></i>
            </span>
            <strong>Semua beres</strong>
            <small>Belum ada notifikasi keuangan baru.</small>
          </div>
        )}
        <div className="my-3 text-center">
          <button type="button" onClick={(event) => openInsight(event)} className="btn btn-soft-primary btn-sm sadar-notification-insight-button">
            Lihat Insight <i className="ri-arrow-right-line align-middle"></i>
          </button>
        </div>
      </SimpleBar>
    </>
  );

  return (
    <>
      <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown header-item sadar-notification">
        <button
          type="button"
          className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
          onClick={toggleNotificationDropdown}
          aria-label="Buka notifikasi keuangan"
          aria-expanded={isNotificationDropdown}
          aria-haspopup="dialog"
        >
          <i className="bx bx-bell fs-22"></i>
          {notifications.length > 0 && (
            <span className="position-absolute topbar-badge translate-middle badge rounded-pill bg-danger">
              {notifications.length}<span className="visually-hidden">notifikasi belum dibaca</span>
            </span>
          )}
        </button>
        {!isMobile && (
          <DropdownMenu className="dropdown-menu-end p-0 sadar-notification-menu">
            {notificationContent}
          </DropdownMenu>
        )}
      </Dropdown>
      {isMobile && isNotificationDropdown && createPortal(
        <div className="sadar-notification sadar-notification-modal-layer" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="sadar-notification-backdrop"
            onClick={closeNotifications}
            aria-label="Tutup notifikasi"
          />
          <div className="dropdown-menu show p-0 sadar-notification-menu" role="dialog" aria-modal="true" aria-label="Notifikasi Keuangan">
            <div className="sadar-notification-sheet-handle" aria-hidden="true" />
            {notificationContent}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default NotificationDropdown;
