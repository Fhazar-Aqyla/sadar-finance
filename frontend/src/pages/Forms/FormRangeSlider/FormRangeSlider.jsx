import React, { useEffect, useState } from "react";
import { Card, Col, Row, CardHeader, Container, Form, CardBody } from "reactstrap";
//import Components
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Nouislider from "nouislider-react";
import 'nouislider/distribute/nouislider.css';

const FormRangeSlider = () => {

  const [mincost, setMincost] = useState(0);
  const [maxcost, setMaxcost] = useState(2000);
  //slider function
  const onUpDate = (value) => {
    setMincost(value[0]);
    setMaxcost(value[1]);
  };

  useEffect(() => {
    onUpDate([mincost, maxcost]);
  }, [mincost, maxcost]);

  useEffect(() => {
    let slider = document.getElementById("product-price-range");
    slider?.setAttribute("data-slider-color", "success");
  }, [])

  const pipsOptions = {
    mode: 'positions',
    values: [0, 25, 50, 75, 100],
    density: 4,
    format: {
      to: (value) => parseInt(value),
      from: (value) => parseInt(value),
    }
  };

  document.title = "Range Slider | Velzon - React Admin & Dashboard Template"

  return (
    <React.Fragment>

      <div className="page-content">

        <Container fluid>
          <BreadCrumb title="Range Slider" pageTitle="Forms" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="align-items-center d-flex">
                  <h4 className="card-title mb-0 flex-grow-1">Bootstrap Range</h4>
                </CardHeader>

                <CardBody>
                  <div className="live-preview">
                    <div>
                      <div>
                        <h5 className="fs-14">Default Range</h5>
                        <p className="text-muted">Use <code>form-range</code> class to create a default range.</p>

                        <Form>
                          <input type="range" className="form-range" id="customRange1" />
                        </Form>
                      </div>

                      <div className="mt-4">
                        <h5 className="fs-14">Disabled</h5>
                        <p className="text-muted">Use <code>disabled</code> attribute on an input to give it a grayed out appearance and remove pointer events.</p>

                        <Form>
                          <input type="range" className="form-range" id="disabledRange" disabled />
                        </Form>
                      </div>

                      <div className="mt-4">
                        <h5 className="fs-14">Min and Max</h5>
                        <p className="text-muted">Use <code>min</code> and <code>max</code> attribute with specified range input respectively.</p>

                        <Form>
                          <input type="range" className="form-range" min="0" max="5" id="customRange2" />
                        </Form>
                      </div>

                      <div className="mt-4">
                        <h5 className="fs-14">Steps</h5>
                        <p className="text-muted">By default, range inputs "snap" to integer values. To change this, you can specify a step value. In the example below, we double the number of steps by using <code>step="0.5"</code> attribute.</p>

                        <Form>
                          <input type="range" className="form-range" min="0" max="5" step="0.5" id="customRange3" />
                        </Form>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>


          {/* nouislider */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Nouislider</h4>
                </CardHeader>

                <CardBody>
                  <p className="text-muted mb-4">noUiSlider is a lightweight JavaScript range slider</p>
                  <div className="live-preview">
                    <div>
                      <div className="mb-3">
                        <Row className="align-items-center">
                          <Col lg={3}>
                            <h5 className="fs-14">Basic Example</h5>
                          </Col>
                          <Col lg={9}>
                            <div data-rangeslider data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[0, 50]}
                                connect
                                onSlide={onUpDate}
                                id="product-price-range"
                                className='slider1'
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row className="align-items-center">
                          <Col lg={3}>
                            <h5 className="fs-14">Multi elements range handle</h5>
                          </Col>
                          <Col lg={9}>
                            <div data-multielement data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[20, 80]}
                                connect
                                onSlide={onUpDate}
                                id="product-price-range"
                                className='slider2'
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row>
                          <Col lg={3}>
                            <h5 className="fs-14">Non linear slider</h5>
                          </Col>
                          <Col lg={9}>
                            <div id="nonlinear" data-slider-color="success">
                              <Nouislider
                                range={{
                                  min: 0,
                                  max: 100,
                                }}
                                start={[50]}
                                connect
                                onSlide={onUpDate}
                              />
                            </div>
                            <div className="d-flex justify-content-between">
                              <div className="example-val" id="lower-value"></div>
                              <div className="example-val" id="upper-value"></div>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>



                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row className="align-items-center">
                          <Col lg={3}>
                            <h5 className="fs-14">Merging overlapping tooltips</h5>
                          </Col>
                          <Col lg={9}>
                            <div className="slider" id="slider-merging-tooltips" data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[25, 75]}
                                connect
                                onSlide={onUpDate}
                                tooltips
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row>
                          <Col lg={3}>
                            <h5 className="fs-14">Only showing tooltips when sliding handle</h5>
                          </Col>
                          <Col lg={9}>
                            <div className="slider" id="slider-hide" data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[20, 80]}
                                onSlide={onUpDate}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="mt-4 mb-5">
                        <Row>
                          <Col lg={3}>
                            <h5 className="fs-14">Moving the slider by clicking pips</h5>
                          </Col>
                          <Col lg={9}>
                            <div className="slider" id="slider-pips" data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[50, 50]}
                                connect
                                onSlide={onUpDate}
                                pips={pipsOptions}
                                id="product-price-range"
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row>
                          <Col lg={3}>
                            <h5 className="fs-14">Colored Connect Elements</h5>
                          </Col>
                          <Col lg={9}>
                            <div className="slider" id="slider-color" data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[20, 40, 60, 80]}
                                connect
                                onSlide={onUpDate}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row>
                          <Col lg={3}>
                            <h5 className="fs-14">Creating a toggle</h5>
                          </Col>
                          <Col lg={9}>
                            <div id="slider-toggle" data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[10, 10]}
                                connect
                                onSlide={onUpDate}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="border border-dashed"></div>

                      <div className="my-4">
                        <Row>
                          <Col lg={3}>
                            <h5 className="fs-14">Soft limits</h5>
                          </Col>
                          <Col lg={9}>
                            <div id="soft" data-slider-color="success">
                              <Nouislider
                                range={{ min: 0, max: 100 }}
                                start={[50, 50]}
                                connect
                                onSlide={onUpDate}
                                pips={pipsOptions}
                                id="product-price-range"
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>

                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* color scheme */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Color Scheme</h4>
                </CardHeader>
                <CardBody>

                  <Row>
                    <Col xl={4} lg={6}>
                      <div>
                        <h5 className="fs-14">Primary</h5>
                        <p className="text-muted mb-4">Use <code>data-rangeslider data-slider-color=&quot;primary&quot;</code> attribute to set primary color scheme.</p>
                        <div data-rangeslider data-slider-color="primary">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xl={4} lg={6}>
                      <div className="mt-4 mt-lg-0">
                        <h5 className="fs-14">Secondary</h5>
                        <p className="text-muted mb-4">Use <code>data-rangeslider data-slider-color=&quot;secondary&quot;</code> attribute to set secondary color scheme.</p>
                        <div data-rangeslider data-slider-color="secondary">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xl={4} lg={6}>
                      <div className="mt-4 mt-xl-0">
                        <h5 className="fs-14">Success</h5>
                        <p className="text-muted mb-4">Use <code>data-rangeslider data-slider-color=&quot;success&quot;</code> attribute to set success color scheme.</p>
                        <div data-rangeslider data-slider-color="success">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <Col xl={4} lg={6}>
                      <div className="mt-4">
                        <h5 className="fs-14">Info</h5>
                        <p className="text-muted mb-4">Use <code>data-rangeslider data-slider-color=&quot;info&quot;</code> attribute to set info color scheme.</p>
                        <div data-rangeslider data-slider-color="info">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xl={4} lg={6}>
                      <div className="mt-4">
                        <h5 className="fs-14">Warning</h5>
                        <p className="text-muted mb-4">Use <code>data-slider-color=&quot;warning&quot;</code> attribute to set warning color scheme.</p>
                        <div data-rangeslider data-slider-color="warning">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>

                    <Col xl={4} lg={6}>
                      <div className="mt-4">
                        <h5 className="fs-14">Danger</h5>
                        <p className="text-muted mb-4">Use <code>data-rangeslider data-slider-color=&quot;danger&quot;</code> attribute to set danger color scheme.</p>
                        <div data-rangeslider data-slider-color="danger">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <Col xl={4} lg={6}>
                      <div className="mt-4">
                        <h5 className="fs-14">Dark</h5>
                        <p className="text-muted mb-4">Use <code>data-rangeslider data-slider-color=&quot;dark&quot;</code> attribute to set dark color scheme.</p>
                        <div data-rangeslider data-slider-color="dark">
                          <Nouislider
                            range={{ min: 0, max: 100 }}
                            start={[0, 50]}
                            connect
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>



        </Container>
      </div>
    </React.Fragment>
  );
};

export default FormRangeSlider;
