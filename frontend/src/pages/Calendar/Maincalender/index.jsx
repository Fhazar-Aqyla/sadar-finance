import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
//Import Icons
import FeatherIcon from "feather-icons-react";

import {
  Card,
  CardBody,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Col
} from "reactstrap";

import * as Yup from "yup";
import { useFormik } from "formik";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import BootstrapTheme from "@fullcalendar/bootstrap";
import Flatpickr from "react-flatpickr";
import listPlugin from '@fullcalendar/list';

//redux
import { useSelector, useDispatch } from "react-redux";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";

//Simple bar
import SimpleBar from "simplebar-react";
import UpcommingEvents from './UpcommingEvents';

import {
  getEvents as onGetEvents,
  getCategories as onGetCategories,
  addNewEvent as onAddNewEvent,
  deleteEvent as onDeleteEvent,
  updateEvent as onUpdateEvent,
  resetCalendar,
} from "../../../slices/thunks";
import { createSelector } from "reselect";

const Calender = () => {
  const dispatch = useDispatch();
  const [event, setEvent] = useState({});
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedNewDay, setSelectedNewDay] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [upcommingevents, setUpcommingevents] = useState([]);
  const [isEditButton, setIsEditButton] = useState(true);

  const selectLayoutState = (state) => state.Calendar;
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (calender) => ({
      events: calender?.events,
      categories: calender?.categories,
      isEventUpdated: calender?.isEventUpdated,
    })
  );
  // Inside your component
  const {
    events, categories, isEventUpdated
  } = useSelector(selectLayoutProperties);

  useEffect(() => {
    dispatch(onGetEvents());
    dispatch(onGetCategories());
    new Draggable(document.getElementById("external-events"), {
      itemSelector: ".external-event",
    });
  }, [dispatch]);

  useEffect(() => {
    setUpcommingevents(events);
    Object.entries(upcommingevents).sort((o1, o2) => {
      return new Date(o1.start) - new Date(o2.start);
    });
  }, [events, upcommingevents]);

  useEffect(() => {
    if (isEventUpdated) {
      setIsEdit(false);
      setEvent({});
      setTimeout(() => {
        dispatch(resetCalendar("isEventUpdated", false));
      }, 500);
    }
  }, [dispatch, isEventUpdated]);

  /**
   * Handling the modal state
   */
  const toggle = () => {
    if (modal) {
      setModal(false);
      setEvent(null);
      setIsEdit(false);
      setIsEditButton(true);
    } else {
      setModal(true);
    }
  };
  /**
   * Handling date click on calendar
   */

  const handleDateClick = (arg) => {
    const date = arg["date"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const currectDate = new Date();
    const currentHour = currectDate.getHours();
    const currentMin = currectDate.getMinutes();
    const currentSec = currectDate.getSeconds();
    const modifiedDate = new Date(
      year,
      month,
      day,
      currentHour,
      currentMin,
      currentSec
    );

    const modifiedData = { ...arg, date: modifiedDate };

    setSelectedNewDay(date);
    setSelectedDay(modifiedData);
    toggle();
  };

  const str_dt = function formatDate(date) {
    var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var d = new Date(date),
      month = "" + monthNames[d.getMonth()],
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [day + " " + month, year].join(",");
  };

  const date_r = function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  };

  /**
   * Handling click on event on calendar
   */
  const handleEventClick = (arg) => {
    const event = arg.event;

    const st_date = event.start;
    const ed_date = event.end;
    const r_date =
      ed_date == null
        ? str_dt(st_date)
        : str_dt(st_date) + " to " + str_dt(ed_date);
    const er_date =
      ed_date == null
        ? date_r(st_date)
        : date_r(st_date) + " to " + date_r(ed_date);

    setEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      className: event.classNames,
      category: event.classNames[0],
      location: event._def.extendedProps.location,
      description: event._def.extendedProps.description,
      defaultDate: er_date,
      datetag: r_date,
    });

    setIsEdit(true);
    setIsEditButton(false);
    toggle();
  };
  /**
   * On delete event
   */
  const handleDeleteEvent = () => {
    dispatch(onDeleteEvent(event.id));
    setDeleteModal(false);
    toggle();
  };

  // events validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      title: (event && event.title) || "",
      category: (event && event.category) || "",
      location: (event && event.location) || "",
      description: (event && event.description) || "",
      defaultDate: (event && event.defaultDate) || "",
      datetag: (event && event.datetag) || "",
    },

    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Your Event Name"),
      category: Yup.string().required("Please Select Your Category"),
    }),
    onSubmit: (values) => {
      var updatedDay = "";
      if (selectedNewDay) {
        updatedDay = new Date(selectedNewDay[1]);
        updatedDay.setDate(updatedDay.getDate() + 1);
      }

      if (isEdit) {
        const updateEvent = {
          id: event.id,
          title: values.title,
          className: values.category,
          start: selectedNewDay ? selectedNewDay[0] : event.start,
          end: selectedNewDay ? updatedDay : event.end,
          location: values.location,
          description: values.description,
        };
        // update event
        dispatch(onUpdateEvent(updateEvent));
        validation.resetForm();
      } else {
        const newEvent = {
          id: Math.floor(Math.random() * 100),
          title: values["title"],
          start: selectedDay ? selectedNewDay[0] : new Date(),
          end: selectedDay ? updatedDay : new Date(),
          className: values.category,
          location: values["location"],
          description: values["description"],
        };
        // save new event
        dispatch(onAddNewEvent(newEvent));
        validation.resetForm();
      }
      setSelectedDay(null);
      setSelectedNewDay(null);
      toggle();
    },
  });

  const submitOtherEvent = () => {
    document.getElementById("form-event").classList.remove("view-event");

    document
      .getElementById("event-title")
      .classList.replace("d-none", "d-block");
    document
      .getElementById("event-category")
      .classList.replace("d-none", "d-block");
    document
      .getElementById("event-start-date")
      .parentNode.classList.remove("d-none");
    document
      .getElementById("event-start-date")
      .classList.replace("d-none", "d-block");
    document
      .getElementById("event-location")
      .classList.replace("d-none", "d-block");
    document
      .getElementById("event-description")
      .classList.replace("d-none", "d-block");
    document
      .getElementById("event-start-date-tag")
      .classList.replace("d-block", "d-none");
    document
      .getElementById("event-location-tag")
      .classList.replace("d-block", "d-none");
    document
      .getElementById("event-description-tag")
      .classList.replace("d-block", "d-none");
    // document.getElementById("btn-save-event").removeAttribute("hidden");
    setIsEditButton(true);
  };

  /**
   * On category darg event
   */
  const onDrag = (event) => {
    event.preventDefault();
  };

  /**
   * On calendar drop event
   */
  const onDrop = (event) => {
    const date = event["date"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const currectDate = new Date();
    const currentHour = currectDate.getHours();
    const currentMin = currectDate.getMinutes();
    const currentSec = currectDate.getSeconds();
    const modifiedDate = new Date(
      year,
      month,
      day,
      currentHour,
      currentMin,
      currentSec
    );

    const draggedEl = event.draggedEl;
    const draggedElclass = draggedEl.className;
    if (
      draggedEl.classList.contains("external-event") &&
      draggedElclass.indexOf("fc-event-draggable") === -1
    ) {
      const modifiedData = {
        id: Math.floor(Math.random() * 1000),
        title: draggedEl.innerText,
        start: modifiedDate,
        className: draggedEl.className,
      };
      dispatch(onAddNewEvent(modifiedData));
    }
  };
  document.title = "Calendar | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteEvent}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Calendar" pageTitle="Apps" />
          <Row>
            <Col xs={12}>
              <Row>
                <Col xl={3}>
                  <Card className="card-h-100">
                    <CardBody>
                      <button
                        className="btn btn-primary w-100"
                        id="btn-new-event"
                        onClick={toggle}
                      >
                        <i className="mdi mdi-plus"></i> Create New Event
                      </button>

                      <div id="external-events">
                        <br />
                        <p className="text-muted">
                          Drag and drop your event or click in the calendar
                        </p>
                        {categories &&
                          categories.map((category, i) => (
                            <div
                            className={`bg-${category.type}-subtle external-event fc-event text-${category.type}`}
                              key={"cat-" + category.id}
                              draggable
                              onDrag={(event) => {
                                onDrag(event, category);
                              }}
                            >
                              <i className="mdi mdi-checkbox-blank-circle me-2" />
                              {category.title}
                            </div>
                          ))}
                      </div>
                    </CardBody>
                  </Card>
                  <div>
                    <h5 className="mb-1">Upcoming Events</h5>
                    <p className="text-muted">Don't miss scheduled events</p>
                    <SimpleBar
                      className="pe-2 me-n1 mb-3"
                      style={{ height: "400px" }}
                    >
                      <div id="upcoming-event-list">
                        {upcommingevents &&
                          upcommingevents.map((event, key) => (
                            <UpcommingEvents event={event} key={key} />
                          ))}
                      </div>
                    </SimpleBar>
                  </div>

                  <Card>
                    <CardBody className="bg-info-subtle">
                      <div className="d-flex">
                        <div className="flex-shrink-0">
                          <FeatherIcon
                            icon="calendar"
                            className="text-info icon-dual-info"
                          />
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="fs-15">Welcome to your Calendar!</h6>
                          <p className="text-muted mb-0">
                            Event that applications book will appear here. Click
                            on an event to see the details and manage applicants
                            event.
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>

                <Col xl={9}>
                  <Card className="card-h-100">
                    <CardBody>
                      <FullCalendar
                        plugins={[
                          BootstrapTheme,
                          dayGridPlugin,
                          interactionPlugin,
                          listPlugin
                        ]}
                        initialView="dayGridMonth"
                        slotDuration={"00:15:00"}
                        handleWindowResize={true}
                        themeSystem="bootstrap"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek",
                        }}
                        events={events}
                        editable={true}
                        droppable={true}
                        selectable={true}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        drop={onDrop}
                      />
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <div style={{ clear: "both" }}></div>

              <Modal isOpen={modal} id="event-modal" centered>
                <ModalHeader toggle={toggle} tag="h5" className="p-3 bg-info-subtle modal-title">
                  {!!isEdit ? "Edit Event" : "Add Event"}
                </ModalHeader>
                <ModalBody>
                  <Form
                    className={
                      !!isEdit
                        ? "needs-validation view-event"
                        : "needs-validation"
                    }
                    name="event-form"
                    id="form-event"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    {!!isEdit ? (
                      <div className="text-end">
                        <Link
                          to="#"
                          className="btn btn-sm btn-soft-primary"
                          id="edit-event-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            submitOtherEvent();
                            return false;
                          }}
                        >
                          Edit
                        </Link>
                      </div>
                    ) :
                      null
                    }


                    <div className="event-details">
                      <div className="d-flex mb-2">
                        <div className="flex-grow-1 d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            <i className="ri-calendar-event-line text-muted fs-16"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6
                              className="d-block fw-semibold mb-0"
                              id="event-start-date-tag"
                            >
                              {event ? event.datetag : ""}
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <div className="flex-shrink-0 me-3">
                          <i className="ri-map-pin-line text-muted fs-16"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="d-block fw-semibold mb-0">
                            {" "}
                            <span id="event-location-tag">
                              {event && event.location !== undefined ? event.location : "No Location"}
                            </span>
                          </h6>
                        </div>
                      </div>
                      <div className="d-flex mb-3">
                        <div className="flex-shrink-0 me-3">
                          <i className="ri-discuss-line text-muted fs-16"></i>
                        </div>
                        <div className="flex-grow-1">
                          <p
                            className="d-block text-muted mb-0"
                            id="event-description-tag"
                          >
                            {event && event.description !== undefined ? event.description : "No Description"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Row className="event-form">
                      <Col xs={12}>
                        <div className="mb-3">
                          <Label className="form-label">Type</Label>
                          <Input
                            className={
                              !!isEdit
                                ? "form-select d-none"
                                : "form-select d-block"
                            }
                            name="category"
                            id="event-category"
                            type="select"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.category || ""}
                          // invalid={
                          //   validation.touched.category &&
                          //   validation.errors.category
                          //     ? true
                          //     : false
                          // }
                          >
                            <option value="bg-danger-subtle">Danger</option>
                            <option value="bg-success-subtle">Success</option>
                            <option value="bg-primary-subtle">Primary</option>
                            <option value="bg-info-subtle">Info</option>
                            <option value="bg-dark-subtle">Dark</option>
                            <option value="bg-warning-subtle">Warning</option>
                          </Input>
                          {validation.touched.category &&
                            validation.errors.category ? (
                            <FormFeedback type="invalid">
                              {validation.errors.category}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <Label className="form-label">Event Name</Label>
                          <Input
                            className={
                              !!isEdit
                                ? "form-control d-none"
                                : "form-control d-block"
                            }
                            placeholder="Enter event name"
                            type="text"
                            name="title"
                            id="event-title"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.title || ""}
                          // invalid={
                          //   validation.touched.title &&
                          //   validation.errors.title
                          //     ? true
                          //     : false
                          // }
                          />
                          {validation.touched.title &&
                            validation.errors.title ? (
                            <FormFeedback type="invalid">
                              {validation.errors.title}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <Label>Event Date</Label>
                          <div
                            className={
                              !!isEdit ? "input-group d-none" : "input-group"
                            }
                          >
                            <Flatpickr
                              className="form-control"
                              id="event-start-date"
                              name="defaultDate"
                              placeholder="Select Date"
                              value={validation.values.defaultDate || ""}
                              options={{
                                mode: "range",
                                dateFormat: "Y-m-d",
                              }}
                              onChange={(date) => {
                                setSelectedNewDay(date);
                              }}
                            />
                            <span className="input-group-text">
                              <i className="ri-calendar-event-line"></i>
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <Label htmlFor="event-location">Location</Label>
                          <div>
                            <Input
                              type="text"
                              className={
                                !!isEdit
                                  ? "form-control d-none"
                                  : "form-control d-block"
                              }
                              name="location"
                              id="event-location"
                              placeholder="Event location"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.location || "No Location"}
                            // invalid={
                            //   validation.touched.location &&
                            //   validation.errors.location
                            //     ? true
                            //     : false
                            // }
                            />
                            {validation.touched.location &&
                              validation.errors.location ? (
                              <FormFeedback type="invalid">
                                {validation.errors.location}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <Label className="form-label">Description</Label>
                          <textarea
                            className={
                              !!isEdit
                                ? "form-control d-none"
                                : "form-control d-block"
                            }
                            id="event-description"
                            name="description"
                            placeholder="Enter a description"
                            rows="3"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.description || "No Description"}
                          // invalid={
                          //   validation.touched.description &&
                          //   validation.errors.description
                          //     ? true
                          //     : false
                          // }
                          ></textarea>
                          {validation.touched.description &&
                            validation.errors.description ? (
                            <FormFeedback type="invalid">
                              {validation.errors.description}
                            </FormFeedback>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                    <div className="hstack gap-2 justify-content-end">
                      {!!isEdit && (
                        <button
                          type="button"
                          className="btn btn-soft-danger"
                          id="btn-delete-event"
                          onClick={() => setDeleteModal(true)}
                        >
                          <i className="ri-close-line align-bottom"></i> Delete
                        </button>
                      )}
                      {isEditButton && <button
                        type="submit"
                        className="btn btn-success"
                        id="btn-save-event"
                      >
                        {!!isEdit ? "Edit Event" : "Add Event"}
                      </button>}
                    </div>
                  </Form>
                </ModalBody>
              </Modal>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

Calender.propTypes = {
  events: PropTypes.any,
  categories: PropTypes.array,
  className: PropTypes.string,
  onGetEvents: PropTypes.func,
  onAddNewEvent: PropTypes.func,
  onUpdateEvent: PropTypes.func,
  onDeleteEvent: PropTypes.func,
  onGetCategories: PropTypes.func,
};

export default Calender;
