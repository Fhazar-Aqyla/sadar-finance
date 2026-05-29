//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import { postFakeProfile, postJwtProfile } from "../../../helpers/fakebackend_helper";
import { authApi } from "../../../Components/services/api";

// action
import { profileSuccess, profileError, resetProfileFlagChange } from "./reducer";

const fireBaseBackend = getFirebaseBackend();
const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "sadar";

export const editProfile = (user) => async (dispatch) => {
    try {
        let response;

        if (defaultAuth === "sadar") {
            response = await authApi.updateMe(user);
        } else if (defaultAuth === "firebase") {
            response = fireBaseBackend.editProfileAPI(
                user.username,
                user.idx
            );

        } else if (defaultAuth === "jwt") {

            response = postJwtProfile(
                {
                    username: user.username,
                    idx: user.idx,
                }
            );

        } else if (defaultAuth === "fake") {
            response = postFakeProfile(user);
        }

        const data = await response;

        if (data) {
            dispatch(profileSuccess(data));
        }

    } catch (error) {
        dispatch(profileError("Profil gagal diperbarui."));
    }
};

export const resetProfileFlag = () => {
    try {
        const response = resetProfileFlagChange();
        return response;
    } catch (error) {
        return error;
    }
};
