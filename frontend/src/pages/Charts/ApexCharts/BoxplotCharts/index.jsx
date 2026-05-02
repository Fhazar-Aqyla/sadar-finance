import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../../../Components/Common/BreadCrumb';

import {
    Basic,
    Scatter,
    Horizontal
} from "./BoxplotCharts";

const BoxplotCharts = () => {
    document.title="Apex Boxplot Charts | Velzon - React Admin & Dashboard Template";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Boxplot Charts" pageTitle="Apexcharts" />
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Basic Box Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <Basic dataColors='["--vz-primary", "--vz-info"]'/>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Boxplot with Scatter Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <Scatter dataColors='["--vz-succcess", "--vz-info", "--vz-light", "--vz-primary"]'/>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Horizontal BoxPlot</h4>
                                </CardHeader>
                                <CardBody>
                                    <Horizontal dataColors='["--vz-light", "--vz-secondary-bg"]' />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default BoxplotCharts;