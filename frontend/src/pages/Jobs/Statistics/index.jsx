import React from "react";
import { Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import UsersByDevice from "../../DashboardAnalytics/UsersByDevice";
import JobSummary from "./JobSummary";
import NatworkSummary from "./NatworkSummary";
import VisitorGraph from "./VisitorGraph";
import Widgets from "./Widgets";

const Statistics = () => {
    document.title = "Statistics | Velzon -  Admin & Dashboard Template";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Statistics" pageTitle="Jobs" />

                    <Row className="row">
                        <Widgets dataColors='["--vz-success", "--vz-danger"]' />
                    </Row>

                    <Row className="row">
                        <VisitorGraph dataColors='["--vz-primary-rgb, 0.75", "--vz-secondary", "--vz-warning", "--vz-info","--vz-success", "--vz-danger"]' />
                        <UsersByDevice />
                    </Row>

                    <Row className="row">
                        <NatworkSummary dataColors='["--vz-primary", "--vz-info"]' />
                        <JobSummary dataColors='["--vz-success","--vz-primary", "--vz-info", "--vz-danger"]' />
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Statistics;
