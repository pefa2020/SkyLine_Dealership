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
import { IoCloseOutline } from "react-icons/io5";
import logo from "../images/logo.jpg"; // Update with your actual logo path
import { useNavigate } from "react-router-dom";
import { AdminSideNav } from "./AdminSideNav";
import "../styles/DealershipNavbar.css"; // Ensure this CSS file is correctly linked

function AdminNavbar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

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
            id="AdminLoggedSideBarOpen"
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
            <Nav.Link
              style={{ color: "white", fontSize: "1.5rem" }}
              onClick={() => navigate("/")}
            >
              Admin Panel
            </Nav.Link>
          </Nav>
          <Button  size='sm' variant="outline-light" onClick={logout} id="AdminLogOut">
            Log out
          </Button>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="start" size="sm">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Container className="nav-menu-items">
            {AdminSideNav.map((item, index) => (
              <Row
                key={index}
                className={item.cName}
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
          </Container>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default AdminNavbar;
