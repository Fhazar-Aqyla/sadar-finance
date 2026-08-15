import PropTypes from "prop-types";
import React from "react";
import { Row, Col, Alert, Card, Container, FormFeedback, Input, Label, Form } from "reactstrap";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { userForgetPassword } from "../../slices/thunks";

// import images
// import profile from "../../assets/images/bg.png";
import AuthSlider from "../AuthenticationInner/authCarousel";
import sadarLogo from "../../assets/images/landing/sadar-logo.png";
import { createSelector } from "reselect";

const ForgetPasswordPage = props => {
  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Format email belum valid").required("Email wajib diisi"),
    }),
    onSubmit: (values) => {
      dispatch(userForgetPassword(values, props.history));
    }
  });

  const selectLayoutState = (state) => state.ForgetPassword;
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (state) => ({
      forgetError: state.forgetError,
      forgetSuccessMsg: state.forgetSuccessMsg,
    })
  );
  // Inside your component
  const {
    forgetError, forgetSuccessMsg
  } = useSelector(selectLayoutProperties);


  React.useEffect(() => {
    document.title = "Reset Password | SADAR Finance";
    document.documentElement.setAttribute("data-bs-theme", "light");
  }, []);

  return (
    <div className="auth-page-wrapper auth-bg-cover sadar-auth-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="bg-overlay"></div>
      <div className="auth-page-content overflow-hidden pt-lg-5">
        <Container>
          <Row>
            <Col lg={12}>
              <Card className="sadar-auth-card overflow-hidden border-0 m-0">
                <Row className="g-0">
                  <AuthSlider />

                  <Col lg={6} className="sadar-auth-form-panel">
                    <Link to="/" aria-label="SADAR Finance" className="sadar-auth-panel-logo">
                      <img src={sadarLogo} alt="SADAR Finance" />
                    </Link>
                    <div className="w-100 p-lg-5 p-4">
                      <div>
                        <h5 className="text-primary">Lupa password?</h5>
                        <p className="text-muted">Masukkan email akun untuk menerima instruksi reset.</p>

                        <lord-icon
                          src="https://cdn.lordicon.com/rhvddzym.json"
                          trigger="loop"
                          colors="primary:#00bd9d"
                          className="avatar-xl"
                          style={{ width: "120px", height: "120px" }}
                        >
                        </lord-icon>

                      </div>

                      <Alert className="border-0 alert-warning text-center mb-2 mx-2" role="alert">
                        Link reset akan dikirim ke email yang terhubung dengan akun SADAR.
                      </Alert>
                      <div className="p-2">
                        {forgetError && forgetError ? (
                          <Alert color="danger" style={{ marginTop: "13px" }}>
                            {forgetError}
                          </Alert>
                        ) : null}
                        {forgetSuccessMsg ? (
                          <Alert color="success" style={{ marginTop: "13px" }}>
                            {forgetSuccessMsg}
                          </Alert>
                        ) : null}
                        <Form
                          onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                          }}
                        >
                          <div className="mb-4">
                            <Label className="form-label">Email</Label>
                            <Input
                              name="email"
                              className="form-control"
                              placeholder="nama@email.com"
                              type="email"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.email || ""}
                              invalid={
                                validation.touched.email && validation.errors.email ? true : false
                              }
                            />
                            {validation.touched.email && validation.errors.email ? (
                              <FormFeedback type="invalid"><div>{validation.errors.email}</div></FormFeedback>
                            ) : null}
                          </div>

                          <div className="text-center mt-4">
                            <button className="btn btn-success w-100" type="submit">Kirim Link Reset</button>
                          </div>
                        </Form>
                      </div>

                      <div className="mt-5 text-center">
                        <p className="mb-0">Sudah ingat password? <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Kembali masuk</Link></p>
                      </div>

                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <footer className="footer">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center">
                <p className="mb-0">&copy; {new Date().getFullYear()} SADAR Finance. Bantu kamu lebih sadar mengatur uang.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
