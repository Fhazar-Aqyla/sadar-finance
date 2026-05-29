import React from "react";
import { Navigate } from "react-router-dom";

// SADAR Finance Pages
import SadarDashboard from "../pages/SadarDashboard";
import SadarBehaviorInsight from "../pages/SadarBehaviorInsight";
import SadarFinancialScore from "../pages/SadarFinancialScore";
import SadarProfileAccount from "../pages/SadarProfileAccount";
import SadarProfileEdit from "../pages/SadarProfileEdit";
import TransactionInput from "../pages/Sadar/TransactionInput";

// Auth & Profiles
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import UserProfile from "../pages/Authentication/user-profile";

// Landing Index
import OnePage from "../pages/Landing/OnePage";

// Legal / Policy Pages
import PrivancyPolicy from "../pages/Pages/PrivancyPolicy/PrivancyPolicy";
import TermAndConditions from "../pages/Pages/TermAndConditions/TermAndConditions";

const authProtectedRoutes = [
  { path: "/dashboard", component: <SadarDashboard /> },
  { path: "/catat-keuangan", component: <TransactionInput /> },
  { path: "/behavior-insight", component: <SadarBehaviorInsight /> },
  { path: "/financial-score", component: <SadarFinancialScore /> },
  { path: "/profile-account", component: <SadarProfileAccount /> },
  { path: "/profile-account/edit", component: <SadarProfileEdit /> },
  { path: "/index", component: <SadarDashboard /> },
  { path: "/transactions/input", component: <TransactionInput /> },
  { path: "/privancy-policy", component: <PrivancyPolicy /> },
  { path: "/term-conditions", component: <TermAndConditions /> },
  { path: "/profile", component: <UserProfile /> },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  { path: "*", component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  // Authentication Page
  { path: "/", component: <OnePage /> },
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/register", component: <Register /> },
  { path: "/landing", component: <OnePage /> },
];

export { authProtectedRoutes, publicRoutes };
