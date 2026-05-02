import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { jobList } from "../../../../common/data/appsJobs";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import img10 from "../../../../assets/images/small/img-10.jpg";
import img7 from "../../../../assets/images/companies/img-7.png";
import AppSummaryChart from "./AppSummary";
import Pagination from "../../../../Components/Common/Pagination";

const JobList = () => {
  document.title = "Job Lists | Velzon -  Admin & Dashboard Template";

  const [jobListData, setJobListData] = useState();
  const [currentPage, setCurrentPage] = useState(1);

  //pagination
  const perPageData = 3;
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentdata = useMemo(() => jobList?.slice(indexOfFirst, indexOfLast), [indexOfFirst, indexOfLast])

  useEffect(() => {
    setJobListData(currentdata)
  }, [currentdata]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Job Lists" pageTitle="Jobs" />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody className="bg-light-subtle">
                  <div className="d-flex align-items-center">
                    <h6 className="card-title mb-0 flex-grow-1 fw-bold">
                      Search Jobs
                    </h6>
                    <div className="flex-shrink-0">
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#CreateJobModal"
                      >
                        <i className="ri-add-line align-bottom me-1"></i>
                        Create New Job
                      </button>
                    </div>
                  </div>

                  <Row className="row mt-3 gy-3">
                    <Col xxl={10} md={6}>
                      <div className="search-box">
                        <input
                          type="text"
                          className="form-control search bg-light border-light"
                          id="searchJob"
                          autoComplete="off"
                          placeholder="Search for jobs or companies..."
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </Col>
                    <Col xxl={2} md={6}>
                      <div className="input-light">
                        <select
                          className="form-control"
                          data-choices
                          data-choices-search-false
                          name="choices-single-default"
                          id="idStatus"
                        >
                          <option value="All">All Selected</option>
                          <option value="Newest" defaultValue>
                            Newest
                          </option>
                          <option value="Popular">Popular</option>
                          <option value="Oldest">Oldest</option>
                        </select>
                      </div>
                    </Col>
                    <Col xl={12} className="d-none" id="found-job-alert">
                      <div
                        className="alert alert-success mb-0 text-center"
                        role="alert"
                      >
                        <strong id="total-result">253</strong> jobs found
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xxl={9}>
              <div id="job-list">
                {(jobListData || []).map((item, key) => (
                  <Card className="card joblist-card" key={key}>
                    <CardBody>
                      <div className="d-flex mb-4">
                        <div className="avatar-sm">
                          <div className="avatar-title bg-light rounded">
                            <img
                              src={item.companyLogo}
                              alt=""
                              className="avatar-xxs companyLogo-img"
                            />
                          </div>
                        </div>
                        <div className="ms-3 flex-grow-1">
                          <img
                            src={item.coverImg}
                            alt=""
                            className="d-none cover-img"
                          />
                          <Link to="#!">
                            <h5 className="job-title">{item.jobTitle}</h5>
                          </Link>
                          <p className="company-name text-muted mb-0">
                            {item.companyName}
                          </p>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="btn btn-ghost-primary btn-icon custom-toggle"
                            data-bs-toggle="button"
                          >
                            <span className="icon-on">
                              <i className="ri-bookmark-line"></i>
                            </span>
                            <span className="icon-off">
                              <i className="ri-bookmark-fill"></i>
                            </span>
                          </button>
                        </div>
                      </div>
                      <p className="text-muted job-description">
                        {item.description}
                      </p>
                      <div>
                        {(item.tags || []).map((subItem, key) => (
                          <span key={key} className="badge bg-primary-subtle text-primary me-1">{subItem}</span>
                        ))}
                      </div>
                    </CardBody>
                    <CardHeader className="card-footer border-top-dashed">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                          <i className="ri-briefcase-2-line align-bottom me-1"></i>{" "}
                          <span className="job-type">{item.type}</span>
                        </div>
                        <div className="d-none">
                          <span className="job-experience">
                            {item.experience}
                          </span>
                        </div>
                        <div>
                          <i className="ri-map-pin-2-line align-bottom me-1"></i>{" "}
                          <span className="job-location">{item.location}</span>
                        </div>
                        <div>
                          <i className="ri-user-3-line align-bottom me-1"></i>
                          {item.applied}
                        </div>
                        <div>
                          <i className="ri-time-line align-bottom me-1"></i>{" "}
                          <span className="job-postdate">{item.postDate}</span>
                        </div>
                        <div>
                          <Link
                            to="#!"
                            className="btn btn-primary viewjob-list"
                          >
                            View More{" "}
                            <i className="ri-arrow-right-line align-bottom ms-1"></i>
                          </Link>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Pagination
                perPageData={perPageData}
                data={jobList}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </Col>
            <Col xxl={3}>
              <Card
                className="card job-list-view-card overflow-hidden"
                id="job-overview"
              >
                <img
                  src={img10}
                  alt=""
                  id="cover-img"
                  className="img-fluid background object-fit-cover"
                />
                <CardBody className="card-body">
                  <div className="avatar-md mt-n5">
                    <div className="avatar-title bg-light rounded-circle">
                      <img
                        src={img7}
                        alt=""
                        className="avatar-xs view-companylogo"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h5 className="view-title">Product Designer</h5>
                    <div className="hstack gap-3 mb-3">
                      <span className="text-muted">
                        <i className="ri-building-line me-1 align-bottom"></i>{" "}
                        <span className="view-companyname">Themesbrand</span>
                      </span>
                      <span className="text-muted">
                        <i className="ri-map-pin-2-line me-1 align-bottom"></i>{" "}
                        <span className="view-location">United Kingdom</span>
                      </span>
                    </div>
                    <p className="text-muted view-desc">
                      A UI/UX designer's job is to create user-friendly
                      interfaces that enable users to understand how to use
                      complex technical products. If you're passionate about the
                      latest technology trends and devices, you'll find great
                      fulfillment in being involved in the design process for
                      the next hot gadget.
                    </p>
                    <div className="py-3 border border-dashed border-start-0 border-end-0 mt-4">
                      <Row>
                        <Col lg={4} sm={6}>
                          <div>
                            <p className="mb-2 text-uppercase fw-semibold fs-12 text-muted">
                              Job Type
                            </p>
                            <h5 className="fs-14 mb-0 view-type">Full Time</h5>
                          </div>
                        </Col>
                        <Col lg={4} sm={6}>
                          <div>
                            <p className="mb-2 text-uppercase fw-semibold fs-12 text-muted">
                              Post Date
                            </p>
                            <h5 className="fs-14 mb-0 view-postdate">
                              15 Sep, 2022
                            </h5>
                          </div>
                        </Col>
                        <Col lg={4} sm={6}>
                          <div>
                            <p className="mb-2 text-uppercase fw-semibold fs-12 text-muted">
                              Experience
                            </p>
                            <h5 className="fs-14 mb-0 view-experience">
                              0 - 5 Year
                            </h5>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="mb-3">Application Summary</h5>
                    <div>
                      <AppSummaryChart dataColors='["--vz-success", "--vz-primary", "--vz-danger", "--vz-danger"]' />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="button" className="btn btn-success w-100">
                      Apply Now
                    </button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default JobList;
