import React from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../../../Components/Common/BreadCrumb';
import { RangeAreaBasicChartCode, RangeAreaChartCode } from './RangeAreaCharts';

const RangeArea = () => {
  document.title = "Apex Apex Range Area Charts | Velzon - React Admin & Dashboard Template";
  return (
      <React.Fragment>
          <div className="page-content">

              <Container fluid>
                  <BreadCrumb title="Range Area Charts" pageTitle="Apexcharts" />
                  <Row>
                      <Col lg={6}>
                          <Card>
                              <CardHeader>
                                  <h4 className="card-title mb-0">Basic Range Area Chart</h4>
                              </CardHeader>
                              <CardBody>
                                  <RangeAreaChartCode dataColors='["--vz-primary"]' />
                              </CardBody>
                          </Card>
                      </Col>

                      <Col lg={6}>
                          <Card>
                              <CardHeader>
                                  <h4 className="card-title mb-0">Combo</h4>
                              </CardHeader>
                              <CardBody>
                                  <RangeAreaBasicChartCode dataColors='["--vz-info", "--vz-danger"]' />
                              </CardBody>
                          </Card>
                      </Col>
                  </Row>
              </Container>
          </div>
      </React.Fragment>
  )
}

export default RangeArea