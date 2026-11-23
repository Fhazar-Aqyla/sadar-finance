import React from "react";
import { Navigate } from "react-router-dom";

// SADAR Finance Web App Pages (Basic SADAR Finance)
import SadarDashboard from "../pages/SadarDashboard";
import SadarBehaviorInsight from "../pages/SadarBehaviorInsight";
import SadarFinancialScore from "../pages/SadarFinancialScore";
import SadarFinancialHistory from "../pages/SadarFinancialHistory";
import SadarProfileAccount from "../pages/SadarProfileAccount";
import SadarProfileEdit from "../pages/SadarProfileEdit";
import TransactionInput from "../pages/Sadar/TransactionInput";

// Auth & Profiles
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import UserProfile from "../pages/Authentication/user-profile";

// Landing & Installation Pages
import OnePage from "../pages/Landing/OnePage";
import InstallPage from "../pages/Landing/InstallPage";

// Legal / Policy Pages
import PrivancyPolicy from "../pages/Pages/PrivancyPolicy/PrivancyPolicy";
import TermAndConditions from "../pages/Pages/TermAndConditions/TermAndConditions";

const authProtectedRoutes = [
  { path: "/dashboard", component: <SadarDashboard /> },
  { path: "/catat-keuangan", component: <TransactionInput /> },
  { path: "/behavior-insight", component: <SadarBehaviorInsight /> },
  { path: "/financial-score", component: <SadarFinancialScore /> },
  { path: "/financial-history", component: <SadarFinancialHistory /> },
  { path: "/profile-account", component: <SadarProfileAccount /> },
  { path: "/profile-account/edit", component: <SadarProfileEdit /> },
  { path: "/index", component: <SadarDashboard /> },
  { path: "/transactions/input", component: <TransactionInput /> },
  { path: "/profile", component: <UserProfile /> },
  { path: "*", component: <Navigate to="/dashboard" replace /> },
];

const publicRoutes = [
  { path: "/", component: <OnePage />, guestOnly: true },
  { path: "/landing", component: <OnePage />, guestOnly: true },
  { path: "/install", component: <InstallPage /> },
  { path: "/download", component: <InstallPage /> },
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login />, guestOnly: true },
  { path: "/forgot-password", component: <ForgetPasswordPage />, guestOnly: true },
  { path: "/register", component: <Register />, guestOnly: true },
  { path: "/privancy-policy", component: <PrivancyPolicy /> },
  { path: "/privacy-policy", component: <PrivancyPolicy /> },
  { path: "/term-conditions", component: <TermAndConditions /> },
  { path: "/terms-conditions", component: <TermAndConditions /> },
];

export { authProtectedRoutes, publicRoutes };
