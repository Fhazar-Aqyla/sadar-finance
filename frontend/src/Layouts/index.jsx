import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import withRouter from '../Components/Common/withRouter';


//import Components
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import "../pages/SadarShared/sadar-pages.css";

//import actions
import {
    changeLayout,
    changeSidebarTheme,
    changeLayoutMode,
    changeLayoutWidth,
    changeLayoutPosition,
    changeTopbarTheme,
    changeLeftsidebarSizeType,
    changeLeftsidebarViewType,
    changeSidebarVisibility,
    logoutUser
} from "../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from 'reselect';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';


const Layout = (props) => {
    const [headerClass, setHeaderClass] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        await dispatch(logoutUser());
        setIsLoggingOut(false);
        setShowLogoutModal(false);
        navigate("/login", { replace: true });
    };

    const selectLayoutState = (state) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            layoutType: layout.layoutType,
            leftSidebarType: layout.leftSidebarType,
            layoutModeType: layout.layoutModeType,
            layoutWidthType: layout.layoutWidthType,
            layoutPositionType: layout.layoutPositionType,
            topbarThemeType: layout.topbarThemeType,
            leftsidbarSizeType: layout.leftsidbarSizeType,
            leftSidebarViewType: layout.leftSidebarViewType,
            leftSidebarImageType: layout.leftSidebarImageType,
            preloader: layout.preloader,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
        })
    );
    // Inside your component
    const {
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarImageType,
        preloader,
        sidebarVisibilitytype
    } = useSelector(selectLayoutProperties);
    const scrollNavigation = () => {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setHeaderClass("topbar-shadow");
        } else {
            setHeaderClass("");
        }
    };
    // class add remove in header
    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
        return () => window.removeEventListener("scroll", scrollNavigation, true);
    });
    /*
    layout settings
    */
    useEffect(() => {
        if (
            layoutType ||
            leftSidebarType ||
            layoutModeType ||
            layoutWidthType ||
            layoutPositionType ||
            topbarThemeType ||
            leftsidbarSizeType ||
            leftSidebarViewType ||
            sidebarVisibilitytype
        ) {
            window.dispatchEvent(new Event('resize'));
            dispatch(changeLeftsidebarViewType(leftSidebarViewType));
            dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
            dispatch(changeSidebarTheme(leftSidebarType));
            dispatch(changeLayoutMode(layoutModeType));
            dispatch(changeLayoutWidth(layoutWidthType));
            dispatch(changeLayoutPosition(layoutPositionType));
            dispatch(changeTopbarTheme(topbarThemeType));
            dispatch(changeLayout(layoutType));
            dispatch(changeSidebarVisibility(sidebarVisibilitytype));
        }
    }, [layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        sidebarVisibilitytype,
        dispatch]);
    /*
    call dark/light mode
    */
    const onChangeLayoutMode = (value) => {
        if (changeLayoutMode) {
            dispatch(changeLayoutMode(value));
        }
    };

    useEffect(() => {
        if (sidebarVisibilitytype === 'show' || layoutType === "vertical" || layoutType === "twocolumn") {
            document.querySelector(".hamburger-icon")?.classList.remove('open');
        } else {
            document.querySelector(".hamburger-icon")?.classList.add('open');
        }
    }, [sidebarVisibilitytype, layoutType]);

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header
                    headerClass={headerClass}
                    layoutModeType={layoutModeType}
                    onChangeLayoutMode={onChangeLayoutMode}
                    onLogoutClick={() => setShowLogoutModal(true)}
                />
                <Sidebar
                    layoutType={layoutType}
                />
                <div className="main-content">{props.children}
                    <Footer />
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                toggle={() => setShowLogoutModal(false)}
                centered
                className="sadar-confirm-modal"
            >
                <ModalBody className="text-center">
                    <div className="sadar-confirm-icon danger mx-auto mb-3">
                        <i className="ri-logout-box-r-line"></i>
                    </div>
                    <h4>Konfirmasi Keluar</h4>
                    <p>
                        Apakah Anda yakin ingin keluar dari <strong>SADAR Finance</strong> dan mengakhiri sesi aktif Anda saat ini?
                    </p>
                </ModalBody>
                <ModalFooter className="d-flex flex-nowrap gap-2 p-3 pt-0">
                    <Button
                        color="danger"
                        onClick={handleConfirmLogout}
                        disabled={isLoggingOut}
                        className="w-50 py-2-5 fw-semibold rounded d-flex align-items-center justify-content-center gap-2"
                    >
                        {isLoggingOut ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Memproses Keluar...</span>
                            </>
                        ) : (
                            <>
                                <i className="ri-shut-down-line fs-14"></i>
                                <span>Keluar Sekarang</span>
                            </>
                        )}
                    </Button>
                    <Button
                        color="light"
                        onClick={() => setShowLogoutModal(false)}
                        disabled={isLoggingOut}
                        className="w-50 py-2-5 fw-semibold rounded border"
                    >
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>

    );
};

Layout.propTypes = {
    children: PropTypes.object,
};

export default withRouter(Layout);
