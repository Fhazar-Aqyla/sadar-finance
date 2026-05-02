import { gridData } from '../../../../common/data';
import BreadCrumb from '../../../../Components/Common/BreadCrumb'
import Pagination from '../../../../Components/Common/Pagination';
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap'

const BlogGridView = () => {

    document.title = "Grid View | Velzon - React Admin & Dashboard Template";

     //pagination
     const [currentPage, setCurrentPage] = useState(1);
     const perPageData = 8;
     const indexOfLast = currentPage * perPageData;
     const indexOfFirst = indexOfLast - perPageData;
     const currentdata = useMemo(() => gridData?.slice(indexOfFirst, indexOfLast), [indexOfFirst, indexOfLast])

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Grid View" pageTitle="Blogs" />
                    <Row className="g-4 mb-3">
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

                                <select className="form-control w-md" style={{width: "152px"}} defaultValue="Yesterday">
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
                    </Row>

                    <Row>
                        {currentdata.map((item, idx) => (
                            <Col xxl={3} lg={6} key={idx}>
                                <div className="card overflow-hidden blog-grid-card">
                                    <div className="position-relative overflow-hidden">
                                        <img src={item.image} alt="" className="blog-img object-fit-cover" />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title"><Link to="/pages-blog-overview" className="text-reset">{item.title}</Link></h5>
                                        <p className="text-muted mb-2">{item.description}</p>
                                        <Link to="/pages-blog-overview" className="link link-primary text-decoration-underline link-offset-1">Read Post <i className="ri-arrow-right-up-line"></i></Link>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <div className="row g-0 text-center text-sm-start align-items-center mb-4">
                    <div className="col-sm-6">
                        <div>
                            <p className="mb-sm-0 text-muted">Showing <span className="fw-semibold">1</span> to <span className="fw-semibold">8</span> of <span className="fw-semibold text-decoration-underline">33</span> entries</p>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <Pagination
                            perPageData={perPageData}
                            data={gridData}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                </div>

                </Container>
            </div>
        </React.Fragment>
    )
}

export default BlogGridView