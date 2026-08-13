import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AuthProtected = (props) => {
  const location = useLocation();
  const authUser = JSON.parse(localStorage.getItem("authUser") || "null");

  if (!authUser?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{props.children}</>;
};

export { AuthProtected };
