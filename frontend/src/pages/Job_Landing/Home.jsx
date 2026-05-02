import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Container,
  Form,
  Input,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import Avatar3 from "../../assets/images/users/avatar-3.jpg";
import Avatar9 from "../../assets/images/users/avatar-9.jpg";
import Avatar10 from "../../assets/images/users/avatar-10.jpg";
import JobProfile2 from "../../assets/images/job-profile2.png";

const Home = () => {
  return (
    <React.Fragment>
      <section className="section job-hero-section bg-light pb-0" id="hero">
        <Container>
          <Row className="justify-content-between align-items-center">
            <Col lg={6}>
              <div>
                <h1 className="display-6 fw-bold text-capitalize mb-3 lh-base">
                  Find your next job and build your dream here
                </h1>
                <p className="lead text-muted fw-normal lh-base mb-4">
                  Find jobs, create trackable resumes and enrich your
                  applications. Carefully crafted after analyzing the needs of
                  different industries.
                </p>
                <Form action="#" className="job-panel-filter">
                  <Row className="g-md-0 g-2">
                    <Col className="col-md-4">
                      <div>
                        <Input
                          type="search"
                          id="job-title"
                          className="form-control filter-input-box"
                          placeholder="Job, Company name..."
                        />
                      </div>
                    </Col>
                    <Col className="col-md-4">
                      <div>
                        <select className="form-control" data-choices>
                          <option value="">Select job type</option>
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                    </Col>
                    <Col className="col-md-4">
                      <div className="h-100">
                        <button
                          className="btn btn-primary submit-btn w-100 h-100"
                          type="submit"
                          onClick={e => e.preventDefault()}
                        >
                          <i className="ri-search-2-line align-bottom me-1"></i>{" "}
                          Find Job
                        </button>
                      </div>
                    </Col>
                  </Row>
                </Form>

                <ul className="treding-keywords list-inline mb-0 mt-3 fs-13">
                  <li className="list-inline-item text-danger fw-semibold">
                    <i className="mdi mdi-tag-multiple-outline align-middle"></i>{" "}
                    Trending Keywords:
                  </li>
                  <li className="list-inline-item">
                    <Link to="#">
                      Design,
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="#">
                      Development,
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="#">
                      Manager,
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="#">
                      Senior
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
            <Col lg={4}>
              <div className="position-relative home-img text-center mt-5 mt-lg-0">
                <Card className="card-bg-fill p-3 rounded shadow-lg inquiry-box">
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm flex-shrink-0 me-3">
                      <div className="avatar-title bg-warning-subtle text-warning rounded fs-18">
                        <i className="ri-mail-send-line"></i>
                      </div>
                    </div>
                    <h5 className="fs-15 lh-base mb-0">
                      Work Inquiry from velzon
                    </h5>
                  </div>
                </Card>

                <Card className="card-bg-fill p-3 rounded shadow-lg application-box">
                  <h5 className="fs-15 lh-base mb-3">Applications</h5>
                  <div className="avatar-group">
                    <Link to="#!" className="avatar-group-item" id="brent">
                      <UncontrolledTooltip placement="top" target="brent">
                        Brent Gonzalez
                      </UncontrolledTooltip>
                      <div className="avatar-xs">
                        <img
                          src={Avatar3}
                          alt=""
                          className="rounded-circle img-fluid"
                        />
                      </div>
                    </Link>
                    <Link to="#!" className="avatar-group-item " id="ellen">
                      <UncontrolledTooltip placement="top" target="ellen">
                        Ellen Smith
                      </UncontrolledTooltip>
                      <div className="avatar-xs">
                        <div className="avatar-title rounded-circle bg-danger">
                          S
                        </div>
                      </div>
                    </Link>
                    <Link to="#!" className="avatar-group-item" id="smith">
                      <UncontrolledTooltip placement="top" target="smith">
                        Ellen Smith
                      </UncontrolledTooltip>
                      <div className="avatar-xs">
                        <img
                          src={Avatar10}
                          alt=""
                          className="rounded-circle img-fluid"
                        />
                      </div>
                    </Link>
                    <Link
                      to="#!"
                      className="avatar-group-item"
                      data-bs-toggle="tooltip"
                      data-bs-trigger="hover"
                      data-bs-placement="top"
                    >
                      <div className="avatar-xs">
                        <div className="avatar-title rounded-circle bg-success">
                          Z
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="#!"
                      className="avatar-group-item"
                      id="gonzalez"
                    >
                      <UncontrolledTooltip placement="top" target="gonzalez">
                        Brent Gonzalez
                      </UncontrolledTooltip>
                      <div className="avatar-xs">
                        <img
                          src={Avatar9}
                          alt=""
                          className="rounded-circle img-fluid"
                        />
                      </div>
                    </Link>
                    <Link to="#!" className="avatar-group-item" id="more">
                      <UncontrolledTooltip placement="top" target="more">
                        More Appliances
                      </UncontrolledTooltip>
                      <div className="avatar-xs">
                        <div className="avatar-title fs-13 rounded-circle bg-light border-dashed border text-primary">
                          2k+
                        </div>
                      </div>
                    </Link>
                  </div>
                </Card>
                <img src={JobProfile2} alt="" className="user-img" />

                <div className="circle-effect">
                  <div className="circle"></div>
                  <div className="circle2"></div>
                  <div className="circle3"></div>
                  <div className="circle4"></div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default Home;
