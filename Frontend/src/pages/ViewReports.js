import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavBar";
import ManagerDealershipNavbarLogged from '../components/ManagerDealershipNavbarLogged'
import {
  Button,
  Form,
  Table,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";

function ViewReports() {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2017 },
    (_, i) => currentYear - i
  );

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const fetchMonthPayments = async () => {
    try {
      const response = await fetch("http://localhost:5000/monthPayments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });
      const data = await response.json();
      if (response.ok) {
        setPayments(data.monthPayments);
      } else {
        setError(data.error || "No monthly payment for that date");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const fetchMonthSales = async () => {
    try {
      const response = await fetch("http://localhost:5000/monthSales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });
      const data = await response.json();
      if (response.ok) {
        setSales(data.monthSales);
      } else {
        setError(data.error || "No monthly sales for that date");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleFetchReport = (reportType) => {
    if (reportType === "payments") {
      fetchMonthPayments();
    } else {
      fetchMonthSales();
    }
  };

  return (
    <div>
      {localStorage.getItem('job_title') == 'Admin'? <AdminNavbar /> : <ManagerDealershipNavbarLogged/>}
      <Container fluid>
        <h1>View Reports</h1>
        <Row>
          <Col md={4}>
            <Form>
              <Form.Group controlId="selectYear">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedYear}
                  onChange={handleYearChange}
                  id="reportSelectYearButton"
                >
                  {years.map((year) => (
                    <option key={year} value={year} id={year + "report"}>
                      {year}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="selectMonth">
                <Form.Label>Month</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  id="reportSelectMonthButton"
                >
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option id="marchReport" value="03">
                    March
                  </option>
                  <option id="aprilReport" value="04">
                    April
                  </option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </Form.Control>
              </Form.Group>
              <br />
              <Button
                id="fetchMonthlyPayments"
                onClick={() => handleFetchReport("payments")}
              >
                Fetch Monthly Payments
              </Button>
              <Button
                id="fetchMonthlySales"
                onClick={() => handleFetchReport("sales")}
                style={{ marginLeft: "10px" }}
              >
                Fetch Monthly Sales
              </Button>
            </Form>
          </Col>
          <Col md={8}>
            {error && <Alert variant="danger">{error}</Alert>}
            <h2>Monthly Payments</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.payment_id}</td>
                    <td>{`${payment.first_name} ${payment.last_name}`}</td>
                    <td>${payment.price}</td>
                    <td>
                      {new Date(payment.insert_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h2>Monthly Sales</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Sales ID</th>
                  <th>VIN</th>
                  <th>Finance/Cash</th>
                  <th>Sale Date</th>
                  <th>Price</th>
                  <th>Customer</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={index}>
                    <td>{sale.sales_id}</td>
                    <td>{sale.vin}</td>
                    <td>{sale.financeOrCash}</td>
                    <td>{new Date(sale.insert_date).toLocaleDateString()}</td>
                    <td>{sale.price}</td>
                    <td>{`${sale.first_name} ${sale.last_name}`}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ViewReports;
