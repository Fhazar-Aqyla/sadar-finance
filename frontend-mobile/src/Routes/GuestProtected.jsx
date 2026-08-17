import React from "react";
import { Navigate } from "react-router-dom";

import { getStoredAuthUser } from "../helpers/auth-storage";

const GuestProtected = (props) => {
  const authUser = getStoredAuthUser();
  const hasToken = Boolean(authUser?.token || authUser?.data?.token);

  if (hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{props.children}</>;
};

export { GuestProtected };
