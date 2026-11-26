import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";

//import images
import dummyAvatar from "../../assets/images/users/user-dummy-img.jpg";
import { getStoredAuthUserRaw } from "../../helpers/auth-storage";

const buildAvatar2dDataUri = (avatarId) => {
  const id = String(avatarId || "").replace(/^avatar2d:/, "");
  const palettes = {
    freelancer: ["#6366f1", "#4338ca", "FL"],
    student: ["#3b82f6", "#1d4ed8", "MH"],
    executive: ["#0f172a", "#1e3a8a", "EX"],
    investor: ["#10b981", "#047857", "IV"],
    saver: ["#14b8a6", "#0f766e", "SV"],
  };
  const [c1, c2] = palettes[id] || ["#1e3a8a", "#14b8a6", "SD"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><circle cx="60" cy="60" r="60" fill="url(#g)"/><circle cx="60" cy="46" r="21" fill="#fde68a"/><path d="M40 36c4-10 36-10 40 0 0-8-8-16-20-16s-20 8-20 16z" fill="#1e293b"/><circle cx="53" cy="46" r="2.6" fill="#0f172a"/><circle cx="67" cy="46" r="2.6" fill="#0f172a"/><path d="M54 54q6 5 12 0" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M28 106c4-22 20-32 32-32s28 10 32 32" fill="#ffffff" fill-opacity="0.9"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const resolveAvatarUrl = (url) => {
  if (!url) return dummyAvatar;
  if (String(url).startsWith("avatar2d:")) return buildAvatar2dDataUri(url);
  if (/^(https?:|data:)/i.test(url)) return url;
  return `${url.startsWith("/") ? "" : "/"}${url}`;
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
    const storedUser = getStoredAuthUserRaw();

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
    const storedUser = getStoredAuthUserRaw();

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

    const storedUser = getStoredAuthUserRaw();
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
      </D