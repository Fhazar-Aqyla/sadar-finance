import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

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

const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ri-home-5-line' },
    { label: 'Insight', href: '/behavior-insight', icon: 'ri-pulse-line' },
    { label: 'Catat', href: '/catat-keuangan', icon: 'ri-add-line', primary: true },
    { label: 'Riwayat', href: '/financial-history', icon: 'ri-file-list-3-line' },
];

const mobileMoreItems = [
    {
        label: 'Skor Finansial',
        description: 'Lihat kesehatan dan faktor skor keuangan',
        href: '/financial-score',
        icon: 'ri-bar-chart-box-line',
    },
    {
        label: 'Profil & Akun',
        description: 'Kelola identitas, rekening, dan preferensi',
        href: '/profile-account',
        icon: 'ri-user-settings-line',
    },
];

const Header = ({ onChangeLayoutMode, layoutModeType, headerClass, onLogoutClick }) => {
    const dispatch = useDispatch();
    const location = useLocation();

    const selectDashboardData = createSelector(
        (state) => state.Layout,
        (sidebarVisibilitytype) => sidebarVisibilitytype.sidebarVisibilitytype
    );
    // Inside your component
    const sidebarVisibilitytype = useSelector(selectDashboardData);

    const [search, setSearch] = useState(false);
    const [moreMenu, setMoreMenu] = useState(false);
    const toogleSearch = () => setSearch((isOpen) => !isOpen);

    useEffect(() => {
        if (!search) return undefined;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setSearch(false);
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [search]);

    useEffect(() => {
        if (!moreMenu) return undefined;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMoreMenu(false);
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [moreMenu]);

    const toogleMenuBtn = () => {
        var windowSize = document.documentElement.clientWidth;

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

                            <Link to="/dashboard" className="sadar-mobile-header-brand" aria-label="SADAR Finance - Dashboard">
                                <img src={sadarLogo} alt="SADAR" />
                            </Link>

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
                                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger d-none d-lg-inline-flex"
                                id="topnav-hamburger-icon"
                                aria-label="Buka atau tutup sidebar">
                                <span className="hamburger-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>


                            <SearchOption />
                        </div>

                        <div className="d-flex align-items-center sadar-topbar-actions">

                            <div className="topbar-head-dropdown header-item sadar-mobile-search">
                                <button
                                    type="button"
                                    className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                                    onClick={toogleSearch}
                                    aria-label="Buka pencarian"
                                    aria-expanded={search}
                                    aria-controls="sadar-mobile-search-dialog"
                                >
                                    <i className="bx bx-search fs-22"></i>
                                </button>
                            </div>

                            <FullScreenDropdown />
                            <LightDark layoutMode={layoutModeType} onChangeLayoutMode={onChangeLayoutMode} />
                            <NotificationDropdown />
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>

            </header>

            {search && createPortal(
                <div className="sadar-mobile-search-layer">
                    <button
                        type="button"
                        className="sadar-mobile-search-backdrop"
                        onClick={() => setSearch(false)}
                        aria-label="Tutup pencarian"
                    />
                    <section
                        id="sadar-mobile-search-dialog"
                        className="sadar-mobile-search-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="sadar-mobile-search-title"
                    >
                        <div className="sadar-mobile-sheet-handle" aria-hidden="true" />
                        <div className="sadar-mobile-search-heading">
                            <div>
                                <strong id="sadar-mobile-search-title">Cari di SADAR</strong>
                                <span>Temukan fitur dan catatan keuangan</span>
                            </div>
                            <button type="button" onClick={() => setSearch(false)} aria-label="Tutup pencarian">
                                <i className="ri-close-line" aria-hidden="true"></i>
                            </button>
                        </div>
                        <SearchOption
                            className="sadar-app-search-mobile"
                            autoFocus
                            inputId="search-options-mobile"
                            onNavigate={() => setSearch(false)}
                            placeholder="Cari fitur atau transaksi"
                        />
                    </section>
                </div>,
                document.body
            )}

            {moreMenu && createPortal(
                <div className="sadar-mobile-more-layer">
                    <button
                        type="button"
                        className="sadar-mobile-more-backdrop"
                        onClick={() => setMoreMenu(false)}
                        aria-label="Tutup menu lainnya"
                    />
                    <section className="sadar-mobile-more-sheet" role="dialog" aria-modal="true" aria-labelledby="sadar-mobile-more-title">
                        <div className="sadar-mobile-sheet-handle" aria-hidden="true" />
                        <div className="sadar-mobile-more-heading">
                            <div>
                                <span>Menu SADAR</span>
                                <strong id="sadar-mobile-more-title">Fitur lainnya</strong>
                            </div>
                            <button type="button" onClick={() => setMoreMenu(false)} aria-label="Tutup menu lainnya">
                                <i className="ri-close-line" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="sadar-mobile-more-grid">
                            {mobileMoreItems.map((item) => (
                                <Link key={item.href} to={item.href} className="sadar-mobile-more-item" onClick={() => setMoreMenu(false)}>
                                    <span className="sadar-mobile-more-icon" aria-hidden="true"><i className={item.icon} /></span>
                                    <span className="sadar-mobile-more-copy">
                                        <strong>{item.label}</strong>
                                        <small>{item.description}</small>
                                    </span>
                                    <i className="ri-arrow-right-s-line sadar-mobile-more-arrow" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="sadar-mobile-logout-button"
                            onClick={() => {
                                setMoreMenu(false);
                                onLogoutClick?.();
                            }}
                        >
                            <span className="sadar-mobile-logout-icon" aria-hidden="true"><i className="ri-logout-box-r-line" /></span>
                            <span>
                                <strong>Keluar</strong>
                                <small>Akhiri sesi dengan aman</small>
                            </span>
                            <i className="ri-arrow-right-s-line" aria-hidden="true" />
                        </button>
                    </section>
                </div>,
                document.body
            )}

            <nav className="sadar-mobile-bottom-nav" aria-label="Navigasi utama mobile">
                <div className="sadar-mobile-bottom-nav-surface">
                    {mobileNavItems.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`sadar-mobile-bottom-link${isActive ? ' is-active' : ''}${item.primary ? ' is-primary' : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <span className="sadar-mobile-bottom-icon" aria-hidden="true">
                                    <i className={item.icon}></i>
                                </span>
                                <span className="sadar-mobile-bottom-label">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        className={`sadar-mobile-bottom-link sadar-mobile-more-trigger${moreMenu || mobileMoreItems.some((item) => location.pathname.startsWith(item.href)) ? ' is-active' : ''}`}
                        onClick={() => setMoreMenu(true)}
                        aria-expanded={moreMenu}
                        aria-haspopup="dialog"
                    >
                        <span className="sadar-mobile-bottom-icon" aria-hidden="true"><i className="ri-apps-2-line" /></span>
                        <span className="sadar-mobile-bottom-label">Lainnya</span>
                    </button>
                </div>
            </nav>
        </React.Fragment>
    );
};

export default Header;
