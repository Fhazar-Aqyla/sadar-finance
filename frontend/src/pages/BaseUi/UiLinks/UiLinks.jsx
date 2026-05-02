import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";

import {
    LinkColorsExample, LinkUtilitiesExample, LinkOpacityExample, LinkHoverExample, UnderlineColorCode,
    UnderlineOpacityCode, UnderlineOffsetCode
} from "./UiLinksCode";

const UiLinks = () => {
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Link colors</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="link-colors-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="link-colors-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">You can use the <code>.link-*</code> classes to colorize links. Unlike the <Link to="/ui-colors"><code>.text-*</code> classes</Link>, these classes have a <code>:hover</code> and <code>:focus</code> state. Some of the link styles use a relatively light foreground color, and should only be used on a dark background in order to have sufficient contrast.</p>
                                    <div className="live-preview">
                                        <p><Link to="#" className="link-primary">Primary link</Link></p>
                                        <p><Link to="#" className="link-secondary">Secondary link</Link></p>
                                        <p><Link to="#" className="link-success">Success link</Link></p>
                                        <p><Link to="#" className="link-danger">Danger link</Link></p>
                                        <p><Link to="#" className="link-warning">Warning link</Link></p>
                                        <p><Link to="#" className="link-info">Info link</Link></p>
                                        <p><Link to="#" className="link-light">Light link</Link></p>
                                        <p><Link to="#" className="text-dark">Dark link</Link></p>
                                        <p><Link to="#" className="link-body-emphasis mb-0">Emphasis link</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup" style="height: 280px;">
                                            <code>
                                                <LinkColorsExample />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={6}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Link utilities</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="link-utilities-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="link-utilities-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">Colored links can also be modified by our link utilities.</p>
                                    <div className="live-preview">
                                        <p><Link to="#" className="link-primary link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Primary link</Link></p>
                                        <p><Link to="#" className="link-secondary link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Secondary link</Link></p>
                                        <p><Link to="#" className="link-success link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Success link</Link></p>
                                        <p><Link to="#" className="link-danger link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Danger link</Link></p>
                                        <p><Link to="#" className="link-warning link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Warning link</Link></p>
                                        <p><Link to="#" className="link-info link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Info link</Link></p>
                                        <p><Link to="#" className="link-light link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Light link</Link></p>
                                        <p><Link to="#" className="text-dark link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-100-hover">Dark link</Link></p>
                                        <p><Link to="#" className="link-body-emphasis link-offset-2 text-decoration-underline link-underline-opacity-25 link-underline-opacity-75-hover mb-0">Emphasis link</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup" style="height: 280px;">
                                            <code>
                                                <LinkUtilitiesExample />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Link Opacity</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="link-opacity-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="link-opacity-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">Change the alpha opacity of the link <code>rgba()</code> color value with utilities. Please be aware that changes to a color’s opacity can lead to links with <Link to="https://getbootstrap.com/docs/5.3/getting-started/accessibility/#color-contrast" target="_blank"><em>insufficient</em> contrast</Link>.</p>
                                    <div className="live-preview">
                                        <p><Link className="link-opacity-10" to="#">Link opacity 10</Link></p>
                                        <p><Link className="link-opacity-25" to="#">Link opacity 25</Link></p>
                                        <p><Link className="link-opacity-50" to="#">Link opacity 50</Link></p>
                                        <p><Link className="link-opacity-75" to="#">Link opacity 75</Link></p>
                                        <p className="mb-0"><Link className="link-opacity-100" to="#">Link opacity 100</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup">
                                            <code>
                                                <LinkOpacityExample />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg={6}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Link Opacity Hover</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="link-hover-opacity-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="link-hover-opacity-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">You can even change the opacity level on hover.</p>
                                    <div className="live-preview">
                                        <p><Link className="link-opacity-10-hover" to="#">Link hover opacity 10</Link></p>
                                        <p><Link className="link-opacity-25-hover" to="#">Link hover opacity 25</Link></p>
                                        <p><Link className="link-opacity-50-hover" to="#">Link hover opacity 50</Link></p>
                                        <p><Link className="link-opacity-75-hover" to="#">Link hover opacity 75</Link></p>
                                        <p className="mb-0"><Link className="link-opacity-100-hover" to="#">Link hover opacity 100</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup" style={{ height: "195px" }}>
                                            <code>
                                                <LinkHoverExample />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col xxl={4}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Underline color</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="underline-color-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="underline-color-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">Change the underline’s color independent of the link text color.</p>
                                    <div className="live-preview">
                                        <p><Link to="#" className="text-decoration-underline link-underline-primary">Primary underline</Link></p>
                                        <p><Link to="#" className="text-decoration-underline link-underline-secondary">Secondary underline</Link></p>
                                        <p><Link to="#" className="text-decoration-underline link-underline-success">Success underline</Link></p>
                                        <p><Link to="#" className="text-decoration-underline link-underline-danger">Danger underline</Link></p>
                                        <p><Link to="#" className="text-decoration-underline link-underline-warning">Warning underline</Link></p>
                                        <p><Link to="#" className="text-decoration-underline link-underline-info">Info underline</Link></p>
                                        <p><Link to="#" className="text-decoration-underline link-underline-light">Light underline</Link></p>
                                        <p className="mb-0"><Link to="#" className="text-decoration-underline link-underline-dark">Dark underline</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup">
                                            <code>
                                                <UnderlineColorCode />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xxl={4}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Underline opacity</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="underline-opacity-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="underline-opacity-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">Change the underline’s opacity. Requires adding <code>.link-underline</code> to first set an <code>rgba()</code> color we use to then modify the alpha opacity.</p>
                                    <div className="live-preview">
                                        <p><Link className="link-offset-2 text-decoration-underline link-underline link-underline-opacity-0" to="#">Underline opacity 0</Link></p>
                                        <p><Link className="link-offset-2 text-decoration-underline link-underline link-underline-opacity-10" to="#">Underline opacity 10</Link></p>
                                        <p><Link className="link-offset-2 text-decoration-underline link-underline link-underline-opacity-25" to="#">Underline opacity 25</Link></p>
                                        <p><Link className="link-offset-2 text-decoration-underline link-underline link-underline-opacity-50" to="#">Underline opacity 50</Link></p>
                                        <p><Link className="link-offset-2 text-decoration-underline link-underline link-underline-opacity-75" to="#">Underline opacity 75</Link></p>
                                        <p className="mb-0"><Link className="link-offset-2 text-decoration-underline link-underline link-underline-opacity-100" to="#">Underline opacity 100</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup">
                                            <code >
                                                <UnderlineOpacityCode />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xxl={4}>
                            <Card>
                                <CardHeader className="align-items-center d-flex">
                                    <h4 className="card-title mb-0 flex-grow-1">Underline offset</h4>
                                    <div className="flex-shrink-0">
                                        <div className="form-check form-switch form-switch-right form-switch-md">
                                            <label htmlFor="underline-offset-showcode" className="form-label text-muted">Show Code</label>
                                            <input className="form-check-input code-switcher" type="checkbox" id="underline-offset-showcode" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-muted">Change the underline’s distance from your text. Offset is set in <code>em</code> units to automatically scale with the element’s current <code>font-size</code>.</p>
                                    <div className="live-preview">
                                        <p><Link to="#">Default link</Link></p>
                                        <p><Link className="text-decoration-underline link-offset-1" to="#">Offset 1 link</Link></p>
                                        <p><Link className="text-decoration-underline link-offset-2" to="#">Offset 2 link</Link></p>
                                        <p className="mb-0"><Link className="text-decoration-underline link-offset-3" to="#">Offset 3 link</Link></p>
                                    </div>
                                    <div className="d-none code-view">
                                        <pre className="language-markup">
                                            <code>
                                                <UnderlineOffsetCode />
                                            </code>
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </div>
        </React.Fragment >
    );
}

export default UiLinks;