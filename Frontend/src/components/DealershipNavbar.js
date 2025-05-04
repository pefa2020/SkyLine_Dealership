import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Row,
  Col,
  Image,
  Offcanvas,
} from "react-bootstrap";
import { HiBars3 } from "react-icons/hi2";
import skylinelogo from "../images/skylinelogo.jpg"; // Ensure the path to the logo is correct
import { useNavigate } from "react-router-dom";
import "../styles/DealershipNavbar.css"; // Ensure your CSS path is correct
import { SideNav } from "./SideNav";

//Navbar Login Button ID: NavbarLoginButton


function DealershipNavbar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <Navbar
        expand="lg"
        className="navbar"
        style={{ backgroundColor: "#003366" }}
      >
        <Container fluid>

          <Navbar.Brand onClick={() => navigate("/Skyline")}>
            <Image
              src={skylinelogo}
              style={{ width: "2rem", height: "2rem" }}
              alt="Skyline Logo"
              roundedCircle
            />
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link
              style={{ color: "white", fontSize: "1.5rem" }}
              onClick={() => navigate("/Skyline")}
            >
              Skyline Dealership
            </Nav.Link>
          </Nav>
          <Button
            variant="outline-light"
            onClick={() => navigate("/login")}
            id="NavbarLoginButton"
          >
            Login
          </Button>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="start" size="sm">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Skyline Dealership</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Container className="nav-menu-items">
            {SideNav.map((item, index) => (
              <Row
                key={index}
                className={item.cName}
                onClick={() => {
                  navigate(item.path);
                  handleClose();
                }}
              >
                <Col md="auto" className="nav-icons">
                  {item.icon}
                </Col>
                <Col className="sidenavButtons">{item.title}</Col>
              </Row>
            ))}
          </Container>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default DealershipNavbar;
