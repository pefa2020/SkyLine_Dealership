import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Image,
  Offcanvas,
  Row,
  Col,
} from "react-bootstrap";
import { HiBars3 } from "react-icons/hi2";
import { FaRegUser } from "react-icons/fa";
import skylinelogo from "../images/skylinelogo.jpg"; // Ensure this is the correct path
import "../styles/DealershipNavbar.css"; // Ensure this CSS is correctly linked
import { SideNav } from "./SideNavLogged";
import { TechnicianSidenav } from "./TechnicianSidenavLogged";
import { useNavigate } from "react-router-dom";

function DealershipNavbarLogged() {
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState('');  // State to store the first name
  const navigate = useNavigate();
  const job_title = localStorage.getItem("job_title");
  const userId = localStorage.getItem("user_id");

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("http://localhost:5000/getUserDetails", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ "user_id": userId })
        });
        const data = await response.json();
        if (response.ok) {
          setFirstName(data.first_name);  // Set the first name in state
        } else {
          throw new Error(data.error || "Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  async function logout() {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        localStorage.clear();
        navigate("/Skyline");
      } else {
        throw new Error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Logout failed, please try again");
    }
  }

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
            id="DealershipLoggedSideBarOpen"
          >
            <HiBars3 style={{ fontSize: "2rem" }} />
          </Navbar.Brand>
          <Navbar.Brand onClick={() => navigate("/")}>
            <Image
              src={skylinelogo}
              style={{ width: "2rem", height: "2rem" }}
              alt="Skyline Logo"
              roundedCircle
            />
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link onClick={() => {navigate('/')}} style={{ color: "white" }}>Welcome {firstName}</Nav.Link>
          </Nav>
          <Button size='sm' 
            variant="outline-light"
            onClick={logout}
            id="DealershipLoggedLogoutButton"
          >
            Log out
          </Button>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={handleClose} placement="start" size="sm">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Container className="nav-menu-items">
            {(job_title === "Technician" ? TechnicianSidenav : SideNav).map(
              (item, index) => (
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
              )
            )}
          </Container>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default DealershipNavbarLogged;
