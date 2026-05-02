import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Row, Label, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import SimpleBar from "simplebar-react";

import BreadCrumb from "../../../Components/Common/BreadCrumb";

import MultiSelect from './DualListbox';
import { country } from "../../../common/data";

// Import Image
import usFlag from "../../../assets/images/flags/us.svg"


const FormAdvanced = () => {
  const [defaultCounter, setdefaultCounter] = useState(5);
  const [lightCounter, setlightCounter] = useState(5);
  const [fullwidthCounter, setfullwidthCounter] = useState(5);
  const [lfullwidthCounter, setlfullwidthCounter] = useState(5);
  const [blueCounter, setblueCounter] = useState(5);
  const [skyCounter, setskyCounter] = useState(5);
  const [greenCounter, setgreenCounter] = useState(5);
  const [tealCounter, settealCounter] = useState(5);
  const [yellowCounter, setyellowCounter] = useState(5);
  const [redCounter, setredCounter] = useState(5);

  function countUP(id, prev_data_attr) {
    id(prev_data_attr + 1);
  }

  function countDown(id, prev_data_attr) {
    id(prev_data_attr - 1);
  }

  const [seletedCountry, setseletedCountry] = useState('');
  const [seletedCountry1, setseletedCountry1] = useState({});
  const [seletedCountry2, setseletedCountry2] = useState('');
  const [seletedCountry3, setseletedCountry3] = useState({
    id: 240,
    flagImg: usFlag,
    countryName: "United States of America",
    countryCode: "+1"
  });
  const [seletedCountry4, setseletedCountry4] = useState({
    id: 240,
    flagImg: usFlag,
    countryName: "United States of America",
    countryCode: "+1"
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const [dropdownOpen3, setDropdownOpen3] = useState(false);
  const [dropdownOpen4, setDropdownOpen4] = useState(false);
  const [dropdownOpen5, setDropdownOpen5] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const toggle2 = () => setDropdownOpen2((prevState) => !prevState);
  const toggle3 = () => setDropdownOpen3((prevState) => !prevState);
  const toggle4 = () => setDropdownOpen4((prevState) => !prevState);
  const toggle5 = () => setDropdownOpen5((prevState) => !prevState);

  document.title = "Form Advanced | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Form Advanced" pageTitle="Forms" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Custom country select input</h4>
                </CardHeader>
                <CardBody>
                  <Row className="g-3">
                    <Col lg={6}>
                      <div>
                        <Label>Simple select example</Label>
                        <Dropdown isOpen={dropdownOpen} toggle={toggle} >
                          <DropdownToggle tag="div" caret={false} type="text" className="w-100 form-control rounded-end flag-input" >
                            {seletedCountry || 'Select country'}
                          </DropdownToggle>
                          <DropdownMenu tag='ul' className="list-unstyled w-100 dropdown-menu-list mb-0">
                            <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                              {
                                country.map((item, key) => (
                                  <DropdownItem as='li'
                                    onClick={() => setseletedCountry(item.countryName)} key={key}
                                    className="dropdown-item d-flex">
                                    <div className="flex-shrink-0 me-2">
                                      <img src={item.flagImg} alt="country flag" className="options-flagimg" height="20" />
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex">
                                        <div className="country-name me-1">{item.countryName}</div>
                                        <span className="countrylist-codeno text-muted">{item.countryCode}</span>
                                      </div>
                                    </div>
                                  </DropdownItem>
                                ))
                              }
                            </SimpleBar>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <div className="mt-3">
                        <Label>Select input flag with img & name</Label>
                        <Dropdown isOpen={dropdownOpen2} toggle={toggle2}>
                          <DropdownToggle
                            tag="div"
                            caret={false} type="text" style={{ backgroundImage: `url(${seletedCountry1.flagImg && seletedCountry1.flagImg})` }} className="w-100 form-control rounded-end flag-input form-select" readOnly defaultValue={seletedCountry1.countryName} >
                            {seletedCountry1.countryName || 'Select country'}
                          </DropdownToggle>
                          <DropdownMenu as='ul' className="list-unstyled w-100 dropdown-menu-list mb-0">
                            <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                              {(country || []).map((item, key) => (
                                <DropdownItem as='li' onClick={() => setseletedCountry1(item)} key={key} className="dropdown-item d-flex">
                                  <div className="flex-shrink-0 me-2">
                                    <img src={item.flagImg} alt="country flag" className="options-flagimg" height="20" />
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex">
                                      <div className="country-name me-1">{item.countryName}</div>
                                      <span className="countrylist-codeno text-muted">{item.countryCode}</span>
                                    </div>
                                  </div>
                                </DropdownItem>
                              ))}
                            </SimpleBar>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <div className="mt-3">
                        <Label>Search input false in dropdown menu</Label>
                        <Dropdown isOpen={dropdownOpen3} toggle={toggle3}>
                          <DropdownToggle
                            tag="div"
                            className="form-control rounded-end flag-input form-select"
                            style={{ cursor: 'pointer' }}
                          >
                            {seletedCountry2 || 'Select country'}
                          </DropdownToggle>
                          <DropdownMenu as='ul' className="list-unstyled w-100 dropdown-menu-list mb-0">
                            <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                              {(country || []).map((item, key) => (
                                <DropdownItem as='li' onClick={() => setseletedCountry2(item.countryName)} key={key} className="dropdown-item d-flex">
                                  <div className="flex-shrink-0 me-2">
                                    <img src={item.flagImg} alt="country flag" className="options-flagimg" height="20" />
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex">
                                      <div className="country-name me-1">{item.countryName}</div>
                                      <span className="countrylist-codeno text-muted">{item.countryCode}</span>
                                    </div>
                                  </div>
                                </DropdownItem>
                              ))}
                            </SimpleBar>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div>
                        <Label>Select input with buttons & Flag with number</Label>
                        <Dropdown className='input-group' isOpen={dropdownOpen4} toggle={toggle4}>
                          <DropdownToggle as="button" className="btn btn-light border arrow-none">
                            <img src={seletedCountry3.flagImg} alt="country flag" className="options-flagimg" height="20" />
                            <span className="countrylist-codeno text-muted">{seletedCountry3.countryCode}</span>
                          </DropdownToggle>
                          <input type="number" className="form-control rounded-end flag-input" placeholder="Enter number" />
                          <DropdownMenu as='ul' className="list-unstyled w-100 dropdown-menu-list mb-0">
                            <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                              {(country || []).map((item, key) => (
                                <DropdownItem as='li' onClick={() => setseletedCountry3(item)} key={key} className="dropdown-item d-flex">
                                  <div className="flex-shrink-0 me-2">
                                    <img src={item.flagImg} alt="country flag" className="options-flagimg" height="20" />
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex">
                                      <div className="country-name me-1">{item.countryName}</div>
                                      <span className="countrylist-codeno text-muted">{item.countryCode}</span>
                                    </div>
                                  </div>
                                </DropdownItem>
                              ))}
                            </SimpleBar>
                          </DropdownMenu>
                        </Dropdown>
                        <div className="dropdown-menu w-100">
                          <div className="p-2 px-3 pt-1 searchlist-input">
                            <label type="text" className="form-control-sm border search-countryList" placeholder="Search country name or country code..." />
                          </div>
                          <ul className="list-unstyled dropdown-menu-list mb-0"></ul>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label>Select input with buttons & Flag</Label>
                        <Dropdown className='input-group' isOpen={dropdownOpen5} toggle={toggle5}>
                          <DropdownToggle as="button" className="btn btn-light border arrow-none">
                            <img src={seletedCountry4.flagImg} alt="country flag" className="options-flagimg" height="20" />
                          </DropdownToggle>
                          <input type="number" className="form-control rounded-end flag-input" placeholder="Enter number" />
                          <DropdownMenu as='ul' className="list-unstyled w-100 dropdown-menu-list mb-0">
                            <SimpleBar style={{ maxHeight: "220px" }} className="px-3">
                              {(country || []).map((item, key) => (
                                <DropdownItem as='li' onClick={() => setseletedCountry4(item)} key={key} className="dropdown-item d-flex">
                                  <div className="flex-shrink-0 me-2">
                                    <img src={item.flagImg} alt="country flag" className="options-flagimg" height="20" />
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex">
                                      <div className="country-name me-1">{item.countryName}</div>
                                      <span className="countrylist-codeno text-muted">{item.countryCode}</span>
                                    </div>
                                  </div>
                                </DropdownItem>
                              ))}
                            </SimpleBar>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Form Input Spin</h4>
                </CardHeader>

                <CardBody>
                  <div>
                    <Row className="gy-4">
                      <Col sm={6}>
                        <div>
                          <h5 className="fs-13 fw-medium text-muted">
                            Default
                          </h5>
                          <div className="input-step">
                            <button
                              type="button"
                              className="minus"
                              onClick={() => {
                                countDown(setdefaultCounter, defaultCounter);
                              }}
                            >
                              –
                            </button>
                            <Input
                              type="number"
                              className="product-quantity"
                              value={defaultCounter}
                              min="0"
                              max="100"
                              readOnly
                            />
                            <button
                              type="button"
                              className="plus"
                              onClick={() => {
                                countUP(setdefaultCounter, defaultCounter);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </Col>

                      <Col sm={6}>
                        <div>
                          <h5 className="fs-13 fw-medium text-muted">Light</h5>
                          <div className="input-step light">
                            <button
                              type="button"
                              className="minus"
                              onClick={() => {
                                countDown(setlightCounter, lightCounter);
                              }}
                            >
                              –
                            </button>
                            <Input
                              type="number"
                              className="product-quantity"
                              value={lightCounter}
                              min="0"
                              max="100"
                              readOnly
                            />
                            <button
                              type="button"
                              className="plus"
                              onClick={() => {
                                countUP(setlightCounter, lightCounter);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div className="mt-4 pt-2">
                      <Row className="gy-4">
                        <Col sm={6}>
                          <div>
                            <h5 className="fs-13 fw-medium text-muted">
                              Default (Full width)
                            </h5>
                            <div className="input-step full-width">
                              <button
                                type="button"
                                className="minus"
                                onClick={() => {
                                  countDown(
                                    setfullwidthCounter,
                                    fullwidthCounter
                                  );
                                }}
                              >
                                –
                              </button>
                              <Input
                                type="number"
                                className="product-quantity"
                                value={fullwidthCounter}
                                min="0"
                                max="100"
                                readOnly
                              />
                              <button
                                type="button"
                                className="plus"
                                onClick={() => {
                                  countUP(
                                    setfullwidthCounter,
                                    fullwidthCounter
                                  );
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </Col>

                        <Col sm={6}>
                          <div>
                            <h5 className="fs-13 fw-medium text-muted">
                              Light (Full width)
                            </h5>
                            <div className="input-step full-width light">
                              <button
                                type="button"
                                className="minus"
                                onClick={() => {
                                  countDown(
                                    setlfullwidthCounter,
                                    lfullwidthCounter
                                  );
                                }}
                              >
                                –
                              </button>
                              <Input
                                type="number"
                                className="product-quantity"
                                value={lfullwidthCounter}
                                min="0"
                                max="100"
                                readOnly
                              />
                              <button
                                type="button"
                                className="plus"
                                onClick={() => {
                                  countUP(
                                    setlfullwidthCounter,
                                    lfullwidthCounter
                                  );
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <Row className="mt-4 pt-2">
                      <h5 className="fs-13 fw-medium text-muted">Colored</h5>
                      <div className="d-flex flex-wrap align-items-start gap-2">
                        <div className="input-step step-primary">
                          <button
                            type="button"
                            className="minus"
                            onClick={() => {
                              countDown(setblueCounter, blueCounter);
                            }}
                          >
                            –
                          </button>
                          <Input
                            type="number"
                            className="product-quantity"
                            value={blueCounter}
                            min="0"
                            max="100"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus"
                            onClick={() => {
                              countUP(setblueCounter, blueCounter);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div className="input-step step-secondary">
                          <button
                            type="button"
                            className="minus"
                            onClick={() => {
                              countDown(setskyCounter, skyCounter);
                            }}
                          >
                            –
                          </button>
                          <Input
                            type="number"
                            className="product-quantity"
                            value={skyCounter}
                            min="0"
                            max="100"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus"
                            onClick={() => {
                              countUP(setskyCounter, skyCounter);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div className="input-step step-success">
                          <button
                            type="button"
                            className="minus"
                            onClick={() => {
                              countDown(setgreenCounter, greenCounter);
                            }}
                          >
                            –
                          </button>
                          <Input
                            type="number"
                            className="product-quantity"
                            value={greenCounter}
                            min="0"
                            max="100"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus"
                            onClick={() => {
                              countUP(setgreenCounter, greenCounter);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div className="input-step step-info">
                          <button
                            type="button"
                            className="minus"
                            onClick={() => {
                              countUP(settealCounter, tealCounter);
                            }}
                          >
                            –
                          </button>
                          <Input
                            type="number"
                            className="product-quantity"
                            value={tealCounter}
                            min="0"
                            max="100"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus"
                            onClick={() => {
                              countUP(settealCounter, tealCounter);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div className="input-step step-warning">
                          <button
                            type="button"
                            className="minus"
                            onClick={() => {
                              countDown(setyellowCounter, yellowCounter);
                            }}
                          >
                            –
                          </button>
                          <Input
                            type="number"
                            className="product-quantity"
                            value={yellowCounter}
                            min="0"
                            max="100"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus"
                            onClick={() => {
                              countUP(setyellowCounter, yellowCounter);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div className="input-step step-danger">
                          <button
                            type="button"
                            className="minus"
                            onClick={() => {
                              countDown(setredCounter, redCounter);
                            }}
                          >
                            –
                          </button>
                          <Input
                            type="number"
                            className="product-quantity"
                            value={redCounter}
                            min="0"
                            max="100"
                            readOnly
                          />
                          <button
                            type="button"
                            className="plus"
                            onClick={() => {
                              countUP(setredCounter, redCounter);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Auto Complete</h4>
                </CardHeader>

                <CardBody>
                  <div>
                    <Row className="g-3">
                      <Col lg={6}>
                        <div>
                          <Label className="text-muted">Search Result of Fruit Names</Label>

                          <Input placeholder='Search for fruits...' id="autoCompleteFruit" type="text" dir="ltr" spellCheck={false} autoComplete="off" autoCapitalize="off" />
                        </div>
                      </Col>
                      <Col lg={6}>
                        <div>
                          <Label className="text-muted">Search Result of Car Names</Label>

                          <Input placeholder='Search for cars...' id="autoCompleteCars" type="text" dir="ltr" spellCheck={false} autoComplete="off" autoCapitalize="off" />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">Multi List</h4>
                </CardHeader>

                <CardBody>
                  <MultiSelect />
                </CardBody>

              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FormAdvanced;