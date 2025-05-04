import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Image,
} from "react-bootstrap";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { FaHeart } from "react-icons/fa";

import FavoriteButton from "../components/FavoriteButton";
import TestDrivePopup from "../components/TestDrivePopup";
import DealershipNavbar from "../components/DealershipNavbar";
import DealershipNavbarLogged from "../components/DealershipNavbarLogged";

import greenCheck from "../images/green-check.jpg"; // Adjust the path as necessary
import blueSquare from "../images/blue_square.png"; // Adjust the path as necessary

// Import default image
import defaultVehicleImage from "../images/default.png";

// Import images for each car make for different views
import fordMainImage from "../images/cars/ford.png";
import fordBackImage from "../images/cars/ford-back.jpeg";
import fordSideImage from "../images/cars/ford-side.jpeg";
import fordInteriorImage from "../images/cars/ford-interior.jpeg";
import fordFrontImage from "../images/cars/ford-front.jpeg";

import bmwMainImage from "../images/cars/bmw.png";
import bmwBackImage from "../images/cars/bmw-back.jpeg";
import bmwSideImage from "../images/cars/bmw-side.jpeg";
import bmwInteriorImage from "../images/cars/bmw-interior.jpeg";
import bmwFrontImage from "../images/cars/bmw-front.jpeg";

import nissanMainImage from "../images/cars/nissan.png";
import nissanBackImage from "../images/cars/nissan-back.jpeg";
import nissanSideImage from "../images/cars/nissan-side.jpeg";
import nissanInteriorImage from "../images/cars/nissan-interior.jpeg";
import nissanFrontImage from "../images/cars/nissan-front.jpeg";

import hondaMainImage from "../images/cars/honda.png";
import hondaBackImage from "../images/cars/honda-back.jpeg";
import hondaSideImage from "../images/cars/honda-side.jpeg";
import hondaInteriorImage from "../images/cars/honda-interior.jpeg";
import hondaFrontImage from "../images/cars/honda-front.jpeg";

import jeepMainImage from "../images/cars/jeep.png";
import jeepBackImage from "../images/cars/jeep-back.jpeg";
import jeepSideImage from "../images/cars/jeep-side.jpeg";
import jeepInteriorImage from "../images/cars/jeep-interior.jpeg";
import jeepFrontImage from "../images/cars/jeep-front.jpeg";

import jaguarMainImage from "../images/cars/jaguar.png";
import jaguarBackImage from "../images/cars/jaguar-back.jpeg";
import jaguarSideImage from "../images/cars/jaguar-side.jpeg";
import jaguarInteriorImage from "../images/cars/jaguar-interior.jpeg";
import jaguarFrontImage from "../images/cars/jaguar-front.jpeg";

import gmcMainImage from "../images/cars/gmc.png";
import gmcBackImage from "../images/cars/gmc-back.jpeg";
import gmcSideImage from "../images/cars/gmc-side.jpeg";
import gmcInteriorImage from "../images/cars/gmc-interior.jpeg";
import gmcFrontImage from "../images/cars/gmc-front.jpeg";

import porscheMainImage from "../images/cars/porsche.png";
import porscheBackImage from "../images/cars/porsche-back.jpeg";
import porscheSideImage from "../images/cars/porsche-side.jpeg";
import porscheInteriorImage from "../images/cars/porsche-interior.jpeg";
import porscheFrontImage from "../images/cars/porsche-front.jpeg";

import audiMainImage from "../images/cars/audi.png";
import audiBackImage from "../images/cars/audi-back.jpeg";
import audiSideImage from "../images/cars/audi-side.jpeg";
import audiInteriorImage from "../images/cars/audi-interior.jpeg";
import audiFrontImage from "../images/cars/audi-front.jpeg";

import infinitiMainImage from "../images/cars/infiniti.png";
import infinitiBackImage from "../images/cars/infiniti-back.jpeg";
import infinitiSideImage from "../images/cars/infiniti-side.jpeg";
import infinitiInteriorImage from "../images/cars/infiniti-interior.jpeg";
import infinitiFrontImage from "../images/cars/infiniti-front.jpeg";

