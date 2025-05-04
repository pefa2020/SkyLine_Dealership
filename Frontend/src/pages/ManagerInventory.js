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
import "../styles/ManagerInventory.css";

function ManagerInventory() {
  // const { userId } = useParams();
  // console.log("User id (manager) is: ", userId);
  const userId = localStorage.getItem("user_id");

  const [car_id, setCarId] = useState("");

  const navigate = useNavigate();

  const [new_service_option, setNewServiceOption] = useState("");
  const [new_service_price, setNewServicePrice] = useState("");

  const [update_service, setUpdateService] = useState("");
  const [update_price_service, setUpdatePriceService] = useState("");
  const [update_name_service, setUpdateNameService] = useState("");

  const handleUpdateService = (event) => {
    event.preventDefault();
    console.log("update service: ", update_service);
    console.log("update price: ", update_price_service);
    console.log("update name: ", update_name_service);
    if (
      (update_service != "") & (update_price_service > 0) &&
      update_name_service != ""
    ) {
      const url = "http://localhost:5000/updateDealershipService";
      const jsonData = {
        option_id: update_service,
        description: update_name_service,
        price: update_price_service,
      };
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
          setUpdateService("");
          setUpdatePriceService("");
          setUpdateNameService("");
          window.location.reload();
        })
        .catch((error) => {
          console.error("error", error);
        });
    }
  };

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

  const handleAddService = (event) => {
    event.preventDefault();
    console.log("About to add a new service");
    if (
      (new_service_option != "") & (new_service_price > 0) &&
      new_service_price != ""
    ) {
      const url = "http://localhost:5000/addDealershipService";
      const jsonData = {
        service_option: new_service_option,
        price: new_service_price,
      };
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
          setNewServiceOption("");
          window.location.reload();
        })
        .catch((error) => {
          console.error("error", error);
        });
    }
  };

  const handleResetVariables = () => {
    setNewServiceOption("");
    setNewServicePrice("");
  };

  return (
    <div className="managerInventory">
      {userId != undefined && <ManagerDealershipNavbarLogged userId={userId} />}

      <Container className="appointment-curr">
        <Row className="appointment-type">
          <center>
            <h3>Inventory</h3>
          </center>
        </Row>
      </Container>

      <div className="inventoryRow1"></div>

      <div className="inventoryRow2">
        <div className="inventoryColumn1">
          <Button
            size="lg"
            id="managerInventoryAddCar"
            onClick={(event) => {
              navigate(`/ManagerAddCarMMY/${userId}`);
            }}
          >
            Add Car Make, Model, Year
          </Button>
        </div>
        <div className="inventoryColumn2">
          <Button
            size="lg"
            onClick={(event) => {
              navigate(`/ManagerUpdateCar/${userId}`);
            }}
          >
            Update Car Details
          </Button>
        </div>
        <div className="inventoryColumn2">
          <Button
            size="lg"
            onClick={(event) => {
              navigate(`/ManagerAddCar/${userId}`);
            }}
            id="managerInventoryAddIndivCar"
          >
            Add Individual Car
          </Button>
        </div>

        <div className="inventoryColumn2">
          <Popup
            contentStyle={{
              width: "30%",
              height: "50%",
              borderWidth: "8px",
              borderColor: "#2148C0",
              borderRadius: "10px",
            }}
            trigger={<Button size="lg">Add a Service</Button>}
            modal
            nested
            onClose={(event) => {
              handleResetVariables(event);
            }}
          >
            {(close) => (
              <div className="serviceManagement">
                <Form onSubmit={handleAddService}>
                  <br />
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      Service Option:
                    </InputGroup.Text>

                    <Form.Control
                      placeholder="Enter service"
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      value={new_service_option}
                      onChange={(e) => setNewServiceOption(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <br />

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      Service Price:
                    </InputGroup.Text>

                    <Form.Control
                      placeholder="Enter price in $"
                      type="number"
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      value={new_service_price}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <br />
                  <Button type="submit">ADD service</Button>
                </Form>
                {/* <Button onClick={() => close()}>Close</Button> */}
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
        </div>

        <div className="inventoryColumn2">
          <Popup
            contentStyle={{
              width: "35%",
              height: "80%",
              borderWidth: "8px",
              borderColor: "#2148C0",
              borderRadius: "10px",
            }}
            trigger={<Button size="lg">Update a Service</Button>}
            modal
            nested
            onClose={(event) => {
              handleResetVariables(event);
            }}
          >
            {(close) => (
              <div className="serviceManagement">
                <Container size="lg">
                  <Row>
                    <Col>
                      <Form onSubmit={handleUpdateService}>
                        <Form.Group>
                          <Form.Label>Choose Service</Form.Label>
                          <Form.Select
                            onChange={(event) =>
                              setUpdateService(event.target.value)
                            }
                            required
                          >
                            <option value="" disabled selected>
                              Select a service
                            </option>
                            {all_services.map((innerArray, index1) => (
                              <option
                                key={index1}
                                value={innerArray[0]}
                                className="twoColumnLayout"
                              >
                                <Col>{innerArray[1]} Service</Col>
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <br />

                        <Form.Group>
                          <Form.Label>New service name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter service name"
                            value={update_name_service}
                            onChange={(event) =>
                              setUpdateNameService(event.target.value)
                            }
                            pattern="^[a-zA-Z]+\s?[a-zA]*$"
                            required
                          />
                        </Form.Group>
                        <br />

                        <Form.Group>
                          <Form.Label>New service price</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter service name"
                            value={update_price_service}
                            onChange={(event) =>
                              setUpdatePriceService(event.target.value)
                            }
                            pattern="^[1-9][0-9]*$"
                            required
                          />
                        </Form.Group>
                        <br />

                        <Button type="submit">UPDATE Service</Button>
                      </Form>
                    </Col>
                  </Row>
                </Container>

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
        </div>
      </div>
    </div>
  );
}

export default ManagerInventory;
