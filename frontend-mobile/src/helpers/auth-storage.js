const AUTH_USER_KEY = "authUser";

const availableStorages = () => [sessionStorage, localStorage];

export const getStoredAuthUser = () => {
  for (const storage of availableStorages()) {
    const rawAuthUser = storage.getItem(AUTH_USER_KEY);
    if (!rawAuthUser) continue;

    try {
      return JSON.parse(rawAuthUser);
    } catch {
      storage.removeItem(AUTH_USER_KEY);
    }
  }

  return null;
};

export const getStoredAuthUserRaw = () => {
  const authUser = getStoredAuthUser();
  return authUser ? JSON.stringify(authUser) : null;
};

export const setStoredAuthUser = (authUser, remember = true) => {
  const targetStorage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(AUTH_USER_KEY);
  targetStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
};

export const updateStoredAuthUser = (updater) => {
  const authUser = getStoredAuthUser();
  if (!authUser) return null;

  const updatedAuthUser = updater(authUser);
  const remember = Boolean(localStorage.getItem(AUTH_USER_KEY));
  setStoredAuthUser(updatedAuthUser, remember);
  return updatedAuthUser;
};

export const removeStoredAuthUser = () => {
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};
