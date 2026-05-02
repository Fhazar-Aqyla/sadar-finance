import React, { useEffect, useState } from "react";

import {
  Col,
  Container,
  Row,
  Card,
  CardBody,
  Input,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  Form,
  ModalBody,
  ModalFooter,
  Label,
  ModalHeader,
} from "reactstrap";

import Flatpickr from "react-flatpickr";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Select from "react-select";
import LeadDiscover from "./leadDiscover";

//Import actions
import { getDeals as onGetDeals } from "../../../slices/thunks";
//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

const CrmDeals = () => {
  const dispatch = useDispatch();
  const crmdealsData = createSelector(
    (state) => state.Crm,
    (deals) => deals.deals
  );
  // Inside your component
  const deals = useSelector(crmdealsData);

  useEffect(() => {
    if (deals && !deals.length) {
      dispatch(onGetDeals());
    }
  }, [dispatch, deals]);

  const [sortBy, setsortBy] = useState("Owner");
  const [modal, setModal] = useState(false);

  function handlesortBy(sortBy) {
    setsortBy(sortBy);
  }

  const sortbyname = [
    {
      options: [
        { label: "Owner", value: "Owner" },
        { label: "Company", value: "Company" },
        { label: "Location", value: "Location" },
      ],
    },
  ];

  const toggle = () => {
    if (modal) {
      setModal(false);
    } else {
      setModal(true);
    }
  };
  document.title = "Deals | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Deals" pageTitle="CRM" />
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md={3}>
                  <div className="search-box">
                    <Input
                      type="text"
                      className="form-control search"
                      placeholder="Search for deals..."
                    />
                    <i className="ri-search-line search-icon"></i>
                  </div>
                </Col>
                <div className="col-md-auto ms-auto">
                  <div className="d-flex hastck gap-2 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted">Sort by: </span>
                      <Select
                        className="mb-0"
                        value={sortBy}
                        onChange={() => {
                          handlesortBy();
                        }}
                        options={sortbyname}
                        id="choices-single-default"
                      ></Select>
                    </div>
                    <button className="btn btn-primary" onClick={toggle}>
                      <i className="ri-add-fill align-bottom me-1"></i> Add
                      Deals
                    </button>
                    <UncontrolledDropdown>
                      <DropdownToggle
                        href="#"
                        className="btn btn-soft-secondary btn-icon fs-14"
                        tag="button"
                      >
                        <i className="ri-settings-4-line"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
                        <DropdownItem className="dropdown-item" href="#">
                          Copy
                        </DropdownItem>
                        <DropdownItem className="dropdown-item" href="#">
                          Move to pipline
                        </DropdownItem>
                        <DropdownItem className="dropdown-item" href="#">
                          Add to exceptions
                        </DropdownItem>
                        <DropdownItem className="dropdown-item" href="#">
                          Switch to common form view
                        </DropdownItem>
                        <DropdownItem className="dropdown-item" href="#">
                          Reset form view to default
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
                </div>
              </Row>
            </CardBody>
          </Card>

          <Row className="row-cols-xxl-5 row-cols-lg-3 row-cols-md-2 row-cols-1">
            {deals.map((deal, key) => (
              <React.Fragment key={key}>
                <LeadDiscover deal={deal} index={key} />
              </React.Fragment>
            ))}
          </Row>
        </Container>
      </div>

      <Modal id="adddeals" isOpen={modal} toggle={toggle} centered>
        <ModalHeader className="bg-light p-3" toggle={toggle}>
          Create Deals
        </ModalHeader>
        <Form>
          <ModalBody>
            <div className="mb-3">
              <Label htmlFor="dealTitle" className="form-label">
                Deal Title
              </Label>
              <Input
                type="text"
                className="form-control"
                id="dealTitle"
                placeholder="Enter title"
                step="0.01"
                required
              />
              <div className="invalid-feedback">
                Please write a value.
              </div>
            </div>
            <div className="mb-3">
              <Label htmlFor="dealValue" className="form-label">
                Value (USD)
              </Label>
              <Input
                type="text"
                className="form-control"
                id="dealValue"
                placeholder="Enter value"
                required
              />
              <div className="invalid-feedback">
                Please write an deals owner name.
              </div>
            </div>
            <div className="mb-3">
              <Label htmlFor="dealOwner" className="form-label">
                Deals Owner
              </Label>
              <Input
                type="text"
                className="form-control"
                id="dealOwner"
                placeholder="Enter owner name"
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="dueDate" className="form-label">
                Due Date
              </Label>
              <Flatpickr
                className="form-control"
                id="datepicker-publish-input"
                placeholder="Select a date"
                options={{
                  altInput: true,
                  altFormat: "F j, Y",
                  mode: "multiple",
                  dateFormat: "d.m.y",
                }}
                required
              />
              <div className="invalid-feedback">
                Please select a due date.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="dealEmail" className="form-label">Email</label>
              <Input type="email" className="form-control" id="dealEmail"
                placeholder="Enter email" required />
              <div className="invalid-feedback">
                Please write a email.
              </div>
            </div>
            <div className="mb-3">
              <Label htmlFor="contactNumber" className="form-label">
                Contact
              </Label>
              <Input
                type="text"
                className="form-control"
                id="contactNumber"
                placeholder="Enter contact number"
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="contactNumber" className="form-label">
                Description
              </Label>
              <Input
                name="text"
                type="textarea"
                className="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder="Enter description"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="light"
              onClick={() => {
                setModal(false);
              }}
            >
              Close
            </Button>
            <Button
              type="submit"
              color="success"
              onClick={() => {
                setModal(false);
              }}
            >
              <i className="ri-save-line align-bottom me-1"></i> Save
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default CrmDeals;
