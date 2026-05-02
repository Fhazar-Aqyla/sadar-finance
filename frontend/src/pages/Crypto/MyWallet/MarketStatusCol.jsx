import React from 'react';

const Quantity = (cell) => {
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

const CurrentValue = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

const Returns = (cell) => {
    return (
        <React.Fragment>
            {cell.getValue()}
        </React.Fragment>
    );
};

export { Quantity, AvgPrice, CurrentValue, Returns }; 