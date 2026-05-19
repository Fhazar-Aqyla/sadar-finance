import React, { useEffect, useState } from "react";
import { Row, Col, Card, Alert, Container, Input, Label, Form, FormFeedback } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// action
import { registerUser, apiError, resetRegisterFlag } from "../../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";

//import images 
import AuthSlider from "../AuthenticationInner/authCarousel";
import sadarLogo from "../../assets/images/landing/sadar-logo.png";
import { createSelector } from "reselect";

const Register = () => {
    const history = useNavigate();
    const dispatch = useDispatch();
    const [passwordShow, setPasswordShow] = useState(false);
    const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            email: '',
            first_name: '',
            password: '',
            confirm_password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Format email belum valid").required("Email wajib diisi"),
            first_name: Yup.string().min(2, "Nama minimal 2 karakter").required("Nama wajib diisi"),
            password: Yup.string()
                .min(8, "Password minimal 8 karakter")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                    "Password harus berisi huruf besar, huruf kecil, angka, dan simbol"
                )
                .required("Password wajib diisi"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref("password")], "Konfirmasi password tidak sama")
                .required("Konfirmasi password wajib diisi"),
        }),
        onSubmit: (values) => {
            dispatch(registerUser(values));
        }
    });

    const selectLayoutState = (state) => state.Account;
    const registerdatatype = createSelector(
        selectLayoutState,
        (account) => ({
            success: account.success,
            error: account.error,
            registrationError: account.registrationError
        })
    );
    // Inside your component
    const {
        error, success, registrationError
    } = useSelector(registerdatatype);

    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setTimeout(() => history("/login"), 3000);
        }

        setTimeout(() => {
            dispatch(resetRegisterFlag());
        }, 3000);

    }, [dispatch, success, error, history]);

    useEffect(() => {
        document.title = "Daftar | SADAR Finance";
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
                                            <h5 className="text-primary">Buat akun SADAR</h5>
                                            <p className="text-muted">Siapkan dashboard keuangan pribadimu dalam beberapa langkah.</p>
                                        </div>
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                className="needs-validation" action="#">

                                                {success && success ? (
                                                    <>
                                                        {toast("Akun berhasil dibuat. Mengarahkan ke halaman masuk...", { position: "top-right", hideProgressBar: false, className: 'bg-success text-white', progress: undefined, toastId: "" })}
                                                        <ToastContainer autoClose={2000} limit={1} />
                                                        <Alert color="success">
                                                            Akun berhasil dibuat. Kamu akan diarahkan ke halaman masuk.
                                                        </Alert>
                                                    </>
                                                ) : null}

                                                {error && error ? (
                                                    <Alert color="danger"><div>
                                                        {registrationError || "Registrasi gagal. Periksa data dan coba lagi."} </div></Alert>
                                                ) : null}

                                                <div className="mb-3">
                                                    <Label htmlFor="useremail" className="form-label">Email <span className="text-danger">*</span></Label>
                                                    <Input
                                                        id="email"
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
                                                <div className="mb-3">
                                                    <Label htmlFor="username" className="form-label">Nama <span className="text-danger">*</span></Label>
                                                    <Input
                                                        name="first_name"
                                                        type="text"
                                                        placeholder="Nama lengkap"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.first_name || ""}
                                                        invalid={
                                                            validation.touched.first_name && validation.errors.first_name ? true : false
                                                        }
                                                    />
                                                    {validation.touched.first_name && validation.errors.first_name ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.first_name}</div></FormFeedback>
                                                    ) : null}

                                                </div>

                                                <div className="mb-3">
                                                    <Label htmlFor="userpassword" className="form-label">Password <span className="text-danger">*</span></Label>
                                                    <div className="position-relative auth-pass-inputgroup">
                                                        <Input
                                                            id="userpassword"
                                                            name="password"
                                                            type={passwordShow ? "text" : "password"}
                                                            placeholder="Minimal 8 karakter, huruf besar, angka, dan simbol"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.password || ""}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.password && validation.errors.password ? (
                                                            <FormFeedback type="invalid"><div>{validation.errors.password}</div></FormFeedback>
                                                        ) : null}
                                                        <button
                                                            className="btn btn-link password-toggle-btn text-decoration-none"
                                                            onClick={() => setPasswordShow(!passwordShow)}
                                                            type="button"
                                                            aria-label={passwordShow ? "Sembunyikan password" : "Tampilkan password"}
                                                        >
                                                            <i className={`${passwordShow ? "ri-eye-off-fill" : "ri-eye-fill"} align-middle`}></i>
                                                        </button>
                                                    </div>

                                                </div>

                                                <div className="mb-2">
                                                    <Label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></Label>
                                                    <div className="position-relative auth-pass-inputgroup">
                                                        <Input
                                                            id="confirmPassword"
                                                            name="confirm_password"
                                                            type={confirmPasswordShow ? "text" : "password"}
                                                            placeholder="Ulangi password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.confirm_password || ""}
                                                            invalid={
                                                                validation.touched.confirm_password && validation.errors.confirm_password ? true : false
                                                            }
                                                        />
                                                        {validation.touched.confirm_password && validation.errors.confirm_password ? (
                                                            <FormFeedback type="invalid"><div>{validation.errors.confirm_password}</div></FormFeedback>
                                                        ) : null}
                                                        <button
                                                            className="btn btn-link password-toggle-btn text-decoration-none"
                                                            onClick={() => setConfirmPasswordShow(!confirmPasswordShow)}
                                                            type="button"
                                                            aria-label={confirmPasswordShow ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                                                        >
                                                            <i className={`${confirmPasswordShow ? "ri-eye-off-fill" : "ri-eye-fill"} align-middle`}></i>
                                                        </button>
                                                    </div>

                                                </div>

                                                <div className="mb-4">
                                                    <p className="mb-0 fs-12 text-muted fst-italic">Dengan mendaftar, kamu menyetujui
                                                        <Link to="/term-conditions" className="text-primary text-decoration-underline fst-normal fw-medium"> ketentuan penggunaan SADAR Finance</Link>.</p>
                                                </div>

                                                <div className="mt-4">
                                                    <button className="btn btn-success w-100" type="submit">Daftar</button>
                                                </div>


                                            </Form>
                                        </div>
                                <div className="mt-5 text-center">
                                    <p className="mb-0">Sudah punya akun? <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Masuk</Link></p>
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

export default Register;
