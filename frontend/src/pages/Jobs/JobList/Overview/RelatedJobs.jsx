import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, Col, Row } from "reactstrap";
import { overviewJobs } from "../../../../common/data/appsJobs";

const RelatedJobs = () => {

  const favouriteBtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <div className="d-flex align-items-center mb-4">
            <div className="flex-grow-1">
              <h5 className="mb-0">Related Jobs</h5>
            </div>
            <div className="flex-shrink-0">
              <Link to="#!" className="btn btn-ghost-success">
                View All{" "}
                <i className="ri-arrow-right-line ms-1 align-bottom"></i>
              </Link>
            </div>
          </div>
        </Col>
        {overviewJobs.map((item, key) => (
          <Col xl={4} key={key}>
            <Card>
              <CardBody>
                <button
                  type="button"
                  className="btn btn-icon btn-soft-danger float-end"
                  data-bs-toggle="button"
                  aria-pressed="true"
                  onClick={(e) => favouriteBtn(e.target)}
                >
                  <i className="mdi mdi-cards-heart fs-16"></i>
                </button>
                <div className="avatar-sm mb-4">
                  <div className="avatar-title bg-secondary-subtle rounded">
                    <img src={item.companyLogo} alt="" className="avatar-xxs" />
                  </div>
                </div>
                <Link to="#!">
                  <h5>{item.jobTitle}</h5>
                </Link>
                <p className="text-muted">{item.companyName}</p>

                <div className="d-flex gap-4 mb-3">
                  <div>
                    <i className="ri-map-pin-2-line text-primary me-1 align-bottom"></i>{" "}
                    {item.location}
                  </div>

                  <div>
                    <i className="ri-time-line text-primary me-1 align-bottom"></i>{" "}
                    {item.time}
                  </div>
                </div>

                <p className="text-muted">{item.description}</p>

                <div className="hstack gap-2">
                  {
                    item.requirement.map((badge, inx) => (
                      <span key={inx}>
                        {badge === "Full Time" ?
                          <span className="badge bg-success-subtle text-success">{badge}</span>
                          :
                          badge === "Freelance" ?
                            <span className="badge bg-primary-subtle text-primary">{badge}</span>
                            :
                            badge === "Urgent" ?
                              <span className="badge bg-danger-subtle text-danger">{badge}</span>
                              :
                              badge === "Private" ?
                                <span className="badge bg-info-subtle text-info">{badge}</span>
                                :
                                <span className="badge bg-warning-subtle text-warning">{badge}</span>}
                      </span>
                    ))
                  }
                </div>

                <div className="mt-4 hstack gap-2">
                  <Link to="#!" className="btn btn-soft-primary w-100">
                    Apply Job
                  </Link>
                  <Link to="#!" className="btn btn-soft-success w-100">
                    Overview
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </React.Fragment>
  );
};

export default RelatedJobs;
