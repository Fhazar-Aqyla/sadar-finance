import React from "react";
import { CardBody, Row, Col, Card, Table, CardHeader,Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { Link } from "react-router-dom";

import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

const InvoiceDetails = () => {
  //Print the Invoice
  const printInvoice = () => {
    window.print();
  };
  document.title="Invoice Details | Velzon - React Admin & Dashboard Template";
  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Invoice Details" pageTitle="Invoices" />

        <Row className="justify-content-center">
          <Col xxl={9}>
            <Card id="demo">
              <CardHeader className="border-bottom-dashed p-4">
                <div className="d-sm-flex">
                  <div className="flex-grow-1">
                    <img
                      src={logoDark}
                      className="card-logo card-logo-dark"
                      alt="logo dark"
                      height="17"
                    />
                    <img
                      src={logoLight}
                      className="card-logo card-logo-light"
                      alt="logo light"
                      height="17"
                    />
                    <div className="mt-sm-5 mt-4">
                      <h6 className="text-muted text-uppercase fw-semibold">
                        Address
                      </h6>
                      <p className="text-muted mb-1">
                        California, United States
                      </p>
                      <p className="text-muted mb-0"><span>Zip-code:</span> 90201</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-sm-0 mt-3">
                    <h6>
                      <span className="text-muted fw-normal">
                        Legal Registration No:
                      </span>{" "}
                      <span id="legal-register-no">987654</span>
                    </h6>
                    <h6>
                      <span className="text-muted fw-normal">Email:</span>{" "}
                      <span id="email">velzon@themesbrand.com</span>
                    </h6>
                    <h6>
                      <span className="text-muted fw-normal">Website:</span>{" "}
                      <Link to="#" className="link-primary">
                        www.themesbrand.com
                      </Link>
                    </h6>
                    <h6 className="mb-0">
                      <span className="text-muted fw-normal">Contact No:</span>{" "}
                      <span id="contact-no"> +(01) 234 6789</span>
                    </h6>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <Row className="g-3">
                  <Col lg={3} xs={6}>
                    <p className="text-muted mb-2 text-uppercase fw-semibold">
                      Invoice No
                    </p>
                    <h5 className="fs-14 mb-0"><span id="invoice-no">25000355</span></h5>
                  </Col>
                  <Col lg={3} xs={6}>
                    <p className="text-muted mb-2 text-uppercase fw-semibold">
                      Date
                    </p>
                    <h5 className="fs-14 mb-0"><span id="invoice-date">23 Nov, 2021</span>
                     <small className="text-muted">02:36PM</small>
                    </h5>
                  </Col>
                  <Col lg={3} xs={6}>
                    <p className="text-muted mb-2 text-uppercase fw-semibold">
                      Payment Status
                    </p>
                    <span className="badge bg-success-subtle text-success fs-11">Paid</span>
                  </Col>
                  <Col lg={3} xs={6}>
                    <p className="text-muted mb-2 text-uppercase fw-semibold">
                      Total Amount
                    </p>
                    <h5 className="fs-14 mb-0">$<span id="total-amount">415.96</span></h5>
                  </Col>
                </Row>
              </CardBody>
              <CardBody className="p-4 border-top border-top-dashed">
                <Row className="g-3">
                  <Col sm={6}>
                    <h6 className="text-muted text-uppercase fw-semibold mb-3">
                      Billing Address
                    </h6>
                    <p className="fw-medium mb-2">David Nichols</p>
                    <p className="text-muted mb-1">305 S San Gabriel Blvd</p>
                    <p className="text-muted mb-1">
                      California, United States - 91776
                    </p>
                    <p className="text-muted mb-1"><span>Phone: +</span><span id="billing-phone-no">(123) 456-7890</span></p>
                    <p className="text-muted mb-0"><span>Tax: </span><span id="billing-tax-no">12-3456789</span></p>
                  </Col>
                  <Col sm={6}>
                    <h6 className="text-muted text-uppercase fw-semibold mb-3">
                      Shipping Address
                    </h6>
                    <p className="fw-medium mb-2" id="shipping-name">David Nichols</p>
                    <p className="text-muted mb-1">345 Elm Ave, Solvang</p>
                    <p className="text-muted mb-1">
                      California, United States - 91776
                    </p>
                    <p className="text-muted mb-1"><span>Phone: +</span><span id="shipping-phone-no">(123) 456-7890</span></p>
                  </Col>
                </Row>
              </CardBody>
              <CardBody className="p-4">
                <div className="table-responsive">
                  <Table className="table-borderless text-center table-nowrap align-middle mb-0">
                    <thead>
                      <tr className="table-active">
                        <th scope="col" style={{ width: "50px" }}>
                          #
                        </th>
                        <th scope="col">Product Details</th>
                        <th scope="col">Rate</th>
                        <th scope="col">Quantity</th>
                        <th scope="col" className="text-end">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">01</th>
                        <td className="text-start">
                          <span className="fw-medium">
                            Sweatshirt for Men (Pink)
                          </span>
                          <p className="text-muted mb-0">
                            Graphic Print Men & Women Sweatshirt
                          </p>
                        </td>
                        <td>$119.99</td>
                        <td>02</td>
                        <td className="text-end">$239.98</td>
                      </tr>
                      <tr>
                        <th scope="row">02</th>
                        <td className="text-start">
                          <span className="fw-medium">
                            Noise NoiseFit Endure Smart Watch
                          </span>
                          <p className="text-muted mb-0">
                            32.5mm (1.28 Inch) TFT Color Touch Display
                          </p>
                        </td>
                        <td>$94.99</td>
                        <td>01</td>
                        <td className="text-end">$94.99</td>
                      </tr>
                      <tr>
                        <th scope="row">03</th>
                        <td className="text-start">
                          <span className="fw-medium">
                            350 ml Glass Grocery Container  
                          </span>
                          <p className="text-muted mb-0">
                            Glass Grocery Container (Pack of 3, White)
                          </p>
                        </td>
                        <td>$24.99</td>
                        <td>01</td>
                        <td className="text-end">$24.99</td>
                      </tr>
                      <tr className="border-top border-top-dashed mt-2">
                        <td colSpan="3"></td>
                        <td colSpan="2" className="fw-medium p-0">
                          <Table className="table-borderless text-start table-nowrap align-middle mb-0">
                            <tbody>
                              <tr>
                                <td>Sub Total</td>
                                <td className="text-end">$359.96</td>
                              </tr>
                              <tr>
                                <td>Estimated Tax (12.5%)</td>
                                <td className="text-end">$44.99</td>
                              </tr>
                              <tr>
                                <td>
                                  Discount{" "}
                                  <small className="text-muted">
                                    (VELZON15)
                                  </small>
                                </td>
                                <td className="text-end">- $53.99</td>
                              </tr>
                              <tr>
                                <td>Shipping Charge</td>
                                <td className="text-end">$65.00</td>
                              </tr>
                              <tr className="border-top border-top-dashed">
                                <th scope="row">Total Amount</th>
                                <td className="text-end">$415.96</td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                <div className="mt-3">
                  <h6 className="text-muted text-uppercase fw-semibold mb-3">
                    Payment Details:
                  </h6>
                  <p className="text-muted mb-1">
                    Payment Method:{" "}
                    <span className="fw-medium">Mastercard</span>
                  </p>
                  <p className="text-muted mb-1">
                    Card Holder:{" "}
                    <span className="fw-medium">David Nichols</span>
                  </p>
                  <p className="text-muted mb-1">
                    Card Number:{" "}
                    <span className="fw-medium">xxx xxxx xxxx 1234</span>
                  </p>
                  <p className="text-muted">
                    Total Amount: <span className="fw-medium">$415.96</span>
                  </p>
                </div>
                <div className="mt-4">
                  <div className="alert alert-primary">
                    <p className="mb-0">
                      <span className="fw-semibold">NOTES:</span> All accounts
                      are to be paid within 7 days from receipt of invoice. To
                      be paid by cheque or credit card or direct payment online.
                      If account is not paid within 7 days the credits details
                      supplied as confirmation of work undertaken will be
                      charged the agreed quoted fee noted above.
                    </p>
                  </div>
                </div>
                <div className="hstack gap-2 justify-content-end d-print-none mt-4">
                  <Link
                    to="#"
                    onClick={printInvoice}
                    className="btn btn-soft-primary"
                  >
                    <i className="ri-printer-line align-bottom me-1"></i> Print
                  </Link>
                  <Link to="#" className="btn btn-primary">
                    <i className="ri-download-2-line align-bottom me-1"></i>{" "}
                    Download
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InvoiceDetails;
