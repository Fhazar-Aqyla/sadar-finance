import React from 'react'

import avatar1 from "../../assets/images/users/avatar-1.jpg"
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import { DeviceCharts } from './DashboardBlogCharts'

const Device = () => {
    return (
        <React.Fragment>
            <div className="col-xl-4">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex">
                                    <div className="flex-shrink-0 me-3">
                                        <img src={avatar1} alt="" className="avatar-sm rounded-circle img-thumbnail" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <h5 className="mb-1 card-title">Anna Adame</h5>
                                                <p className="mb-0 text-muted">Founder</p>
                                            </div>

                                            <div className="flex-shrink-0 dropdown ms-2">
                                                <UncontrolledDropdown className='btn btn-light btn-sm'>
                                                    <DropdownToggle tag="a" href="#" className="text-reset dropdown-btn">
                                                        <i className="bx bxs-cog align-middle me-1"></i> Setting
                                                    </DropdownToggle>
                                                    <DropdownMenu className="dropdown-menu-end">
                                                        <li><DropdownItem>Action</DropdownItem></li>
                                                        <li><DropdownItem>Another action</DropdownItem></li>
                                                        <li><DropdownItem>Something else</DropdownItem></li>
                                                    </DropdownMenu>
                                                </UncontrolledDropdown>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-4">
                                                <div className="border p-2 rounded border-dashed">
                                                    <p className="text-muted text-truncate mb-2">Total Post</p>
                                                    <h5 className="mb-0">26</h5>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="border p-2 rounded border-dashed">
                                                    <p className="text-muted text-truncate mb-2">Subscribes</p>
                                                    <h5 className="mb-0">17k</h5>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="border p-2 rounded border-dashed">
                                                    <p className="text-muted text-truncate mb-2">Viewers</p>
                                                    <h5 className="mb-0">487k</h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-header align-items-center d-flex">
                                <h5 className="card-title mb-0 flex-grow-1">Used Device</h5>
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
                                <DeviceCharts id="gradient_chart" dataColors='["--vz-primary", "--vz-success", "--vz-warning"]' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Device