import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import '../styles/Warrenty.css'


// IDs for Buttons in WarrantyCard:
// addWarranty-1, addWarranty-2, addWarranty-3, addWarranty-4: IDs for the "Add" buttons on each warranty card
// removeWarranty-1, removeWarranty-2, removeWarranty-3, removeWarranty-4: IDs for the "Remove" buttons on each warranty card

// ID for the Button in Warrenty Component:
// continueWarrentyButton: ID for the "Continue" button to proceed with the warranty choices



function WarrantyCard({ years, tempLst, setTempLst,title, description, price, setWprice, wPrice , myID}) {
    const [added, setAdded] = useState(false);  // State to track if warranty is added

    const handleAdd = () => {
        setWprice(wPrice + price);
        setAdded(true);  // Set added to true when added
        setTempLst([...tempLst, myID])
    }

    const handleRemove = () => {
        setWprice(wPrice - price);
        setAdded(false);  // Set added to false when removed
        setTempLst(tempLst.filter(id => id !== myID));
    }

    return (
        <Card>
            <Card.Header>Extended Warranty: {years} Years</Card.Header>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Subtitle>${price}</Card.Subtitle>
                <Card.Text>{description}</Card.Text>
                <Row>
                    <Col>
                        {added ? (
                            <Button variant="danger" onClick={handleRemove} id={`removeWarranty-${myID}`}>Remove</Button>
                        ) : (
                            <Button variant="success" onClick={handleAdd} id={`addWarranty-${myID}`}>Add</Button>
                        )}
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}




function Warrenty({setProg, setServiceOpt , serviceOpt, TotalPrice, setLA,setMonthPay, carData, la, monthlypay}) {
const [wPrice, setWprice] = useState(0)
const [tempLst, setTempLst] = useState([]);


  const handleContinue = () => {
    setLA(String(Number(la) + wPrice));
    setServiceOpt(tempLst);
    setProg(3);
  }

  return (
    <Container className='warranty-container'>
    <Row className='warranty-row'>
        <Col style={{textAlign: 'center'}}>
            <h5>Added Extended Warranties</h5>
        </Col>
    </Row>
    <Row className='warranty-row'>
            <Col>
            <Card className='warranty-card'>
            <WarrantyCard
             wPrice={wPrice}
             myID='1'
             setWprice={setWprice}
             tempLst={tempLst}
             setTempLst={setTempLst}
             years={'3'}
             title={'Standard Oil Change Warranty'} 
             price={500}
             description={'This warranty covers the full cost of a standard oil change, ensuring your vehicle operates smoothly and efficiently.'} />
            </Card>
            </Col>
        </Row>
        <Row className='payment-details-warranty' >
            <Col>
            <Card className='warranty-card'>
            <WarrantyCard
            wPrice={wPrice}
            setWprice={setWprice}
            myID='2'
             years={'3'}
             tempLst={tempLst}
             setTempLst={setTempLst}
             title={'Standard Tire Rotation Warranty'} 
             price={200}
             description={'This warranty covers the full cost of a standard oil change, ensuring your vehicle operates smoothly and efficiently.'} />
            </Card>
            </Col>
        </Row>
        <Row className='payment-details-warranty' >
            <Col>
            <Card className='warranty-card'>
            <WarrantyCard
            wPrice={wPrice}
            setWprice={setWprice}
             years={'5'}
             myID='3'
             tempLst={tempLst}
             setTempLst={setTempLst}
             title={'Brake Inspection'} 
             price={1000}
             description={'This warranty covers the full cost of a standard oil change, ensuring your vehicle operates smoothly and efficiently.'} />
            </Card>
            </Col>
        </Row>
        <Row className='payment-details-warranty' >
            <Col>
            <Card className='warranty-card'>
            <WarrantyCard
            wPrice={wPrice}
            setWprice={setWprice}
             years={'10'}
             myID='4'
             tempLst={tempLst}
             setTempLst={setTempLst}
             title={'Engine Tune-up Warranty'} 
             price={500}
             description={'This warranty covers the full cost of a standard oil change, ensuring your vehicle operates smoothly and efficiently.'} />
            </Card>
            </Col>
        </Row>
        <Row className='warranty-row'>
                <Col className='warranty-summary-text'>Added Warranty Price: </Col>
                <Col className='warranty-summary-value'>{wPrice}</Col>
            </Row>
            <Row className='warranty-row'>
                <Col className='warranty-summary-text'>Total Price: </Col>
                <Col className='warranty-summary-value'>{Number(la) + wPrice}</Col>
            </Row>
            <Row className='warranty-row'>
                <Col className='warranty-summary-text'>Services ID: </Col>
                <Col className='warranty-summary-value'>{tempLst.join(', ')}</Col>
            </Row>
            <Row className='warranty-row'>
                <Col style={{textAlign: 'center'}}>
                    <Button className='warranty-continue-button' onClick={handleContinue} id="continueWarrentyButton">Continue</Button>
                </Col>
            </Row>
        </Container>
  );
}

export default Warrenty;
