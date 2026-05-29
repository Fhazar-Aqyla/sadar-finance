import React from "react";
import FeatherIcon from "feather-icons-react";

const Navdata = () => {
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
      id: "profile-account",
      label: "Profil & Akun",
      icon: <FeatherIcon icon="user" className="icon-dual" />,
      link: "/profile-account",
    },
  ];

  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
