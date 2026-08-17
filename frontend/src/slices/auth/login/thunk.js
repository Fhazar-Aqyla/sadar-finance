//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
} from "../../../helpers/fakebackend_helper";
import { setAuthorization } from "../../../helpers/api_helper";
import { authApi } from "../../../Components/services/api";
import { removeStoredAuthUser, setStoredAuthUser } from "../../../helpers/auth-storage";

import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from './reducer';

const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "sadar";

const normalizeSadarAuth = (response) => {
  const payload = response?.data || response;
  return {
    token: payload?.token,
    user: payload?.user,
  };
};

export const loginUser = (user, history) => async (dispatch) => {

  try {
    let response;
    if (defaultAuth === "sadar") {
      response = await authApi.login({
        email: user.email,
        password: user.password,
      });

      const data = normalizeSadarAuth(response);
      if (!data.token) {
        throw new Error("Login gagal.");
      }

      setStoredAuthUser(data, user.rememberMe);
      setAuthorization(data.token);
      dispatch(loginSuccess(data.user));
      history('/dashboard');
      return;
    }

    if (defaultAuth === "firebase") {
      let fireBaseBackend = getFirebaseBackend();
      response = fireBaseBackend.loginUser(
        user.email,
        user.password
      );
    } else if (defaultAuth === "jwt") {
      response = postJwtLogin({
        email: user.email,
        password: user.password
      });

    } else {
      response = postFakeLogin({
        email: user.email,
        password: user.password,
      });
    }
    
    var data = await response;

    if (data) {
      setStoredAuthUser(data, user.rememberMe);
      if (defaultAuth === "fake") {
        var finallogin = JSON.stringify(data);
        finallogin = JSON.parse(finallogin)
        data = finallogin.data;
        if (finallogin.status === "success") {
          setStoredAuthUser({
            token: finallogin.data?.accessToken,
            user: finallogin.data,
          }, user.rememberMe);
          dispatch(loginSuccess(data));
          history('/dashboard')
        } else {
          dispatch(apiError("Email atau password salah."));
        }
      }else{
        dispatch(loginSuccess(data));
        history('/dashboard')
      }
    }
  } catch (error) {
    dispatch(apiError(error?.message || "Email atau password salah."));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    removeStoredAuthUser();
    let fireBaseBackend = getFirebaseBackend();
    if (defaultAuth === "firebase") {
      const response = fireBaseBackend.logout;
      dispatch(logoutUserSuccess(response));
    } else {
      dispatch(logoutUserSuccess(true));
    }

  } catch {
    dispatch(apiError("Logout gagal."));
  }
};

export const socialLogin = (type, history) => async (dispatch) => {
  try {
    let response;

    if (defaultAuth === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      response = fireBaseBackend.socialLoginUser(type);
    }
    //  else {
      //   response = postSocialLogin(data);
      // }
      
      const socialdata = await response;
    if (socialdata) {
      setStoredAuthUser(response, true);
      dispatch(loginSuccess(response));
      history('/dashboard')
    }

} catch {
    dispatch(apiError("Login gagal."));
  }
};

export const resetLoginFlag = () => async (dispatch) =>{
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch {
    dispatch(apiError("Login gagal."));
  }
};
