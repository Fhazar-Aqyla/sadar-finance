import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
import TableContainer from '../../../Components/Common/TableContainer';
import {
    Type,
    Quantity,
    OrderValue,
    AvgPrice,
    Price,
    Status
} from './OrderCol';

const AllOrders = ({ orderList }) => {
    const columns = useMemo(
        () => [
            {
                header: "Date",
                accessorKey: "date",
                enableColumnFilter: false,
                cell: (cell) => (
                    <>
                        {cell.getValue()}{" "}
                        <small className="text-muted">{cell.row.original.time}</small>
                    </>
                ),
            },
            {
                header: "Name",
                accessorKey: "coinName",
                enableColumnFilter: false,
                cell: (cell) => (
                    <>
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <img src={cell.row.original.img} alt="" className="avatar-xxs" />
                            </div>
                            <Link to="#" className="currency_name flex-grow-1 ms-2">{cell.getValue()}</Link>
                        </div>
                    </>
                ),
            },
            {
                header: "Type",
                accessorKey: "type",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Type {...cell} />;
                },
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
                header: "Order Value",
                accessorKey: "orderValue",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <OrderValue {...cell} />;
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
                header: "Price",
                accessorKey: "price",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Price {...cell} />;
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
        ],
        []
    );
    return (
        <React.Fragment>
            <Col lg={12}>
                <Card>
                    <CardHeader className="d-flex align-items-center border-0">
                        <h5 className="card-title mb-0 flex-grow-1">All Orders</h5>
                        <div className="flex-shrink-0">
                            <div className="flax-shrink-0 hstack gap-2">
                                <button className="btn btn-primary">Today's Orders</button>
                                <button className="btn btn-soft-secondary">Past Orders</button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={(orderList || [])}
                            isGlobalFilter={true}
                            isAddUserList={false}
                            customPageSize={8}
                            className="custom-header-css"
                            divClass="table-responsive table-card mb-1"
                            tableClass="align-middle table-nowrap"
                            theadClass="table-light text-muted"
                            isCryptoOrdersFilter={true}
                            SearchPlaceholder='Search for orders'
                        />
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default AllOrders;