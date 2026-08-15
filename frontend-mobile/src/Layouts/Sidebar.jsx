import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Edit3,
  Home,
  LogOut,
  Menu,
  ReceiptText,
  User,
  X,
} from "lucide-react";
import sadarLogo from "../assets/images/landing/sadar-logo.png";
import sadarLogoLight from "../assets/images/landing/logo-sadar-light.png";

const navigationItems = [
  { id: "dashboard", name: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "catat-keuangan", name: "Catat Keuangan", icon: Edit3, href: "/catat-keuangan" },
  { id: "behavior-insight", name: "Insight Perilaku", icon: Activity, href: "/behavior-insight" },
  { id: "financial-score", name: "Skor Finansial", icon: BarChart3, href: "/financial-score" },
  { id: "financial-history", name: "Riwayat Keuangan", icon: ReceiptText, href: "/financial-history" },
  { id: "profile-account", name: "Profil", icon: User, href: "/profile-account" },
];

const sidebarWidths = {
  expanded: 280,
  collapsed: 84,
};

const Sidebar = ({ className = "", onLogoutClick }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    document.documentElement.getAttribute("data-sidebar-size") === "sm",
  );

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 992);
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
    if (window.innerWidth >= 992) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      setIsOpen(document.body.classList.contains("vertical-sidebar-enable"));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname]);

  const toggleSidebar = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    document.body.classList.toggle("vertical-sidebar-enable", nextOpen);
  };

  const handleItemClick = () => {
    if (window.innerWidth < 992) {
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
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`sadar-sidebar fixed left-0 top-0 z-40 hidden lg:flex h-screen flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
        style={{ width: isCollapsed ? sidebarWidths.collapsed : sidebarWidths.expanded }}
      >
        <div className="sadar-sidebar-brand relative flex h-[104px] shrink-0 items-center justify-center border-b border-slate-200 bg-slate-50/60 px-5">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex min-w-0 items-center no-underline">
              <img src={sadarLogo} alt="SADAR" className="sadar-logo-light-mode h-auto w-[104px] object-contain" />
              <img src={sadarLogoLight} alt="SADAR" className="sadar-logo-dark-mode h-auto w-[104px] object-contain" />
            </Link>
          )}

          {isCollapsed && (
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm"
              aria-label="SADAR Finance"
            >
              <img src={sadarLogo} alt="SADAR" className="sadar-logo-light-mode h-6 w-6 object-cover object-left" />
              <img src={sadarLogoLight} alt="SADAR" className="sadar-logo-dark-mode h-6 w-6 object-cover object-left" />
            </Link>
          )}

          <button
            onClick={toggleSidebar}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 border-0 bg-transparent hover:bg-slate-200/50 lg:hidden flex items-center justify-center transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-slate-500 hover:text-slate-700" />
          </button>
        </div>

        <nav className="sadar-sidebar-nav min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-6">
          <ul className="m-0 list-none space-y-1 p-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveItem(item);

              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={handleItemClick}
                    className={`sadar-sidebar-link group relative flex w-full items-center rounded-md px-3 py-2.5 text-left no-underline transition-all duration-200 ${
                      isCollapsed ? "justify-center px-2" : "gap-2.5"
                    } ${
                      isActive
                        ? "sadar-sidebar-link-active bg-blue-50 !text-blue-700 dark:bg-blue-950/40 dark:!text-blue-400"
                        : "!text-slate-800 hover:bg-slate-50 hover:!text-blue-700 dark:!text-slate-200 dark:hover:bg-slate-800/40 dark:hover:!text-blue-400"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex min-w-[24px] items-center justify-center">
                      <Icon
                        className={`sadar-sidebar-icon h-4 w-4 flex-shrink-0 ${
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

        <div className="sadar-sidebar-footer mt-auto shrink-0 border-t border-slate-200 bg-white">
          <div className={isCollapsed ? "flex h-[66px] items-center justify-center p-3" : "flex h-[66px] items-center p-3"}>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                if (onLogoutClick) {
                  onLogoutClick();
                }
              }}
              className={`sadar-sidebar-logout group relative flex w-full items-center rounded-md text-left no-underline transition-all duration-200 !text-red-600 hover:bg-red-50 hover:!text-red-700 dark:!text-red-400 dark:hover:bg-red-950/30 dark:hover:!text-red-300 ${
                isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"
              }`}
              title={isCollapsed ? "Keluar" : undefined}
            >
              <div className="flex min-w-[22px] items-center justify-center">
                <LogOut className="h-4 w-4 flex-shrink-0 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300" />
              </div>

              {!isCollapsed && <span className="text-sm text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300">Keluar</span>}

              {isCollapsed && (
                <div className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  Keluar
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
