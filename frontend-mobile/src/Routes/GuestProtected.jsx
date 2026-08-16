import React from "react";
import { Navigate } from "react-router-dom";

const GuestProtected = (props) => {
  const hasToken = (() => {
    try {
      const authUser = JSON.parse(localStorage.getItem("authUser") || "null");
      return Boolean(authUser?.token || authUser?.data?.token);
    } catch {
      return false;
    }
  })();

  if (hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{props.children}</>;
};

export { GuestProtected };