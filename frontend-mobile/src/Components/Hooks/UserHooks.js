import { getLoggedinUser } from "../../helpers/api_helper";

const useProfile = () => {
  const userProfileSession = getLoggedinUser();
  var token =
  userProfileSession &&
  userProfileSession["token"];
  const loading = !token;
  const userProfile = userProfileSession || null;

  return { userProfile, loading,token };
};

export { useProfile };
