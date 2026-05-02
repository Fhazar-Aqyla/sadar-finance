import React from 'react';
import { Link } from 'react-router-dom';
import moment from "moment";

const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
};

const TicketsId = (cell) => {
    return (
        <React.Fragment>
            <Link to="/apps-tickets-details" className="fw-medium link-primary">{cell.getValue()}</Link>
        </React.Fragment>
    );
};

const Title = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const Client = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const AssignedTo = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const CreateDate = (cell) => {
    return (
        <React.Fragment>
            {handleValidDate(cell.getValue())}
        </React.Fragment>
    );
};

const DueDate = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const Status = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue() === "Inprogress" ? <span className="badge bg-warning-subtle  text-warning text-uppercase">{cell.getValue()}</span>
                : cell.getValue() === "New" ? <span className="badge bg-info-subtle  text-info text-uppercase">{cell.getValue()}</span>
                    : cell.getValue() === "Open" ? <span className="badge bg-success-subtle text-success text-uppercase">{cell.getValue()}</span>
                        : cell.getValue() === "Closed" ? <span className="badge bg-danger-subtle  text-danger text-uppercase">{cell.getValue()}</span>
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

export { TicketsId, Title, Client, AssignedTo, CreateDate, DueDate, Status, Priority };