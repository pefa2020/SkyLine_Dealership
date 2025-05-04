import { React, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/TechnicianAvailable.css";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { IoMdTime, IoMdListBox } from "react-icons/io";
import {
  FaBuilding,
  FaCalendarAlt,
  FaTools,
  FaRegUser,
  FaCar,
} from "react-icons/fa";

const CompleteTicket = (data) => {
  const [updateStatus, setUpdateStatus] = useState(data.data[17]);
  const [msg, setMsg] = useState("");
  const url = "http://localhost:5000/updateTicketStatus";

  const handleUpdate = () => {
    const jsonData = { apptID: data.data[0], statusID: updateStatus };
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
      .then((res) => {
        console.log(res);
        //alert(res['TicketStatus']);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <div>
      <br />
      <br />
      <Container className="ticket">
        <Row className="ticket-top">
          <Col>
            <FaRegUser /> {data.data[15]} {data.data[16]}
          </Col>
          <Col>
            <IoMdTime /> {data.data[4]}
          </Col>
          <Col>
            <FaCar /> {data.data[8]} {data.data[9]} {data.data[10]}
          </Col>
          <Col>
            <FaTools />
            {data.data[5]}
          </Col>
        </Row>
        <Row className="ticket-bottom">
          <Col md="auto">Ticket Status</Col>
          <Col md="auto" style={{ alignContent: "center" }}>
            <div
              className={
                data.data[11] == "Voided" ? "status-voided" : "status-closed"
              }
            >
              {data.data[11]}
            </div>
          </Col>
        </Row>
        <Row>
          <Col md="auto">Ticket Message</Col>
          <Col>
            <div className="ticket-msg">{data.data[12]}</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CompleteTicket;
