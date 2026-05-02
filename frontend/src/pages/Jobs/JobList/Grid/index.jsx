import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { jobGrid } from "../../../../common/data/appsJobs";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import Pagination from "../../../../Components/Common/Pagination";

const JobGrid = () => {
  document.title = "Job Grid | Velzon -  Admin & Dashboard Template";
  const [jobGridData, setJobGridData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [favouritebtn, setFavouritebtn] = useState(false);

  const favouriteBtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };

  //pagination
  const perPageData = 7;
  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentdata = useMemo(() => jobGrid?.slice(indexOfFirst, indexOfLast), [indexOfFirst, indexOfLast])

  useEffect(() => {
    setJobGridData(currentdata)
  }, [currentdata]);

  const OnchangeHandler = (e, name) => {
    let search = e.target.value;
    if (search) {
      setJobGridData(
        jobGrid.filter((data) =>
          Object.values(data).some(
            (field) =>
              typeof field === 'string' &&
              field.toLowerCase().includes(search?.toLowerCase()),
          )
        )
      )
    } else {
      setJobGridData(currentdata)
    }
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Job Grid Lists" pageTitle="Jobs" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody className="bg-light-subtle">
                  <Form>
                    <Row className="row g-3">
                      <Col xxl={4} sm={12}>
                        <div className="search-box">
                          <Input
                            type="text"
                            className="form-control search bg-light border-light"
                            id="searchJob"
                            autoComplete="off"
                            placeholder="Search for jobs or companies..."
                            name="companyName"
                            onChange={(e) => OnchangeHandler(e, "companyName")}
                          />
                          <i className="ri-search-line search-icon"></i>
                        </div>
                      </Col>

                      <Col xxl={3} sm={4}>
                        <Flatpickr
                          className="form-control"
                          id="datepicker-publish-input"
                          placeholder="Select a date"
                          // name="date"
                          // onChange={(e) => OnchangeHandler(e, "date")}
                          options={{
                            altInput: true,
                            altFormat: "F j, Y",
                            mode: "multiple",
                            dateFormat: "d.m.y",
                          }}
                        />
                      </Col>

                      <Col xxl={2} sm={4}>
                        <div className="input-light">
                          <select
                            className="form-control"
                            data-choices
                            data-choices-search-false
                            // name="choices-idType"
                            id="idType"
                            name="requirement"
                            onChange={(e) => OnchangeHandler(e, "requirement")}
                          >
                            <option value="all" defaultValue>
                              All
                            </option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                      </Col>

                      <Col xxl={2} sm={4}>
                        <div className="input-light">
                          <select
                            className="form-control"
                            data-choices
                            data-choices-search-false
                            // name="choices-single-default"
                            id="idStatus"
                            name="status"
                            onChange={(e) => OnchangeHandler(e, "status")}
                          >
                            <option value="all" defaultValue>
                              All
                            </option>
                            <option value="Active">Active</option>
                            <option value="New">New</option>
                            <option value="Close">Close</option>
                          </select>
                        </div>
                      </Col>

                      <Col xxl={1} sm={4}>
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                        // onclick={(e) => searchData(e)}
                        >
                          <i className="ri-equalizer-fill me-1 align-bottom"></i>{" "}
                          Filters
                        </button>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <div className="d-flex align-items-center mb-4">
                <div className="flex-grow-1">
                  <p className="text-muted fs-14 mb-0">
                    Result: <span id="total-result"></span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <UncontrolledDropdown className="dropdown">
                    <DropdownToggle
                      className="btn text-muted fs-14 dropdown-toggle"
                      to="#"
                      role="button"
                      tag="button"
                      type="button"
                    >
                      All View
                    </DropdownToggle>
                    <DropdownMenu
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuLink"
                    >
                      <li>
                        <DropdownItem className="dropdown-item" href="#">
                          Action
                        </DropdownItem>
                      </li>
                      <li>
                        <DropdownItem className="dropdown-item" href="#">
                          Another action
                        </DropdownItem>
                      </li>
                      <li>
                        <DropdownItem className="dropdown-item" href="#">
                          Something else here
                        </DropdownItem>
                      </li>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </div>
            </Col>
          </Row>

          <Row id="job-list">
            <Col lg={3} md={6} id="job-widget">
              <Card className="card-height-100 bg-info bg-job">
                <CardBody className="p-5">
                  <h2 className="lh-base text-white">
                    Velzon invites young professionals for an Internship!
                  </h2>
                  <p className="text-white text-opacity-75 mb-0 fs-14">
                    Don't miss your opportunity to improve your skills!
                  </p>
                  <div className="mt-5 pt-2">
                    <Button type="button" className="btn btn-light w-100">
                      View More{" "}
                      <i className="ri-arrow-right-line align-bottom"></i>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
            {
              (jobGridData || []).map((item, key) => (
                <Col lg={3} md={6} key={key}>
                  <Card>
                    <CardBody>
                      <button
                        type="button"
                        className={favouritebtn ? "btn btn-icon btn-soft-primary float-end" : "btn btn-icon btn-soft-primary float-end"}
                        data-bs-toggle="button"
                        aria-pressed="true"
                        onClick={(e) => favouriteBtn(e.target)}
                      >
                        <i className="mdi mdi-cards-heart fs-16"></i>
                      </button>
                      <div className="avatar-sm mb-4">
                        <div className="avatar-title bg-light rounded">
                          <img
                            src={item.companyLogo}
                            alt=""
                            className="avatar-xxs"
                          />
                        </div>
                      </div>
                      <Link to="#!">
                        <h5>{item.jobTitle}</h5>
                      </Link>
                      <p className="text-muted">{item.companyName} </p>
                      <div className="d-flex gap-4 mb-3">
                        <div>
                          <i className="ri-map-pin-2-line text-primary me-1 align-bottom"></i>{" "}
                          {item.location}
                        </div>
                        <div>
                          <i className="ri-time-line text-primary me-1 align-bottom"></i>{" "}
                          {item.postDate}
                        </div>
                      </div>
                      <p className="text-muted">{item.description}</p>
                      <div className="hstack gap-2">
                        {item.requirement.map((subItem, key) => (
                          <React.Fragment key={key}>
                            {
                              subItem === "Full Time" ?
                                <span className="badge bg-success-subtle text-success">{subItem}</span>
                                :
                                subItem === "Freelance" ?
                                  <span className="badge bg-primary-subtle text-primary">{subItem}</span>
                                  :
                                  <span className="badge bg-danger-subtle text-danger">{subItem}</span>
                            }
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-4 hstack gap-2">
                        <Link to="#!" className="btn btn-soft-primary w-100">
                          Apply Job
                        </Link>
                        <Link
                          to="/apps-job-details"
                          className="btn btn-soft-success w-100"
                        >
                          Overview
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))
            }
          </Row>

          <Pagination
            perPageData={perPageData}
            data={jobGrid}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default JobGrid;
