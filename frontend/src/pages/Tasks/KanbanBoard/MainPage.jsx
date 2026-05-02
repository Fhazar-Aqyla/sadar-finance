import React, { useState, useEffect} from "react"
import {
  Card,
  CardBody,
  Col,
  Row,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  Label,
  Input,
  FormFeedback,
} from "reactstrap"
import { useFormik } from "formik"
import * as Yup from "yup"
import Select from "react-select";


import {
  getTasks as onGetTasks,
  addCardData as onAddCardData,
  updateCardData as onUpdateCardData,
  deleteKanban as OnDeleteKanban,
} from "../../../slices/thunks"

//redux
import { useSelector, useDispatch } from "react-redux"
import { createSelector } from "reselect"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Link } from "react-router-dom"
import SimpleBar from "simplebar-react"
// import moment from "moment"
import { ToastContainer } from "react-toastify"
import Spinners from "../../../Components/Common/Spinner";
import { AddTeamMember, headData } from "../../../common/data"
import DeleteModal from "../../../Components/Common/DeleteModal";
import Flatpickr from "react-flatpickr";
import moment from "moment";

const TasksKanban = () => {
  const dispatch = useDispatch();
  const [kanbanTasksCards, setKanbanTasksCards] = useState()

  const selectLayoutState = (state) => state.Tasks;
  const TasksKanbanProperties = createSelector(
    selectLayoutState,
    (state) => ({
      tasks: state.tasks,
      loading: state.loading
    }))

  const { tasks, loading } = useSelector(TasksKanbanProperties)

  const [isLoading, setLoading] = useState(loading)

  useEffect(() => {
    dispatch(onGetTasks())
  }, [dispatch])

  const [cards, setCards] = useState([])

  useEffect(() => {
    setCards(tasks)
  }, [tasks])




  const handleDragEnd = (result) => {
    if (!result.destination) return // If dropped outside a valid drop area, do nothing

    const { source, destination } = result
    // Reorder cards within the same card line
    if (source.droppableId === destination.droppableId) {
      const line = cards.find((line) => line.id === source.droppableId)
      const reorderedCards = Array.from(line.cards)
      const [movedCard] = reorderedCards.splice(source.index, 1)
      reorderedCards.splice(destination.index, 0, movedCard)

      const updatedLines = cards.map((line) => {
        if (line.id === source.droppableId) {
          return { ...line, cards: reorderedCards }
        }
        return line
      })

      setCards(updatedLines)
    } else {
      // Move card between different card lines
      const sourceLine = cards.find((line) => line.id === source.droppableId)
      const destinationLine = cards.find(
        (line) => line.id === destination.droppableId
      )
      const sourceCards = Array.from(sourceLine.cards)
      const destinationCards = Array.from(destinationLine.cards)
      const [movedCard] = sourceCards.splice(source.index, 1)
      destinationCards.splice(destination.index, 0, movedCard)

      const updatedLines = cards.map((line) => {
        if (line.id === source.droppableId) {
          return { ...line, cards: sourceCards }
        } else if (line.id === destination.droppableId) {
          return { ...line, cards: destinationCards }
        }
        return line
      })

      setCards(updatedLines)
    }
  }

  // create Modal
  const [modall, setModall] = useState(false)

  const handleOpen = () => {
    setModall(!modall);
    setCardHead(null)
  }

  const [cardhead, setCardHead] = useState()


  const formik = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (cardhead && cardhead.id) || "",
      name: (cardhead && cardhead.name) || "",
    } ,
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Card Title"),
    }),
    onSubmit: (values) => {

      const newCardheaderData = {
        id: (Math.floor(Math.random() * (30 - 20)) + 20).toString(),
        name: values["name"],
        cards: []
      }

      dispatch(onAddCardData(newCardheaderData))
      formik.resetForm()

      handleOpen()
    },
  })


  // badges
  const [tag, setTag] = useState();
  const [assignTag, setAssignTag] = useState([]);

  const handlestag = (tags) => {
    setTag(tags);
    const assigned = tags.map((item) => item.value);
    setAssignTag(assigned);
  };

  const tags = [
    { label: "Admin", value: "Admin" },
    { label: "Layout", value: "Layout" },
    { label: "Dashboard", value: "Dashboard" },
    { label: "Design", value: "Design" },
    { label: "Website", value: "Website" },
    { label: "Marketing", value: "Marketing" },
    { label: "Business", value: "Business" },
    { label: "Logo", value: "Logo" },
    { label: "UI/UX", value: "UI/UX" },
    { label: "Analysis", value: "Analysis" },
    { label: "Product", value: "Product" },
    { label: "Ecommerce", value: "Ecommerce" },
    { label: "Graphic", value: "Graphic" },
  ];

  // Add Modal
  const [modal, setModal] = useState(false)
  const toggle = () => {
    if (modal) {
      setModal(false)
      setImages([])
      setCard(null)
    } else {
      setModal(true)
      setAssignTag([]);
    }
  }


  const [isEdit, setIsEdit] = useState(false)
  const [card, setCard] = useState()
  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: (card && card.cardId) || "",
      title: (card && card.title) || "",
      text: (card && card.text) || "",
      badge1: (card && card.badge1) || [],
      userImages: (card && card.userImages) || [],
      botId: (card && card.botId) || "",
      eye: (card && card.eye) || "",
      que: (card && card.que) || "",
      clip: (card && card.clip) || "",
    } ,
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Your Job Title"),
      text: Yup.string().required("Please Enter Your Task Description"),
      userImages: Yup.array().min(1, 'Please select at least one team member'),
      botId: Yup.string().required("Please Enter the Dates"),
      eye: Yup.number().required("Please Enter the Views"),
      que: Yup.number().required("Please Enter the Comments Number"),
      clip: Yup.number().required("Please Enter the Pinned Views Number"),
    }),
    onSubmit: (values) => {
      if (isEdit) {
        const updatedCards = {
          id: card ? card.id : 0,
          kanId: kanbanTasksCards,
          cardId: values.id,
          title: values.title,
          text: values.text,
          badge1: values.badge1,
          botId: values.botId,
          userImages: values.userImages,
          eye: values.eye,
          que: values.que,
          clip: values.clip,
        }

        // update Job
        dispatch(onUpdateCardData(updatedCards))
        validation.resetForm()
      } else {
        const newCardData = {
          id: (Math.floor(Math.random() * (30 - 20)) + 20).toString(),
          kanId: kanbanTasksCards,
          cardId: values["id"],
          title: values["title"],
          text: values["text"],
          badge1: assignTag,
          botId: values["botId"],
          userImages: values["userImages"],
          eye: values['eye'],
          que: values["que"],
          clip: values["clip"],
        }

        dispatch(onAddCardData(newCardData))
        validation.resetForm()
      }
      toggle()
    },
  })



  const handleCardEdit = (arg, line) => {
    setModal(true)
    setCard(arg)

    let card = arg
    setCard({
      id: card.id,
      title: card.title,
      text: card.text,
      botId: card.botId,
      userImages: card.userImages,
      eye: card.eye,
      que: card.que,
      clip: card.clip,
      badge1: card.badge1
    })

    setKanbanTasksCards(line.id)
    setIsEdit(true)

    toggle()
  }

  const handleAddNewCard = (line) => {
    setCard("")
    setIsEdit(false)
    toggle()
    setKanbanTasksCards(line.id)
  };

  const [images, setImages] = useState([])

  const [deleteModal, setDeleteModal] = useState(false);

  const onClickDelete = (card) => {
    setCard(card);
    setDeleteModal(true);
  };

  const handleDeleteCard = () => {
    if (card) {
      dispatch(OnDeleteKanban(card.id));
      setDeleteModal(false);
    }
  };


  const handleImage = (image) => {
    const updatedImages = images.includes(image)
      ? images.filter((item) => item !== image)
      : [...images, image];

    setImages(updatedImages);
    validation.setFieldValue('userImages', updatedImages)
  }
  useEffect(() => {
    if (card) {
      setImages([...card?.userImages])
    }
  }, [card])




  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCard}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Card>
        <CardBody>
          <Row className="g-2">
            <div className="col-lg-auto">
              <div className="hstack gap-2">
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createboardModal" onClick={handleOpen}>
                  <i className="ri-add-line align-bottom me-1"></i> Create Board</button>
              </div>
            </div>
            <div className="col-lg-3 col-auto">
              <div className="search-box">
                <input type="text" className="form-control search" id="search-task-options" placeholder="Search for project, tasks..." />
                <i className="ri-search-line search-icon"></i>
              </div>
            </div>
            <div className="col-auto ms-sm-auto">
              <div className="avatar-group" id="newMembar">
                {(headData || []).map((item, key) => (<Link to="#" className="avatar-group-item" data-bs-toggle="tooltip" key={key} data-bs-trigger="hover" data-bs-placement="top" aria-label={item.name} data-bs-original-title={item.name}>
                  <img src={item.picture} alt="" className="rounded-circle avatar-xs" />
                </Link>))}
                <Link to="#addmemberModal" data-bs-toggle="modal" className="avatar-group-item" >
                  <div className="avatar-xs">
                    <div className="avatar-title rounded-circle">
                      +
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </Row>
        </CardBody>
      </Card>

      <div className="tasks-board mb-3 d-flex" id="kanbanboard">
        {
          isLoading ? <Spinners setLoading={setLoading} /> :
            <DragDropContext onDragEnd={handleDragEnd}>
              {(cards || []).map((line) => {
                return (
                  // header line
                  <div className="tasks-list" key={line.id}>
                    <div className="d-flex mb-3">
                      <div className="flex-grow-1">
                        <h6 className="fs-14 text-uppercase fw-semibold mb-0">{line.name} <small className={`badge bg-${line.color} align-bottom ms-1 totaltask-badge`}>{line.badge}</small></h6>
                      </div>
                      <div className="flex-shrink-0">
                        <UncontrolledDropdown className="card-header-dropdown float-end">
                          <DropdownToggle
                            className="text-reset dropdown-btn"
                            tag="a"
                            color="white"
                          >
                            <span className="fw-medium text-muted fs-12">Priority<i className="mdi mdi-chevron-down ms-1"></i></span>
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-end">
                            <DropdownItem>Priority</DropdownItem>
                            <DropdownItem>Date Added</DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                    {/* data */}
                    <SimpleBar className="tasks-wrapper px-3 mx-n3">
                      <div id="unassigned-task" className={line.cards === "object" ? "tasks" : "tasks noTask"}>
                        <Droppable droppableId={line.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {line.cards.map((card, index) => {
                                return (
                                  <Draggable
                                    key={card.id}
                                    draggableId={card.id}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        // className="card task-list"
                                        className="pb-1 task-list"
                                        id={line.name + "-task"}
                                      >
                                        <div className="card task-box" id="uptask-1">
                                          <CardBody>
                                            <Link to="#" className="text-muted fw-medium fs-14 flex-grow-1 ">{card.cardId}</Link>
                                            <UncontrolledDropdown className="float-end">
                                              <DropdownToggle
                                                className="arrow-none"
                                                tag="a"
                                                color="white"
                                              >
                                                <i className="ri-more-fill"></i>
                                              </DropdownToggle>
                                              <DropdownMenu className="dropdown-menu-end">
                                                <DropdownItem
                                                  className="edittask-details"
                                                >
                                                  View
                                                </DropdownItem>
                                                <DropdownItem
                                                  className="edittask-details"
                                                  onClick={() =>
                                                    handleCardEdit(card, line)
                                                  }
                                                >
                                                  Edit
                                                </DropdownItem>
                                                <DropdownItem
                                                  className="deletetask"
                                                  onClick={() =>
                                                    onClickDelete(card)
                                                  }
                                                >
                                                  Delete
                                                </DropdownItem>
                                              </DropdownMenu>
                                            </UncontrolledDropdown>
                                            <div className="mb-3">

                                              <h6 className="fs-15 mb-0 flex-grow-1 text-truncate task-title">
                                                <Link
                                                  to="#"
                                                  className="d-block"
                                                  id="task-name"
                                                >
                                                  {card.title}
                                                </Link>
                                              </h6>
                                            </div>
                                            <p className="text-muted">
                                              {card.text}
                                            </p>

                                            {card.picture ?
                                              <div className="tasks-img rounded mb-2" style={{ backgroundImage: `url(${card.picture})`, height: "135px" }}>
                                              </div> : ""}

                                            {/* progress */}
                                            {card.prowidth ?
                                              <div className="mb-3">
                                                <div className="d-flex mb-1">
                                                  <div className="flex-grow-1">
                                                    <h6 className="text-muted mb-0"><span className="text-secondary">{card.prowidth}</span> of 100%</h6>
                                                  </div>
                                                  <div className="flex-shrink-0">
                                                    <span className="text-muted">03 Jan, 2022</span>
                                                  </div>
                                                </div>
                                                <div className="progress rounded-3 progress-sm">
                                                  <div className={`progress-bar bg-${card.procolor}`} role="progressbar" style={{ width: `${card.prowidth}` }}></div>
                                                </div>
                                              </div>
                                              : ""
                                            }
                                            {/* badge & image */}
                                            {
                                              <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                  {card.badge1.map((badgeText, index) => (
                                                    <span key={index} className="badge bg-primary-subtle text-primary me-1">
                                                      {badgeText}
                                                    </span>
                                                  ))}
                                                </div>
                                                <div className="flex-shrink-0">
                                                  <div className="avatar-group">
                                                    {card.userImages.map((picturedata, idx) => (
                                                      <Link to="#" className="avatar-group-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Alexis" key={idx}>
                                                        <img src={picturedata.img} alt="" className="rounded-circle avatar-xxs" />
                                                      </Link>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            }

                                          </CardBody>
                                          {/* bottom */}
                                          <div className="card-footer border-top-dashed">
                                            <div className="d-flex">
                                              <div className="flex-grow-1">
                                                <span className="text-muted"><i className="ri-time-line align-bottom"></i>{card.botId}</span>
                                              </div>
                                              <div className="flex-shrink-0">
                                                <ul className="link-inline mb-0">
                                                  <li className="list-inline-item">
                                                    <Link to="#" className="text-muted"><i className="ri-eye-line align-bottom"></i> {card.eye}</Link>
                                                  </li>
                                                  <li className="list-inline-item">
                                                    <Link to="#" className="text-muted"><i className="ri-question-answer-line align-bottom"></i> {card.que}</Link>
                                                  </li>
                                                  <li className="list-inline-item">
                                                    <Link to="#" className="text-muted"><i className="ri-attachment-2 align-bottom"></i> {card.clip}</Link>
                                                  </li>
                                                </ul>
                                              </div>
                                            </div>
                                          </div>

                                          {card.botpro ?
                                            <div className="progress progress-sm">
                                              <div className={`progress-bar bg-${card.botprocolor}`} role="progressbar" style={{ width: `${card.botpro}` }} ></div>
                                            </div>
                                            : ""
                                          }

                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              })}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </SimpleBar>
                    <div className="my-2 mt-0">
                      <button className="btn btn-soft-info w-100" data-bs-toggle="modal" data-bs-target="#creatertaskModal" onClick={() => handleAddNewCard(line)}>Add More</button>
                    </div>
                  </div>
                )
              })}
            </DragDropContext>
        }
      </div>


      {/* Create Modal */}
      <Modal isOpen={modall} toggle={handleOpen} centered={true}>
        <div className="modal-content border-0" >
          <ModalHeader className=" p-3 bg-info-subtle" toggle={handleOpen}>Add Board
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={(event) => {
              event.preventDefault();
              formik.handleSubmit();
              return false
            }}>
              <Row>
                <Col lg={12}>
                  <Label htmlFor="boardName" className="form-label">Board Name</Label>
                  <Input type="text" id="boardName" placeholder="Enter board name"
                    // validaue={{ required: { value: true } }}
                    name="name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    invalid={
                      formik.touched.name && formik.errors.name
                        ? true
                        : false
                    }
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <FormFeedback type="invalid">
                      {formik.errors.name}
                    </FormFeedback>
                  ) : null}
                </Col>
                <div className="mt-4">
                  <div className="hstack gap-2 justify-content-end">
                    <button type="button" className="btn btn-light" data-bs-dismiss="modal">Close</button>
                    <button type="submit" className="btn btn-success" id="addNewBoard">Add Board</button>
                  </div>
                </div>
              </Row>
            </Form>
          </ModalBody>
        </div>

      </Modal>

      <Modal id="modalForm" isOpen={modal} toggle={toggle} centered={true} size="lg">
        <ModalHeader toggle={toggle}>
          {!!isEdit ? "Update Task" : "Add New Task"}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={e => {
              e.preventDefault()
              validation.handleSubmit()
              return false
            }}
          >
            <div className="form-group mb-3">
              <Label htmlFor="taskname" className="col-form-label">
                Task Name<span className="text-danger">*</span>
              </Label>
              <Col lg={12}>
                <Input
                  id="taskname"
                  name="title"
                  type="text"
                  className="form-control validate"
                  placeholder="Enter Task Name..."
                  validate={{ required: { value: true } }}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title || ""}
                  invalid={
                    validation.touched.title && validation.errors.title
                      ? true
                      : false
                  }
                />
                {validation.touched.title && validation.errors.title ? (
                  <FormFeedback type="invalid">
                    {validation.errors.title}
                  </FormFeedback>
                ) : null}
              </Col>
            </div>
            <div className="form-group mb-3">
              <label className="col-form-label">Task Description</label>
              <Col lg={12}>
                <textarea
                  id="text"
                  className="form-control"
                  placeholder="Enter Task Description"
                  name="text"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.text || ""}
                ></textarea>
                {validation.touched.text &&
                  validation.errors.text ? (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors.text}
                  </FormFeedback>
                ) : null}
              </Col>
            </div>

            <div className="form-group mb-3">
              <label className="col-form-label">
                Add Team Member<span className="text-danger">*</span>
              </label>
              <SimpleBar style={{ height: "200px" }}>
                <ul
                  className="list-unstyled user-list validate"
                  id="taskassignee"
                >
                  {(AddTeamMember || []).map((image, index) => {
                    const isChecked = images.some((item) => {
                      return item.id === image.id
                    });
                    return (
                      <li key={index}>
                        <div className="form-check form-check-primary mb-2 d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={"member" + image.id}
                            name="userImages"
                            onBlur={validation.handleBlur}
                            value={validation.values.userImages}
                            onChange={() => handleImage(image)}
                            checked={isChecked}
                          />
                          <label className="form-check-label ms-2" htmlFor={"member" + image.id}>
                            {image.name}
                          </label>
                          <img
                            src={image.img}
                            className="rounded-circle avatar-xs m-1"
                            alt=""
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </SimpleBar>
              {validation.touched.userImages &&
                validation.errors.userImages ? (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.userImages}
                </FormFeedback>
              ) : null}
            </div>

            <div className="form-group mb-4">
              <Label htmlFor="date-field" className="form-label">
                Date
              </Label>
              <Flatpickr
                name="botId"
                className="form-control"
                id="datepicker-publish-input"
                placeholder="Select a date"
                options={{
                  altInput: true,
                  altFormat: "d M, Y",
                  dateFormat: "d M, Y",
                }}
                onChange={(botId) => validation.setFieldValue("botId", moment(botId[0]).format("DD MMMM ,YYYY"))}
                value={validation.values.botId || ''}
              />
              {validation.errors.botId && validation.touched.botId ? (
                <FormFeedback type="invalid" className='d-block'>{validation.errors.botId}</FormFeedback>
              ) : null}
            </div>
            {/* Bottom */}
            <div className="form-group mb-4 d-flex">
              <div>
                <Label htmlFor="eyefor" className="col-form-label">
                  View
                </Label>
                <Col lg={4}>
                  <Input
                    id="eyefor"
                    name="eye"
                    type="text"
                    className="form-control validate"
                    validate={{ required: { value: true } }}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.eye || ""}
                    invalid={
                      validation.touched.eye && validation.errors.eye
                        ? true
                        : false
                    }
                  />
                  {validation.touched.eye && validation.errors.eye ? (
                    <FormFeedback type="invalid">
                      {validation.errors.eye}
                    </FormFeedback>
                  ) : null}
                </Col>
              </div>
              <div>
                <Label htmlFor="quefor" className="col-form-label">
                  Comment
                </Label>
                <Col lg={4}>
                  <Input
                    id="quefor"
                    name="que"
                    type="text"
                    className="form-control validate"
                    validate={{ required: { value: true } }}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.que || ""}
                    invalid={
                      validation.touched.que && validation.errors.que
                        ? true
                        : false
                    }
                  />
                  {validation.touched.que && validation.errors.que ? (
                    <FormFeedback type="invalid">
                      {validation.errors.que}
                    </FormFeedback>
                  ) : null}
                </Col>
              </div>
              <div>
                <Label htmlFor="clipfor" className="col-form-label">
                  Pinned
                </Label>
                <Col lg={4}>
                  <Input
                    id="clipfor"
                    name="clip"
                    type="text"
                    className="form-control validate"
                    validate={{ required: { value: true } }}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.clip || ""}
                    invalid={
                      validation.touched.clip && validation.errors.clip
                        ? true
                        : false
                    }
                  />
                  {validation.touched.clip && validation.errors.clip ? (
                    <FormFeedback type="invalid">
                      {validation.errors.clip}
                    </FormFeedback>
                  ) : null}
                </Col>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="col-form-label">
                Status<span className="text-danger">*</span>
              </label>
              <div className="col-lg-12">
                <Select
                  isMulti
                  value={tag}
                  onChange={(e) => {
                    handlestag(e);
                  }}
                  className="mb-0"
                  options={tags}
                  id="taginput-choices"
                >
                </Select>
                {validation.touched.badge1 &&
                  validation.errors.badge1 ? (
                  <FormFeedback type="invalid" className="d-block">
                    {validation.errors.badge1}
                  </FormFeedback>
                ) : null}
              </div>
            </div>

            <Row>
              <Col lg={10}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="updatetaskdetail"
                >
                  {!!isEdit ? "Update Task" : "Create Task"}
                </button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
      <ToastContainer />
    </React.Fragment>
  )
}

export default TasksKanban