import chevroletMainImage from "../images/cars/chevrolet.png";
import chevroletBackImage from "../images/cars/chevrolet-back.jpeg";
import chevroletSideImage from "../images/cars/chevrolet-side.jpeg";
import chevroletInteriorImage from "../images/cars/chevrolet-interior.jpeg";
import chevroletFrontImage from "../images/cars/chevrolet-front.jpeg";

import "../styles/VehicleDetails.css";

// ... other images for ford
// Import for other makes similarly...

// Object to map car makes to images
const carMakeImages = {
  ford: {
    main: fordMainImage,
    back: fordBackImage,
    side: fordSideImage,
    interior: fordInteriorImage,
    front: fordFrontImage,
    // main is removed from here since it's used separately
  },
  bmw: {
    main: bmwMainImage,
    back: bmwBackImage,
    side: bmwSideImage,
    interior: bmwInteriorImage,
    front: bmwFrontImage,
  },
  nissan: {
    main: nissanMainImage,
    back: nissanBackImage,
    side: nissanSideImage,
    interior: nissanInteriorImage,
    front: nissanFrontImage,
  },
  honda: {
    main: hondaMainImage,
    back: hondaBackImage,
    side: hondaSideImage,
    interior: hondaInteriorImage,
    front: hondaFrontImage,
  },
  jeep: {
    main: jeepMainImage,
    back: jeepBackImage,
    side: jeepSideImage,
    interior: jeepInteriorImage,
    front: jeepFrontImage,
  },
  jaguar: {
    main: jaguarMainImage,
    back: jaguarBackImage,
    side: jaguarSideImage,
    interior: jaguarInteriorImage,
    front: jaguarFrontImage,
  },
  gmc: {
    main: gmcMainImage,
    back: gmcBackImage,
    side: gmcSideImage,
    interior: gmcInteriorImage,
    front: gmcFrontImage,
  },
  porsche: {
    main: porscheMainImage,
    back: porscheBackImage,
    side: porscheSideImage,
    interior: porscheInteriorImage,
    front: porscheFrontImage,
  },
  chevrolet: {
    main: chevroletMainImage,
    back: chevroletBackImage,
    side: chevroletSideImage,
    interior: chevroletInteriorImage,
    front: chevroletFrontImage,
  },
  infiniti: {
    main: infinitiMainImage,
    back: infinitiBackImage,
    side: infinitiSideImage,
    interior: infinitiInteriorImage,
    front: infinitiFrontImage,
  },
  audi: {
    main: audiMainImage,
    back: audiBackImage,
    side: audiSideImage,
    interior: audiInteriorImage,
    front: audiFrontImage,
  },

  default: defaultVehicleImage, // Fallback if the car make is not listed
};

