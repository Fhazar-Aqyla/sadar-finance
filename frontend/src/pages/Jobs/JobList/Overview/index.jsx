import React from "react";
import { Col, Container, Row } from "reactstrap";
import Header from "./Header";
import JobDescription from "./JobDescription";
import RelatedJobs from "./RelatedJobs";
import RightSection from "./RightSection";

const JobOverview = () => {
  document.title = "Job Overview | Velzon -  Admin & Dashboard Template";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          <Row>
            <Header />
          </Row>

          <Row className="mt-n5">
            <Col xxl={9}>
              <JobDescription />
              <RelatedJobs />
            </Col>

            <Col xxl={3}>
              <RightSection />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default JobOverview;
