import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
};


const OrdersId = (cell) => {
    return (
        <React.Fragment>
            <Link to="/apps-tasks-details" className="fw-medium link-primary">{cell.getValue()}</Link>
        </React.Fragment>
    );
};

const Project = (cell) => {
    return (
        <React.Fragment>
            <Link to="/apps-projects-overview" className="fw-medium link-primary">{cell.getValue()}</Link>
        </React.Fragment>
    );
};

const Tasks = (cell, onEditIconClick, onDeleteIconClick) => {
    return (
        <React.Fragment>
            <div className="d-flex">
                <div className="flex-grow-1 tasks_name">{cell.getValue()}</div>
                <div className="flex-shrink-0 ms-4">
                    <ul className="list-inline tasks-list-menu mb-0">
                        <li className="list-inline-item">
                            <Link to="/apps-tasks-details">
                                <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                            </Link>
                        </li>
                        <li className="list-inline-item">
                            <Link to="#" onClick={onEditIconClick}>
                                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                            </Link>
                        </li>
                        <li className="list-inline-item">
                            <Link to="#" className="remove-item-btn" onClick={onDeleteIconClick}>
                                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </React.Fragment>
    );
};

const CreateBy = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const AssignedTo = (cell) => {
    return (
        <React.Fragment>
            <div className="avatar-group">
                {(cell.getValue() || []).map((item, index) => (
                    <Link key={index} to="#" className="avatar-group-item">
                        <img src={item.img} alt="" className="rounded-circle avatar-xxs" />
                    </Link>
                ))}
            </div>
        </React.Fragment>
    );
};

const DueDate = (cell) => {
    return (
        <React.Fragment>
            {handleValidDate(cell.getValue())}
        </React.Fragment>
    );
};

const Status = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue() === "Inprogress" ?
                <span className="badge bg-secondary-subtle text-secondary text-uppercase">{cell.getValue()}</span>
                :
                cell.getValue() === "New" ?
                    <span className="badge bg-info-subtle text-info text-uppercase">{cell.getValue()}</span>
                    : cell.getValue() === "Completed" ?
                        <span className="badge bg-success-subtle text-success text-uppercase">{cell.getValue()}</span>
                        : cell.getValue() === "Pending" ?
                            <span className="badge bg-warning-subtle text-warning text-uppercase">{cell.getValue()}</span>
                            : null
            }
        </React.Fragment>
    );
};

const Priority = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue() === "Medium" ?
                <span className="badge bg-warning text-uppercase">{cell.getValue()}</span>
                :
                cell.getValue() === "High" ?
                    <span className="badge bg-danger text-uppercase">{cell.getValue()}</span>
                    : cell.getValue() === "Low" ?
                        <span className="badge bg-success text-uppercase">{cell.getValue()}</span>
                        : null
            }
        </React.Fragment>
    );
};


export { OrdersId, Project, Tasks, CreateBy, AssignedTo, DueDate, Status, Priority };