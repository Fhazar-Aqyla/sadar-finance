import React from 'react';
import { Card, CardHeader, CardBody,Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { StoreVisitsCharts } from './DashboardEcommerceCharts';

const StoreVisits = () => {
    return (
        <React.Fragment>
            <Col xl={4}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Store Visits by Source</h4>
                        <div className="flex-shrink-0">
                            <UncontrolledDropdown className="card-header-dropdown" direction='start'>
                                <DropdownToggle tag="a" className="text-reset dropdown-btn" role="button">
                                    <span className="text-muted">Report<i className="mdi mdi-chevron-down ms-1"></i></span>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end">
                                    <DropdownItem>Download Report</DropdownItem>
                                    <DropdownItem>Export</DropdownItem>
                                    <DropdownItem>Import</DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <StoreVisitsCharts dataColors='["--vz-primary", "--vz-primary-rgb, 0.85", "--vz-primary-rgb, 0.70", "--vz-primary-rgb, 0.60", "--vz-primary-rgb, 0.45"]' />
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default StoreVisits;