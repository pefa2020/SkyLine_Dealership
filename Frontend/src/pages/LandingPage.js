import React, { useRef, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../styles/LandingPage.css";
import videoBg from "../assets/videoBg.mp4";
import { Fade } from "react-reveal";

function LandingPage() {
  const fadeRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fadeRef.current.when = true;
          } else {
            fadeRef.current.when = false;
          }
        });
      },
      { threshold: 0.5 }
    );

    if (fadeRef.current) {
      observer.observe(fadeRef.current);
    }
    return () => {
      if (fadeRef.current) {
        observer.unobserve(fadeRef.current);
      }
    };
  }, []);

  return (
    <div>
      <link
        href="https://fonts.googleapis.com/css?family=Abel"
        rel="stylesheet"
      ></link>

      <Container fluid className="landing">
        <Row className="landing-top">
          <video
            src={videoBg}
            autoPlay
            loop
            muted
            style={{ width: "100%", height: "100%" }}
          ></video>

          <Col xs={8} className="landing-top-l"></Col>

          <Col xs={4} className="landing-top-r">
            <Button
              className="top-r-button"
              variant="outline-primary"
              style={{ marginRight: "1rem" }}
              href="/Login"
              id="LandingSignIn"
            >
              Sign In
            </Button>
            <Button className="top-r-button" href="/signup">
              Sign Up
            </Button>
          </Col>
          {/* <div className='landing-top-photo'></div> */}
          <Container className="landing-top-explore">
            <Row>
              <Col className="explore-skyline">Skyline Dealership</Col>
            </Row>
            <br />
            <br />
            <Row>
              <Col className="explore-skyline-statement">
                Revolutionizing car shopping: effortless, from home to the
                driveway
              </Col>
            </Row>
            <Row>
              <Col className="explore-button-area">
                <Button className="explore-button" href="/Skyline">
                  Explore Now
                </Button>
              </Col>
            </Row>
          </Container>
          {/* <Col xs={4} className='landing-top-r'>
                        <Button className='top-r-button' href="/SignUp">Sign Up</Button>
                    </Col> */}
        </Row>
      </Container>
      <Container fluid>
        <Fade duration={2000} ref={fadeRef}>
          <Row>
            <Col
              style={{
                textAlign: "center",
                color: "#2148C0",
                paddingTop: "3vh",
                paddingBottom: "5vh",
                fontSize: "50px",
              }}
            >
              Our Featured Car
            </Col>
          </Row>
          <Row></Row>

          <Row className="landing-mid-feature">
            <Col
              style={{
                textAlign: "right",
                fontSize: "25px",
                alignContent: "center",
                paddingLeft: "10%",
              }}
            >
              Ready? Explore our website to find out amazing car models like
              this one. Immerse yourself into the cars world!
              <Button variant="link" style={{ fontSize: "12px" }}>
                {" "}
                Learn More{" "}
              </Button>
            </Col>
            <Col style={{ paddingLeft: "5%" }}>
              <div className="landing-mid-img" />
            </Col>
          </Row>
        </Fade>
      </Container>
    </div>
  );
}

export default LandingPage;
