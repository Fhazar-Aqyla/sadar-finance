import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Input, Label, Row, Button, Form, FormFeedback, Alert, Spinner } from 'reactstrap';
import AuthSlider from "../AuthenticationInner/authCarousel";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// actions
import { loginUser, resetLoginFlag } from "../../slices/thunks";

import { createSelector } from 'reselect';
//import images
import sadarLogo from "../../assets/images/landing/sadar-logo.png";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const selectLayoutState = (state) => state;
    const loginpageData = createSelector(
        selectLayoutState,
        (state) => ({
            user: state.Account.user,
            error: state.Login.error,
            loading: state.Login.loading,
            errorMsg: state.Login.errorMsg,
        })
    );
    // Inside your component
    const {
        user, error, loading, errorMsg
    } = useSelector(loginpageData);

    const [passwordShow, setPasswordShow] = useState(false);

    const defaultAuth = import.meta.env.VITE_DEFAULTAUTH ?? "fake";
    const loginInitialValues = {
        email: defaultAuth === "firebase" ? user?.multiFactor?.user?.email || "" : user?.user?.email || "",
        password: defaultAuth === "firebase" ? "" : user?.user?.confirm_password || "",
        rememberMe: true,
    };

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: loginInitialValues,
        validationSchema: Yup.object({
            email: Yup.string().email("Format email belum valid").required("Email wajib diisi"),
            password: Yup.string().required("Password wajib diisi"),
        }),
        onSubmit: (values) => {
            dispatch(loginUser(values, navigate));
        }
    });

    useEffect(() => {
        if (errorMsg) {
            setTimeout(() => {
                dispatch(resetLoginFlag());
            }, 3000);
        }
    }, [dispatch, errorMsg]);

    useEffect(() => {
        document.title = "Masuk | SADAR Finance";
        document.documentElement.setAttribute("data-bs-theme", "light");
    }, []);

    return (
        <React.Fragment>
            <div className="auth-page-wrapper auth-bg-cover sadar-auth-cover d-flex justify-content-center align-items-center min-vh-100">
                <div className="bg-overlay"></div>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <Card className="sadar-auth-card border-0 m-0">
                                    <Row className="g-0">
                                        <AuthSlider />

                                        <Col lg={6} className="sadar-auth-form-panel">
                                            <div className="sadar-auth-form-container">
                                                <Link to="/" aria-label="SADAR Finance" className="sadar-auth-panel-logo">
                                                    <img src={sadarLogo} alt="SADAR Finance" />
                                                </Link>
                                                <div>
                                                    <h5 className="text-primary">Selamat datang kembali</h5>
                                                    <p className="text-muted">Masuk untuk lanjut memantau kondisi keuanganmu.</p>
                                                </div>
                                                {error && error ? (<Alert color="danger" className="mt-3 mb-2"> {error} </Alert>) : null}
                                                <div className="mt-3">
                                                    <Form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            validation.handleSubmit();
                                                            return false;
                                                        }}
                                                        action="#">

                                                        <div className="mb-3">
                                                            <Label htmlFor="email" className="form-label">Email</Label>
                                                            <Input
                                                                id="email"
                                                                name="email"
                                                                className="form-control"
                                                                placeholder="nama@email.com"
                                                                type="email"
                                                                autoComplete="email"
                                                                onChange={validation.handleChange}
                                                                onBlur={validation.handleBlur}
                                                                value={validation.values.email || ""}
                                                                invalid={
                                                                    validation.touched.email && validation.errors.email ? true : false
                                                                }
                                                            />
                                                            {validation.touched.email && validation.errors.email ? (
                                                                <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                                                            ) : null}
                                                        </div>

                                                        <div className="mb-3">
                                                            <Label className="form-label" htmlFor="password-input">Password</Label>
                                                            <div className="position-relative auth-pass-inputgroup">
                                                                <Input
                                                                    id="password-input"
                                                                    name="password"
                                                                    value={validation.values.password || ""}
                                                                    type={passwordShow ? "text" : "password"}
                                                                    autoComplete="current-password"
                                                                    className="form-control pe-5"
                                                                    placeholder="Masukkan password"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    invalid={
                                                                        validation.touched.password && validation.errors.password ? true : false
                                                                    }
                                                                />
                                                                {validation.touched.password && validation.errors.password ? (
                                                                    <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                                                ) : null}
                                                                <button className="btn btn-link password-toggle-btn text-decoration-none" onClick={() => setPasswordShow(!passwordShow)} type="button" id="password-addon" aria-label={passwordShow ? "Sembunyikan password" : "Tampilkan password"}>
                                                                    <i className={`${passwordShow ? "ri-eye-off-fill" : "ri-eye-fill"} align-middle`}></i>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                                            <div className="form-check mb-0">
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="auth-remember-check"
                                                                    name="rememberMe"
                                                                    checked={validation.values.rememberMe}
                                                                    onChange={validation.handleChange}
                                                                />
                                                                <Label className="form-check-label" htmlFor="auth-remember-check">Ingat saya</Label>
                                                            </div>
                                                            <Link to="/forgot-password" className="text-muted fs-13">Lupa password?</Link>
                                                        </div>

                                                        <div className="mt-3">
                                                            <Button color="success" disabled={error ? null : loading ? true : false} className="btn btn-success w-100" type="submit">
                                                                {loading ? <Spinner size="sm" className='me-2'> Loading... </Spinner> : null}
                                                                Masuk
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                </div>

                                                <div className="mt-4 text-center">
                                                    <p className="mb-0 fs-13">Belum punya akun? <Link to="/register" className="fw-semibold text-primary text-decoration-underline">Daftar sekarang</Link></p>
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
        </React.Fragment>
    );
};

export default Login;
