import { userForgetPasswordSuccess, userForgetPasswordError } from "./reducer"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";

import {
  postFakeForgetPwd,
  postJwtForgetPwd,
} from "../../../helpers/fakebackend_helper";
import { authApi } from "../../../Components/services/api";

const fireBaseBackend = getFirebaseBackend();
const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "sadar";

export const userForgetPassword = (user) => async (dispatch) => {
  try {
      let response;
      if (defaultAuth === "sadar") {
          const res = await authApi.forgotPassword({ email: user.email });
          dispatch(userForgetPasswordSuccess(res?.message || "Permintaan reset password diterima. Cek email jika layanan email sudah aktif."));
          return;
      }

      if (defaultAuth === "firebase") {

          response = fireBaseBackend.forgetPassword(
              user.email
          )

      } else if (defaultAuth === "jwt") {
          response = postJwtForgetPwd(
              user.email
          )
      } else {
          response = postFakeForgetPwd(
              user.email
          )
      }

      const data = await response;

      if (data) {
          dispatch(userForgetPasswordSuccess("Link reset password berhasil dikirim."))
      }
  } catch (forgetError) {
      dispatch(userForgetPasswordError("Reset password gagal."))
  }
}
