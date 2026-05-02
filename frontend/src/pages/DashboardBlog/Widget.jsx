import { blogwidget, socialShares } from '../../common/data'
import React from 'react'

//Import Icons
import FeatherIcon from "feather-icons-react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { DashboardBlogCharts } from './DashboardBlogCharts';

const Widget = () => {
    return (
        <React.Fragment>
            <div className="col-xl-9">
                <div className="row">
                    {blogwidget.map((item, idx) => (
                        <div className="col-lg-3" key={idx}>
                            <div className="card">
                                <div className="card-body d-flex gap-3 align-items-center">
                                    <div className="avatar-sm">
                                        <div className={`avatar-title border bg-${item.bgColor}-subtle border-${item.bgColor} border-opacity-25 rounded-2 fs-17`}>
                                            <FeatherIcon icon={item.icon} className={`icon-dual-${item.bgColor}`}></FeatherIcon>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h5 className="fs-15">{item.count}</h5>
                                        <p className="mb-0 text-muted">{item.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header align-items-center d-flex">
                                <h5 className="card-title mb-0 flex-grow-1">Site Visitors</h5>
                                <div className="flex-shrink-0">
                                    <UncontrolledDropdown className='card-header-dropdown'>
                                        <DropdownToggle tag="a" href="#" className="text-reset dropdown-btn">
                                            <span className="fw-semibold text-uppercase fs-12">Sort by: </span><span className="text-muted">Current Week<i className="mdi mdi-chevron-down ms-1"></i></span>
                                        </DropdownToggle>
                                        <DropdownMenu className="dropdown-menu-end">
                                            <li><DropdownItem>Today</DropdownItem></li>
                                            <li><DropdownItem>Last Week</DropdownItem></li>
                                            <li><DropdownItem>Last Month</DropdownItem></li>
                                            <li><DropdownItem>Current Year</DropdownItem></li>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </div>
                            </div>
                            <div className="card-body">
                                <div>
                                    <DashboardBlogCharts dataColors='["--vz-primary"]' />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header align-items-center d-flex">
                                <h5 className="card-title mb-0 flex-grow-1">Top Social Media Shares</h5>
                                <div className="flex-shrink-0">
                                    <UncontrolledDropdown className='card-header-dropdown'>
                                        <DropdownToggle tag="a" href="#" className="text-reset dropdown-btn">
                                            <span className="text-muted fs-16"><i className="mdi mdi-dots-vertical align-middle"></i></span>
                                        </DropdownToggle>
                                        <DropdownMenu className="dropdown-menu-end">
                                            <li><DropdownItem>Today</DropdownItem></li>
                                            <li><DropdownItem>Last Week</DropdownItem></li>
                                            <li><DropdownItem>Last Month</DropdownItem></li>
                                            <li><DropdownItem>Current Year</DropdownItem></li>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </div>
                            </div>
                            <div className="card-body">
                                {socialShares.map((items, idx) => (
                                    <div className={`d-flex gap-2 align-items-center ${items.margin}`} key={idx}>
                                        <div className="avatar-xs flex-shrink-0">
                                            <div className={`avatar-title bg-${items.textColor}-subtle text-${items.textColor} rounded-2 fs-17`}>
                                                <i className={`ri-${items.icon}`}></i>
                                            </div>
                                        </div>
                                        <h6 className="mb-0 fs-14 flex-grow-1">{items.platform}</h6>
                                        <h6 className="flex-shrink-0 mb-0">{items.count}</h6>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Widget