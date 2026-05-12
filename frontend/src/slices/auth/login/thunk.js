//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
} from "../../../helpers/fakebackend_helper";

import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag } from './reducer';

const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "fake";
const hasApiUrl = Boolean(import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL);

export const loginUser = (user, history) => async (dispatch) => {

  try {
    let response;
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

    } else if (defaultAuth === "fake" || hasApiUrl) {
      response = postFakeLogin({
        email: user.email,
        password: user.password,
      });
    }
    
    var data = await response;

    if (data) {
      sessionStorage.setItem("authUser", JSON.stringify(data));
      if (defaultAuth === "fake") {
        var finallogin = JSON.stringify(data);
        finallogin = JSON.parse(finallogin)
        data = finallogin.data;
        if (finallogin.status === "success") {
          dispatch(loginSuccess(data));
          history('/dashboard')
        } else {
          dispatch(apiError(finallogin));
        }
      }else{
        dispatch(loginSuccess(data));
        history('/dashboard')
      }
    }
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    sessionStorage.removeItem("authUser");
    let fireBaseBackend = getFirebaseBackend();
    if (defaultAuth === "firebase") {
      const response = fireBaseBackend.logout;
      dispatch(logoutUserSuccess(response));
    } else {
      dispatch(logoutUserSuccess(true));
    }

  } catch (error) {
    dispatch(apiError(error));
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
      sessionStorage.setItem("authUser", JSON.stringify(response));
      dispatch(loginSuccess(response));
      history('/dashboard')
    }

  } catch (error) {
    dispatch(apiError(error));
  }
};


export const resetLoginFlag = () => async (dispatch) =>{
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};
