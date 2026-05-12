//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import { postFakeProfile, postJwtProfile } from "../../../helpers/fakebackend_helper";

// action
import { profileSuccess, profileError, resetProfileFlagChange } from "./reducer";

const fireBaseBackend = getFirebaseBackend();
const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "fake";

export const editProfile = (user) => async (dispatch) => {
    try {
        let response;

        if (defaultAuth === "firebase") {
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
        dispatch(profileError(error));
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
