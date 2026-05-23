import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";

const normalizeAccountName = (value) => {
    const name = String(value || "").trim();
    if (!name || name.toLowerCase() === "admin" || name.toLowerCase().includes("themesbrand")) {
        return "Aqyla";
    }
    return name;
};

const ProfileDropdown = () => {
    const user = useSelector((state) => state.Profile?.user ?? {});
    const userName = useMemo(() => {
        const fallbackName = normalizeAccountName(user?.first_name || user?.username || "Aqyla");
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
                "Aqyla"
            );
        } catch (error) {
            return fallbackName;
        }
    }, [user]);

    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };
    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="header-item topbar-user sadar-profile">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={avatar1}
                            alt="Header Avatar" />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{userName}</span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Personal Finance</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Halo, {userName}</h6>
                    <DropdownItem className='p-0'>
                        <Link to= "/profile-account" className="dropdown-item">
                            <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle">Profile & Account</span>
                        </Link>
                    </DropdownItem>
                    <DropdownItem className='p-0'>
                        <Link to= "/financial-score" className="dropdown-item">
                            <i className="mdi mdi-speedometer text-muted fs-16 align-middle me-1"></i> <span
                                className="align-middle">Financial Score</span>
                        </Link>
                    </DropdownItem>
                    <DropdownItem className='p-0'>
                        <Link to= "/behavior-insight" className="dropdown-item">
                            <i className="mdi mdi-lightbulb-on-outline text-muted fs-16 align-middle me-1"></i> <span
                                className="align-middle">Behavior Insight</span>
                        </Link>
                    </DropdownItem>
                    <div className="dropdown-divider"></div>
                    <DropdownItem className='p-0'>
                        <Link to= "/dashboard" className="dropdown-item">
                            <i
                                className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle">Saldo : <b>Rp18,45 jt</b></span>
                        </Link>
                    </DropdownItem >
                    <DropdownItem className='p-0'>
                        <Link to= "/profile-account" className="dropdown-item">
                            <i
                                    className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i> <span
                                        className="align-middle">Pengaturan</span>
                        </Link>
                    </DropdownItem>
                    <DropdownItem className='p-0'>
                        <Link to= "/logout" className="dropdown-item">
                            <i
                                className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle" data-key="t-logout">Logout</span>
                        </Link>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;
