import React, { useState } from 'react'
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Label,
    Input,
} from "reactstrap";
import PreviewCardHeader from '../../../Components/Common/PreviewCardHeader';
import { BrowserDefaults } from './FormValidationCode';

const ReactValidation = () => {

    const [validation, setValidation] = useState({
        fnm: null,
        lnm: null,
        unm: null,
        city: null,
        stateV: null,
      });

    function handleSubmit(e) {
        e.preventDefault();
        const modifiedV = { ...validation };
        var fnm = document.getElementById("validationTooltip01").value;
        var lnm = document.getElementById("validationTooltip02").value;
        var unm = document.getElementById("validationTooltipUsername").value;
        var city = document.getElementById("validationTooltip03").value;
        var stateV = document.getElementById("validationTooltip04").value;

        if (fnm === "") {
            modifiedV['fnm'] = false;
        } else {
            modifiedV['fnm'] = true;
        }

        if (lnm === "") {
            modifiedV['lnm'] = false;
        } else {
            modifiedV['lnm'] = true;
        }

        if (unm === "") {
            modifiedV['unm'] = false;
        } else {
            modifiedV['unm'] = true;
        }

        if (city === "") {
            modifiedV['city'] = false;
        } else {
            modifiedV['city'] = true;
        }

        if (stateV === "") {
            modifiedV['stateV'] = false;
        } else {
            modifiedV['stateV'] = true;
        }
        setValidation(modifiedV);
    }

    //for change tooltip display propery
    const onChangeValidation = (fieldName, value) => {
        const modifiedV  = { ...validation };
        if (value !== "") {
            modifiedV[fieldName] = true;
        } else {
            modifiedV[fieldName] = false;
        }
        setValidation(modifiedV);
    };


    return (
        <React.Fragment>
            <Col>
                <Card>
                    <PreviewCardHeader title="React Validation(Tooltips)" />
                    <CardBody>
                        <p className="text-muted">
                            If your form layout allows it, you can swap the
                            <code>.{"{valid|invalid-}"}feedback</code> classes for
                            <code>.{"{valid|invalid-}"}-tooltip</code> classes to
                            display validation feedback in a styled tooltip.
                        </p>
                        <div className="live-preview">
                            <form
                                className="needs-validation"
                                method="post"
                                id="tooltipForm"
                                onSubmit={(e) => {
                                    handleSubmit(e);
                                }}
                            >
                                <Row>
                                    <Col md="4">
                                        <div className="mb-3 position-relative">
                                            <Label htmlFor="validationTooltip01">
                                                First name
                                            </Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="validationTooltip01"
                                                placeholder="First name"
                                                onChange={(event) => {
                                                    onChangeValidation("fnm", event.target.value);
                                                }}
                                                valid={validation["fnm"] === true}
                                                invalid={
                                                    validation["fnm"] !== true &&
                                                    validation["fnm"] !== null
                                                }
                                            />

                                            <div
                                                className={
                                                    validation["fnm"] === true
                                                        ? "valid-tooltip"
                                                        : "invalid-tooltip"
                                                }
                                                // name="validate"
                                                id="validate1"
                                            >
                                                {validation["fnm"] === true
                                                    ? "Looks good!"
                                                    : "Please Enter Valid First Name"}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3 position-relative">
                                            <Label htmlFor="validationTooltip02">Last name</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="validationTooltip02"
                                                placeholder="Last name"
                                                onChange={(event) =>
                                                    onChangeValidation("lnm", event.target.value)
                                                }
                                                valid={validation["lnm"] === true}
                                                invalid={
                                                    validation["lnm"] !== true &&
                                                    validation["lnm"] !== null
                                                }
                                            />
                                            <div
                                                className={
                                                    validation["lnm"] === true
                                                        ? "valid-tooltip"
                                                        : "invalid-tooltip"
                                                }
                                                // name="validate"
                                                id="validate2"
                                            >
                                                {validation["lnm"] === true
                                                    ? "Looks good!"
                                                    : "Please Enter Valid Last Name"}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md="4">
                                        <div className="mb-3 position-relative">
                                            <Label htmlFor="validationTooltipUsername">
                                                Username
                                            </Label>
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <span
                                                        className="input-group-text"
                                                        id="validationTooltipUsernamePrepend"
                                                    >
                                                        @
                                                    </span>
                                                </div>
                                                <Input
                                                    type="text"
                                                    className="form-control"
                                                    id="validationTooltipUsername"
                                                    placeholder="Username"
                                                    onChange={(event) =>
                                                        onChangeValidation("unm", event.target.value)
                                                    }
                                                    valid={validation["unm"] === true}
                                                    invalid={
                                                        validation["unm"] !== true &&
                                                        validation["unm"] !== null
                                                    }
                                                />
                                                <div
                                                    className={
                                                        validation["unm"] === true
                                                            ? "valid-tooltip"
                                                            : "invalid-tooltip"
                                                    }
                                                    // name="validate"
                                                    id="validate3"
                                                >
                                                    {validation["unm"] === true
                                                        ? "Looks good!"
                                                        : "Please choose a unique and valid username."}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <div className="mb-3 position-relative">
                                            <Label htmlFor="validationTooltip03">City</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="validationTooltip03"
                                                placeholder="City"
                                                onChange={(event) =>
                                                    onChangeValidation("city", event.target.value)
                                                }
                                                valid={validation["city"] === true}
                                                invalid={
                                                    validation["city"] !== true &&
                                                    validation["city"] !== null
                                                }
                                            />
                                            <div
                                                className={
                                                    validation["city"] === true
                                                        ? "valid-tooltip"
                                                        : "invalid-tooltip"
                                                }
                                                // name="validate"
                                                id="validate4"
                                            >
                                                {validation["city"] === true
                                                    ? "Looks good!"
                                                    : "Please choose a unique and valid username.Please provide a valid city."}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md="6">
                                        <div className="mb-3 position-relative">
                                            <Label htmlFor="validationTooltip04">State</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="validationTooltip04"
                                                placeholder="State"
                                                onChange={(event) =>
                                                    onChangeValidation("stateV", event.target.value)
                                                }
                                                valid={validation["stateV"] === true}
                                                invalid={
                                                    validation["stateV"] !== true &&
                                                    validation["stateV"] !== null
                                                }
                                            />
                                            <div
                                                className={
                                                    validation["stateV"] === true
                                                        ? "valid-tooltip"
                                                        : "invalid-tooltip"
                                                }
                                                // name="validate"
                                                id="validate5"
                                            >
                                                {validation["stateV"] === true
                                                    ? "Looks good!"
                                                    : "Please provide a valid state."}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Button color="primary" type="submit">
                                    Submit form
                                </Button>
                            </form>

                        </div>
                        <div className="d-none code-view">
                            <pre className="language-markup" style={{ "height": "352px" }}>
                                <code>
                                    <BrowserDefaults />
                                </code>
                            </pre>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    )
}

export default ReactValidation