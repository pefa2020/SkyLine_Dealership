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

const MyTickets = () => {
  const url2 = "http://localhost:5000/openTickets";
  const url = "http://localhost:5000/assigntech";
  const url3 = "http://localhost:5000/openTechTickets";
  const [available, setAvailable] = useState([]);
  const [apptID, setApptID] = useState("");
  const userId = localStorage.getItem("user_id");
  const [mytickets, setMytickets] = useState([]);

  useEffect(() => {
    const jsonData = { tech_id: userId };
    fetch(url3, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      //.then(data => console.log(data)) // will later be changed to actually store the received data
      .then((data) => {
        if (data) {
          setMytickets(data);
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="available">
      <DealershipNavbarLogged />
      <Container>
        <Row>
          <Col>
            <h5>My Tickets</h5>
          </Col>
        </Row>
        <Row>
          <Col>
            {mytickets["openTechTickets"]
              ? mytickets["openTechTickets"].map((data) => (
                  <Ticket key={data[0]} data={data} />
                ))
              : null}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MyTickets;
