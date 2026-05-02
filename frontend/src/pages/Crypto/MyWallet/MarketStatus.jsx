import React, { useMemo } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import TableContainer from '../../../Components/Common/TableContainer';
import { marketStatus } from "../../../common/data";
import { Link } from "react-router-dom";

import { Quantity, AvgPrice, CurrentValue, Returns } from "./MarketStatusCol";

const MarketStatus = () => {
    const columns = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "coinName",
                enableColumnFilter: false,
                cell: (cell) => (
                    <>
                        <div className="d-flex align-items-center fw-medium">
                            <img src={cell.row.original.img} alt="" className="avatar-xxs me-2" />
                            <Link to="#" className="currency_name">{cell.getValue()}</Link>
                        </div>
                    </>
                ),
            },
            {
                header: "Quantity",
                accessorKey: "quantity",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Quantity {...cell} />;
                },
            },
            {
                header: "Avg Price",
                accessorKey: "avgPrice",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <AvgPrice {...cell} />;
                },
            },
            {
                header: "Current Value",
                accessorKey: "value",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <CurrentValue {...cell} />;
                },
            },
            {
                header: "Returns",
                accessorKey: "returns",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Returns {...cell} />;
                },
            },
            {
                header: "Returns %x",
                accessorKey: "percentage",
                enableColumnFilter: false,
                cell: (cell) => (
                    <>
                        <h6 className={"text-" + cell.row.original.percentageClass + " fs-13 mb-0"}>
                            <i className={cell.row.original.icon + " align-middle me-1"}></i>
                            {cell.getValue()}
                        </h6>
                    </>
                ),
            },
        ],
        []
    );
    return (
        <React.Fragment>
            <Card>
                <CardHeader className="border-bottom-dashed d-flex align-items-center">
                    <h4 className="card-title mb-0 flex-grow-1">Market Status</h4>
                    <div className="flex-shrink-0">
                        <div className="btn-group" role="group" aria-label="Basic example">
                            <button type="button" className="btn btn-primary btn-sm">Today</button>
                            <button type="button" className="btn btn-outline-primary btn-sm">Overall</button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <TableContainer
                        columns={columns}
                        data={(marketStatus || [])}
                        isGlobalFilter={false}
                        isAddUserList={false}
                        customPageSize={6}
                        className="custom-header-css"
                        divClass="table-responsive table-card mb-3"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light text-muted"
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

export default MarketStatus;