import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../styles/PaymentProcess.css";
import {
  IoIosCheckboxOutline as Emptybox,
  IoIosCheckbox as Fullbox,
} from "react-icons/io";
import PaymentDetails from "../components/PaymentDetails";
import CashOrLoan from "../components/CashOrLoan";
import Finance from "../components/Finance";
import { useLocation, useNavigate } from "react-router-dom";
import FinanceResult from "../components/FinanceResult";
import Warrenty from "../components/Warrenty";
import DriverLicense from "../components/DriverLicense";
import SignNdReV from "../components/SignNdRev";

/*
carData.carDetail holds all car relevant values
{"engine":"V4, 5.0 Liter","exterior_color":"beige","interior_color":"white","keys_given":2,"make":"Jaguar","mileage":1664,"model":"E-Pace","price":"99712.98","seats":4,"tax":"3312.00","transmission":"mannual","vin":"WAULD64B03N739082","wheel_drive":"AWD","year":2018}

*/
function PaymentProcess() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const [fullName, setFullName] = useState("");
  const [bank, setBank] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ssn, setSsn] = useState("");
  const [paymentOpt, setPaymentOpt] = useState("none");
  const [income, setIncome] = useState("");
  const [step, setStep] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [apr, setAPR] = useState(0);
  const [la, setLA] = useState(0);
  const [bankAccountId, setBankAccountId] = useState("");
  const [monthlypay, setMonthPay] = useState(0);
  const [serviceOpt, setServiceOpt] = useState([]);

  const [saleLoan, setSaleLoan] = useState({ sale: "", loan: "" });

  const location = useLocation();
  const carData = location.state.data;
  const handleStepClick = (newStep) => {
    if (newStep <= step) {
      setStep(newStep);
    }
  };

  const createContract = async (userId) => {
    try {
      const response = await fetch("http://localhost:5000/createContract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id1: userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create contract");
      }
      console.log("Contract created:", data);
    } catch (error) {
      console.error("Error creating contract:", error);
    }
  };

  const renderProgressIcon = (index) => {
    const isActive = step >= index;
    const Icon = isActive ? Fullbox : Emptybox;
    return (
      <span
        onClick={() => handleStepClick(index - 1)}
        style={{
          cursor: isActive ? "pointer" : "default",
          color: isActive ? "green" : "grey",
        }}
      >
        <Icon className={isActive ? "prog-full" : "prog-empty"} />
      </span>
    );
  };

  useEffect(() => {
    const handleFinalizeSale = async () => {
      const commonBody = {
        user_id: userId,
        sales_id: null,
        price: la,
        financeOrCash: paymentOpt,
        vin: carData.carDetails.vin,
      };

      
      try {

        const markAsSoldResponse = await fetch("http://localhost:5000/markAsSold", {
          method: "POST",
          headers: { "Content-Type": "application/json" ,
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  
          },
          body: JSON.stringify({ vin: carData.carDetails.vin }),
        });
    
        if (!markAsSoldResponse.ok) {
          throw new Error("Failed to mark the car as sold");
        }

        const salesResponse = await fetch(
          "http://localhost:5000/add_sale_and_payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commonBody),
          }
        );

        if (!salesResponse.ok) {
          throw new Error("Failed to add sale and payment");
        }

        const salesData = await salesResponse.json();
        const salesId = salesData.sales_id;

        let loanId = null;

        if (paymentOpt === "loan") {
          const loanBody = {
            ssn: ssn,
            loan_amount: la,
            monthly_amount: monthlypay,
            initial_payment_amount: downPayment,
          };

          const loanResponse = await fetch(
            "http://localhost:5000/proxy_create_loan_and_payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(loanBody),
            }
          );

          if (!loanResponse.ok) {
            throw new Error("Failed to process the loan details");
          }

          const loanData = await loanResponse.json();
          loanId = loanData.loan_id;
        }

    // Add a car to the user's garage
    const garageResponse = await fetch(
      "http://localhost:5000/myGarageAddCar",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,

        },
        body: JSON.stringify({
          custID: userId,
          make: carData.carDetails.make,
          model: carData.carDetails.model,
          year: carData.carDetails.year,
          vin: carData.carDetails.vin,
        }),
      }
    );

    if (!garageResponse.ok) {
      const garageData = await garageResponse.json();
      throw new Error(garageData.message || "Failed to add car to garage");
    }


    
    await Promise.all(serviceOpt.map(async (option_id) => {
      const warrantyResponse = await fetch("http://localhost:5000/addCarWarranty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: carData.carDetails.vin,
          option_id: option_id
        }),
      });

      if (!warrantyResponse.ok) {
        const warrantyData = await warrantyResponse.json();
        throw new Error(warrantyData.message || "Failed to add warranty");
      }
    }));


        if (salesId && loanId) {
          const paymentLoanBody = {
            sales_id: salesId,
            loan_id: loanId,
          };

          const paymentLoanResponse = await fetch(
            "http://localhost:5000/add_payment_loan",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentLoanBody),
            }
          );

          if (!paymentLoanResponse.ok) {
            throw new Error("Failed to link payment and loan");
          }
        }

        //alert('Transaction processed successfully!');
        navigate("/"); // Navigate back if the operation is successful
      } catch (error) {
        console.error("Error during transaction:", error);
        alert(`Failed to finalize the transaction: ${error.message}`);
      }
    };

    if (step === 5) {
      createContract(userId);
      handleFinalizeSale();
    }
  }, [
    step,
    userId,
    paymentOpt,
    ssn,
    la,
    monthlypay,
    downPayment,
    carData.carDetails.vin,
  ]);

  const StepComponent = () => {
    switch (step) {
      case 0:
        return (
          <PaymentDetails
            setRoutingNumber={setRoutingNumber}
            setAccountNumber={setAccountNumber}
            setFullName={setFullName}
            setSSN={setSsn}
            setProg={setStep}
            setBank={setBank}
            setBankAccountId={setBankAccountId}
          />
        );
      case 1:
        return (
          <CashOrLoan
            setPaymentOpt={setPaymentOpt}
            setProg={setStep}
            setLA={setLA}
            carPrice={carData.carDetails.price}
          />
        );
      case 1.1:
        return (
          <Finance
            routingNumber={routingNumber}
            accountNumber={accountNumber}
            setMyIncome={setIncome}
            setLoanDownPayment={setDownPayment}
            setProg={setStep}
          />
        );
      case 1.2:
        return (
          <FinanceResult
            income={income}
            ssn={ssn}
            downpayment={downPayment}
            carPrice={carData.carDetails.price}
            setAPR={setAPR}
            setLA={setLA}
            setMonthPay={setMonthPay}
            setProg={setStep}
            paymentOpt={paymentOpt}
          />
        );
      case 2:
        return (
          <Warrenty
            setLA={setLA}
            la={la}
            setServiceOpt={setServiceOpt}
            serviceOpt={serviceOpt}
            monthlypay={monthlypay}
            setMonthPay={setMonthPay}
            carData={carData}
            setProg={setStep}
          />
        );
      case 3:
        return <DriverLicense setProg={setStep} />;
      case 4:
        return (
          <SignNdReV
            fullName={fullName}
            routingNumber={routingNumber}
            accountNumber={accountNumber}
            ssn={ssn}
            paymentOpt={paymentOpt}
            income={income}
            setProg={setStep}
            downPayment={downPayment}
            apr={apr}
            la={la}
            monthlypay={monthlypay}
          />
        );
      case 5:
        return <div>Processing your transaction...</div>;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (paymentOpt == "cash") {
      setLA(carData.carDetails.price);
    }
  }, [paymentOpt]);

  return (
    <Container fluid style={{ height: "100vh" }}>
      <link
        href="https://fonts.googleapis.com/css?family=Abel"
        rel="stylesheet"
      ></link>
      <Row>
        <Col className="payment-sidenav">
          <Container style={{ height: "100%" }}>
            <Row className="payment-sidenav-header">
              <Col>Purchase Process</Col>
            </Row>
            <Row className="payment-sidenav-sub">
              <Col>In Progress</Col>
            </Row>
            <Row className="payment-sidenav-opts">
              <Col>{renderProgressIcon(1)} Payment Details</Col>
            </Row>
            <Row className="payment-sidenav-opts">
              <Col>{renderProgressIcon(2)} Cash or Finance</Col>
            </Row>
            <Row className="payment-sidenav-opts">
              <Col>{renderProgressIcon(3)} Services and Warranties</Col>
            </Row>
            <Row className="payment-sidenav-opts">
              <Col>{renderProgressIcon(4)} Driver's License</Col>
            </Row>
            <Row className="payment-sidenav-opts">
              <Col>{renderProgressIcon(5)} Sign & Review</Col>

            </Row>
            <Row className="payment-page-exit">
              <Button variant="danger" onClick={() => navigate(-1)} size="sm">
                Exit Payment Page
              </Button>
            </Row>
          </Container>
        </Col>
        <Col className="payment-page">
          <StepComponent />
        </Col>
      </Row>
    </Container>
  );
}

export default PaymentProcess;
