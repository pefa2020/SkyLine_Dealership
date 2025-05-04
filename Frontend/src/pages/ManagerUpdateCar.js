import { React, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { Card, Button, Container, Row, Col, CardTitle, CardBody, CardText, Form, FormLabel } from 'react-bootstrap'
import carimage from '../images/image.png';
import { IoMdTime, IoMdListBox, IoIosPricetags, } from "react-icons/io";
import { FaBuilding, FaCar, FaCalendarAlt, FaTools } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ManagerDealershipNavbarLogged from '../components/ManagerDealershipNavbarLogged';
import InputGroup from 'react-bootstrap/InputGroup';
import Popup from 'reactjs-popup';
import { useNavigate } from "react-router-dom";
import '../styles/ManagerUpdateCar.css';

function ManagerUpdateCar() {

    // const { userId } = useParams();
    // console.log("User id (manager) is: ", userId);
    const userId = localStorage.getItem("user_id");

    const [vin, setVin] = useState('');
    const [price, setPrice] = useState('');
    const [ext_color, setExtColor] = useState('');
    const [int_color, setIntColor] = useState('');
    const [wheel_drive, setWheelDrive] = useState('');
    const [mileage, setMileage] = useState('');
    const [trans, setTrans] = useState('');
    const [seats, setSeats] = useState('');
    const [keys, setKeys] = useState('');
    const [tax, setTax] = useState('');
    const [engine, setEngine] = useState('');

    const [vin_lookup, setVinLookup] = useState('');
    const [car_details, setCarDetails] = useState([]);


    const handleVinLookup = (event) => {
        event.preventDefault();
        // do fetch
        if (vin_lookup != '') {
            const jsonData = { "vin": vin_lookup };
            const url = 'http://localhost:5000/getCarDetails';
            fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(jsonData),
            })
                .then(response => response.json())
                //.then(data => console.log(data)) // will later be changed to actually store the received data
                .then(data => {
                    if (data) {
                        if (data["message"] == "Car VIN does not exist.") {
                            alert(data["message"]);
                        } else if (data["results"]) {
                            console.log(data);
                            setCarDetails(data);
                            // console.log("This is vin", setVin(data["results"][0]["vin"]));
                            setVin(data["results"][0]["vin"]);
                            setPrice(data["results"][0]["price"]);
                            setExtColor(data["results"][0]["ext_color"]);
                            setIntColor(data["results"][0]["int_color"]);
                            setWheelDrive(data["results"][0]["wheel_drive"]);
                            setMileage(data["results"][0]["mileage"]);
                            setTrans(data["results"][0]["transmission"]);
                            setSeats(data["results"][0]["seats"]);
                            setKeys(data["results"][0]["keys_given"]);
                            setTax(data["results"][0]["tax"]);
                            setEngine(data["results"][0]["engine"]);                            
                        }
                    }
                    setVinLookup('');
                })
                .catch((error) => {
                    console.error('Response:', error);
                });
        } else {
            alert("Check field.");
        }
    }

    const handleManagerUpdateCar = (event) => {
        event.preventDefault();
        const regex_digits = /^[0-9]+$/;

        if (vin != '' && price != '' && ext_color != '' &&
            int_color != '' && wheel_drive != '' && mileage != ''
            && trans != '' && seats != '' && keys != '' && tax != ''
            && engine != '' && regex_digits.test(mileage) &&
            regex_digits.test(seats) && regex_digits.test(keys)
            ) {

            const jsonData = {
                "vin": vin, "price": price, "ext_color": ext_color,
                "int_color": int_color, "wheel_drive": wheel_drive, "mileage": mileage,
                "transmission": trans, "seats": seats, "keys": keys, "tax": tax, "engine": engine
            };
            const url = 'http://localhost:5000/updateCarDetails';
            fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify(jsonData),
            })
                .then(response => response.json())
                //.then(data => console.log(data)) // will later be changed to actually store the received data
                .then(data => {
                    if (data) {
                        alert(data["Response"]);
                    }
                    setVin('');
                    setPrice('');
                    setExtColor('');
                    setIntColor('');
                    setWheelDrive('');
                    setMileage('');
                    setTrans('');
                    setSeats('');
                    setKeys('');
                    setTax('');
                    setEngine('');
                    setCarDetails([]);
                })
                .catch((error) => {
                    console.error('Response:', error);
                });

        } else {
            alert("Check your fields.");
        }
    }

    return (
        <div className="managerCarUpdate">
            {userId != undefined && <ManagerDealershipNavbarLogged userId={userId} />}


            <Container className='appointment-curr'>
                <Row className='appointment-type'><center><h3>Update Car Details</h3></center>
                </Row>
            </Container>
            <br></br>
            <Row className="profileRow">
                <Col></Col>
                <Col className="middleCol">

                    <div className="searchBarSale">
                        <Form onSubmit={handleVinLookup}>
                            {/* onSubmit={handleSearchSale} */}
                            <br/>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="inputGroup-sizing-default" >
                                    Input VIN Number:
                                </InputGroup.Text>
                                <Form.Control
                                    aria-label="Default"
                                    aria-describedby="inputGroup-sizing-default"
                                    value={vin_lookup}
                                    onChange={(e) => (setVinLookup(e.target.value))}
                                />
                            </InputGroup>
                            <Button variant="primary" type="submit" className="searchBarSale">
                                Search
                            </Button>
                        </Form>
                    </div>

                    <div>
                        {console.log("Car details: ", car_details)}
                        {car_details["results"] &&

                            <Form onSubmit={handleManagerUpdateCar}>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>PRICE </Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input PRICE" type="text"
                                        value={price}
                                        onChange={(event) => setPrice(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>EXTERIOR COLOR</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input EXTERIOR COLOR" type="text"
                                        value={ext_color}
                                        onChange={(event) => setExtColor(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>INTERIOR COLOR</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input INTERIOR COLOR" type="text"
                                        value={int_color}
                                        onChange={(event) => setIntColor(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>WHEEL DRIVE</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input WHEEL DRIVE" type="text"
                                        value={wheel_drive}
                                        onChange={(event) => setWheelDrive(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>MILEAGE</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input MILEAGE" type="text"
                                        value={mileage}
                                        onChange={(event) => setMileage(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>TRANSMISSION</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input TRANSMISSION" type="text"
                                        value={trans}
                                        onChange={(event) => setTrans(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>SEATS</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input SEATS" type="text"
                                        value={seats}
                                        onChange={(event) => setSeats(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>KEYS GIVEN</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input KEYS" type="text"
                                        value={keys}
                                        onChange={(event) => setKeys(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>TAX</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input TAX" type="text"
                                        value={tax}
                                        onChange={(event) => setTax(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Form.Label>ENGINE</Form.Label>
                                    <Form.Control className="inputBar" placeholder="Input ENGINE" type="text"
                                        value={engine}
                                        onChange={(event) => setEngine(event.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} className="textBar">
                                    <Button variant="primary" type="submit" className="updateButton">
                                        UPDATE
                                    </Button>
                                </Form.Group>
                                <br />
                            </Form>}
                    </div>

                </Col>

                <Col></Col>
            </Row>

        </div>
    )
}

export default ManagerUpdateCar;