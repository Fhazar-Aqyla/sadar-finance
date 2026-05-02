import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../../../Components/Common/BreadCrumb';

import {
    BasicColumn,
    ColumnWithLable,
    StackedColumn,
    StackedColumn2,
    ColumnMarker,
    RotateLable,
    NagetiveLable,
    RangeColumn,
    DynamicColumn,
    Quarter,
    DistributedColumn,
    ColumnGroupLabels,
    StackedColumnColors,
    DumbBell
} from "./ColumnCharts";

const ColumnCharts = () => {
    document.title = "Apex Column Charts | Velzon - React Admin & Dashboard Template";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Column Charts" pageTitle="Apexcharts" />
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Basic Column Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <BasicColumn dataColors='["--vz-info", "--vz-primary", "--vz-success"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Column with Data Labels</h4>
                                </CardHeader>
                                <CardBody>
                                    <ColumnWithLable dataColors='["--vz-primary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Stacked Column Charts</h4>
                                </CardHeader>
                                <CardBody>
                                    <StackedColumn dataColors='["--vz-primary", "--vz-success", "--vz-info", "--vz-light"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Stacked Column 100</h4>
                                </CardHeader>
                                <CardBody>
                                    <StackedColumn2 dataColors='["--vz-primary", "--vz-info", "--vz-success"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Grouped Stacked Columns</h4>
                                </CardHeader>

                                <CardBody>
                                    <StackedColumnColors dataColors='["--vz-success", "--vz-primary","--vz-secondary", "--vz-danger"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Dumbbell Chart</h4>
                                </CardHeader>

                                <CardBody>
                                    <DumbBell dataColors='["--vz-success", "--vz-primary"]' />
                                </CardBody>
                            </Card>
                        </Col>

                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Column with Markers</h4>
                                </CardHeader>
                                <CardBody>
                                    <ColumnMarker dataColors='["--vz-success", "--vz-primary"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Column with Rotated Labels</h4>
                                </CardHeader>
                                <CardBody>
                                    <RotateLable dataColors='["--vz-info"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Column with Nagetive Values</h4>
                                </CardHeader>
                                <CardBody>
                                    <NagetiveLable dataColors='["--vz-primary", "--vz-info", "--vz-success"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Range Column Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <RangeColumn dataColors='["--vz-primary", "--vz-info"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Dynamic Loaded Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <div id="dynamicloadedchart-wrap" dir="ltr">
                                        <div id="chart-year" className="apex-charts">
                                            <DynamicColumn dataColors='["--vz-primary", "--vz-success", "--vz-light", "--vz-secondary", "--vz-primary-rgb, 0.6", "--vz-info"]' />
                                        </div>
                                        <div id="chart-quarter" className="apex-charts">
                                            <Quarter dataColors='["--vz-primary"]' />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Distributed Columns Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <DistributedColumn dataColors='["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-dark", "--vz-info"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Column with Group Label</h4>
                                </CardHeader>
                                <CardBody>
                                    <ColumnGroupLabels dataColors='["--vz-info"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default ColumnCharts;