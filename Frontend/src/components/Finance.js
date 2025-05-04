import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import '../styles/CashOrLoan.css';
import { IoCashOutline } from "react-icons/io5";
import { FaHandHoldingUsd } from "react-icons/fa";


// IDs for Form Inputs:
// inputBirthday: ID for the birthday date input
// inputIncome: ID for the annual income input
// inputDownPayment: ID for the down payment input

// ID for the Button:
// continueFinanceButton: ID for the continue button to proceed with the finance options


function Finance({ setProg, setMyIncome, setLoanDownPayment }) {
    const [bday, setBday] = useState('');
    const [income, setIncome] = useState('');
    const [downpayment, setDownpayment] = useState('');

    const handleContinue = () => {
        if (!bday) {
            alert("Please enter your birthday.");
            return;
        }
        if (!income) {
            alert('Please enter your income');
            return;
        }

        const birthDate = new Date(bday);
        const currentDate = new Date();
        let diff = currentDate.getFullYear() - birthDate.getFullYear();
        const m = currentDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
            diff--;
        }

        if (diff < 18) {
            alert("You must be at least 18 years old.");
            return;
        }
        if (downpayment > 5000){
            alert("cannot have downpayment greater than $5000 ")
            return;
        }
        setMyIncome(income);
        setLoanDownPayment(downpayment);
        // Proceed with the next step if age check passes
        setProg(1.2);
    };

    return (
        <Container className='finance-page'>
            <Row><Col style={{textAlign: 'center'}}><h4><b>Personal Details For Finance</b></h4></Col></Row>
            <Row><Col style={{color:'darkslategray', fontSize:"0.75rem",textAlign: 'center'}}>this information will be used to purchase and register your car</Col></Row>
            <Row>
                <Container className='finance-personal-details'>
                    <Row><Col style={{textAlign: 'center', fontSize : '1.25rem', paddingTop: '1vh'}}>Verify Your Info</Col></Row>
                </Container>
            </Row>
            <br/>
            <Row><Col style={{textAlign: 'center'}}><h6>Additional Required Info</h6></Col></Row>
            <Row>
            <Container><Row>
                <Form>
                    <Col md='auto'>
                        <Form.Label>My Birthday</Form.Label>
                        <Form.Control
                            id="inputBirthday" // ID for the birthday input
                            type='date'
                            value={bday}
                            onChange={e => setBday(e.target.value)}
                        />
                    </Col>
                    <Col md='auto'>
                        <Form.Label>My Annual Income</Form.Label>
                        <Form.Control
                            id="inputIncome" // ID for the income input
                            type='number'
                            placeholder='$'
                            value={income}
                            onChange={e => setIncome(e.target.value)}
                        />
                    </Col>
                    <Col md='auto'>
                        <Form.Label>Down Payment</Form.Label>
                        <Form.Control
                            id="inputDownPayment" // ID for the down payment input
                            type='number'
                            placeholder='$'
                            value={downpayment}
                            onChange={e => setDownpayment(e.target.value)}
                        />
                    </Col>
                </Form>
            </Row></Container>

            </Row>
            <Row style={{textAlign: 'center'}}>
                <Col md='auto' style={{paddingTop: '2vh', textAlign: 'center'}}>
                <Button variant='success' id="continueFinanceButton" onClick={handleContinue}>Continue</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Finance;