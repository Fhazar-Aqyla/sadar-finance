import { listData } from '../../../../common/data'
import Pagination from '../../../../Components/Common/Pagination'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Col, Row } from 'reactstrap'

const MainList = () => {
    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPageData = 6;
    const indexOfLast = currentPage * perPageData;
    const indexOfFirst = indexOfLast - perPageData;
    const currentdata = useMemo(() => listData?.slice(indexOfFirst, indexOfLast), [indexOfFirst, indexOfLast])

    return (
        <React.Fragment>
            <div className="col-xxl-9">
                <div className="row g-4 mb-3">
                    <div className="col-sm-auto">
                        <div>
                            <Link to="/apps-projects-create" className="btn btn-success"><i className="ri-add-line align-bottom me-1"></i> Add New</Link>
                        </div>
                    </div>
                    <div className="col-sm">
                        <div className="d-flex justify-content-sm-end gap-2">
                            <div className="search-box ms-2">
                                <input type="text" className="form-control" placeholder="Search..." />
                                <i className="ri-search-line search-icon"></i>
                            </div>

                            <select className="form-control w-md" defaultValue="Yesterday" style={{width: "152px"}}>
                                <option value="All">All</option>
                                <option value="Today">Today</option>
                                <option value="Yesterday">Yesterday</option>
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">Last 30 Days</option>
                                <option value="This Month">This Month</option>
                                <option value="Last Year">Last Year</option>
                            </select>

                        </div>
                    </div>
                </div>

                <Row className='gx-4'>
                    {currentdata.map((item, idx) => (
                        <Col xxl={12} key={idx}>
                            <Card>
                                <CardBody>
                                    <div className="row g-4">
                                        <div className="col-xxl-3 col-lg-5">
                                            <img src={item.image} alt="" className="img-fluid rounded w-100 object-fit-cover" />
                                        </div>
                                        <div className="col-xxl-9 col-lg-7">
                                            <p className="mb-2 text-primary text-uppercase">{item.category}</p>
                                            <Link to="/pages-blog-overview">
                                                <h5 className="fs-15 fw-semibold">{item.title}</h5>
                                            </Link>
                                            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                                                <span className="text-muted"><i className="ri-calendar-event-line me-1"></i> {item.date}</span> | <span className="text-muted"><i className="ri-eye-line me-1"></i> {item.views}</span> | <Link to="/pages-profile"><i className="ri-user-3-line me-1"></i> Admin</Link>
                                            </div>
                                            <p className="text-muted mb-2">{item.description}</p>
                                            <Link to="/pages-blog-overview" className="text-decoration-underline">Read more <i className="ri-arrow-right-line"></i></Link>
                                            <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                                                {item.tags.map((item, idx) => (
                                                    <Link to="#!" key={idx} className="badge text-success bg-success-subtle">{item}</Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="row g-0 text-center text-sm-start align-items-center mb-4">
                    <div className="col-sm-6">
                        <div>
                            <p className="mb-sm-0 text-muted">Showing <span className="fw-semibold">1</span> to <span className="fw-semibold">6</span> of <span className="fw-semibold text-decoration-underline">21</span> entries</p>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <Pagination
                            perPageData={perPageData}
                            data={listData}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                </div>



            </div>
        </React.Fragment>
    )
}

export default MainList