import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import '../styles/SignNdRev.css'
// IDs for Form Inputs:
// digitalSignatureInput: ID for the digital signature input field

// IDs for Buttons:
// confirmContinueButton: ID for the "Confirm and Continue" button


function SignNdReV({
    fullName, routingNumber, accountNumber, ssn, 
    paymentOpt, income, downPayment, 
    apr, la, monthlypay, setProg
}) {
    const [digitalSignature, setDigitalSignature] = useState('');

    const handleContinue = () => {
        if (digitalSignature === fullName) {
            setProg(5); // Move to the next step or finalize the process
        } else {
            alert("Digital signature must match the full name provided.");
        }
    };


    const printContract = () => {
        window.print();
    };

    return (
        <Container className='contract-form'>
            <Row>
                <Col>
                    <Card className="contract-card">
                        <Card.Header as="h3">Contract Agreement</Card.Header>
                        <Card.Body>
                            <Card.Text as="div" className="contract-body">
                                <p className="contract-clause">
                                    This document certifies that I, <strong>{fullName}</strong>, SSN ending with the last four digits 
                                    <strong> {ssn.slice(-4)}</strong>, hereby agree to the terms outlined below associated with the 
                                    {paymentOpt === 'cash' ? " cash purchase" : " financing option"} of my new vehicle. The total amount 
                                    agreed upon is <strong>${paymentOpt === 'cash' ? la : monthlypay} {paymentOpt === 'cash' ? "" : "per month"}</strong>.
                                </p>
                                <p className="contract-clause">
                                    By signing below, I commit to fulfill the obligations set forth in this agreement, including but not limited to 
                                    adhering to payment schedules, maintaining insurance coverage as required, and complying with all local and federal 
                                    laws regarding vehicle ownership and use. This agreement is legally binding and is digitally signed upon submission. 
                                    Any modifications to this agreement must be made in writing and signed by all parties involved.
                                </p>
                                <p className="contract-clause">
                                    Failure to meet these obligations could result in legal consequences, including but not limited to repossession of the vehicle. 
                                    I have read and understand the terms of this agreement and certify my compliance by my digital signature below.
                                </p>
                            </Card.Text>
                            <div className="contract-details">
                                <p><strong>Full Name:</strong> {fullName}</p>
                                <p><strong>SSN:</strong> ****-****-{ssn.slice(-4)}</p>
                                <p><strong>Routing Number:</strong> {routingNumber}</p>
                                <p><strong>Account Number:</strong> {accountNumber}</p>
                                <p><strong>Payment Option:</strong> {paymentOpt}</p>
                                {paymentOpt === 'cash' ? (
                                    <>
                                        <p><strong>Total Amount:</strong> ${la}</p>
                                        <p>This is a cash purchase with no financing details required.</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Annual Income:</strong> ${income}</p>
                                        <p><strong>Down Payment:</strong> ${downPayment}</p>
                                        <p><strong>Loan Amount (LA):</strong> ${la}</p>
                                        <p><strong>Monthly Payment:</strong> ${monthlypay}</p>
                                        <p><strong>APR:</strong> {apr}%</p>
                                    </>
                                )}
                            </div>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3">Digital Signature:</Form.Label>
                                    <Col sm="9">
                                        <Form.Control
                                            id="digitalSignatureInput"
                                            type="text"
                                            placeholder="Type your full name as digital signature"
                                            value={digitalSignature}
                                            onChange={e => setDigitalSignature(e.target.value)}
                                        />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row style={{padding : '2rem'}}>
                <Col className='text-center'>
                    <Button variant="primary" onClick={handleContinue} disabled={digitalSignature !== fullName} id="confirmContinueButton">
                        Confirm and Continue
                    </Button>
                </Col><Col className='text-center'>
                    <Button variant="secondary" onClick={printContract} className="ml-2">
                        Print Contract
                    </Button>
                </Col>
            </Row>
        </Container>

    );
}

export default SignNdReV;
