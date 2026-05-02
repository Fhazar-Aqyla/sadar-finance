import React from 'react';

const Type = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue() === "Buy" ?
                <span className="type text-success">{cell.getValue()}</span>
                :
                <span className="type text-danger">{cell.getValue()}</span>
            }
        </React.Fragment>
    );
};

const Quantity = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const OrderValue = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const AvgPrice = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const Price = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const Status = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue() === "Pending" ?
                <span className="badge bg-warning-subtle text-warning text-uppercase">{cell.getValue()}</span>
                : cell.getValue() === "Successful" ?
                    <span className="badge bg-success-subtle text-success text-uppercase">{cell.getValue()}</span>
                    : cell.getValue() === "Cancelled" ?
                        <span className="badge bg-danger-subtle text-danger text-uppercase">{cell.getValue()}</span>
                        : null

            }
        </React.Fragment>
    );
};

export { Type, Quantity, OrderValue, AvgPrice, Price, Status };