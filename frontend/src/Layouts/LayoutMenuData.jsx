import React from "react";
import FeatherIcon from "feather-icons-react";

const Navdata = () => {
  const menuItems = [
    {
      label: "Main Menu",
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
      label: "Behavior Insight",
      icon: <FeatherIcon icon="activity" className="icon-dual" />,
      link: "/behavior-insight",
    },
    {
      id: "financial-score",
      label: "Financial Score",
      icon: <FeatherIcon icon="bar-chart-2" className="icon-dual" />,
      link: "/financial-score",
    },
    {
      id: "profile-account",
      label: "Profile & Account",
      icon: <FeatherIcon icon="user" className="icon-dual" />,
      link: "/profile-account",
    },
  ];

  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
