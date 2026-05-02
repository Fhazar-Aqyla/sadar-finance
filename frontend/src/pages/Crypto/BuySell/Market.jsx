import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { market } from '../../../common/data';
import TableContainer from '../../../Components/Common/TableContainer';
import {
    Price,
    Pairs,
    HighPrice,
    LowPrice,
    MarketVolume
} from "./MarketCol";

const Market = () => {
    const columns = useMemo(
        () => [
            {
                header: "Currency",
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
                header: "Price",
                accessorKey: "price",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Price {...cell} />;
                },
            },
            {
                header: "Pairs",
                accessorKey: "pairs",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Pairs {...cell} />;
                },
            },
            {
                header: "24 High",
                accessorKey: "high",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <HighPrice {...cell} />;
                },
            },
            {
                header: "24 Low",
                accessorKey: "low",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <LowPrice {...cell} />;
                },
            },
            {
                header: "Market Volume",
                accessorKey: "marketVolume",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <MarketVolume {...cell} />;
                },
            },
            {
                header: "Volume %",
                accessorKey: "percentage",
                enableColumnFilter: false,
                cell: (cell) => (
                    <>
                        <h6 className={"text-" + cell.row.original.iconClass + " fs-13 mb-0"}>
                            <i className={cell.row.original.icon + " align-middle me-1"}></i>
                            {cell.getValue()}
                        </h6>
                    </>
                ),
            },
            {
                header: "Action",
                cell: () => (
                    <>
                        <button className="btn btn-sm btn-soft-info">Trade Now</button>
                    </>
                ),
            },
        ],
        []
    );
    return (
        <React.Fragment>
            <Card>
                <CardHeader className="border-bottom-dashed">
                    <Row className="align-items-center">
                        <Col xs={3}>
                            <h5 className="card-title mb-0">Markets</h5>
                        </Col>
                        <div className="col-auto ms-auto">
                            <div className="d-flex gap-2">
                                <button className="btn btn-primary"><i className="ri-equalizer-line align-bottom me-1"></i> Filters</button>
                            </div>
                        </div>
                    </Row>
                </CardHeader>
                <CardBody className="p-0 border-bottom border-bottom-dashed">
                    <div className="search-box">
                        <input type="text" className="form-control search border-0 py-3" placeholder="Search to currency..." />
                        <i className="ri-search-line search-icon"></i>
                    </div>
                </CardBody>
                <CardBody>
                    <TableContainer
                        columns={columns}
                        data={(market || [])}
                        isGlobalFilter={false}
                        isAddUserList={false}
                        customPageSize={8}
                        className="custom-header-css"
                        divClass="table-responsive table-card"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light text-muted"
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

export default Market;