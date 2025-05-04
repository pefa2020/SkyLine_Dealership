import React, { useState, useEffect, useRef } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.css";
import "../styles/Login.css";
import carLogin from "../images/login_car.jpg";
import backButton from "../images/backButton.jpg";
import logo from "../images/logo.jpg";
import { Link } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Alert from 'react-bootstrap/Alert';

import Carousel from 'react-bootstrap/Carousel';
import landingTwo from "../images/landing2.jpg";
import landingThree from "../images/landing3.jpg";
import landingFour from "../images/landing4.jpg";

const login = (data) => {
  localStorage.setItem('user_id', data["user_id"]);
  localStorage.setItem('job_title', data["job_title"]);
  localStorage.setItem('access_token', data["access_token"]);

}


function Login() {
  const location = useLocation();
  const previousUrl = location.state?.previousUrl || "/";
  console.log(previousUrl);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const resetHelperForm = useRef();
  const navigage = useNavigate();


  const [show, setShow] = useState(true);
  const [my_bool, setMyBool] = useState(false);


  const handleLoginSubmit = (event) => {
    event.preventDefault();
    console.log("Data to be sent to endpoint: ");
    console.log("Username: ", username);
    console.log("Password: ", password);



    const regex_username = /^[a-zA-Z0-9]{0,10}$/;

    if (regex_username.test(username) && password != "") {
      const jsonData = { username: username, password: password };
      const url = "http://localhost:5000/authenticate";
      fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      })
        .then((response) => response.json())
        //.then(data => console.log(data)) // will later be changed to actually store the received data
        .then((data) => {
          if (data) {
            console.log(data);
            // alert(data["message"]);

            if (data["message"] == "Authentication successful") {
              const user_id = data["user_id"];
              const job_title = data["job_title"];
              const access_token = data["access_token"];
              //STORES TOKEN AND JOB TITLE IN SESSION STORAGE 
              login(data);
              // console.log("User id received is: ", user_id);
              // Ideally they should be redirected to the landing page
              navigate("/")
            } else {
              setMyBool(true);
            }
            // Route the user to a different page
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      // Consider Job as well
      setUsername("");
      setPassword("");
    } else {
      alert("Check your fields.");
    }
    setPassword("");
    setUsername("");
  };

  const navigate = useNavigate();

  return (
    <Row className="rowOne">
      <Col md="auto" className="rowOneColOne">
        {/* Car Image
        <img className="carLogin" src={carLogin} /> */}
        <Carousel>

          <Carousel.Item>
            {/* <ExampleCarouselImage text="Third slide" /> */}
            <img className="carLogin" src={landingThree} />
            <Carousel.Caption>
              <h3>Drive without Limits</h3>
              <p>
                Schedule a test drive at your earliest convenience.
              </p>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            {/* <ExampleCarouselImage text="First slide" /> */}
            <img className="carLogin" src={carLogin} />
            <Carousel.Caption>
              <h3>Own the Drive</h3>
              <p>Check out our latest models today.</p>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            {/* <ExampleCarouselImage text="Third slide" /> */}
            <img className="carLogin" src={landingFour} />
            <Carousel.Caption>
              <h3>Enjoy the Ride</h3>
              <p>
                The future of driving is here.
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>


      </Col>

      <Col md="auto" className="rowOneColTwo">
        <Row className="subRowOne">
          <button
            href="App"
            className="backButton"
            onClick={() => navigate(-1)}
          >
            <MdArrowBack />
          </button>
        </Row>
        <Row className="subRowTwo">
          <div className="divSubRowTwo">
            <img className="logo" src={logo} />
          </div>
        </Row>
        <Row className="subRowThree">
          {/* <div className="message" >{message}</div> */}

          {my_bool == true &&
            <Alert variant="danger"
              onClose={(event) => { setShow(false); setMyBool(false) }}
              style={{ marginLeft: '90px', marginRight: '10px', height: '15%', width: '75%' }}
              dismissible>{/* onClose={() => {setShow(false)}} */}
              <Alert.Heading>Error.</Alert.Heading>
              <p>
                Invalid credentials.
              </p>
            </Alert>}

          <Form onSubmit={handleLoginSubmit}>
            <Form.Group as={Col} className="textBar">
              <Form.Control
                className="inputBar"
                placeholder="USERNAME"
                value={username}
                id="usernameInputLogin"
                onChange={(event) => setUsername(event.target.value)}
                pattern="^[a-zA-Z0-9]{0,10}$"
                required
              />
            </Form.Group>

            <Form.Group as={Col} className="textBar">
              <Form.Control
                className="inputBar"
                placeholder="PASSWORD"
                type="password"
                value={password}
                id="passwordInputLogin"
                onChange={(event) => setPassword(event.target.value)}
                pattern="^.+$"
                required
              />
            </Form.Group>

            <Form.Group as={Col} className="textBar">
              <p>
                Don't have an account? <Link to="/SignUp">Sign Up</Link>
              </p>
              <Button
                variant="primary"
                type="submit"
                className="login"
                id="LoginPageButton"
              >
                LOGIN
              </Button>
            </Form.Group>
          </Form>
        </Row>
      </Col>
    </Row>
  );
}

export default Login;
