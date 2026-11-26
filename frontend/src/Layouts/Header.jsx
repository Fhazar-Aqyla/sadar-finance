import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import { LogOut, User } from 'lucide-react';

//import Components
import SearchOption from '../Components/Common/SearchOption';
import FullScreenDropdown from '../Components/Common/FullScreenDropdown';
import LightDark from '../Components/Common/LightDark';
import NotificationDropdown from '../Components/Common/NotificationDropdown';
import sadarLogo from '../assets/images/landing/sadar-logo.png';
import dummyAvatar from '../assets/images/users/user-dummy-img.jpg';

import { changeSidebarVisibility } from '../slices/thunks';
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from 'reselect';
import { getStoredAuthUser } from '../helpers/auth-storage';

const getStoredUser = () => {
    return getStoredAuthUser();
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

const buildAvatar2dDataUri = (avatarId) => {
    const id = String(avatarId || "").replace(/^avatar2d:/, "");
    const palettes = {
        freelancer: ["#6366f1", "#4338ca"],
        student: ["#3b82f6", "#1d4ed8"],
        executive: ["#0f172a", "#1e3a8a"],
        investor: ["#10b981", "#047857"],
        saver: ["#14b8a6", "#0f766e"],
    };
    const [c1, c2] = palettes[id] || ["#1e3a8a", "#14b8a6"];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><circle cx="60" cy="60" r="60" fill="url(#g)"/><circle cx="60" cy="46" r="21" fill="#fde68a"/><path d="M40 36c4-10 36-10 40 0 0-8-8-16-20-16s-20 8-20 16z" fill="#1e293b"/><circle cx="53" cy="46" r="2.6" fill="#0f172a"/><circle cx="67" cy="46" r="2.6" fill="#0f172a"/><path d="M54 54q6 5 12 0" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M28 106c4-22 20-32 32-32s28 10 32 32" fill="#ffffff" fill-opacity="0.9"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const resolveAvatarUrl = (url) => {
    if (!url) return dummyAvatar;
    if (String(url).startsWith("avatar2d:")) return buildAvatar2dDataUri(url);
    if (/^(https?:|data:)/i.test(url)) return url;
    return `${url.startsWith("/") ? "" : "/"}${url}`;
};

const Header = ({ onChangeLayoutMode, layoutModeType, headerClass, onLogoutClick }) => {
    const dispatch = useDispatch();
    const profileUser = useSelector((state) => state.Profile?.user ?? {});

    const selectDashboardData = createSelector(
        (state) => state.Layout,
        (sidebarVisibilitytype) => sidebarVisibilitytype.sidebarVisibilitytype
    );
    // Inside your component
    const sidebarVisibilitytype = useSelector(selectDashboardData);

    const [search, setSearch] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toogleSearch = () => {
        setSearch(!search);
    };

    const userName = (() => {
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
    })();

    const userEmail = (() => {
        const storedUser = getStoredUser();
        return normalizeAccountEmail(
            profileUser?.email ||
            storedUser?.user?.email ||
            storedUser?.data?.email ||
            storedUser?.email ||
            "aqyla@example.com"
        );
    })();

    const userAvatar = resolveAvatarUrl(profileUser?.profile_image || profileUser?.avatar || dummyAvatar);

    const toogleMenuBtn = () => {
        var windowSize = document.documentElement.clientWidth;
        
        if (windowSize <= 767) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            return;
        }

        dispatch(changeSidebarVisibility("show"));

        if (windowSize > 767)
            document.querySelector(".hamburger-icon").classList.toggle('open');

        //For collapse horizontal menu
        if (document.documentElement.getAttribute('data-layout') === "horizontal") {
            document.body.classList.contains("menu") ? document.body.classList.remove("menu") : document.body.classList.add("menu");
        }

        //For collapse vertical and semibox menu
        if (sidebarVisibilitytype === "show" && (document.documentElement.getAttribute('data-layout') === "vertical" || document.documentElement.getAttribute('data-layout') === "semibox")) {
            if (windowSize < 1025 && windowSize > 767) {
                document.body.classList.remove('vertical-sidebar-enable');
                (document.documentElement.getAttribute('data-sidebar-size') === 'sm') ? document.documentElement.setAttribute('data-sidebar-size', '') : document.documentElement.setAttribute('data-sidebar-size', 'sm');
            } else if (windowSize > 1025) {
                document.body.classList.remove('vertical-sidebar-enable');
                (document.documentElement.getAttribute('data-sidebar-size') === 'lg') ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'lg');
            } else if (windowSize <= 767) {
                document.body.classList.toggle('vertical-sidebar-enable');
                document.documentElement.setAttribute('data-sidebar-size', 'lg');
            }
        }


        //Two column menu
        if (document.documentElement.getAttribute('data-layout') === "twocolumn") {
            document.body.classList.contains('twocolumn-panel') ? document.body.classList.remove('twocolumn-panel') : document.body.classList.add('twocolumn-panel');
        }
    };

    return (
        <React.Fragment>
            <header id="page-topbar" className={headerClass}>
                <div className="layout-width">
                    <div className="navbar-header">
                        <div className="d-flex align-items-center flex-grow-1 min-width-0 sadar-topbar-left">

                            <div className="navbar-brand-box horizontal-logo">
                                <Link to="/" className="logo logo-dark">
                                    <span className="logo-sm">
                                        <img src={sadarLogo} alt="SADAR" className="sadar-brand-logo sadar-brand-logo-sm" />
                                    </span>
                                    <span className="logo-lg">
                                        <img src={sadarLogo} alt="SADAR" className="sadar-brand-logo" />
                                    </span>
                                </Link>

                                <Link to="/" className="logo logo-light">
                                    <span className="logo-sm">
                                        <img src={sadarLogo} alt="SADAR" className="sadar-brand-logo sadar-brand-logo-sm" />
                                    </span>
                                    <span className="logo-lg">
                                        <img src={sadarLogo} alt="SADAR" className="sadar-brand-logo" />
                                    </span>
                                </Link>
                            </div>

                            <button
                                onClick={toogleMenuBtn}
                                type="button"
                                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                                id="topnav-hamburger-icon">
                                <span className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>


                            <SearchOption />
                        </div>

                        <div className="d-flex align-items-center sadar-topbar-actions">

                            <Dropdown isOpen={search} toggle={toogleSearch} className="d-md-none topbar-head-dropdown header-item">
                                <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                                    <i className="bx bx-search fs-22"></i>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                                    <div className="p-3">
                                        <SearchOption className="sadar-app-search-mobile" autoFocus inputId="search-options-mobile" onNavigate={toogleSearch} />
                                    </div>
                                </DropdownMenu>
                            </Dropdown>

                            <div className="d-none d-md-block">
                                <FullScreenDropdown />
                            </div>
                            <LightDark layoutMode={layoutModeType} onChangeLayoutMode={onChangeLayoutMode} />
                            <NotificationDropdown />
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <nav
                        className="d-md-none absolute left-0 right-0 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-lg flex flex-col gap-1 p-3 z-50"
                        style={{ top: "100%" }}
                        aria-label="Menu Mobile"
                    >
                        <div className="mb-1 flex items-center gap-3 rounded-lg bg-slate-50/80 p-3">
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = dummyAvatar;
                                }}
                            />
                            <span className="flex-grow-1 min-w-0">
                                <span className="block truncate text-sm font-semibold !text-slate-800 dark:!text-slate-100">
                                    {userName}
                                </span>
                                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                    {userEmail}
                                </span>
                            </span>
                        </div>

                        {[
                            { name: "Dashboard", href: "/dashboard" },
                            { name: "Catat Keuangan", href: "/catat-keuangan" },
                            { name: "Insight Perilaku", href: "/behavior-insight" },
                            { name: "Skor Finansial", href: "/financial-score" },
                            { name: "Riwayat Keuangan", href: "/financial-history" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2.5 rounded-lg text-[13px] font-semibold no-underline transition-all duration-200 flex items-center justify-between text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                            >
                                <span>{item.name}</span>
                                <i className="ri-arrow-right-s-line text-slate-400"></i>
                            </Link>
                        ))}

                        <div className="mt-1 border-t border-slate-200 pt-1 dark:border-slate-800">
                            <Link
                                to="/profile-account"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold no-underline transition-all duration-200 text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                            >
                                <User className="h-4 w-4 flex-shrink-0" size={16} />
                                <span>Profil & Akun</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (onLogoutClick) onLogoutClick();
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold no-underline transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <LogOut className="h-4 w-4 flex-shrink-0" size={16} />
                                <span>Keluar</span>
                            </button>
                        </div>
                    </nav>
                )}
            </header>
        </React.Fragment>
    );
};

export default Header;
