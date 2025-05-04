import { React, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
// Added
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
// import DealershipNavBarLogged from './components/DealershipNavbarLogged';
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
import "../styles/ManagerPage.css";
import Popup from "reactjs-popup";
import { useNavigate } from "react-router-dom";

function ManagerPage() {
  // const { user_id } = useParams();  // const { userId } = useParams();
  // console.log("User (Manager) id is: ", user_id);

  // const { userId } = useParams();
  // console.log("User id is: ", userId);

  const userId = localStorage.getItem("user_id");

  const [currappts, setCurrappts] = useState([]);
  const [carSales, setCarSales] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [sale_id, setSaleId] = useState("");

  const [date, setDate] = useState("");
  const [times, setTimes] = useState([]);
  const [hour, setHour] = useState("");
  const [apptId, setApptId] = useState("");
  const [removeApptId, setRemoveApptId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const url2 = "http://localhost:5000/testDriveAppts";
    fetch(url2, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      // body: JSON.stringify(jsonData2),
    })
      .then((response) => response.json())
      //.then(data => console.log(data)) // will later be changed to actually store the received data
      .then((data) => {
        if (data) {
          setCurrappts(data);
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    const jsonData = { managerID: userId };
    const url2 = "http://localhost:5000/negotiation";
    fetch(url2, {
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
          setNegotiations(data);
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const handleCancelApptSubmit = (event) => {
    event.preventDefault();
    if (removeApptId != "") {
      const url = "http://localhost:5000/cancelTestDriveAppt";
      const jsonData = { apptID: removeApptId };
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
          if (data) {
            //alert(data["testDriveAppt"]);
          }
          // Resetting variables
          setDate("");
          setTimes([]);
          setHour("");
          setApptId("");
          setRemoveApptId("");
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const handleRescheduleApptSubmit = (event) => {
    event.preventDefault();
    console.log("Appt id is: ", apptId);
    if (apptId != "" && hour != "" && date != "") {
      const url = "http://localhost:5000/rescheduleTestDriveAppt";
      const jsonData = { apptID: apptId, datetime: date + " " + hour };
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
          if (data) {
            //alert(data["message"]);
          }
          // Resetting variables
          setDate("");
          setTimes([]);
          setHour("");
          setApptId("");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const handleDate = (event) => {
    setTimes([]);
    setDate(event.target.value);
    if (event.target.value != "") {
      console.log("Selected date: ", event.target.value);
      const url = "http://localhost:5000/availableTestDriveTimes";
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
    setApptId("");
    setRemoveApptId("");
    // setcarMake('none');
    // setcarModel('none');
  };

  const handleSearchSale = (event) => {
    event.preventDefault();
    console.log("You chose: ", sale_id);
    const jsonData = { saleID: sale_id };
    const url = "http://localhost:5000/negotiationSale";
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
          setCarSales(data);
          console.log(data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    setSaleId("");
  };

  return (
    <div>
      {/* <ManagerDealershipNavbarLogged userId={user_id} /> */}
      {userId != undefined && <ManagerDealershipNavbarLogged userId={userId} />}

      <Container fluid className="appointment-page">
        <Row className="appointment-type">
          <center>
            <h5>Test Drive Appointments</h5>
          </center>
        </Row>
        <Row>
          <Col>
            <Container className="appointment-curr">
              {/* <Row><Col className='appointment-curr-label'>My Upcoming Appointment</Col></Row> */}
              {currappts["testDriveAppts"] != "" &&
              currappts["testDriveAppts"] ? (
                <Row className="appointment-curr-header">
                  <Col xs={3}>
                    <IoMdTime /> Appt. Id
                  </Col>
                  <Col>
                    <IoMdListBox /> First Name
                  </Col>
                  <Col>
                    <FaTools /> Last Name
                  </Col>
                  <Col>
                    <FaTools /> User_id
                  </Col>
                  <Col>
                    <FaTools /> Scheduled Date
                  </Col>
                  <Col>
                    <FaTools /> Status
                  </Col>
                  <Col>Option 1</Col>
                  <Col>Option 2</Col>
                </Row>
              ) : null}
              {currappts["testDriveAppts"] != "" &&
              currappts["testDriveAppts"] ? (
                currappts["testDriveAppts"].map((data) => (
                  <Row key={data.appt_id} className="appointment-curr-info">
                    <Col xs={3}>{data.appt_id}</Col>
                    <Col>{data.first_name}</Col>
                    <Col>{data.last_name}</Col>
                    <Col>{data.user_id}</Col>
                    <Col>{data.scheduled_date}</Col>
                    <Col>{data.status}</Col>

                    {data.status == "created" ? (
                      <Col>
                        <Popup
                          contentStyle={{
                            height: "85%",
                            size: "auto",
                            width: "45%",
                            borderWidth: "8px",
                            borderColor: "#2148C0",
                            borderRadius: "10px",
                          }}
                          trigger={<Button size="sm">Reschedule</Button>}
                          onOpen={(event) => {
                            setApptId(data.appt_id);
                            console.log("Appt just set to: ", data.appt_id);
                          }}
                          modal
                          nested
                          onClose={(event) => {
                            handleResetVariables(event);
                          }}
                        >
                          {(close) => (
                            <div className="popupUpperRowManager">
                              <Row className="popupHeader">
                                <h4>
                                  Reschedule Service
                                  <hr className="myHR"></hr>
                                </h4>
                                <br />
                                <br />
                                <br />
                                <Form>
                                  <br />
                                  <Form.Group>
                                    <Form.Label>Pick Date</Form.Label>
                                    <br />
                                    <Form.Text>
                                      <input
                                        type="date"
                                        name="dateAdded"
                                        className="filter-input"
                                        // placeholder="Date Added"
                                        // value="2018-07-22"
                                        min={new Date().toJSON().slice(0, 10)}
                                        onChange={handleDate}
                                      />
                                    </Form.Text>

                                    {date != "" && times["availableTimes"] && (
                                      <ul className="myUL">
                                        {times["availableTimes"].map(
                                          (time, index) => (
                                            <li>
                                              <br />
                                              <Form.Group
                                                key={index}
                                                controlId={`timeSlot-${index}`}
                                              >
                                                <Form.Check
                                                  type="radio"
                                                  label={time}
                                                  name="timeSlot"
                                                  value={time}
                                                  onChange={(e) => {
                                                    setHour(e.target.value);
                                                  }}
                                                />
                                              </Form.Group>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                  </Form.Group>
                                  <br />
                                  <br />
                                  <Button onClick={handleRescheduleApptSubmit}>
                                    Reschedule
                                  </Button>
                                </Form>
                              </Row>
                            </div>
                          )}
                        </Popup>
                      </Col>
                    ) : (
                      <Col>
                        <Button size="sm" disabled>
                          Reschedule
                        </Button>
                      </Col>
                    )}

                    {data.status == "created" ? (
                      <Col>
                        <Popup
                          contentStyle={{
                            height: "25%",
                            size: "auto",
                            width: "30%",
                            borderWidth: "8px",
                            borderColor: "#2148C0",
                            borderRadius: "10px",
                          }}
                          trigger={<Button size="sm">Remove</Button>}
                          onOpen={(event) => {
                            setRemoveApptId(data.appt_id);
                            console.log(
                              "Remove Appt just set to: ",
                              data.appt_id
                            );
                          }}
                          modal
                          nested
                          onClose={(event) => {
                            handleResetVariables(event);
                          }}
                        >
                          {(close) => (
                            <div className="popupRowManager">
                              <div>
                                Are you sure you want to cancel appointment with
                                id: {data.appt_id}?
                              </div>
                              <Form>
                                <Button onClick={handleCancelApptSubmit}>
                                  YES
                                </Button>
                              </Form>
                              <br />
                              <Button onClick={close}>NO</Button>
                            </div>
                          )}
                        </Popup>
                      </Col>
                    ) : (
                      <Col>
                        <Button size="sm" disabled>
                          Remove
                        </Button>
                      </Col>
                    )}
                  </Row>
                ))
              ) : (
                <Row>
                  <Col>No appointments</Col>
                </Row>
              )}
            </Container>
          </Col>
        </Row>

        <Row className="appointment-type">
          <center>
            <h5>Negotiations</h5>
          </center>
        </Row>
        <Row>
          <Col>
            <Container className="appointment-curr">
              {/* <Row><Col className='appointment-curr-label'>My Upcoming Appointment</Col></Row> */}
              {negotiations["negotiation"] != "" &&
              negotiations["negotiation"] ? (
                <Row className="appointment-curr-header">
                  <Col xs={3}>
                    <IoMdTime /> User Id
                  </Col>
                  <Col>
                    <IoMdListBox /> First Name
                  </Col>
                  <Col>
                    <FaTools /> Last Name
                  </Col>
                  <Col>
                    <FaTools /> Vin
                  </Col>
                  <Col>
                    <FaTools /> Price
                  </Col>
                  <Col>
                    <FaTools /> Insert Date
                  </Col>
                  <Col> </Col>
                </Row>
              ) : null}
              {negotiations["negotiation"] != "" &&
              negotiations["negotiation"] ? (
                negotiations["negotiation"].map((data) => (
                  <Row key={data.vin} className="appointment-curr-info">
                    <Col xs={3}>{data.user_id}</Col>
                    <Col>{data.first_name}</Col>
                    <Col>{data.last_name}</Col>
                    <Col>{data.vin}</Col>
                    <Col>{data.price}</Col>
                    <Col>{data.insert_date}</Col>
                    <Col>
                      <Button
                        size="sm"
                        onClick={(event) => {
                          navigate(`/ManagerNegotiation/${userId}`);
                        }}
                      >
                        Manage
                      </Button>
                    </Col>
                  </Row>
                ))
              ) : (
                <Row>
                  <Col>No appointments</Col>
                </Row>
              )}
            </Container>
          </Col>
        </Row>

        <Row className="appointment-type">
          <center>
            <h5>Car Sales</h5>
          </center>
        </Row>
        <br />
        <Row>
          <Col>
            <div className="searchBarSale">
              <Form onSubmit={handleSearchSale}>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">
                    Input Sale ID:
                  </InputGroup.Text>
                  <Form.Control
                    aria-label="Default"
                    aria-describedby="inputGroup-sizing-default"
                    value={sale_id}
                    onChange={(e) => setSaleId(e.target.value)}
                    id="managerPageSearchSaleText"
                  />
                </InputGroup>
                <Button
                  variant="primary"
                  type="submit"
                  className="searchBarSale"
                  id="managerPageSearchButton"
                >
                  Search
                </Button>
              </Form>
            </div>

            {/*THIRD table*/}
            <Container className="appointment-curr">
              {/* <Row><Col className='appointment-curr-label'>My Upcoming Appointment</Col></Row> */}
              {carSales["negotiationSale"] != "" &&
              carSales["negotiationSale"] ? (
                <Row className="appointment-curr-header">
                  <Col xs={3}>
                    <IoMdTime /> User Id
                  </Col>
                  <Col>
                    <IoMdListBox /> First Name
                  </Col>
                  <Col>
                    <FaTools /> Last Name
                  </Col>
                  <Col>
                    <FaTools /> Vin
                  </Col>
                  <Col>
                    <FaTools /> Make
                  </Col>
                  <Col>
                    <FaTools /> Model
                  </Col>
                  <Col>
                    <FaTools /> Year
                  </Col>
                  <Col>
                    <FaTools /> Sale Date
                  </Col>
                  <Col>
                    <FaTools /> Price $
                  </Col>
                </Row>
              ) : null}
              {carSales["negotiationSale"] != "" &&
              carSales["negotiationSale"] ? (
                carSales["negotiationSale"].map((data) => (
                  <Row key={data.user_id} className="appointment-curr-info">
                    <Col xs={3}>{data.user_id}</Col>
                    <Col>{data.first_name}</Col>
                    <Col>{data.last_name}</Col>
                    <Col>{data.vin}</Col>
                    <Col>{data.make}</Col>
                    <Col>{data.model}</Col>
                    <Col>{data.year}</Col>
                    <Col>{data.insert_date}</Col>
                    <Col>{data.price}</Col>
                  </Row>
                ))
              ) : (
                <Row>
                  <Col>No Results Found</Col>
                </Row>
              )}
            </Container>
            <br />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ManagerPage;
