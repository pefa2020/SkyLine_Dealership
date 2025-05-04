import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Offcanvas,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import { HiBars3 } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import "../styles/DealershipNavbar.css"; // Ensure this CSS is correctly linked
import logo from "../images/logo.jpg"; // Update this path as necessary
import { useNavigate } from "react-router-dom";
import { ManagerSidenavLogged } from "./ManagerSidenavLogged.js"; // Adjust if the actual component name differs

function ManagerNavbar() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const logout = async () => {
    const response = await fetch("http://localhost:5000/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (response.ok) {
      localStorage.clear();
      navigate(`/Skyline`);
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        className="navbar"
        style={{ backgroundColor: "#003366" }}
      >
        <Container fluid>
          <Navbar.Brand
            onClick={handleShow}
            style={{ cursor: "pointer", color: "white" }}
            id="ManagerLoggedSideBarOpen"
          >
            <HiBars3 style={{ fontSize: "2rem" }} />
          </Navbar.Brand>
          <Navbar.Brand onClick={() => navigate("/")}>
            <Image
              src={logo}
              style={{ width: "2rem", height: "2rem" }}
              alt="Admin Logo"
              roundedCircle
            />
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/")}>Manager</Nav.Link>
          </Nav>
          <Button
            variant="outline-light"
            onClick={logout}
            className="button-div"
            size='sm'
            id="ManagerDealershipLoggedLogoutButton"
          >
            Log out
          </Button>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="nav-menu-items">
            {ManagerSidenavLogged.map((item, index) => (
              <Row
                key={index}
                className="nav-text"
                onClick={() => {
                  navigate(item.path);
                  handleClose();
                }}
                id={item.title}
              >
                <Col md="auto" className="nav-icons">
                  {item.icon}
                </Col>
                <Col className="sidenavButtons">{item.title}</Col>
              </Row>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default ManagerNavbar;
