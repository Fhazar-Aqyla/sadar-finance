import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Container, Input, Label, Row } from "reactstrap";
import logoLight from "../../assets/images/logo-light.png";

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="auth-page-wrapper pt-5">
    <div className="auth-one-bg-position auth-one-bg">
      <div className="bg-overlay"></div>
      <div className="shape">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1440 120">
          <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
        </svg>
      </div>
    </div>

    <div className="auth-page-content">
      <Container>
        <Row>
          <Col lg={12}>
            <div className="text-center mt-sm-5 mb-4 text-white-50">
              <Link to="/" className="d-inline-block auth-logo">
                <img src={logoLight} alt="" height="20" />
              </Link>
              <p className="mt-3 fs-15 fw-medium">SADAR Finance</p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="mt-4">
              <CardBody className="p-4">
                <div className="text-center mt-2">
                  <h5 className="text-primary">{title}</h5>
                  <p className="text-muted">{subtitle}</p>
                </div>
                {children}
              </CardBody>
            </Card>
            {footer}
          </Col>
        </Row>
      </Container>
    </div>

    <footer className="footer">
      <Container>
        <Row>
          <Col lg={12}>
            <div className="text-center">
              <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} SADAR Finance.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  </div>
);

const Login = () => {
  useEffect(() => {
    document.title = "Login | SADAR Finance";
  }, []);

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue."
      footer={(
        <div className="mt-4 text-center">
          <p className="mb-0">Don't have an account? <Link to="/register" className="fw-semibold text-primary text-decoration-underline">Sign up</Link></p>
        </div>
      )}
    >
      <form className="p-2 mt-4" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-3">
          <Label htmlFor="email" className="form-label">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter email" defaultValue="admin@themesbrand.com" />
        </div>

        <div className="mb-3">
          <div className="float-end">
            <Link to="/forgot-password" className="text-muted">Forgot password?</Link>
          </div>
          <Label htmlFor="password" className="form-label">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Enter password" defaultValue="123456" />
        </div>

        <div className="form-check">
          <Input className="form-check-input" type="checkbox" id="auth-remember-check" />
          <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
        </div>

        <div className="mt-4">
          <button className="btn btn-success w-100" type="submit">Sign In</button>
        </div>
      </form>
    </AuthShell>
  );
};

const Register = () => {
  useEffect(() => {
    document.title = "Register | SADAR Finance";
  }, []);

  return (
    <AuthShell
      title="Create New Account"
      subtitle="Get your account now."
      footer={(
        <div className="mt-4 text-center">
          <p className="mb-0">Already have an account? <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Sign in</Link></p>
        </div>
      )}
    >
      <form className="p-2 mt-4" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-3">
          <Label htmlFor="register-email" className="form-label">Email</Label>
          <Input id="register-email" name="email" type="email" placeholder="Enter email address" />
        </div>
        <div className="mb-3">
          <Label htmlFor="register-username" className="form-label">Username</Label>
          <Input id="register-username" name="username" type="text" placeholder="Enter username" />
        </div>
        <div className="mb-3">
          <Label htmlFor="register-password" className="form-label">Password</Label>
          <Input id="register-password" name="password" type="password" placeholder="Enter password" />
        </div>
        <div className="mb-4">
          <Label htmlFor="confirm-password" className="form-label">Confirm Password</Label>
          <Input id="confirm-password" name="confirmPassword" type="password" placeholder="Confirm password" />
        </div>
        <button className="btn btn-success w-100" type="submit">Sign Up</button>
      </form>
    </AuthShell>
  );
};

const ForgotPassword = () => {
  useEffect(() => {
    document.title = "Forgot Password | SADAR Finance";
  }, []);

  return (
    <AuthShell
      title="Forgot Password?"
      subtitle="Enter your email and we'll send reset instructions."
      footer={(
        <div className="mt-4 text-center">
          <p className="mb-0">Wait, I remember my password... <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Sign in</Link></p>
        </div>
      )}
    >
      <form className="p-2 mt-4" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-4">
          <Label htmlFor="reset-email" className="form-label">Email</Label>
          <Input id="reset-email" name="email" type="email" placeholder="Enter email" />
        </div>
        <button className="btn btn-success w-100" type="submit">Send Reset Link</button>
      </form>
    </AuthShell>
  );
};

export { ForgotPassword, Login, Register };
