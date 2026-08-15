import React from "react";
import { Navigate } from "react-router-dom";

const GuestProtected = (props) => {
  const hasToken = (() => {
    try {
      return Boolean(JSON.parse(localStorage.getItem("authUser") || "null")?.token);
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