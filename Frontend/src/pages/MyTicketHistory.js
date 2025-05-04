import { React, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/TechnicianAvailable.css'
import { Container, Row, Col, Button} from 'react-bootstrap'
import CompleteTicket from '../components/CompleteTicket';
import DealershipNavbarLogged from '../components/DealershipNavbarLogged';


const MyTicketsHistory = () => {

    const url3 = 'http://localhost:5000/closedTechTickets';
    const userId = localStorage.getItem("user_id")
    const [mytickets, setMytickets] = useState([]);
    

    useEffect(() => {
        const jsonData = { 'tech_id': userId};
        fetch(url3,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        //.then(data => console.log(data)) // will later be changed to actually store the received data
        .then(data => {
            if (data) {
                setMytickets(data);
                console.log(data);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    },[]);

    return (
        <div className="available">
            <DealershipNavbarLogged/>
            <Container>
                <Row>
                    <Col style={{paddingTop: "2vh"}}>
                    <h5>Ticket History</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
            {mytickets["closedTechTickets"]? mytickets["closedTechTickets"].map((data) => (<CompleteTicket key={data[0]} data={data} />)): "No Ticket History"}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default MyTicketsHistory;