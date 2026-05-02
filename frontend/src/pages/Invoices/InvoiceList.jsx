import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CardBody,
  Row,
  Col,
  Card,
  Container,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Link } from "react-router-dom";

import CountUp from "react-countup";
import moment from "moment";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";

//Import Icons
import FeatherIcon from "feather-icons-react";

import { invoiceWidgets } from "../../common/data/invoiceList";
//Import actions
import {
  getInvoices as onGetInvoices,
  deleteInvoice as onDeleteInvoice,
} from "../../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";

import Loader from "../../Components/Common/Loader";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSelector } from "reselect";

const InvoiceList = () => {
  const dispatch = useDispatch();
  const selectLayoutState = (state) => state.Invoice;
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (state) => ({
      invoices: state.invoices,
      isInvoiceSuccess: state.isInvoiceSuccess,
      error: state.error,
    })
  );
  // Inside your component
  const {
    invoices, isInvoiceSuccess, error
  } = useSelector(selectLayoutProperties);

  //delete invoice
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (invoices && !invoices.length) {
      dispatch(onGetInvoices());
    }
  }, [dispatch, invoices]);

  useEffect(() => {
    setInvoice(invoices);
  }, [invoices]);

  // Delete Data
  const onClickDelete = (invoice) => {
    setInvoice(invoice);
    setDeleteModal(true);
  };

  const handleDeleteInvoice = () => {
    if (invoice) {
      dispatch(onDeleteInvoice(invoice._id));
      setDeleteModal(false);
    }
  };


  const handleValidDate = date => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };

  const handleValidTime = (time) => {
    const time1 = new Date(time);
    const getHour = time1.getUTCHours();
    const getMin = time1.getUTCMinutes();
    const getTime = `${getHour}:${getMin}`;
    var meridiem = "";
    if (getHour >= 12) {
      meridiem = "PM";
    } else {
      meridiem = "AM";
    }
    const updateTime = moment(getTime, 'hh:mm').format('hh:mm') + " " + meridiem;
    return updateTime;
  };


  // Checked All
  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".invoiceCheckBox");

    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const deleteMultiple = () => {
    const checkall = document.getElementById("checkBoxAll");
    selectedCheckBoxDelete.forEach((element) => {
      dispatch(onDeleteInvoice(element.value));
      setTimeout(() => { toast.clearWaitingQueue(); }, 3000);
    });
    setIsMultiDeleteButton(false);
    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".invoiceCheckBox:checked");
    ele.length > 0 ? setIsMultiDeleteButton(true) : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  // Column
  const columns = useMemo(
    () => [
      {
        header: <input type="checkbox" id="checkBoxAll" className="form-check-input" onClick={() => checkedAll()} />,
        cell: (cell) => {
          return <input type="checkbox" className="invoiceCheckBox form-check-input" value={cell.getValue()} onChange={() => deleteCheckbox()} />;
        },
        id: '#',
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "ID",
        accessorKey: "invoiceId",
        enableColumnFilter: false,
        cell: (cell) => {
          return <Link to="/apps-invoices-details" className="fw-medium link-primary">{cell.getValue()}</Link>;
        },
      },
      {
        header: "Customer",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            <div className="d-flex align-items-center">
              {cell.row.original.img ? <img
                src={process.env.REACT_APP_API_URL + "/images/users/" + cell.row.original.img}
                alt=""
                className="avatar-xs rounded-circle me-2"
              /> :
                <div className="flex-shrink-0 avatar-xs me-2">
                  <div className="avatar-title bg-success-subtle text-success rounded-circle fs-13">
                    {cell.row.original.name.charAt(0) + cell.row.original.name.split(" ").slice(-1).toString().charAt(0)}
                  </div>
                </div>}
              {cell.getValue()}
            </div>
          </>
        ),
      },
      {
        header: "EMAIL",
        accessorKey: "email",
        enableColumnFilter: false,
      },
      {
        header: "COUNTRY",
        accessorKey: "country",
        enableColumnFilter: false,
      },
      {
        header: "DATE",
        accessorKey: "date",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {handleValidDate(cell.getValue())},{" "}
            <small className="text-muted">{handleValidTime(cell.getValue())}</small>
          </>
        ),
      },
      {
        header: "AMOUNT",
        accessorKey: "amount",
        enableColumnFilter: false,
      },
      {
        header: "PAYMENT STATUS",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => {
          switch (cell.getValue()) {
            case "Paid":
              return <span className="badge text-uppercase bg-success-subtle text-success"> {cell.getValue()} </span>;
            case "Unpaid":
              return <span className="badge text-uppercase bg-warning-subtle text-warning"> {cell.getValue()} </span>;
            case "Cancel":
              return <span className="badge text-uppercase bg-danger-subtle text-danger"> {cell.getValue()} </span>;
            default:
              return <span className="badge text-uppercase bg-primary-subtle text-primary"> {cell.getValue()} </span>;
          }
        }
      },
      {
        header: "Action",
        cell: (cellProps) => {
          return (
            <UncontrolledDropdown >
              <DropdownToggle
                href="#"
                className="btn btn-soft-secondary btn-sm dropdown"
                tag="button"
              >
                <i className="ri-more-fill align-middle"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem href="/apps-invoices-details">
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                  View
                </DropdownItem>

                <DropdownItem href="/apps-invoices-create">
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
                </DropdownItem>

                <DropdownItem href="/#">
                  <i className="ri-download-2-line align-bottom me-2 text-muted"></i>{" "}
                  Download
                </DropdownItem>

                <DropdownItem divider />

                <DropdownItem
                  href="#"
                  onClick={() => { const invoiceData = cellProps.row.original; onClickDelete(invoiceData); }}
                >
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    [checkedAll]
  );
  document.title = "Invoice List | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          onDeleteClick={() => handleDeleteInvoice()}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
        <Container fluid>
          <BreadCrumb title="Invoice List" pageTitle="Invoices" />
          <Row>
            {invoiceWidgets.map((invoicewidget, key) => (
              <React.Fragment key={key}>
                <Col xl={3} md={6}>
                  <Card className="card-animate">
                    <CardBody>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <p className="text-uppercase fw-medium text-muted mb-0">
                            {invoicewidget.label}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <h5
                            className={
                              "fs-14 mb-0 text-" + invoicewidget.percentageClass
                            }
                          >
                            <i className="ri-arrow-right-up-line fs-13 align-middle"></i>{" "}
                            {invoicewidget.percentage}
                          </h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                        <div>
                          <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                            <CountUp
                              start={0}
                              prefix={invoicewidget.prefix}
                              suffix={invoicewidget.suffix}
                              decimals="2"
                              end={invoicewidget.counter}
                              duration={4}
                              className="counter-value"
                            />
                          </h4>
                          <span className="badge bg-secondary me-1">
                            {invoicewidget.badge}
                          </span>{" "}
                          <span className="text-muted">
                            {" "}
                            {invoicewidget.caption}
                          </span>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title bg-light rounded fs-3">
                            <FeatherIcon
                              icon={invoicewidget.feaIcon}
                              className="text-primary icon-dual-primary"
                            />
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </React.Fragment>
            ))}
          </Row>

          <Row>
            <Col lg={12}>
              <Card id="invoiceList">
                <CardHeader className="border-0">
                  <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Invoices</h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-2 flex-wrap">
                        {isMultiDeleteButton && <button className="btn btn-primary me-1" onClick={() => setDeleteModalMulti(true)}><i className="ri-delete-bin-2-line"></i></button>}
                        <Link
                          to="/apps-invoices-create"
                          className="btn btn-soft-primary"
                        >
                          <i className="ri-add-line align-bottom me-1"></i> Create
                          Invoice
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-0">
                  <div>
                    {isInvoiceSuccess && invoices.length ? (
                      <TableContainer
                        columns={columns}
                        data={(invoices || [])}
                        isGlobalFilter={true}
                        isAddUserList={false}
                        customPageSize={10}
                        className="custom-header-css"
                        divClass="table-responsive table-card"
                        tableClass="align-middle table-nowrap"
                        theadClass="text-muted"
                        thClass="text-muted"
                        isInvoiceListFilter={true}
                        SearchPlaceholder='Search for customer, email, country, status or something...'
                      />
                    ) : (<Loader error={error} />)
                    }
                    <ToastContainer closeButton={false} limit={1} />
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

export default InvoiceList;
