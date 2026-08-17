//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeRegister,
  postJwtRegister,
} from "../../../helpers/fakebackend_helper";
import { authApi } from "../../../Components/services/api";
import { setStoredAuthUser } from "../../../helpers/auth-storage";
import { setAuthorization } from "../../../helpers/api_helper";

// action
import {
  registerUserSuccessful,
  registerUserFailed,
  resetRegisterFlagChange,
  apiErrorChange
} from "./reducer";

// initialize relavant method of both Auth
const fireBaseBackend = getFirebaseBackend();
const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "sadar";

const getErrorMessage = (error, fallback = "Registrasi gagal.") => {
  const message = String(
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    error?.data?.message ||
    error?.data ||
    ""
  ).toLowerCase();

  if (message.includes("email") && (message.includes("exist") || message.includes("terdaftar") || message.includes("duplicate"))) {
    return "Email sudah terdaftar.";
  }

  return fallback;
};

const splitFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "SADAR",
    lastName: parts.slice(1).join(" ") || "User",
  };
};

// Is user register successfull then direct plot user in redux.
export const registerUser = (user, history) => async (dispatch) => {
  try {
    let response;

    if (defaultAuth === "sadar") {
      const { firstName, lastName } = splitFullName(user.first_name);
      response = await authApi.register({
        firstName,
        lastName,
        email: user.email,
        password: user.password,
      });

      const data = response?.data || response;
      if (!data?.token) {
        throw new Error("Registrasi berhasil, tetapi sesi login tidak tersedia.");
      }

      setStoredAuthUser(data, true);
      setAuthorization(data.token);
      dispatch(registerUserSuccessful(data.user));
      history("/dashboard", { replace: true });
      return;
    }

    if (defaultAuth === "firebase") {
      response = fireBaseBackend.registerUser(user.email, user.password);
      // yield put(registerUserSuccessful(response));
    } else if (defaultAuth === "jwt") {
      response = postJwtRegister('/post-jwt-register', user);
      // yield put(registerUserSuccessful(response));
    } else {
      response = postFakeRegister(user);
      const data = await response;

      if (data.message === "success") {
        dispatch(registerUserSuccessful(data));
      } else {
        dispatch(registerUserFailed("Registrasi gagal."));
      }
    }
  } catch (error) {
    dispatch(registerUserFailed(getErrorMessage(error)));
  }
};

export const resetRegisterFlag = () => {
  try {
    const response = resetRegisterFlagChange();
    return response;
  } catch (error) {
    return error;
  }
};

export const apiError = () => {
  try {
    const response = apiErrorChange();
    return response;
  } catch (error) {
    return error;
  }
};
