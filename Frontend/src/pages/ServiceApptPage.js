import { React, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/ServiceApptPage.css";
import axios from "axios";
import DealershipNavbarLogged from "../components/DealershipNavbarLogged";
import carimage from "../images/image.png";
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
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "../styles/FilterBar.css";
import oil_change from "../images/oil_change.jpg";
import brake_inspection from "../images/brake_inspection.jpg";
import tire_rotation from "../images/tire_rotation.jpg";
import engine_tuneup from "../images/engine_tuneup.jpeg";
import car_wash_int_cleaning from "../images/car_wash_int_cleaning.jpg";

function ServiceApptPage() {
  const { userId, carId } = useParams();
  console.log("User id is: ", userId);
  console.log("Car id is: ", carId);

  const [date, setDate] = useState("");
  const [times, setTimes] = useState([]);
  const [hour, setHour] = useState("");
  const [serviceOption, setServiceOption] = useState("");

  const [cardHolder, setCarHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");

  const [all_services, setAllServices] = useState([]);

  useEffect(() => {
    const url = "http://localhost:5000/getAllServicesInfo";
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setAllServices(data);
          console.log(data);
          console.log("This is", data[0][1]);
        }
      })
      .catch((error) => {
        console.error("Response:", error);
      });
  }, []);

  const handleServiceSubmit = (event) => {
    event.preventDefault();
    console.log("Date is: ", date);
    console.log("Time is: ", times);
    console.log("Hour is: ", hour);
    console.log("Cardholder: ", cardHolder);
    console.log("CarNumer: ", cardNumber);
    console.log("Expiry date: ", expiryDate);
    console.log("CVC: ", cvc);
    if (
      !date ||
      !hour ||
      carId == undefined ||
      (serviceOption == "" &&
        cardHolder != "" &&
        cardNumber != "" &&
        expiryDate != "" &&
        cvc != "")
    ) {
      alert("Check your fields.");
    } else {
      // We are good to send info
      const url = "http://localhost:5000/scheduleServiceAppt";
      const jsonData = {
        userID: userId,
        vin: carId,
        serviceOption: serviceOption,
        serviceDate: date + " " + hour,
        cardHolder: cardHolder,
        cardNumber: cardNumber,
        expiryDate: expiryDate,
        cvc: cvc,
      };
      console.log(jsonData);
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(jsonData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data["message"]) {
            //alert(data["message"]);
          }
          // Resetting variables
          setDate("");
          setTimes([]);
          setHour("");
          setCarHolder("");
          setCardNumber("");
          setExpiryDate("");
          setCvc("");
          window.location.reload();
        })
        .catch((error) => {
          console.error("error", error);
        });
    }
  };

  const handleDate = (event) => {
    setTimes([]);
    setDate(event.target.value);
    if (event.target.value != "") {
      console.log("Selected date: ", event.target.value);
      const url = "http://localhost:5000/availableServiceTimes";
      const jsonData = { date: event.target.value };
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
          // console.log(data);
          setTimes(data);
          if (data) {
            console.log("Times are: ", data);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const handleResetVariables = (event) => {
    setDate("");
    setTimes([]);
    setHour("");
    setCarHolder("");
    setCardNumber("");
    setExpiryDate("");
    setCvc("");
    setServiceOption("");
  };

  return (
    <div>
      <DealershipNavbarLogged userId={userId} />
      <Row className="rowService">
        <Row className="subR1">
          <Col>
            <h1>Schedule a Service</h1>
          </Col>
        </Row>

        <Row className="subR2">
          <div className="columnDisplay">
            {all_services.map((innerArray, index1) => (
              <div key={index1} className="twoColumnLayout">
                {/* 
                                Option_id (Service id): innerArray[0]
                                Description (name): innerArray[1]
                                Price: innerArray[2]
                            */}

                <Col>
                  Service {innerArray[0]}
                  <div className="magicalDiv">
                    {/* TODO: CHANGE SERVICES ACCORDING TO THE TABLE IN BACKEND; then replicate all Popups for each service */}
                    <Card className="garage-car-card">
                      <Card.Img
                        varient="top"
                        src={innerArray[1] == "Oil Change" ? oil_change : ""}
                      ></Card.Img>
                      <Card.Img
                        varient="top"
                        src={
                          innerArray[1] == "Brake Inspection"
                            ? brake_inspection
                            : ""
                        }
                      ></Card.Img>
                      <Card.Img
                        varient="top"
                        src={
                          innerArray[1] == "Tire Rotation" ? tire_rotation : ""
                        }
                      ></Card.Img>
                      <Card.Img
                        varient="top"
                        src={
                          innerArray[1] == "Engine Tune-up" ? engine_tuneup : ""
                        }
                      ></Card.Img>
                      <Card.Img
                        varient="top"
                        src={
                          innerArray[1] == "Car Wash and Interior Cleaning"
                            ? car_wash_int_cleaning
                            : ""
                        }
                      ></Card.Img>
                      <CardBody>
                        <CardTitle>{innerArray[1]}</CardTitle>

                        <Popup
                          contentStyle={{
                            width: "40%",
                            borderWidth: "8px",
                            borderColor: "#2148C0",
                            borderRadius: "10px",
                          }}
                          trigger={
                            <Button size="sm" id="serviceButton">
                              Book Service
                            </Button>
                          }
                          onOpen={(event) => {
                            setServiceOption(innerArray[1]);
                            console.log("Choose: ", innerArray[1]);
                          }}
                          modal
                          nested
                          onClose={(event) => {
                            handleResetVariables(event);
                          }}
                        >
                          {(close) => (
                            <div className="popupRow">
                              <Row className="popupHeader">
                                <h4>
                                  Schedule Service
                                  <hr className="myHR"></hr>
                                </h4>
                                <br />
                                <br />
                                <br />

                                <Col>
                                  <Container>
                                    <Form onSubmit={handleServiceSubmit}>
                                      <Row>
                                        <Col>
                                          <Form.Group>
                                            <Form.Label>
                                              Cardholder Name
                                            </Form.Label>
                                            <Form.Control
                                              type="text"
                                              placeholder="Enter cardholder name"
                                              value={cardHolder}
                                              onChange={(event) =>
                                                setCarHolder(event.target.value)
                                              }
                                              id="cardholderName"
                                              pattern="^[a-zA-Z]+\s?[a-zA]*$"
                                              required
                                            />
                                          </Form.Group>
                                          <br />
                                          <Form.Group>
                                            <Form.Label>Card Number</Form.Label>
                                            <Form.Control
                                              type="text"
                                              placeholder="Enter card number"
                                              value={cardNumber}
                                              onChange={(event) =>
                                                setCardNumber(
                                                  event.target.value
                                                )
                                              }
                                              id="cardNum"
                                              minLength={16}
                                              maxLength={16}
                                              pattern="^[0-9]+$"
                                              required
                                            />
                                          </Form.Group>
                                          <br />

                                          {/* <Form.Group>
                                                                                            <Form.Label>Expiration Month</Form.Label>
                                                                                            <Form.Select
                                                                                                id="expirationMonth" 
                                                                                                type="month"
                                                                                                value={expMonth}
                                                                                                onChange={(event) => setExpMonth(event.target.value)} 
                                                                                                required>
                                                                                                <option value="" disabled selected>Select a month</option>
                                                                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                                                                    <option key={month} value={month}>
                                                                                                        {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </Form.Select>
                                                                                        </Form.Group>

                                                                                        <Form.Group>
                                                                                            <Form.Label>Expiration Year</Form.Label>

                                                                                            <Form.Select
                                                                                                id="expirationYear" 
                                                                                                value={exp_year}
                                                                                                
                                                                                                onChange={(event) => setExpYear(event.target.value)} 
                                                                                                required>
                                                                                                    <option value="" disabled selected>Select a year</option>
                                                                                                {[...Array(10).keys()].map((year) => (
                                                                                                    <option key={year} value={2024 + year}>
                                                                                                        {2024 + year}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </Form.Select>
                                                                                        </Form.Group> */}

                                          <Form.Group>
                                            <Form.Label>
                                              Card Expiry Date
                                            </Form.Label>
                                            <br />
                                            <Form.Text>
                                              <input
                                                type="date"
                                                name="dateAdded"
                                                className="filter-input"
                                                // placeholder="Date Added"
                                                // value="2018-07-22"
                                                min={new Date()
                                                  .toJSON()
                                                  .slice(0, 10)}
                                                onChange={(event) => {
                                                  setExpiryDate(
                                                    event.target.value
                                                  );
                                                }}
                                                id="expDate"
                                                required
                                              />
                                            </Form.Text>
                                          </Form.Group>
                                          <br />

                                          <Form.Group>
                                            <Form.Label>CVC</Form.Label>
                                            <Form.Control
                                              type="text"
                                              placeholder="Enter CVC"
                                              value={cvc}
                                              onChange={(event) =>
                                                setCvc(event.target.value)
                                              }
                                              minLength={3}
                                              maxLength={3}
                                              pattern="^[0-9]+$"
                                              id="cvc"
                                              required
                                            />
                                          </Form.Group>
                                        </Col>

                                        <Col>
                                          <Form.Group>
                                            <Form.Label>
                                              Pick Appointment Date
                                            </Form.Label>
                                            <br />
                                            <Form.Text>
                                              <input
                                                type="date"
                                                name="dateAdded"
                                                className="filter-input"
                                                // placeholder="Date Added"
                                                // value="2018-07-22"
                                                min={new Date()
                                                  .toJSON()
                                                  .slice(0, 10)}
                                                onChange={handleDate}
                                                required
                                                id="date"
                                              />
                                            </Form.Text>

                                            {date != "" &&
                                              times["availableTimes"] && (
                                                <Form.Group>
                                                  <br />
                                                  <Form.Label>
                                                    Select Time
                                                  </Form.Label>
                                                  <Form.Select
                                                    className="myUL"
                                                    value={hour}
                                                    onChange={(event) =>
                                                      setHour(
                                                        event.target.value
                                                      )
                                                    }
                                                    id="time"
                                                    required
                                                  >
                                                    <option
                                                      value=""
                                                      disabled
                                                      selected
                                                    >
                                                      Select a time
                                                    </option>
                                                    {times[
                                                      "availableTimes"
                                                    ].map((time, index) => (
                                                      <option
                                                        key={index}
                                                        value={time}
                                                      >
                                                        {time}
                                                      </option>
                                                    ))}
                                                  </Form.Select>
                                                </Form.Group>
                                              )}
                                          </Form.Group>
                                          <br />
                                          <br />

                                          <Button
                                            variant="primary"
                                            type="submit"
                                            id="button"
                                          >
                                            Schedule
                                          </Button>
                                        </Col>
                                      </Row>
                                    </Form>
                                  </Container>
                                </Col>
                              </Row>
                              <button
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  padding: "9px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  fontSize: "1.2rem",
                                  color: "#2148C0",
                                  cursor: "pointer",
                                  zIndex: 1, // Set a higher z-index than the popup content
                                }}
                                onClick={() => close()}
                              >
                                &times;
                              </button>
                            </div>
                          )}
                        </Popup>
                      </CardBody>
                    </Card>
                  </div>
                </Col>
              </div>
            ))}
          </div>
        </Row>
        {/* <Row className="subR3">
                    <h3>Your scheduled services</h3>
                </Row> */}
      </Row>
    </div>
  );
}

export default ServiceApptPage;
