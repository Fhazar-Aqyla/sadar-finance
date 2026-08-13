import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";

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

const normalizeAccountEmail = (value) => {
  const email = String(value || "").trim();
  if (!email || email.toLowerCase().includes("themesbrand")) {
    return "aqyla@example.com";
  }
  return email;
};

const ProfileDropdown = ({ onLogoutClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.Profile?.user ?? {});

  const userName = useMemo(() => {
    const fallbackName = normalizeAccountName(
      user?.first_name || user?.username || "Aqyla",
    );
    const storedUser = sessionStorage.getItem("authUser");

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

  const userEmail = useMemo(() => {
    const fallbackEmail = normalizeAccountEmail(user?.email);
    const storedUser = sessionStorage.getItem("authUser");

    if (!storedUser) {
      return fallbackEmail;
    }

    try {
      const authUser = JSON.parse(storedUser);
      const u =
        authUser?.user || authUser?.data?.user || authUser?.data || authUser;

      return normalizeAccountEmail(
        user?.email ||
          u?.email ||
          authUser?.user?.email ||
          authUser?.data?.email ||
          authUser?.email ||
          "aqyla@example.com",
      );
    } catch {
      return fallbackEmail;
    }
  }, [user]);

  const avatarUrl = useMemo(() => {
    const rawAvatar =
      user?.profile_picture || user?.profilePicture || user?.avatar;
    if (rawAvatar) return resolveAvatarUrl(rawAvatar);

    const storedUser = sessionStorage.getItem("authUser");
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

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogoutClick) {
      onLogoutClick();
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={() => setIsOpen((prev) => !prev)}
      className="header-item topbar-user sadar-profile"
    >
      <DropdownToggle
        tag="button"
        type="button"
        className="btn d-flex align-items-center"
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
            <i className="mdi mdi-chevron-down d-none d-xl-inline-block fs-14 ms-1 text-muted"></i>
          </span>
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end sadar-profile-menu" style={{ minWidth: "220px" }}>
        <div className="d-flex align-items-center gap-2 px-3 py-2 border-bottom">
          <img
            className="rounded-circle header-profile-user"
            src={avatarUrl}
            alt="Avatar"
          />
          <div className="flex-grow-1 min-width-0">
            <h6 className="m-0 text-truncate fs-14">{userName}</h6>
            <p className="m-0 text-truncate fs-12 text-muted">{userEmail}</p>
          </div>
        </div>
        <Link
          to="/profile-account"
          className="dropdown-item d-flex align-items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <i className="ri-user-settings-line fs-15"></i>
          <span>Profil & Akun</span>
        </Link>
        <div className="dropdown-divider"></div>
        <button
          type="button"
          className="dropdown-item d-flex align-items-center gap-2 text-danger"
          onClick={handleLogoutClick}
        >
          <i className="ri-logout-box-r-line fs-15"></i>
          <span>Keluar</span>
        </button>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
