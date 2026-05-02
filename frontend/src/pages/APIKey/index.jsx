import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import DeleteModal from "../../Components/Common/DeleteModal";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Widgets from "./Widgets";
import TableContainer from "../../Components/Common/TableContainer";
import { APIKeys, CreatedBy, CreatedDate, ExpiryDate, Name, Status } from "./APIKeyCol";
import { useDispatch, useSelector } from "react-redux";
import { getAPIKey } from "../../slices/thunks";
import { createSelector } from "reselect";

const APIKey = () => {
  document.title = "API Key | Velzon -  Admin & Dashboard Template";
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const onClickDelete = (order) => {
    setDeleteModal(true);
  };
  const apikeyData = createSelector(
    (state) => state.APIKey,
    (apiKey) => apiKey.apiKey
  );
// Inside your component
const apiKey = useSelector(apikeyData);

  useEffect(() => {
    dispatch(getAPIKey());
  }, [dispatch]);



  // Checked All
  const checkedAll = () => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".orderCheckBox");

    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
  };
  const columns = useMemo(
    () => [
      {
        header: (
          <Input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onClick={() => checkedAll()}
          />
        ),
        cell: (cell) => {
          return (
            <Input
              type="checkbox"
              className="orderCheckBox form-check-input"
              value={cell.getValue()}
            />
          );
        },
        id: "#",
        accessorKey: "id",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cell) => {
          return <Name {...cell} />;
        },
      },
      {
        header: "Created By",
        accessorKey: "createBy",
        enableColumnFilter: false,
        cell: (cell) => {
          return <CreatedBy {...cell} />;
        },
      },
      {
        header: "API Key",
        accessorKey: "apikey",
        enableColumnFilter: false,
        border: "1px solid black",
        cell: (cell) => {
          return <APIKeys {...cell} />;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => {
          return <Status {...cell} />;
        },
      },
      {
        header: "Created Date",
        accessorKey: "create_date",
        enableColumnFilter: false,
        cell: (cell) => {
          return <CreatedDate {...cell} />;
        },
      },
      {
        header: "Expiry Date",
        accessorKey: "expiry_date",
        enableColumnFilter: false,
        cell: (cell) => {
          return <ExpiryDate {...cell} />;
        },
      },
      {
        header: "Action",
        disableFilters: true,
        enableSorting: false,
        cell: (cell) => {
          return (
            <UncontrolledDropdown className="dropdown">
              <DropdownToggle
                role="button"
                tag="button"
                className="btn btn-soft-secondary btn-sm dropdown"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="ri-more-fill align-middle"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu dropdown-menu-end">
                <li>
                  <DropdownItem
                    className="edit-item-btn"
                    to="#api-key-modal"
                    data-bs-toggle="modal"
                  >
                    Rename
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    className="regenerate-api-btn"
                    to="#api-key-modal"
                    data-bs-toggle="modal"
                  >
                    Regenerate Key
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem className="disable-btn" to="#">
                    {cell.row.original.status === "Active" ? "Disable" : "Active"}
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    className="remove-item-btn"
                    onClick={() => {
                      onClickDelete();
                    }}
                    to="#deleteApiKeyModal"
                  >
                    Delete
                  </DropdownItem>
                </li>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
        <Container fluid>
          <BreadCrumb title="API Key" pageTitle="Apps" />

          <Row>
            <Widgets />
          </Row>

          <Row>
            <Col lg={12}>
              <Card id="apiKeyList">
                <CardHeader className="d-flex align-items-center">
                  <h5 className="card-title flex-grow-1 mb-0">API Keys</h5>
                  <div className="d-flex gap-1 flex-wrap">
                    <Button
                      type="button"
                      color="primary"
                      className="btn create-btn"
                      data-bs-toggle="modal"
                      onClick={handleShow}
                      data-bs-target="#api-key-modal"
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add API
                      Key
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div>
                    <TableContainer
                      columns={columns}
                      data={apiKey || []}
                      customPageSize={8}
                      divClass="table-responsive table-card mb-1"
                      tableClass="align-middle table-nowrap"
                      theadClass="table-light text-muted"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <div
        className="modal fade"
        id="api-key-modal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <Modal isOpen={show} toggle={handleClose} className="modal-content">
            <ModalHeader className="modal-header">Create API Key</ModalHeader>
            <ModalBody className="modal-body">
              <form autoComplete="off">
                <div
                  id="api-key-error-msg"
                  className="alert alert-danger py-2 d-none"
                ></div>
                <Input type="hidden" id="apikeyId" />
                <div className="mb-3">
                  <Label htmlFor="api-key-name" className="form-label">
                    API Key Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="api-key-name"
                    placeholder="Enter api key name"
                  />
                </div>
                <div
                  className="mb-3"
                  id="apikey-element"
                  style={{ display: "none" }}
                >
                  <Label htmlFor="api-key" className="form-label">
                    API Key
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="api-key"
                    disabled
                    value="b5815DE8A7224438932eb296Z5"
                  />
                </div>
              </form>
            </ModalBody>
            <div className="modal-footer">
              <div className="hstack gap-2 justify-content-end">
                <Button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  color="primary"
                  id="createApi-btn"
                >
                  Create API
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </React.Fragment>
  );
};

export default APIKey;