function VehicleDetails() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const userId = localStorage.getItem("user_id");
  const [carDetails, setCarDetails] = useState(null);
  const [showTestDrivePopup, setShowTestDrivePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleScheduleTestDrive = (date, time) => {
    console.log(`Scheduling test drive for ${date} at ${time}`);
    // Here you'd perform the API call to /scheduleTestDriveAppt
    // Then, handleClosePopup();
  };

  useEffect(() => {
    async function fetchCarDetails() {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/vehicleDetails/${vehicleId}`
        );
        const data = await response.json();
        if (response.ok && data.carDetails) {
          setCarDetails(data.carDetails);
        } else {
          console.error("No car details found or unexpected format");
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    }
    fetchCarDetails();
  }, [vehicleId]);

  // Guard against null carDetails
  if (!carDetails) {
    return <div>Loading...</div>;
  }

  const handlePurchase = () => navigate(`/purchase/${carDetails.vin}`);
  const handleBookTestDriveClick = () => setShowTestDrivePopup(true);
  const handleClosePopup = () => setShowTestDrivePopup(false);

  // Determine the correct image set based on car make
  const makeKey = carDetails.make ? carDetails.make.toLowerCase() : "default";

  return (
    <div>
      {userId ? <DealershipNavbarLogged /> : <DealershipNavbar />}
      <Container fluid className="vd-page">
        <Row className="justify-content-md-center">
          <Col xs={12} md={8}>
            <Card className="vd-card mb-4">
              <Card.Header className="vd-card-header">
                <Row>
                  <Col className="vd-title">
                    {carDetails.make} {carDetails.model} ({carDetails.year})
                  </Col>
                  <Col md="auto" className="text-right">
                    <FavoriteButton
                      userId={userId}
                      make={carDetails.make}
                      model={carDetails.model}
                      year={carDetails.year}
                    />
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="vd-card-body">
                <Row>
                  <Col md={8}>
                    <Carousel className="vd-carousel">
                      {Object.entries(carMakeImages[makeKey]).map(
                        ([key, src]) => (
                          <Carousel.Item key={key}>
                            <img
                              className="d-block w-100"
                              src={src}
                              alt={`${carDetails.make} ${key} view`}
                            />
                          </Carousel.Item>
                        )
                      )}
                    </Carousel>
                  </Col>
                  <Col md={4} className="vd-thumbnails">
                    {Object.entries(carMakeImages[makeKey]).map(
                      ([key, src]) => (
                        <Image
                          style={{ height: "4rem", width: "4rem" }}
                          key={key}
                          src={src}
                          alt={`${carDetails.make} ${key}`}
                          thumbnail
                          onClick={() => setSelectedImage(src)}
                        />
                      )
                    )}
                  </Col>
                </Row>
                <Row>
                  <div className="vd-purchase-options text-right">
                    <Col style={{ textAlign: "end", paddingRight: "1rem" }}>
                      <Button
                        className="vd-purchase-btn mr-2"
                        variant="success"
                        onClick={handlePurchase}
                        id="VehicleDetailsPurchaseButton"
                      >
                        Purchase
                      </Button>
                    </Col>
                    <Col style={{ textAlign: "start", paddingLeft: "1rem" }}>
                      <Button
                        className="vd-test-drive-btn"
                        variant="info"
                        onClick={handleBookTestDriveClick}
                        id="VehicleDetailsTestDriveButton"
                      >
                        Book a Test Drive
                      </Button>
                      {showTestDrivePopup && (
                        <TestDrivePopup
                          onClose={handleClosePopup}
                          onSchedule={handleScheduleTestDrive}
                          userId={userId}
                        />
                      )}
                    </Col>
                  </div>
                </Row>
              </Card.Body>
            </Card>

            <Card className="vd-card">
              <Card.Header className="vd-card-header">Key Features</Card.Header>
              <Card.Body className="vd-card-body">
                <Row>
                  {[
                    "Push Button Start",
                    "Alloy Wheels",
                    "Wireless Apple CarPlay",
                    "USB Inputs",
                    "Fold Down Rear Seats",
                    "Power Mirrors",
                    "Tilt Wheel",
                    "Rear View Camera",
                  ].map((feature, index) => (
                    <Col xs={6} md={4} key={index} className="vd-feature">
                      <Card className="vd-feature-card">
                        <Card.Body>
                          <IoIosCheckmarkCircle className="vd-feature-icon" />
                          {feature}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Card className="vd-card">
              <Card.Header className="vd-card-header">
                Vehicle Details
              </Card.Header>
              <Card.Body className="vd-card-body">
                <ul className="vd-details-list">
                  {[
                    "engine",
                    "interior_color",
                    "exterior_color",
                    "keys_given",
                    "wheel_drive",
                    "seats",
                    "transmission",
                    "vin",
                    "car_id",
                  ].map(
                    (detail) =>
                      carDetails[detail] && (
                        <li key={detail}>
                          <strong>{detail.replace(/_/g, " ")}:</strong>{" "}
                          {carDetails[detail]}
                        </li>
                      )
                  )}
                </ul>
              </Card.Body>
            </Card>

            <Card className="vd-card">
              <Card.Header className="vd-card-header">
                Price Details
              </Card.Header>
              <Card.Body className="vd-card-body">
                <ul className="vd-price-list">
                  {carDetails.price && (
                    <li>
                      Vehicle Price: ${parseFloat(carDetails.price).toFixed(2)}
                    </li>
                  )}
                  {carDetails.tax && (
                    <li>Tax: ${parseFloat(carDetails.tax).toFixed(2)}</li>
                  )}
                  {carDetails.price && (
                    <li>
                      Total Price: $
                      {parseFloat(carDetails.price + carDetails.tax).toFixed(2)}
                    </li>
                  )}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default VehicleDetails;
