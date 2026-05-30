import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

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
        } catch {
            return fallbackName;
        }
    }, [user]);

    return (
        <React.Fragment>
            <div className="header-item topbar-user sadar-profile">
                <div className="btn d-flex align-items-center" style={{ cursor: 'default' }}>
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={avatar1}
                            alt="Header Avatar" />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{userName}</span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Keuangan Pribadi</span>
                        </span>
                    </span>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ProfileDropdown;
