import { React, useState, useEffect } from 'react';
import '../styles/AppointmentsPage.css'
import { Card, Button, Container, Row, Col, CardTitle, CardBody, CardText, Form, FormLabel } from 'react-bootstrap'
import { useParams } from 'react-router-dom';
import DealershipNavbarLogged from '../components/DealershipNavbarLogged';
import carimage from '../images/image.png';
import { IoMdTime, IoMdListBox,IoIosPricetags, } from "react-icons/io";
import { FaBuilding, FaCar, FaCalendarAlt, FaTools} from "react-icons/fa";


const AppointmentsPage = () => {
    //obtain user id
    const user_id = localStorage.getItem('user_id');
    const [currappts, setCurrappts] = useState([]);
    const [histappts, setHistappts] = useState([]);
    const [currtest, setCurrtest] = useState([]);
    const [pasttest, setPasttest] = useState([]);

    useEffect(() => {
        const jsonData2 = { "userID": user_id }
        const url2 = 'http://localhost:5000/currentappointments';
        fetch(url2, {
            method: "POST",
            
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData2),
        })
            .then(response => response.json())
            //.then(data => console.log(data)) // will later be changed to actually store the received data
            .then(data => {
                if (data) {
                    setCurrappts(data);
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    },[]);

    useEffect(() => {
        const jsonData2 = { "userID": user_id }
        const url2 = 'http://localhost:5000/historyappointments';
        fetch(url2, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData2),
        })
            .then(response => response.json())
            //.then(data => console.log(data)) // will later be changed to actually store the received data
            .then(data => {
                if (data) {
                    setHistappts(data);
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    },[]);

    useEffect(() => {
        const jsonData2 = { "userID": user_id }
        const url2 = 'http://localhost:5000/currtestdrive';
        fetch(url2, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData2),
        })
            .then(response => response.json())
            //.then(data => console.log(data)) // will later be changed to actually store the received data
            .then(data => {
                if (data) {
                    setCurrtest(data);
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    },[]);

    useEffect(() => {
        const jsonData2 = { "userID": user_id }
        const url2 = 'http://localhost:5000/pasttestdrive';
        fetch(url2, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData2),
        })
            .then(response => response.json())
            //.then(data => console.log(data)) // will later be changed to actually store the received data
            .then(data => {
                if (data) {
                    setPasttest(data);
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    },[]);


    console.log("User id is: ", user_id);

    return (
        <div>
            <DealershipNavbarLogged userId={user_id}/>
            <Container fluid className='appointment-page'>
                <Row  className='appointment-type'><center><h5>Service Appointments</h5></center>
                </Row>
                <Row>
                    <Col>
                    <Container className='appointment-curr'>
                <Row><Col className='appointment-curr-label'>My Upcoming Appointment</Col></Row>
                {currappts['appointments'] != '' && currappts['appointments']?
                <Row className='appointment-curr-header'>
                <Col xs={3}><IoMdTime/> Schd date</Col>
                <Col><IoMdListBox/> Appointment</Col>
                <Col><FaTools/> Service</Col>
                <Col><IoIosPricetags/> Price</Col>
                <Col>Status</Col>
                <Col><FaBuilding/> Make</Col>
                <Col><FaCar/> Model</Col>
                <Col><FaCalendarAlt/> Year</Col>
                </Row>
                 : null}
            {currappts['appointments'] != ''  && currappts['appointments']?
                (currappts['appointments'].map((data) => (
                    <Row key={data.appt_id} className='appointment-curr-info'>
                    <Col xs={3}>{data.scheduled_date}</Col>
                    <Col>{data.appointment}</Col>
                    <Col>{data.description}</Col>
                    <Col>{data.price}</Col>
                    <Col>{data.ticket}</Col>
                    <Col>{data.make}</Col>
                    <Col>{data.model}</Col>
                    <Col>{data.year}</Col>
                </Row>)) ) : <Row><Col>No Upcoming appointments</Col></Row>}
             </Container>

             <Container className='appointment-curr'>
                <Row><Col className='appointment-curr-label'>My Past Appointment</Col></Row>
                {histappts['appointments'] != ''  && histappts['appointments']?
                <Row className='appointment-curr-header'>
                <Col xs={3}><IoMdTime/> Schd date</Col>
                <Col><IoMdListBox/> Appointment</Col>
                <Col><FaTools/> Service</Col>
                <Col><IoIosPricetags/> Price</Col>
                <Col>Status</Col>
                <Col><FaBuilding/> Make</Col>
                <Col><FaCar/> Model</Col>
                <Col><FaCalendarAlt/> Year</Col>
                </Row>
                 : null}
            {histappts['appointments'] != ''  && histappts['appointments']?
                (histappts['appointments'].map((data) => (
                    <Row key={data.appt_id} className='appointment-curr-info'>
                    <Col xs={3}>{data.scheduled_date}</Col>
                    <Col>{data.appointment}</Col>
                    <Col>{data.description}</Col>
                    <Col>{data.price}</Col>
                    <Col>{data.status}</Col>
                    <Col>{data.make}</Col>
                    <Col>{data.model}</Col>
                    <Col>{data.year}</Col>
                </Row>)) ) : <Row><Col>No Past appointments</Col></Row>}
             </Container>
                    </Col>
                </Row>

                <Row className='appointment-type'><center><h5>Test Drive Appointments</h5></center>
                </Row>
                <Row>
                    <Col>
                    <Container className='appointment-curr'>
                <Row><Col className='appointment-curr-label'>My Upcoming Appointment</Col></Row>
                {currtest['appointments'] != '' && currtest['appointments'] ?
                <Row className='appointment-curr-header'>
                <Col xs={3}><IoMdTime/> Schd date</Col>
                <Col>Status</Col>
                </Row>
                 : null}
            {currtest['appointments']!= ''  && currtest['appointments']?
                (currtest['appointments'].map((data) => (
                    <Row key={data.appt_id} className='appointment-curr-info'>
                    <Col xs={3}>{data.scheduled_date}</Col>

                    <Col>{data.status}</Col>

                </Row>)) ) : <Row><Col>No Upcoming appointments</Col></Row>}
             </Container>

             <Container className='appointment-curr'>
                <Row><Col className='appointment-curr-label'>My Past Appointment</Col></Row>
                {histappts['appointments']!= ''  && histappts['appointments']?
                <Row className='appointment-curr-header'>
                <Col xs={3}><IoMdTime/> Schd date</Col>
                <Col>Status</Col>
                </Row>
                 : null}
            {pasttest['appointments'] != ''  && pasttest['appointments']?
                (pasttest['appointments'].map((data) => (
                    <Row key={data.appt_id} className='appointment-curr-info'>
                    <Col xs={3}>{data.scheduled_date}</Col>

                    <Col>{data.status}</Col>

                </Row>)) ) : <Row><Col>No Upcoming appointments</Col></Row>}
             </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default AppointmentsPage;