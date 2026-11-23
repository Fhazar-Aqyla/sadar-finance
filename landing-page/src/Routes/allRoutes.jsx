import React from "react";
import { Navigate } from "react-router-dom";

// Landing & Installation Pages
import OnePage from "../pages/Landing/OnePage";
import InstallPage from "../pages/Landing/InstallPage";

// Legal / Policy Pages
import PrivancyPolicy from "../pages/Pages/PrivancyPolicy/PrivancyPolicy";
import TermAndConditions from "../pages/Pages/TermAndConditions/TermAndConditions";

const authProtectedRoutes = [];

const publicRoutes = [
  { path: "/", component: <OnePage /> },
  { path: "/landing", component: <OnePage /> },
  { path: "/install", component: <InstallPage /> },
  { path: "/download", component: <InstallPage /> },
  { path: "/login", component: <Navigate to="/install" replace /> },
  { path: "/register", component: <Navigate to="/install" replace /> },
  { path: "/privancy-policy", component: <PrivancyPolicy /> },
  { path: "/privacy-policy", component: <PrivancyPolicy /> },
  { path: "/term-conditions", component: <TermAndConditions /> },
  { path: "/terms-conditions", component: <TermAndConditions /> },
  { path: "*", component: <Navigate to="/" replace /> },
];

export { authProtectedRoutes, publicRoutes };
