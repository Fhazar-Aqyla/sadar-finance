import React from "react";
import { Col, Container, Row } from "reactstrap";
import sadarLogo from "../assets/images/landing/sadar-logo.png";
import sadarLogoLight from "../assets/images/landing/logo-sadar-light.png";
import logoDbsDicoding from "../assets/images/logo-dbs-dicoding-cropped.png";
import logoCodingCamp from "../assets/images/logo-coding-camp-cropped.png";

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid>
          <Row className="align-items-center gy-2">
            <Col sm={6} xs={12}>
              <div className="sadar-footer-brand">
                <span>{new Date().getFullYear()} &copy;</span>
                <img src={sadarLogo} alt="SADAR" className="sadar-logo-light-mode" />
                <img src={sadarLogoLight} alt="SADAR" className="sadar-logo-dark-mode" />
              </div>
            </Col>
            <Col sm={6} xs={12}>
              <div className="sadar-footer-partners d-flex align-items-center justify-content-start justify-content-sm-end gap-2">
                <span className="sadar-footer-partner-label d-none d-md-inline-block">
                  Didukung oleh:
                </span>
                <div className="sadar-partner-badge" title="DBS Foundation x Dicoding">
                  <img src={logoDbsDicoding} alt="DBS Foundation x Dicoding" />
                </div>
                <div className="sadar-partner-badge" title="Coding Camp 2025 powered by DBS Foundation">
                  <img src={logoCodingCamp} alt="Coding Camp 2025" />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;

