import React from 'react'
import { Link } from 'react-router-dom'

import small4 from "../../../../assets/images/small/img-4.jpg"
import small6 from "../../../../assets/images/small/img-6.jpg"
import small7 from "../../../../assets/images/small/img-7.jpg"
import { Card, CardBody, Col } from 'reactstrap'

const Sidepanel = () => {
    return (
        <React.Fragment>
            <Col xxl={3}>
                <Card>
                    <CardBody className="p-4">
                        <div className="search-box">
                            <p className="text-muted">Search</p>
                            <div className="position-relative">
                                <input type="text" className="form-control rounded bg-light border-light" placeholder="Search..." />
                                <i className="mdi mdi-magnify search-icon"></i>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-top border-dashed border-bottom-0 border-start-0 border-end-0">
                            <p className="text-muted">Categories</p>

                            <ul className="list-unstyled fw-medium">
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Art & Design</Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Inspiration & Innovation <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">04</span></Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Business</Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Project</Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Lifestyle</Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Design Resources & Tools</Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> Travel<span className="badge badge-soft-success rounded-pill ms-1 float-end font-size-12">12</span></Link></li>
                            </ul>
                        </div>

                        <div className="mt-4 pt-4 border-top border-dashed border-bottom-0 border-start-0 border-end-0">
                            <p className="text-muted">Archive</p>

                            <ul className="list-unstyled fw-medium">
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> 2024 <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">03</span></Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> 2023 <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">06</span></Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> 2022 <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">05</span></Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> 2021 <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">05</span></Link></li>
                                <li><Link to="#" className="text-muted py-2 d-block"><i className="mdi mdi-chevron-right me-1"></i> 2020 <span className="badge badge-soft-success rounded-pill float-end ms-1 font-size-12">05</span></Link></li>
                            </ul>
                        </div>

                        <div className="mt-4 pt-4 border-top border-dashed border-bottom-0 border-start-0 border-end-0">
                            <p className="text-muted mb-2">Popular Posts</p>

                            <div className="list-group list-group-flush">

                                <Link to="#" className="list-group-item text-muted py-3 px-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-3">
                                            <img src={small7} alt="" className="avatar-md h-auto d-block rounded" />
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="fs-15 text-truncate">Beautiful Day with Friends</h5>
                                            <p className="mb-0 text-truncate">10 Apr, 2024</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link to="#" className="list-group-item text-muted py-3 px-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-3">
                                            <img src={small4} alt="" className="avatar-md h-auto d-block rounded" />
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="fs-15 text-truncate">Drawing a sketch</h5>
                                            <p className="mb-0 text-truncate">24 Mar, 2024</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link to="#" className="list-group-item text-muted py-3 px-2">
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-3">
                                            <img src={small6} alt="" className="avatar-md h-auto d-block rounded" />
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="fs-15 text-truncate">Project discussion with team</h5>
                                            <p className="mb-0 text-truncate">11 Mar, 2024</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-top border-dashed border-bottom-0 border-start-0 border-end-0">
                            <p className="text-muted">Tags</p>

                            <div className="d-flex flex-wrap gap-2 widget-tag">
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Design</Link></div>
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Development</Link></div>
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Business</Link></div>
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Project</Link></div>
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Travel</Link></div>
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Lifestyle</Link></div>
                                <div><Link to="#" className="badge bg-light text-muted font-size-12">Photography</Link></div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    )
}

export default Sidepanel