import { React, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/CustomerGarage.css";
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
import DealershipNavbarLogged from "../components/DealershipNavbarLogged";
import defaultVehicleImage from "../images/default.png";

import audiImage from "../images/cars/audi.png";
import bmwImage from "../images/cars/bmw.png";
import chevroletImage from "../images/cars/chevrolet.png";
import fordImage from "../images/cars/ford.png";
import gmcImage from "../images/cars/gmc.png";
import hondaImage from "../images/cars/honda.png";
import infinitiImage from "../images/cars/infiniti.png";
import jaguarImage from "../images/cars/jaguar.png";
import jeepImage from "../images/cars/jeep.png";
import nissanImage from "../images/cars/nissan.png";
import porscheImage from "../images/cars/porsche.png";

const CustomerGarage = () => {
  const access_token = "";
  const isLogged = () => {
    access_token = localStorage.getItem("access_token");
    if (access_token) {
      const user_id = localStorage.getItem("user_id");
      const job_title = localStorage.getItem("job_title");
      return;
    }
  };

  const carImages = {
    audi: audiImage,
    bmw: bmwImage,
    chevrolet: chevroletImage,
    ford: fordImage,
    gmc: gmcImage,
    honda: hondaImage,
    infiniti: infinitiImage,
    jaguar: jaguarImage,
    jeep: jeepImage,
    nissan: nissanImage,
    porsche: porscheImage,
  };

  const coreurl = "http://localhost:5000";
  // const userID = 24;
  const [cars, setCars] = useState([]);
  const [allcarMake, setallcarMake] = useState([]);
  const [allcarModel, setAllcarModel] = useState([]);
  const [allcarYear, setAllcarYear] = useState([]);
  const [carMake, setcarMake] = useState("none");
  const [carModel, setcarModel] = useState("none");
  const [carYear, setcarYear] = useState("none");
  const [vin, setVin] = useState("none");
  let dis = true;
  let dis2 = true;

  // Obtaining userId
  //    const { userId } = useParams();
  const userId = localStorage.getItem("user_id");
  console.log("User id is: ", userId);

  const GarageCar = (props) => {
    const normake = props.data[2]
      ? props.data[2].toLowerCase().replace(/\s+/g, "")
      : "default";
    const vehicleImageSrc = carImages[normake] || defaultVehicleImage;
    return (
      <Card className="garage-car-card">
        <Card.Img
          src={vehicleImageSrc}
          alt={`${props.data[2]} ${props.data[3]}`}
          className="garage-vehicle-image"
        ></Card.Img>
        <CardBody style={{ padding: 0 }} className="garage-card-body">
          <CardTitle
            style={{ margin: 0, paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
          >
            {props.data[2]} {props.data[3]}
            <div style={{ fontSize: "0.8rem", color: "blue" }}>
              {props.data[4]}
            </div>
          </CardTitle>
          <CardText>
            <Button
              id={props.data[1] + "serviceButton"}
              size="sm"
              href={"/ServiceApptPage/" + userId + "/" + props.data[1]}
            >
              Service
            </Button>
          </CardText>
        </CardBody>
      </Card>
    );
  };

  useEffect(() => {
    const url = coreurl + "/myGarageInv";
    const jsonData = { custID: userId };
    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      //.then(data => console.log(data)) // will later be changed to actually store the received data
      .then((data) => {
        console.log(data);
        setCars(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    const url2 = coreurl + "/allmake";
    fetch(url2, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setallcarMake(data);
      })
      .catch((error) => {
        console.error("error", error);
      });
  }, [carMake]);

  useEffect(() => {
    const jsonData = { make: carMake };
    const url = coreurl + "/maketomodel";
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
        console.log(data);
        setAllcarModel(data);
      })
      .catch((error) => {
        console.error("error", error);
      });
  }, [carMake]);

  useEffect(() => {
    const jsonData = { model: carModel };
    const url = coreurl + "/modeltoyear";
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
        console.log(data);
        setAllcarYear(data);
      })
      .catch((error) => {
        console.error("error", error);
      });
  }, [carModel]);

  if (carMake === "none") {
    dis = true;
  } else dis = false;
  if (carModel === "none") dis2 = true;
  else dis2 = false;

  const handleMake = (event) => {
    setcarMake(event.target.value);
  };

  const handleSubmit = () => {
    if (
      carMake == "none" ||
      carModel == "none" ||
      carYear == "none" ||
      vin == "none"
    ) {
      alert("Please Enter All Information to Add New Car to Your Garage");
      return 0;
    } else {
      const jsonData = {
        custID: userId,
        make: carMake,
        model: carModel,
        year: carYear,
        vin: vin,
      };
      const url = coreurl + "/myGarageAddCar";
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
          console.log(data);
          //alert(data.message);
          setcarMake("none");
          setcarModel("none");
          setcarYear("none");
          setVin("none");
        })
        .catch((error) => {
          console.error("error", error);
        });
    }
  };

  return (
    <div>
      {/* User will see Log Out button if they are logged in*/}
      {userId != undefined && <DealershipNavbarLogged userId={userId} />}
      <Container className="garage">
        <Row className="garage-cars">
          <Col>
            <Container>
              <Row className="garage-car-holder">
                {cars.myGarageInv
                  ? cars.myGarageInv.map((data) => (
                      <Col key={data[1]} className="garage-car-col">
                        <GarageCar data={data} />
                      </Col>
                    ))
                  : null}
              </Row>
            </Container>
          </Col>
          <Col>
            <Form>
              <h5 style={{ color: "darkblue" }}>Add New Car in your Garage</h5>
              <Form.Group>
                <Form.Label>Car Make</Form.Label>
                <Form.Select
                  value={carMake}
                  onChange={(e) => handleMake(e)}
                  id="GarageCarMake"
                >
                  <option value="none">Select Car Make</option>
                  {allcarMake.makes
                    ? allcarMake.makes.map((data) => (
                        <option key={data[0]} value={data[0]}>
                          {data[0]}
                        </option>
                      ))
                    : null}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Car Model</Form.Label>
                <Form.Select
                  value={carModel}
                  onChange={(e) => {
                    setcarModel(e.target.value);
                  }}
                  disabled={dis}
                  id="GarageCarModel"
                >
                  <option value="none">Select Car Model</option>
                  {allcarModel.models
                    ? allcarModel.models.map((data) => (
                        <option key={data[0]} value={data[0]}>
                          {data[0]}
                        </option>
                      ))
                    : null}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Car Year</Form.Label>
                <Form.Select
                  value={carYear}
                  onChange={(e) => {
                    setcarYear(e.target.value);
                  }}
                  disabled={dis2}
                  id="GarageCarYear"
                >
                  <option value="none">Select Car Year</option>
                  {allcarYear.years
                    ? allcarYear.years.map((data) => (
                        <option key={data[0]} value={data[0]}>
                          {data[0]}
                        </option>
                      ))
                    : null}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>VIN Number</Form.Label>
                <Form.Control
                  value={vin}
                  onChange={(e) => {
                    setVin(e.target.value);
                  }}
                  disabled={carYear == "none" ? true : false}
                  id="GarageCarVin"
                ></Form.Control>
              </Form.Group>
              <br />
              <Button onClick={handleSubmit} id="GarageAddCarButton">
                Add New
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerGarage;
