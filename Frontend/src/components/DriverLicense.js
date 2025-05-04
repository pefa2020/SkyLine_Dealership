import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

// IDs for Form Inputs:
// inputDriverLicense: ID for the driver's license number input field

// IDs for Buttons:
// continueLicenseCheckButton: ID for the "Continue" button to proceed with license verification


function DriverLicense({ setProg }) {
    const [lisNum, setLisNum] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setLisNum(e.target.value);
        setError('');  // Clear error messages when user types
    };

    const handleContinue = () => {
        if (testLicense(lisNum)) {
            setProg(4);
        } else {
            setError('Invalid license number. Please check and try again.');
        }
    };

    function testLicense(input) {
      // Pattern 1: A letter followed by 4 digits, a space, 5 digits, a space, and 5 more digits
      const pattern1 = /^[a-zA-Z]\d{4} \d{5} \d{5}$/;
      // Pattern 2: A letter followed by 14 digits
      const pattern2 = /^[a-zA-Z]\d{14}$/;
  
      // Check if the input matches either of the two patterns
      return pattern1.test(input) || pattern2.test(input);
    }

    return (
        <Container className='payment-details'>
            <Row>
                <Col style={{marginTop: '2vh'}}>
                    <Card>
                        <Card.Header>Driver's License Verification</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Enter your driving license number:</Form.Label>
                                    <Form.Control 
                                        id="inputDriverLicense"  // Unique ID for the driver's license input field
                                        value={lisNum} 
                                        onChange={handleInputChange} 
                                        isInvalid={!!error}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {error}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <br/>
                                <Button onClick={handleContinue} id="continueLicenseCheckButton">Continue</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default DriverLicense;
