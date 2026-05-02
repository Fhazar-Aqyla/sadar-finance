import React from "react";
import { NavLink } from "react-router-dom";

const AppId = (cell) => {
  return (
    <NavLink to="#" className="text-body fw-bold">
      #VZ0{cell.getValue() ? cell.getValue() < 10 ? ("0" + cell.getValue()) : cell.getValue() : ""}
    </NavLink>
  );
};
const Name = (cell) => {
  return <React.Fragment>{cell.getValue()}</React.Fragment>;
};
const Designation = (cell) => {
  return <React.Fragment>{cell.getValue()}</React.Fragment>;
};

const Date = (cell) => {
  return <React.Fragment>{cell.getValue()}</React.Fragment>;
};


const Contact = (cell) => {
  return <React.Fragment>{cell.getValue()}</React.Fragment>;
};
const Type = (cell) => {
  return <React.Fragment>{cell.getValue()}</React.Fragment>;
};

const Status = (cell) => {
  return (
    <React.Fragment>
      {cell.getValue() === "New" ? (
        <span className="badge bg-info-subtle text-info text-uppercase">
          {cell.getValue()}
        </span>
      ) : cell.getValue() === "Rejected" ? (
        <span className="badge bg-danger-subtle text-danger text-uppercase">
          {cell.getValue()}
        </span>
      ) : cell.getValue() === "Pending" ? (
        <span className="badge bg-warning-subtle text-warning text-uppercase">
          {cell.getValue()}
        </span>
      ) : cell.getValue() === "Approved" ? (
        <span className="badge bg-success-subtle text-success text-uppercase">
          {cell.getValue()}
        </span>
      ) : null}
    </React.Fragment>
  );
};

export { AppId, Name, Designation, Date, Contact, Type, Status };
