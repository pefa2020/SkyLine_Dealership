import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

// ID List for Form Controls:
// inputFullName: ID for the input field where the full name is entered
// inputRoutingNumber: ID for the input field where the routing number is entered
// inputAccountNumber: ID for the input field where the account number is entered
// inputSSN: ID for the input field where the SSN is entered
// selectBank: ID for the dropdown select where the bank is chosen

// ID for the Continue Button:
// buttonContinue: ID for the button to continue with the form submission

function PaymentDetails({
  setFullName,
  setRoutingNumber,
  setAccountNumber,
  setSSN,
  setProg,
  setBank,
  setBankAccountId,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    routingNumber: "",
    accountNumber: "",
    ssn: "",
    bank: "",
  });

  const userId = localStorage.getItem("user_id");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "ssn") {
      let formattedValue = value.replace(/\D/g, "");
      formattedValue =
        formattedValue.substring(0, 3) +
        (formattedValue.length > 3 ? "-" : "") +
        formattedValue.substring(3, 5) +
        (formattedValue.length > 5 ? "-" : "") +
        formattedValue.substring(5, 9);
      setFormData((prevState) => ({
        ...prevState,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleContinue = () => {
    const nameRule = /^[a-zA-Z ]{2,40}$/;
    const routingNumberRule = /^[0-9]{9}$/;
    const accountNumberRule = /^[0-9]{6}$/;
    const ssnRule = /^\d{3}-\d{2}-\d{4}$/;

    if (
      !nameRule.test(formData.fullName) ||
      !routingNumberRule.test(formData.routingNumber) ||
      !accountNumberRule.test(formData.accountNumber) ||
      !ssnRule.test(formData.ssn)
    ) {
      alert("Please make sure all fields are correctly filled and formatted.");
      return;
    }

    // First, verify or add the SSN
    const ssnUrl = "http://localhost:5000/verify_or_add_ssn";
    fetch(ssnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        ssn: formData.ssn,
      }),
    })
      .then((response) => response.json())
      .then((ssnData) => {
        if (!ssnData.valid) {
          throw new Error("SSN verification failed or SSN mismatch.");
        }
        // If SSN verification/addition is successful, proceed to add bank account details
        const bankAccountUrl = "http://localhost:5000/proxy_add_bank_account";
        return fetch(bankAccountUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.fullName,
            routing_number: formData.routingNumber,
            account_number: formData.accountNumber,
            ssn: formData.ssn,
            bank: formData.bank,
          }),
        });
      })
      .then((bankResponse) => {
        if (!bankResponse.ok) {
          console.log(bankResponse);
          throw new Error("Failed to add bank account details.");
        }
        return bankResponse.json();
      })
      .then((data) => {
        if (data.result) {
          setFullName(formData.fullName);
          setRoutingNumber(formData.routingNumber);
          setAccountNumber(formData.accountNumber);
          setSSN(formData.ssn);
          setBank(formData.bank);
          setProg(1); // Assuming this progresses to the next step or component
          //alert("Bank account successfully added and SSN verified.");
        } else {
          throw new Error("An error occurred while adding bank details.");
        }
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  };

  return (
    <Container className="payment-details">
      <Row className="payment-details-content">
        <Col>
          <Container>
            <Row>
              <Col
                style={{
                  fontSize: "large",
                  padding: "2vh",
                  paddingBottom: "10vh",
                  textAlign: "center",
                }}
              >
                Payment Details
              </Col>
            </Row>
            <Row>
              <Col>
                <Form>
                  <Form.Group>
                    <Form.Label htmlFor="inputFullName">Full Name</Form.Label>
                    <Form.Control
                      id="inputFullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full name"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label htmlFor="inputRoutingNumber">
                      Routing Number
                    </Form.Label>
                    <Form.Control
                      id="inputRoutingNumber"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      placeholder="Routing number"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label htmlFor="inputAccountNumber">
                      Account Number
                    </Form.Label>
                    <Form.Control
                      id="inputAccountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Account number"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label htmlFor="inputSSN">SSN</Form.Label>
                    <Form.Control
                      id="inputSSN"
                      name="ssn"
                      value={formData.ssn}
                      onChange={handleInputChange}
                      maxLength="11"
                      placeholder="123-45-6789"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label htmlFor="selectBank">
                      Banks that we work with
                    </Form.Label>
                    <Form.Select
                      id="selectBank"
                      name="bank"
                      value={formData.bank}
                      onChange={handleInputChange}
                    >
                      <option value="">--select--</option>
                      <option value="Bank of America">Bank of America</option>
                      <option value="Wells Fargo">Wells Fargo</option>
                      <option value="Citi Group">Citi Group</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </Col>
            </Row>
            <Row className="payment-continue-button">
              <Col>
                <Button
                  variant="success"
                  onClick={handleContinue}
                  id="continueButton"
                >
                  Continue
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default PaymentDetails;
