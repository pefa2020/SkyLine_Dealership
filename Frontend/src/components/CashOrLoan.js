import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import '../styles/CashOrLoan.css';
import { IoCashOutline } from "react-icons/io5";
import { FaHandHoldingUsd } from "react-icons/fa";

/* 
cashPaymentOption: ID for the radio button to select the cash payment method.
loanPaymentOption: ID for the radio button to select the loan (finance) payment method.
continueButton: ID for the button used to proceed after selecting a payment method.
*/


function CashOrLoan({ setPaymentOpt, setProg, setLA, carPrice }) {
    const [payOpt, setPayOpt] = useState('none');

    const handleOptionChange = (option) => {
        setPayOpt(option);
    }

    const handleContinue = () => {
        if (payOpt !== 'none') {
            setPaymentOpt(payOpt);
        } else {
            alert('Please choose your payment option!');
        }
        if (payOpt === 'cash')
        {setLA(Math.ceil(carPrice))
        setProg(2);}
        else if (payOpt === 'loan')
        setProg(1.1);
    }

    return (
        <Container className='payment-Cash-Loan'>
            <Row>
                <Col><center><h5>Cash Or Finance</h5></center></Col>
            </Row>
            <Row>
                <Col><center>How would you like to pay for your car? You may choose to pay in cash or through our finance option.</center></Col>
            </Row>
            <Form className='payment-cl-content'>
                <Container>
                    <Row className='payment-cl-holder'>
                        <Col>
                            <Card className={`cash-opt ${payOpt === 'cash' ? 'selected' : ''}`} onClick={() => handleOptionChange('cash')}>
                                <Container>
                                    <Row className='payment-opt-title'>
                                        <Col className='payment-opt-selector'>
                                        <Form.Check
                                            type='radio'
                                            name='cashorloan'
                                            id="cashPaymentOption" // ID for the cash payment radio button
                                            onChange={() => handleOptionChange('cash')}
                                            checked={payOpt === 'cash'}
                                        />
                                        </Col>
                                        <Col>Cash</Col>
                                    </Row>
                                    <Row className='payment-opt-logo'>
                                        <Col style={{ textAlign: 'center' }}>
                                            <IoCashOutline className='payment-opt-cash' />
                                        </Col>
                                    </Row>
                                    <Row className='payment-opt-text'>
                                        <Col>
                                            <p>Plan to pay for the car using the funds from my bank account.</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                        </Col>
                        <Col>
                            <Card className={`loan-opt ${payOpt === 'loan' ? 'selected' : ''}`} onClick={() => handleOptionChange('loan')}>
                                <Container>
                                    <Row className='payment-opt-title'>
                                        <Col className='payment-opt-selector'>
                                        <Form.Check
                                            type='radio'
                                            name='cashorloan'
                                            id="loanPaymentOption" // ID for the finance payment radio button
                                            onChange={() => handleOptionChange('loan')}
                                            checked={payOpt === 'loan'}
                                        />
                                        </Col>
                                        <Col>Finance</Col>
                                    </Row>
                                    <Row className='payment-opt-logo'>
                                        <Col style={{ textAlign: 'center' }}>
                                            <FaHandHoldingUsd className='payment-opt-finance' />
                                        </Col>
                                    </Row>
                                    <Row className='payment-opt-text'>
                                        <Col>
                                            <p>Get your terms in a few minutes. You choose the down payment and monthly payments. Get a custom deal from the comfort of your house.</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='payment-cl-button'>
                        <Button variant='success' id="continueButton" onClick={handleContinue}>Continue</Button>
                        </Col>
                    </Row>
                </Container>
            </Form>
        </Container>
    );
}

export default CashOrLoan;
