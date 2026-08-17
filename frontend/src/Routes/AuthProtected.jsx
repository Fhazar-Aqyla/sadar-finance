import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getStoredAuthUser } from "../helpers/auth-storage";

const AuthProtected = (props) => {
  const location = useLocation();
  const authUser = getStoredAuthUser();

  if (!authUser?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{props.children}</>;
};

export { AuthProtected };
