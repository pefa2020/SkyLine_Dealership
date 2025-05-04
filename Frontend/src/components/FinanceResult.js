import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../styles/CashOrLoan.css';
import '../styles/FinanceResult.css';
import { useNavigate } from 'react-router-dom';

// IDs for Buttons:
// cancelLoanButton: ID for the button to cancel the loan process
// continueLoanButton: ID for the button to continue with the loan process after approval


function Unqualified({ }) {
    return (
        <Container className="loan-qualification-container">
            <Row className="header">
                <Col><h1>Finance With Us</h1></Col>
            </Row>
            <Row>
                <p>Your terms are calculated based on your credit history, income and price of this vehicle.</p>
            </Row>
            <div className="status">
                <h2>Not Qualified for the Loan</h2>
                <div className="details">
                    <p>Contact a Manager for more details. Possible reasons for your loan decline include:</p>
                    <ul>
                        <li>Denied Loan due to insufficient credit score or income</li>
                        <li>Insufficient gross income for loan</li>
                        <li>Credit History</li>
                    </ul>
                </div>
            </div>
            <div className="actions"></div>
        </Container>
    );
}


function Qualified({ carPrice, apr, monthly, loanAmount, downpayment, loanDuration }) {
  return (
    <Container className='loan-qualification-container qualified-container'>
      <Row className="qualified-header">
        <Col><h1>Finance with Us</h1></Col>
      </Row>
      <Row className="qualified-intro">
        <p>Your terms are calculated based on your credit history, income, and price of this vehicle.</p>
      </Row>
      <Row className="qualified-details">
        <Container>
          <Row className="qualified-status">
            <Col>You are qualified</Col>
          </Row>
          <Row className="qualified-financials">
            <Col>Car Price: ${carPrice.toLocaleString()}</Col>
          </Row><Row className='qualified-financials'>
            <Col>Remaining Loan Amount: ${loanAmount.toLocaleString()}</Col>
          </Row>
          <Row className="qualified-financials">
            <Col>Down Payment: ${downpayment.toLocaleString()}</Col>
          </Row>
          <Row className="qualified-financials">
            <Col>APR: {apr}%</Col>
            <Col>Monthly Payment: ${monthly.toLocaleString()}</Col>
            <Col>Loan Duration: {loanDuration} months</Col>
          </Row>
        </Container>
      </Row>
    </Container>
  );
}



function FinanceResult({ carPrice, income, ssn, downpayment, setAPR, setLA, setMonthPay, setProg }) {
    const [creditScore, setCreditScore] = useState(null);
    const [apr, setApr] = useState(0);
    const [loanAmount, setLoanAmount] = useState(0);

    const [monthly, setMonthly] = useState(0);
    const loanDuration = 60;
    const navigate = useNavigate();


    useEffect(() => {
        const fetchCreditScore = async () => {
            const response = await fetch('http://localhost:5000/proxy_check_credit_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ssn })
            });

            const data = await response.json();
            if (response.ok) {
                setCreditScore(data.credit_score); // Adjust this based on how credit score is actually returned
                console.log('Credit Score:', data.credit_score); // Logging the credit score
                if(data.credit_score >= 760){
                  setApr(4);
                }
                else if (data.credit_score  < 760 && data.credit_score  >= 700){
                  setApr(4.5);
                }
                else if (data.credit_score  < 700 && data.credit_score  >= 600){
                  setApr(5);
                }
                else if (data.credit_score  < 600 && data.credit_score  >=500){
                  setApr(7);
                }
                else if (data.credit_score  < 500 && data.credit_score  >= 400){
                  setApr(10);
                }
                else {
                  setApr(14);
                }
                console.log(apr);



            } else {
                console.error('Failed to fetch credit score:', data.error);
            }

        };

        if (ssn) {
            fetchCreditScore();
        }
    }, [ssn]);
    useEffect(() => {
      setLoanAmount(Math.ceil((carPrice - downpayment)*(1+(apr/100))));
    },[apr])
    useEffect(() => {
      setMonthly(Math.ceil(loanAmount / loanDuration));
    },[loanAmount])

    const StepComponent = () => {
        if (carPrice > income * 0.1 || apr > 10 ) {
            return <Unqualified creditScore={creditScore} />;
        } else {
            // This else block can be adjusted or expanded depending on what should happen if qualified
            return <Qualified carPrice={carPrice} downpayment={downpayment} apr={apr} monthly={monthly} loanAmount={loanAmount} loanDuration={loanDuration} />; // Placeholder output
        }
    };


    const handleContinue = () => {
      setAPR(apr);
      setLA(loanAmount);
      setMonthPay(monthly);
      setProg(2);
    }

    return (
        <Container className='finance-page'>
            <StepComponent />
            <Row>
              <Col>
              <Button variant="secondary" id="cancelLoanButton" onClick={() => navigate(-1)}>
                  Cancel Loan
              </Button>
              </Col>
              <Col>
              <Button onClick={handleContinue} variant='success' id="continueLoanButton">
                Continue
            </Button>
              </Col>
            </Row>
        </Container>
    );
}

export default FinanceResult;
