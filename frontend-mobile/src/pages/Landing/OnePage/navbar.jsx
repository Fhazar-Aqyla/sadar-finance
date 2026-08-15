import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Collapse, Container, NavbarToggler, NavLink } from "reactstrap";
import { Link } from "react-router-dom";

// Import Images
import logodark from "../../../assets/images/logo-dark.png";
import logolight from "../../../assets/images/logo-light.png";

const Navbar = () => {
    const [isOpenMenu, setisOpenMenu] = useState(false);
    const [navClass, setnavClass] = useState("");
    const [activeSection, setActiveSection] = useState("hero");

    const navItems = useMemo(() => [
        { id: "hero", label: "Home" },
        { id: "services", label: "Services" },
        { id: "features", label: "Features" },
        { id: "plans", label: "Plans" },
        { id: "reviews", label: "Reviews" },
        { id: "team", label: "Team" },
        { id: "contact", label: "Contact" },
    ], []);

    const toggle = () => setisOpenMenu(!isOpenMenu);

    const scrollNavigation = useCallback(() => {
        const scrollup = document.documentElement.scrollTop;
        setnavClass(scrollup > 50 ? "is-sticky" : "");
    }, []);

    useEffect(() => {
        const updateActiveSection = () => {
            const scrollPosition = window.scrollY + 80;
            const currentSection = navItems.reduce((current, item) => {
                const section = document.getElementById(item.id);
                if (section && section.offsetTop <= scrollPosition) {
                    return item.id;
                }
                return current;
            }, navItems[0].id);

            setActiveSection(currentSection);
        };

        const handleScroll = () => {
            scrollNavigation();
            updateActiveSection();
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [navItems, scrollNavigation]);

    const handleNavClick = (id) => {
        setActiveSection(id);
        setisOpenMenu(false);
    };

    return (
        <React.Fragment>
            <nav className={"navbar navbar-expand-lg navbar-landing fixed-top " + navClass} id="navbar">
                <Container>
                    <Link className="navbar-brand" to="/index">
                        <img src={logodark} className="card-logo card-logo-dark" alt="logo dark" height="17" />
                        <img src={logolight} className="card-logo card-logo-light" alt="logo light" height="17" />
                    </Link>

                    <NavbarToggler className="navbar-toggler py-0 fs-20 text-dark" onClick={toggle} type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <i className="mdi mdi-menu"></i>
                    </NavbarToggler>

                    <Collapse
                        isOpen={isOpenMenu}
                        className="navbar-collapse"
                        id="navbarSupportedContent"
                    >
                        <ul className="navbar-nav mx-auto mt-2 mt-lg-0" id="navbar-example">
                            {navItems.map((item) => (
                                <li className="nav-item" key={item.id}>
                                    <NavLink
                                        className={`fs-15 ${activeSection === item.id ? "active" : ""}`}
                                        href={`#${item.id}`}
                                        onClick={() => handleNavClick(item.id)}
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>

                        <div className="">
                            <Link to="/login" className="btn btn-link fw-medium text-decoration-none text-dark">Sign
                                in</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </div>
                    </Collapse>
                </Container>
            </nav>
        </React.Fragment>
    );
};

export default Navbar;
