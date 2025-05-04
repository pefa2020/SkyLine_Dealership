import React, { useState } from "react";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";

export default function MsgModal({ apptID, updateStatus, onHide, show }) {
  const [msg, setMsg] = useState("");

  const handleCut = () => {
    // Define both fetch operations in sequence
    fetch("http://localhost:5000/updateTicketMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ apptID: apptID, message: msg }),
    })
      .then((response) => response.json())
      .then((res) => {
        alert(res["TicketMessage"]);
        // Chain the next fetch here if the first one is successful
        return fetch("http://localhost:5000/updateTicketStatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ apptID: apptID, statusID: updateStatus }),
        });
      })
      .then((response) => response.json())
      .then((res) => {
        alert(res["TicketStatus"]);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error updating ticket");
      });
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      style={{ borderWidth: "3px", borderColor: "blue" }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <b>Confirm Completed Service</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>Are you sure the service has been completed?</Col>
          </Row>
          <Row>
            <Col>
              <Form>
                <Form.Label style={{ fontSize: "0.7rem" }}>
                  Technician Note:
                </Form.Label>
                <Form.Control
                  id="ticketTextArea"
                  as="textarea"
                  rows={3}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
              </Form>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          No, Close
        </Button>
        <Button onClick={handleCut} id="YesCutTicket">
          Yes, Cut
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
