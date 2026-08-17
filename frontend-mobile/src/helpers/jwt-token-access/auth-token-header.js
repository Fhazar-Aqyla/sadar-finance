import { getStoredAuthUser } from "../auth-storage";

export default function authHeader() {
  const obj = getStoredAuthUser();

  if (obj && obj.accessToken) {
    return { Authorization: obj.accessToken };
  }

  return {};
}
