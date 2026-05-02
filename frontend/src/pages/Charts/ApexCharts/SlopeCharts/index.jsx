import BreadCrumb from '../../../../Components/Common/BreadCrumb';
import React from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import { BasicSlop, MultiGroup } from './Slop';

const SlopeCharts = () => {
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Slope Charts" pageTitle="Apexcharts" />
                    <Row>
                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Basic Chart</h4>
                                </CardHeader>
                                <CardBody>
                                    <BasicSlop dataColors='["--vz-primary", "--vz-success", "--vz-danger"]' />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col xl={6}>
                            <Card>
                                <CardHeader>
                                    <h4 className="card-title mb-0">Multi Group</h4>
                                </CardHeader>
                                <CardBody>
                                    <MultiGroup dataColors='["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger"]' />
                                </CardBody>
                            </Card>
                        </Col>


                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default SlopeCharts