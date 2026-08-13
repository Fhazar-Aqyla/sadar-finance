import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';

//import Components
import SearchOption from '../Components/Common/SearchOption';
import FullScreenDropdown from '../Components/Common/FullScreenDropdown';
import LightDark from '../Components/Common/LightDark';
import NotificationDropdown from '../Components/Common/NotificationDropdown';
import ProfileDropdown from '../Components/Common/ProfileDropdown';
import sadarLogo from '../assets/images/landing/sadar-logo.png';

import { changeSidebarVisibility } from '../slices/thunks';
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from 'reselect';

const Header = ({ onChangeLayoutMode, layoutModeType, headerClass, onLogoutClick }) => {
    const dispatch = useDispatch();

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
                                        <SearchOption className="sadar-app-search-mobile" autoFocus onNavigate={toogleSearch} />
                                    </div>
                                </DropdownMenu>
                            </Dropdown>

                            <div className="d-none d-md-block">
                                <FullScreenDropdown />
                            </div>
                            <LightDark layoutMode={layoutModeType} onChangeLayoutMode={onChangeLayoutMode} />
                            <NotificationDropdown />
                            <ProfileDropdown onLogoutClick={onLogoutClick} />
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <nav
                        className="d-md-none absolute left-0 right-0 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-lg flex flex-col gap-1 p-3 z-50"
                        style={{ top: "100%" }}
                        aria-label="Menu Mobile"
                    >
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
                    </nav>
                )}
            </header>
        </React.Fragment>
    );
};

export default Header;
