import React from "react";
import FeatherIcon from "feather-icons-react";
import { getStoredAuthUser } from "../helpers/auth-storage";

const Navdata = () => {
  const authUser = getStoredAuthUser();
  const rawUser = authUser?.user || authUser?.data?.user || {};
  const isDeveloper =
    String(rawUser?.email || "").trim().toLowerCase() ===
    "mhmdhabibrafi@gmail.com";

  const menuItems = [
    {
      label: "Menu Utama",
      isHeader: true,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FeatherIcon icon="home" className="icon-dual" />,
      link: "/dashboard",
    },
    {
      id: "catat-keuangan",
      label: "Catat Keuangan",
      icon: <FeatherIcon icon="edit-3" className="icon-dual" />,
      link: "/catat-keuangan",
    },
    {
      id: "behavior-insight",
      label: "Insight Perilaku",
      icon: <FeatherIcon icon="activity" className="icon-dual" />,
      link: "/behavior-insight",
    },
    {
      id: "financial-score",
      label: "Skor Finansial",
      icon: <FeatherIcon icon="bar-chart-2" className="icon-dual" />,
      link: "/financial-score",
    },
    {
      id: "financial-history",
      label: "Riwayat Keuangan",
      icon: <FeatherIcon icon="file-text" className="icon-dual" />,
      link: "/financial-history",
    },
    {
      id: "financial-plans",
      label: "Rencana & Piutang",
      icon: <FeatherIcon icon="compass" className="icon-dual" />,
      link: "/financial-plans",
    },
    {
      id: "profile-account",
      label: "Profil",
      icon: <FeatherIcon icon="user" className="icon-dual" />,
      link: "/profile-account",
    },
    ...(isDeveloper
      ? [
          {
            id: "developer-panel",
            label: "Panel Developer",
            icon: <FeatherIcon icon="terminal" className="icon-dual" />,
            link: "/developer-panel",
          },
        ]
      : []),
  ];

  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
