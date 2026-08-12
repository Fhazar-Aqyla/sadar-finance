import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Container, Row, Col } from "reactstrap";
import { logoutUser } from "../../slices/thunks";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  React.useEffect(() => {
    document.title = "Konfirmasi Keluar | SADAR Finance";
  }, []);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const handleCancelLogout = () => {
    // Go back in history if possible, otherwise redirect to dashboard
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="sadar-logout-wrapper" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 10% 20%, rgb(242, 246, 253) 0%, rgb(224, 233, 248) 90.1%)",
      padding: "24px",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{
              backdropFilter: "blur(16px) saturate(180%)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(209, 213, 219, 0.3)"
            }}>
              <CardBody className="p-5 text-center">
                {/* Glowing Circle Icon */}
                <div className="d-inline-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle mb-4" style={{
                  width: "72px",
                  height: "72px",
                  boxShadow: "0 8px 24px rgba(239, 68, 68, 0.15)",
                }}>
                  <i className="ri-logout-box-r-line" style={{ fontSize: "32px" }}></i>
                </div>

                <h3 className="fw-bold text-dark mb-3">Konfirmasi Keluar</h3>
                <p className="text-muted fs-14 mb-4" style={{ lineHeight: "1.6" }}>
                  Apakah Anda yakin ingin keluar dari <strong>SADAR Finance</strong> dan mengakhiri sesi aktif Anda saat ini?
                </p>

                <div className="d-flex flex-column gap-2">
                  <Button 
                    color="danger" 
                    onClick={handleConfirmLogout} 
                    disabled={isLoggingOut}
                    className="w-100 py-2-5 fw-semibold rounded shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Memproses Keluar...</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-shut-down-line fs-16"></i>
                        <span>Keluar Sekarang</span>
                      </>
                    )}
                  </Button>

                  <Button 
                    color="light" 
                    onClick={handleCancelLogout}
                    disabled={isLoggingOut}
                    className="w-100 py-2-5 fw-semibold rounded border shadow-sm"
                  >
                    Batal & Kembali
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Logout;
