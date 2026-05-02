import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Collapse,
  Container,
  NavbarToggler,
  NavLink,
} from "reactstrap";
import LogoDark from "../../assets/images/logo-dark.png";
import LogoLight from "../../assets/images/logo-light.png";

const Navbar = () => {
  const [isOpenMenu, setisOpenMenu] = useState(false);
  const [navClass, setnavClass] = useState("");
  const [activeSection, setActiveSection] = useState("hero");

  const navItems = useMemo(() => [
    { id: "hero", label: "Home" },
    { id: "process", label: "Process" },
    { id: "categories", label: "Categories" },
    { id: "findJob", label: "Find Jobs" },
    { id: "candidates", label: "Candidates" },
    { id: "blog", label: "Blog" },
  ], []);

  const toggle = () => setisOpenMenu(!isOpenMenu);

  const scrollNavigation = useCallback(() => {
    const scrollup = document.documentElement.scrollTop;
    setnavClass(scrollup > 50 ? " is-sticky" : "");
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
      <nav
        className={
          "navbar navbar-expand-lg navbar-landing fixed-top job-navbar" +
          navClass
        }
        id="navbar"
      >
        <Container fluid className="custom-container">
          <Link className="navbar-brand" to="/index">
            <img
              src={LogoDark}
              className="card-logo card-logo-dark"
              alt="logo dark"
              height="17"
            />
            <img
              src={LogoLight}
              className="card-logo card-logo-light"
              alt="logo light"
              height="17"
            />
          </Link>
          <NavbarToggler
            onClick={toggle}
            className="navbar-toggler py-0 fs-20 text-dark"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="mdi mdi-menu"></i>
          </NavbarToggler>

          <Collapse isOpen={isOpenMenu} className="navbar-collapse" id="navbarSupportedContent">
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

            <div>
              <Link to="/auth-signin-basic" className="btn btn-soft-primary">
                <i className="ri-user-3-line align-bottom me-1"></i> Login &
                Register
              </Link>
            </div>
          </Collapse>
        </Container>
      </nav>
    </React.Fragment>
  );
};

export default Navbar;
