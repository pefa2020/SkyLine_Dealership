import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Button, Container, Row, Col } from 'react-bootstrap';

import '../styles/VehicleCard.css';
// Default image
import defaultVehicleImage from '../images/default.png';
// Import images for each car make
import audiImage from '../images/cars/audi.png';
import bmwImage from '../images/cars/bmw.png';
import chevroletImage from '../images/cars/chevrolet.png';
import fordImage from '../images/cars/ford.png';
import gmcImage from '../images/cars/gmc.png';
import hondaImage from '../images/cars/honda.png';
import infinitiImage from '../images/cars/infiniti.png';
import jaguarImage from '../images/cars/jaguar.png';
import jeepImage from '../images/cars/jeep.png';
import nissanImage from '../images/cars/nissan.png';
import porscheImage from '../images/cars/porsche.png';
import { FaDollarSign, FaRegUserCircle, FaUserFriends } from 'react-icons/fa';

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



function VehicleCard({ vehicle, userId, onSelect, isChecked, showCheckbox = false }) {
  const normalizedMake = vehicle.make ? vehicle.make.toLowerCase().replace(/\s+/g, '') : 'default';
  const vehicleImageSrc = carImages[normalizedMake] || defaultVehicleImage;

  return (
    <Card className={isChecked ? "vehicle-card selected" : "vehicle-card"}>
      <Card.Img variant="top" src={vehicleImageSrc} alt={`${vehicle.make} ${vehicle.model}`} className="vehicle-image" />
      <Container className="vehicle-info">
        <Row className="justify-content-center">
          <Col xs={12}>
            <Card.Title className="card-title">{`${vehicle.make} ${vehicle.model}`}</Card.Title>
          </Col>
        </Row>
        <Row className="vehicle-details justify-content-center">
          <Col md="auto" className="icon-col">
            <span className="icon-text">{vehicle.year}</span>
          </Col>
          <Col md="auto" className="icon-col">
            <FaDollarSign /><span className="icon-text">${vehicle.price}</span>
          </Col>
          {vehicle.passengers && (
            <Col md="auto" className="icon-col">
              <FaUserFriends /><span className="icon-text">{vehicle.passengers}</span>
            </Col>
          )}
        </Row>
        <Row>
          <Col>
            <Button className="details-button">
              <Link to={`/vehicleDetails/${vehicle.vin}${userId ? `/${userId}` : ''}`} className="details-link">
                Details
              </Link>
            </Button>
          </Col>
          {showCheckbox && (
            <input type="checkbox" checked={isChecked} onChange={() => onSelect(vehicle)} className="position-absolute" style={{top: '10px', right: '10px'}} />
          )}
        </Row>
      </Container>
    </Card>
  );
}

export default VehicleCard;