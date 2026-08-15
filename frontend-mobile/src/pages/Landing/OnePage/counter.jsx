import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

const AnimatedCounter = ({ end, duration = 3000, decimals = 0 }) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let animationFrame;
        const startTime = performance.now();

        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            setValue(end * easedProgress);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateValue);
            }
        };

        animationFrame = requestAnimationFrame(updateValue);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [duration, end]);

    return value.toFixed(decimals);
};

const Counter = () => {
    return (
        <React.Fragment>
            <section className="py-5 position-relative bg-light">
                <Container>
                    <Row className="text-center gy-4">
                        <Col lg={3} className="col-6">
                            <div>
                                <h2 className="mb-2"><span className="counter-value" data-target="100">
                                    <AnimatedCounter end={100} />
                                </span>
                                    +
                                </h2>
                                <div className="text-muted">Projects Completed</div>
                            </div>
                        </Col>

                        <Col lg={3} className="col-6">
                            <div>
                                <h2 className="mb-2"><span className="counter-value" data-target="24">
                                    <AnimatedCounter end={24} />
                                </span>
                                </h2>
                                <div className="text-muted">Win Awards</div>
                            </div>
                        </Col>

                        <Col lg={3} className="col-6">
                            <div>
                                <h2 className="mb-2"><span className="counter-value" data-target="20.3">
                                    <AnimatedCounter end={20.3} decimals={1} />
                                </span>
                                    k
                                </h2>
                                <div className="text-muted">Satisfied Clients</div>
                            </div>
                        </Col>

                        <Col lg={3} className="col-6">
                            <div>
                                <h2 className="mb-2"><span className="counter-value" data-target="50">
                                    <AnimatedCounter end={50} />
                                </span>
                                </h2>
                                <div className="text-muted">Employees</div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </React.Fragment>
    );
};

export default Counter;
