import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../../../Components/Common/BreadCrumb';
import {BasicTreemap,MultiTreemap,DiffColorTreemap,ColorRangeTreemap} from './TreemapCharts'

const TreemapCharts = () => {
    document.title="Apex Treemap Charts | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
            <div className="page-content">
                <Container fluid>
                        <BreadCrumb title="Treemap Charts" pageTitle="Apexcharts" />
                        <Row>
                            <Col xl={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Basic Treemap Charts</h4>
                                    </CardHeader>

                                    <CardBody>
                                        <BasicTreemap dataColors='["--vz-primary"]'/>
                                    </CardBody>
                                </Card>
                            </Col>
                            

                            <Col xl={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Multi-Dimensional Treemap Chart</h4>
                                    </CardHeader>

                                    <CardBody>
                                        <MultiTreemap dataColors='["--vz-primary","--vz-info"]'/>
                                    </CardBody>
                                </Card>
                            </Col>                            
                        </Row>                       

                        <Row>
                            <Col xl={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Distributed Treemap Chart (Different Color for  each Cell)</h4>
                                    </CardHeader>

                                    <CardBody>
                                        <DiffColorTreemap dataColors='["--vz-primary", "--vz-success", "--vz-info","--vz-light"]'/>
                                    </CardBody>
                                </Card>
                            </Col>                            

                            <Col xl={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Treemap Chart with Color Ranges</h4>
                                    </CardHeader>
                                    <CardBody>
                                        <ColorRangeTreemap dataColors='["--vz-info","--vz-primary"]'/>
                                    </CardBody>
                                </Card>
                            </Col>                            
                        </Row>                     
                    </Container>
            </div>
        </React.Fragment>
  )
}

export default TreemapCharts