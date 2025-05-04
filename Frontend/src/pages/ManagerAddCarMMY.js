import { React, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  CardTitle,
  CardBody,
  CardText,
  Form,
  FormLabel,
} from "react-bootstrap";
import carimage from "../images/image.png";
import { IoMdTime, IoMdListBox, IoIosPricetags } from "react-icons/io";
import { FaBuilding, FaCar, FaCalendarAlt, FaTools } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ManagerDealershipNavbarLogged from "../components/ManagerDealershipNavbarLogged";
import InputGroup from "react-bootstrap/InputGroup";
import Popup from "reactjs-popup";
import { useNavigate } from "react-router-dom";
import "../styles/ManagerAddCarMMY.css";

function ManagerAddCarMMY() {
  // const { userId } = useParams();
  // console.log("User id (manager) is: ", userId);
  const userId = localStorage.getItem("user_id");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const handleSubmitAddCarMMY = (event) => {
    event.preventDefault();
    const regex_year = /^[0-9]+$/;
    if (make != "" && model != "" && year != "" && regex_year.test(year)) {
      const jsonData = { make: make, model: model, year: year };
      const url = "http://localhost:5000/insertCarModel";
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
          if (data) {
            //alert(data["Response"]);
          }
          setMake("");
          setModel("");
          setYear("");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      alert("Check your fields.");
    }
  };

  return (
    <div className="managerMMY">
      {userId != undefined && <ManagerDealershipNavbarLogged userId={userId} />}
      <Container className="appointment-curr">
        <Row className="appointment-type">
          <center>
            <h3>Add New Car Model/Year</h3>
          </center>
        </Row>
      </Container>
      <br></br>
      <Row className="profileRow">
        <Col></Col>
        <Col className="middleCol">
          <Form onSubmit={handleSubmitAddCarMMY}>
            <Form.Group as={Col} className="textBar">
              <Form.Label>CAR MAKE</Form.Label>
              <Form.Control
                className="inputBar"
                placeholder="Input CAR MAKE"
                type="text"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                id="managerAddCarMake"
              />
            </Form.Group>

            <Form.Group as={Col} className="textBar">
              <Form.Label>CAR MODEL</Form.Label>
              <Form.Control
                className="inputBar"
                placeholder="Input CAR MODEL"
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                id="managerAddCarModel"
              />
            </Form.Group>

            <Form.Group as={Col} className="textBar">
              <Form.Label>CAR YEAR</Form.Label>
              <Form.Control
                className="inputBar"
                placeholder="Input Car Year"
                type="text"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                id="managerAddCarYear"
              />
            </Form.Group>

            <Form.Group as={Col} className="textBar">
              <Button
                variant="primary"
                type="submit"
                className="updateButton"
                id="managerAddCarSubmitButton"
              >
                ADD
              </Button>
            </Form.Group>
          </Form>
        </Col>
        <Col></Col>
      </Row>
    </div>
  );
}

export default ManagerAddCarMMY;
