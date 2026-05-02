import React, { useMemo } from "react";
import { Container } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import { Link } from "react-router-dom";

import { NFTRanking } from "../../../common/data";

const Ranking = () => {
    document.title = "Ranking | Velzon - React Admin & Dashboard Template";

    // Ranking Column
    const columns = useMemo(
        () => [
            {
                header: "Ranking",
                accessorKey: "ranking",
                enableColumnFilter: false,
                cell: (cell) => {
                    if (cell.getValue() < 4) {
                        return (<div className="ranking text-info fw-semibold">#{cell.getValue()}</div>);
                    } else {
                        return (<div className="ranking">#{cell.getValue()}</div>);
                    }
                }
            },
            {
                header: "Collection",
                accessorKey: "collection",
                enableColumnFilter: false,
                cell: (cell) => (
                    <>
                        <div className="collection">
                            <div className="d-flex align-items-center">
                                <img src={cell.row.original.img} alt="" className="avatar-xs rounded-circle object-fit-cover me-2" /> <Link to="/apps-nft-item-details" className="text-body">{cell.getValue()}</Link>
                            </div>
                        </div>
                    </>
                ),
            },
            {
                header: "Volume",
                accessorKey: "volume_price",
                enableColumnFilter: false,
            },
            {
                header: "24h%",
                accessorKey: "hours",
                enableColumnFilter: false,
                cell: (cell) => {
                    if (cell.getValue() > 0) {
                        return (<h6 className="text-success mb-1 24h" > {cell.getValue()} ETH</h6 >);
                    } else {
                        return (<h6 className="text-danger mb-1 24h">{cell.getValue()} ETH</h6>);
                    }
                }
            },
            {
                header: "7d%",
                accessorKey: "day",
                enableColumnFilter: false,
                cell: (cell) => {
                    if (cell.getValue() > 0) {
                        return (<h6 className="text-success mb-1 7d" > {cell.getValue()} ETH</h6 >);
                    } else {
                        return (<h6 className="text-danger mb-1 7d">{cell.getValue()} ETH</h6>);
                    }
                }
            },
            {
                header: "Item",
                accessorKey: "item",
                enableColumnFilter: false,
            },
            {
                header: "Floor Price",
                accessorKey: "floor_price",
                enableColumnFilter: false,
            },
        ],
        []);
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Ranking" pageTitle="NFT Marketplace" />
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card" id="contactList">
                                <div className="card-header border-0">
                                    <div className="d-flex align-items center">
                                        <h5 className="card-title mb-0 flex-grow-1">The top NFTs ranking on Velzon</h5>
                                        <p className="text-muted mb-0">Updated: 28 April, 2022 08:05:00</p>
                                    </div>
                                </div>
                                
                                <div className="card-body pt-0">
                                    {NFTRanking && NFTRanking.length > 0 ? (
                                        <TableContainer
                                            columns={columns}
                                            data={(NFTRanking || [])}
                                            isGlobalFilter={true}
                                            isAddUserList={false}
                                            customPageSize={10}
                                            className="custom-header-css"
                                            divClass="table-responsive table-card mb-1"
                                            tableClass="align-middle table-nowrap"
                                            theadClass="table-light text-muted"
                                            isNFTRankingFilter={true}
                                            SearchPlaceholder='Search for...'
                                        />
                                    ) : (
                                        <div className="noresult">
                                            <div className="text-center">
                                                <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#405189,secondary:#0ab39c" style={{ width: "75px", height: "75px" }}></lord-icon>
                                                <h5 className="mt-2">Sorry! No Result Found</h5>
                                                <p className="text-muted mb-0">We've searched more than 150+ ranking We did not find any ranking for you search.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Ranking;
