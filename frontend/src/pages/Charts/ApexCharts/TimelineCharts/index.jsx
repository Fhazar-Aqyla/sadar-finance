import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../../../Components/Common/BreadCrumb';

import {
    Basic,
    DifferentColor,
    MultiSeries,
    Advanced,
    MultipleSeries,
    DumbBell
} from "./TimelineCharts";

const TimelineCharts = () => {
    document.title = "Apex TimeLine Charts | Velzon - React Admin & Dashboard Template";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="TimeLine Charts" pageTitle="Apexcharts" />
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Basic TimeLine Charts</h4>
                                </CardHeader>
                                <CardBody>
                                    <Basic dataColors='["--vz-primary"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Different Color For Each Bar</h4>
                                </CardHeader>
                                <CardBody>
                                    <DifferentColor dataColors='["--vz-primary", "--vz-info", "--vz-success", "--vz-light", "--vz-secondary"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Multi Series Timeline</h4>
                                </CardHeader>
                                <CardBody>
                                    <MultiSeries dataColors='["--vz-primary","--vz-info"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Advanced Timeline (Multiple Range)</h4>
                                </CardHeader>
                                <CardBody>
                                    <Advanced dataColors='["--vz-primary", "--vz-info", "--vz-light"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Multiple series � Group rows</h4>
                                </CardHeader>

                                <CardBody>
                                    <MultipleSeries dataColors='["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info","--vz-gray","--vz-pink","--vz-purple","--vz-secondary", "--vz-dark"]' />
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Dumbbell Chart (Horizontal)</h4>
                                </CardHeader>

                                <CardBody>
                                    <DumbBell dataColors='["--vz-primary", "--vz-success"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default TimelineCharts;