import React, { useMemo } from "react";
import { useSelector } from "react-redux";

//import images
import dummyAvatar from "../../assets/images/users/user-dummy-img.jpg";

const resolveAvatarUrl = (url) => {
  if (!url) return dummyAvatar;
  if (/^(https?:|data:)/i.test(url)) return url;
  const serverUrl = "https://sadar-finance.up.railway.app";
  return `${serverUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const normalizeAccountName = (value) => {
  const name = String(value || "").trim();
  if (
    !name ||
    name.toLowerCase() === "admin" ||
    name.toLowerCase().includes("themesbrand")
  ) {
    return "Aqyla";
  }
  return name;
};

const ProfileDropdown = () => {
  const user = useSelector((state) => state.Profile?.user ?? {});

  const userName = useMemo(() => {
    const fallbackName = normalizeAccountName(
      user?.first_name || user?.username || "Aqyla",
    );
    const storedUser = localStorage.getItem("authUser");

    if (!storedUser) {
      return fallbackName;
    }

    try {
      const authUser = JSON.parse(storedUser);

      return normalizeAccountName(
        user?.first_name ||
          user?.username ||
          authUser?.user?.first_name ||
          authUser?.user?.username ||
          authUser?.data?.first_name ||
          authUser?.data?.username ||
          authUser?.first_name ||
          authUser?.username ||
          authUser?.email ||
          "Aqyla",
      );
    } catch {
      return fallbackName;
    }
  }, [user]);

  const avatarUrl = useMemo(() => {
    const rawAvatar =
      user?.profile_picture || user?.profilePicture || user?.avatar;
    if (rawAvatar) return resolveAvatarUrl(rawAvatar);

    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const authUser = JSON.parse(storedUser);
        const u =
          authUser?.user || authUser?.data?.user || authUser?.data || authUser;
        const av = u?.profile_picture || u?.profilePicture || u?.avatar;
        if (av) return resolveAvatarUrl(av);
      } catch {
        // ignore
      }
    }
    return dummyAvatar;
  }, [user]);

  return (
    <React.Fragment>
      <div className="header-item topbar-user sadar-profile">
        <div
          className="btn d-flex align-items-center"
          style={{ cursor: "default" }}
        >
          <span className="d-flex align-items-center">
            <img
              className="rounded-circle header-profile-user"
              src={avatarUrl}
              alt="Header Avatar"
            />
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {userName}
              </span>
            </span>
          </span>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProfileDropdown;
