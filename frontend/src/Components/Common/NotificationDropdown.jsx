import React, { useEffect, useState } from "react";
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from "reactstrap";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";

import { analyticsApi, appApi } from "../services/api";

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
  const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdown(!isNotificationDropdown);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const [alertsRes, bcastRes, pushRes] = await Promise.all([
          analyticsApi.alerts().catch(() => []),
          appApi.broadcasts().catch(() => ({ broadcasts: [] })),
          appApi.pushFeed().catch(() => ({ notifications: [] })),
        ]);
        const rawAlerts = alertsRes?.data || alertsRes || [];
        const rawBroadcasts = Array.isArray(bcastRes?.broadcasts)
          ? bcastRes.broadcasts
          : [];
        const rawPushes = Array.isArray(pushRes?.notifications)
          ? pushRes.notifications.filter((p) => p && p.target !== "android")
          : [];
        if (!isMounted) return;

        // Fire browser desktop notification for newly arrived remote pushes
        try {
          const seenRaw = localStorage.getItem("sadar_seen_push_ids_v2");
          const seenSet = new Set(seenRaw ? JSON.parse(seenRaw) : []);
          let changed = false;
          for (const p of rawPushes.slice(0, 5)) {
            if (p.id && !seenSet.has(p.id)) {
              seenSet.add(p.id);
              changed = true;
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(p.title || "SADAR Finance V 2.0", {
                  body: p.body || p.message || "",
                  icon: "/favicon.png",
                });
              }
            }
          }
          if (changed) {
            localStorage.setItem(
              "sadar_seen_push_ids_v2",
              JSON.stringify([...seenSet].slice(-60))
            );
          }
        } catch (_) {}

        const mappedPushes = rawPushes.map((p) => ({
          id: p.id,
          icon:
            p.category === "budget" || p.category === "urgent"
              ? "ri-alarm-warning-line"
              : p.category === "recurring"
                ? "ri-calendar-event-line"
                : p.category === "debt"
                  ? "ri-team-line"
                  : "ri-notification-badge-line",
          tone:
            p.category === "budget" || p.category === "urgent"
              ? "danger"
              : p.category === "recurring" || p.category === "debt"
                ? "warning"
                : "success",
          title: p.title || "Push Notification SADAR",
          message: p.body || p.message || "",
          time: p.sentAt
            ? new Intl.DateTimeFormat("id-ID", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(p.sentAt))
            : "Baru saja",
          route: p.actionRoute || "/dashboard",
        }));

        const mappedBroadcasts = rawBroadcasts.map((b) => ({
          id: b.id || b.title,
          icon:
            b.type === "maintenance" || b.type === "urgent"
              ? "ri-tools-line"
              : "ri-megaphone-line",
          tone:
            b.type === "maintenance" || b.type === "urgent"
              ? "warning"
              : "primary",
          title: b.title || "Pengumuman SADAR Finance",
          message: b.message || "",
          time: b.badge || "PENGUMUMAN RESMI",
          route: b.actionRoute || "/dashboard",
        }));

        const mappedAlerts = Array.isArray(rawAlerts)
          ? rawAlerts.map((alert, idx) => ({
              id: alert.alert_id || `alert-${idx}`,
              icon:
                alert.alert_type === "warning" || alert.alertType === "warning"
                  ? "ri-alert-line"
                  : "ri-information-line",
              tone:
                alert.alert_type === "warning" || alert.alertType === "warning"
                  ? "warning"
                  : "primary",
              title:
                alert.alert_type === "warning" || alert.alertType === "warning"
                  ? "Peringatan Anggaran"
                  : "Informasi Keuangan",
              message: translateMessage(alert.message || ""),
              time: alert.created_at
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(alert.created_at))
                : "Baru saja",
              route: "/behavior-insight",
            }))
          : [];

        setNotifications([...mappedPushes, ...mappedBroadcasts, ...mappedAlerts]);
      } catch {
        if (!isMounted) return;
        setNotifications([]);
      }
    };
    fetchNotifications();
    const timer = window.setInterval(fetchNotifications, 15000);
    const onPushSent = () => fetchNotifications();
    window.addEventListener("sadar-push-sent", onPushSent);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
      window.removeEventListener("sadar-push-sent", onPushSent);
    };
  }, []);

  return (
    <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown header-item sadar-notification">
      <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
        <i className="bx bx-bell fs-22"></i>
        {notifications.length > 0 && (
          <span className="position-absolute topbar-badge translate-middle badge rounded-pill bg-danger">
            {notifications.length}<span className="visually-hidden">notifikasi belum dibaca</span>
          </span>
        )}
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end p-0 sadar-notification-menu">
        <div
          className="dropdown-head rounded-top"
          style={{
            background: "linear-gradient(135deg, #0a1e36 0%, #1e3a8a 100%)",
          }}
        >
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 fs-16 fw-semibold text-white">Notifikasi Keuangan</h6>
              </Col>
              <div className="col-auto d-flex align-items-center gap-2">
                <span className="badge bg-light-subtle text-body fs-13">{notifications.length} Baru</span>
                <button
                  type="button"
                  className="btn btn-sm p-0 border-0 bg-transparent text-white"
                  onClick={() => setIsNotificationDropdown(false)}
                  aria-label="Tutup notifikasi"
                  title="Tutup"
                >
                  <i className="bx bx-x fs-22"></i>
                </button>
              </div>
            </Row>
          </div>
        </div>

        <SimpleBar style={{ maxHeight: "300px" }} className="py-2">
          {notifications.length > 0 ? notifications.map((item) => (
            <Link to="/dashboard" className="text-reset notification-item sadar-notification-item d-block dropdown-item position-relative" key={item.title}>
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
              </div>
            </Link>
          )) : (
            <div className="px-3 py-4 text-center text-muted fs-13">Belum ada notifikasi keuangan.</div>
          )}
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
