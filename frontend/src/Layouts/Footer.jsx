import React from "react";
import { Col, Container, Row } from "reactstrap";
import sadarLogo from "../assets/images/landing/sadar-logo.png";

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid>
          <Row className="align-items-center gy-2">
            <Col sm={6}>
              <div className="sadar-footer-brand">
                <span>{new Date().getFullYear()} &copy;</span>
                <img src={sadarLogo} alt="SADAR" />
              </div>
            </Col>
            <Col sm={6}>
              <div className="sadar-footer-note text-sm-end d-none d-sm-block">
                Kelola uang lebih sadar.
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
