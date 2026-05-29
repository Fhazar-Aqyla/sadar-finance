import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../slices/thunks";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Logout | SADAR Finance";

    const logout = async () => {
      await dispatch(logoutUser());
      navigate("/login", { replace: true });
    };

    logout();
  }, [dispatch, navigate]);

  return null;
};

export default Logout;
