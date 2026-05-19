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
    }, []);

    return (
        <React.Fragment>
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
                                            <h5 className="text-primary">Selamat datang kembali</h5>
                                            <p className="text-muted">Masuk untuk lanjut memantau kondisi keuanganmu.</p>
                                        </div>
                                        {error && error ? (<Alert color="danger"> {error} </Alert>) : null}
                                        <div className="p-2 mt-4">
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
                                                        <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-3">
                                                    <Label className="form-label" htmlFor="password-input">Password</Label>
                                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                                        <Input
                                                            name="password"
                                                            value={validation.values.password || ""}
                                                            type={passwordShow ? "text" : "password"}
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

                                                <div className="d-flex align-items-center justify-content-between gap-3">
                                                    <div className="form-check mb-0">
                                                        <Input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                                                        <Label className="form-check-label" htmlFor="auth-remember-check">Ingat saya</Label>
                                                    </div>
                                                    <Link to="/forgot-password" className="text-muted">Forgot password?</Link>
                                                </div>

                                                <div className="mt-4">
                                                    <Button color="success" disabled={error ? null : loading ? true : false} className="btn btn-success w-100" type="submit">
                                                        {loading ? <Spinner size="sm" className='me-2'> Loading... </Spinner> : null}
                                                        Masuk
                                                    </Button>
                                                </div>


                                            </Form>
                                        </div>

                                <div className="mt-5 text-center">
                                    <p className="mb-0">Belum punya akun? <Link to="/register" className="fw-semibold text-primary text-decoration-underline">Daftar sekarang</Link></p>
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
