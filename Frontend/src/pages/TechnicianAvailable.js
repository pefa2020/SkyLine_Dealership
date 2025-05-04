import { React, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/TechnicianAvailable.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import { IoMdTime, IoMdListBox } from "react-icons/io";
import {
  FaBuilding,
  FaCalendarAlt,
  FaTools,
  FaRegUser,
  FaCar,
} from "react-icons/fa";
import Ticket from "../components/Ticket";
import DealershipNavbarLogged from "../components/DealershipNavbarLogged";

const TechnicianAvailable = () => {
  const url2 = "http://localhost:5000/openTickets";
  const url = "http://localhost:5000/assigntech";
  const url3 = "http://localhost:5000/openTechTickets";
  const [available, setAvailable] = useState([]);
  const [apptID, setApptID] = useState("");
  const userId = localStorage.getItem("user_id");
  const [mytickets, setMytickets] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch(url2, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
        .then((response) => response.json())
        //.then(data => console.log(data)) // will later be changed to actually store the received data
        .then((data) => {
          if (data) {
            setAvailable(data);
            console.log(available["openTickets"]);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStart = () => {
    const jsonData = { tech_id: userId, apptID: apptID };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      //.then(data => console.log(data)) // will later be changed to actually store the received data
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="available">
      <DealershipNavbarLogged />
      <Container>
        <Row>
          <Col className="available-header">Available Tickets</Col>
        </Row>
        {available["openTickets"] != "" && available["openTickets"] ? (
          <Row className="available-table-header">
            <Col xs={3}>
              <IoMdTime /> Schd date
            </Col>
            <Col>
              <IoMdListBox /> Appointment
            </Col>
            <Col xs={3}>
              <FaTools /> Service
            </Col>
            <Col>Status</Col>
            <Col>
              <FaBuilding /> Make
            </Col>
            <Col></Col>
          </Row>
        ) : null}
        {available["openTickets"] != "" && available["openTickets"] ? (
          available["openTickets"].map((data) => (
            <Row key={data[0]} className="available-tickets">
              <Col xs={3}>{data[4]}</Col>
              <Col>{data[7]}</Col>
              <Col xs={3}>{data[5]}</Col>
              <Col>{data[8]}</Col>
              <Col>{data[1]}</Col>
              <Col xs={1} className="ticket-start-container">
                <Button
                  id={data[1] + "ticket"}
                  className="ticket-start"
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setApptID(data[0]);
                    handleStart();
                  }}
                >
                  start
                </Button>
              </Col>
            </Row>
          ))
        ) : (
          <Row>
            <Col>No Upcoming appointments</Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default TechnicianAvailable;
