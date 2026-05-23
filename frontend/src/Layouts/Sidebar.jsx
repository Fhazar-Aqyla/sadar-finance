import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import sadarLogo from "../assets/images/landing/sadar-logo.png";

const navigationItems = [
  { id: "dashboard", name: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "catat-keuangan", name: "Catat Keuangan", icon: Edit3, href: "/catat-keuangan" },
  { id: "behavior-insight", name: "Behavior Insight", icon: Activity, href: "/behavior-insight" },
  { id: "financial-score", name: "Financial Score", icon: BarChart3, href: "/financial-score" },
  { id: "profile-account", name: "Profile & Account", icon: User, href: "/profile-account" },
];

const sidebarWidths = {
  expanded: 280,
  collapsed: 84,
};

const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("authUser") || "null");
  } catch (error) {
    return null;
  }
};

const getInitials = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const normalizeAccountName = (value) => {
  const name = String(value || "").trim();
  if (!name || name.toLowerCase() === "admin" || name.toLowerCase().includes("themesbrand")) {
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

const Sidebar = ({ className = "" }) => {
  const location = useLocation();
  const profileUser = useSelector((state) => state.Profile?.user ?? {});
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    document.documentElement.getAttribute("data-sidebar-size") === "sm",
  );

  const userName = useMemo(() => {
    const storedUser = getStoredUser();

    return normalizeAccountName(
      profileUser?.first_name ||
      profileUser?.username ||
      storedUser?.user?.first_name ||
      storedUser?.user?.username ||
      storedUser?.data?.first_name ||
      storedUser?.data?.username ||
      storedUser?.first_name ||
      storedUser?.username ||
      storedUser?.user?.email ||
      storedUser?.email ||
      "Aqyla"
    );
  }, [profileUser]);

  const userEmail = useMemo(() => {
    const storedUser = getStoredUser();

    return normalizeAccountEmail(
      profileUser?.email ||
      storedUser?.user?.email ||
      storedUser?.data?.email ||
      storedUser?.email ||
      "aqyla@example.com"
    );
  }, [profileUser]);

  const userInitials = getInitials(userName) || "AF";

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--vz-vertical-menu-width",
      `${sidebarWidths.expanded}px`,
    );
    document.documentElement.style.setProperty(
      "--vz-vertical-menu-width-sm",
      `${sidebarWidths.collapsed}px`,
    );
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsCollapsed(document.documentElement.getAttribute("data-sidebar-size") === "sm");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-sidebar-size"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shouldShowMobile = document.body.classList.contains("vertical-sidebar-enable");
    if (window.innerWidth < 768) {
      setIsOpen(shouldShowMobile);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    document.body.classList.toggle("vertical-sidebar-enable", nextOpen);
  };

  const toggleCollapse = () => {
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    document.documentElement.setAttribute("data-sidebar-size", nextCollapsed ? "sm" : "lg");
  };

  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
      document.body.classList.remove("vertical-sidebar-enable");
    }
  };

  const isActiveItem = (item) => {
    return (
      location.pathname === item.href ||
      (item.href === "/dashboard" && ["/", "/index"].includes(location.pathname))
    );
  };

  return (
    <React.Fragment>
      <button
        onClick={toggleSidebar}
        className="fixed left-6 top-6 z-50 rounded-lg border border-slate-100 bg-white p-3 shadow-md transition-all duration-200 hover:bg-slate-50 md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
        style={{ width: isCollapsed ? sidebarWidths.collapsed : sidebarWidths.expanded }}
      >
        <div className="relative flex h-[104px] shrink-0 items-center justify-center border-b border-slate-200 bg-slate-50/60 px-5">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex min-w-0 items-center no-underline">
              <img src={sadarLogo} alt="SADAR" className="h-auto w-[104px] object-contain" />
            </Link>
          )}

          {isCollapsed && (
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm"
              aria-label="SADAR Finance"
            >
              <img src={sadarLogo} alt="SADAR" className="h-6 w-6 object-cover object-left" />
            </Link>
          )}

          <button
            onClick={toggleCollapse}
            className="absolute right-5 hidden rounded-md p-1.5 transition-all duration-200 hover:bg-slate-100 md:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            )}
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-6">
          <ul className="m-0 list-none space-y-1 p-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveItem(item);

              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={handleItemClick}
                    className={`group relative flex w-full items-center rounded-md px-3 py-2.5 text-left no-underline transition-all duration-200 ${
                      isCollapsed ? "justify-center px-2" : "gap-2.5"
                    } ${
                      isActive
                        ? "bg-blue-50 !text-blue-700"
                        : "!text-slate-800 hover:bg-slate-50 hover:!text-blue-700"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex min-w-[24px] items-center justify-center">
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? "text-blue-600" : "text-slate-600 group-hover:text-blue-600"
                        }`}
                      />
                    </div>

                    {!isCollapsed && (
                      <span className={`truncate text-sm ${isActive ? "font-medium" : "font-normal"}`}>
                        {item.name}
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                        {item.name}
                        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1 -translate-y-1/2 rotate-45 bg-slate-800" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto shrink-0 border-t border-slate-200 bg-white">
          <div className={`h-[86px] border-b border-slate-200 bg-slate-50/30 ${isCollapsed ? "flex items-center justify-center px-2" : "flex items-center p-3"}`}>
            {!isCollapsed ? (
              <Link
                to="/profile-account"
                className="flex items-center rounded-md bg-white px-3 py-2 no-underline transition-colors duration-200 hover:bg-slate-50"
              >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-medium text-slate-700">{userInitials}</span>
                </div>
                <div className="ml-2.5 min-w-0 flex-1">
                  <p className="mb-0 truncate text-sm font-medium text-slate-800">{userName}</p>
                  <p className="mb-0 truncate text-xs text-slate-500">{userEmail}</p>
                </div>
                <div className="ml-2 h-2 w-2 rounded-full bg-green-500" title="Online" />
              </Link>
            ) : (
              <Link to="/profile-account" className="flex justify-center" aria-label="Profile & Account">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                    <span className="text-sm font-medium text-slate-700">{userInitials}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
              </Link>
            )}
          </div>

          <div className={isCollapsed ? "flex h-[66px] items-center justify-center p-3" : "flex h-[66px] items-center p-3"}>
            <Link
              to="/logout"
              className={`group relative flex w-full items-center rounded-md text-left no-underline transition-all duration-200 !text-red-600 hover:bg-red-50 hover:!text-red-700 ${
                isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"
              }`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <div className="flex min-w-[22px] items-center justify-center">
                <LogOut className="h-4 w-4 flex-shrink-0 !text-red-500 group-hover:!text-red-600" />
              </div>

              {!isCollapsed && <span className="text-sm !text-red-600 group-hover:!text-red-700">Logout</span>}

              {isCollapsed && (
                <div className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  Logout
                  <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1 -translate-y-1/2 rotate-45 bg-slate-800" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Sidebar;
