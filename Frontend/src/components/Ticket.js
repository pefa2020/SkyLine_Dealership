import { React, useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/TechnicianAvailable.css";
import { Container, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { IoMdTime } from "react-icons/io";
import "reactjs-popup/dist/index.css";
import {
  FaBuilding,
  FaCalendarAlt,
  FaTools,
  FaRegUser,
  FaCar,
} from "react-icons/fa";
import MsgModal from "./MsgModal";

const Ticket = (data) => {
  const [updateStatus, setUpdateStatus] = useState(data.data[17]);
  const [modal, setModal] = useState(false);
  const url = "http://localhost:5000/updateTicketStatus";
  const form = useRef();
  const handleUpdate = (e) => {
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
        //alert(res["TicketStatus"]);
        form.current.submit();
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
          <Form ref={form} onSubmit={handleUpdate}>
            <Col md="auto" style={{ alignContent: "center" }}>
              <Form.Select
                id={data.data[1] + "openTicketStatus"}
                onChange={(e) => {
                  setUpdateStatus(e.target.value);
                }}
                className="update-ticket-status"
                value={updateStatus}
              >
                <option value={2}>Started</option>
                <option
                  value={3}
                  id={data.data[1] + "openTicketStatusProgress"}
                >
                  In Progress
                </option>
              </Form.Select>
            </Col>
            <Col md="auto">
              <Button
                id={data.data[1] + "openTicketUpdate"}
                className="ticket-button"
                disabled={data.data[17] == updateStatus ? true : false}
                onClick={handleUpdate}
              >
                update
              </Button>
            </Col>
          </Form>
          <Col style={{ width: "60%" }}></Col>
          <Col md="auto">
            <Button
              id={data.data[1] + "openTicketVoid"}
              className="ticket-button"
              variant="secondary"
              onClick={() => {
                setUpdateStatus(5);
                setModal(true);
              }}
            >
              Void
            </Button>
          </Col>
          <Col md="auto">
            <Button
              className="ticket-button"
              variant="danger"
              onClick={() => {
                setUpdateStatus(4);
                setModal(true);
              }}
            >
              Cut
            </Button>
          </Col>
        </Row>

        <MsgModal
          show={modal}
          apptID={data.data[0]}
          updateStatus={updateStatus}
          onHide={() => setModal(false)}
        />
      </Container>
    </div>
  );
};

export default Ticket;
