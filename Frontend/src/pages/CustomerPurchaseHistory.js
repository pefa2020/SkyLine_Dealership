import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import DealershipNavbarLogged from '../components/DealershipNavbarLogged';
import '../styles/CustomerPurchaseHistory.css';

function CustomerPurchaseHistory() {
    const userId = localStorage.getItem("user_id");
    const [carSales, setCarSales] = useState([]);
    const [serviceSales, setServiceSales] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState({});
    const [loanDetails, setLoanDetails] = useState(null); // State to store loan details

    useEffect(() => {
        fetchCarPurchaseHistory();
        fetchServiceSales();
    }, []);

    const fetchServiceSales = () => {
        const jsonData = { "user_id": userId };
        const url = 'http://localhost:5000/getServiceSales';
        fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                setServiceSales(data["serviceSales"]);
            }
        })
        .catch((error) => {
            console.error('Error fetching service sales:', error);
        });
    };


    const fetchCarPurchaseHistory = () => {
        const jsonData = { "userID": userId };
        const url = 'http://localhost:5000/carPurchaseHistory';
        fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                setCarSales(data["carPurchaseHistory"]);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const fetchLoanDetails = (salesId) => {
        console.log(salesId);
        const jsonData = { "sales_id": salesId };
        const url = 'http://localhost:5000/proxy_get_loan_details_by_sales';
        fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setLoanDetails(data.loan_details);
            }
        })
        .catch((error) => {
            console.error('Error fetching loan details:', error);
            setLoanDetails(null); // Reset loan details on error
        });
    };

    const handleRowClick = (item) => {
        setSelectedCar(item);
        if (item.financeOrCash === 'loan') {
            fetchLoanDetails(item.saleId);
            setShowModal(true);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setLoanDetails(null); // Clear loan details when closing modal
    };

    return (
        <div>
            <DealershipNavbarLogged userId={userId} />
            <Container fluid>
                <Row className="justify-content-center">
                    <Col md={10}>
                        <h2 className="text-center mt-4 mb-4">Car Sales History</h2>
                        <Table striped bordered hover variant="light" responsive className="rounded shadow">
    <thead>
        <tr>
            <th>Car Make</th>
            <th>Car Model</th>
            <th>Car Year</th>
            <th>Vin Number</th>
            <th>Insert Date</th>
            <th>Price</th>  {/* Updated header label */}
            <th>Payment Type</th>
        </tr>
    </thead>
    <tbody>
        {carSales.map(item => (
            <tr key={item.c_vin} onClick={() => handleRowClick(item)} className="cursor-pointer">
                <td>{item.c_make}</td>
                <td>{item.c_model}</td>
                <td>{item.c_year}</td>
                <td>{item.c_vin}</td>
                <td>{item.insert_date}</td>
                <td>${item.price.toFixed(2)}</td>  {/* Updated to display price */}
                <td>{item.financeOrCash}</td>
            </tr>
        ))}
    </tbody>
</Table>

                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col md={10}>
                        <h2 className="text-center mt-4 mb-4">Service Sales History</h2>
                        {serviceSales?<Table striped bordered hover variant="light" responsive className="rounded shadow">
                            <thead>
                                <tr>
                                    <th>Service ID</th>
                                    <th>Service Type</th>
                                    <th>Price</th>
                                    <th>Date</th>
                                    <th>Last Four of Card</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceSales.map(service => (
                                    <tr key={service.service_sale_id}>
                                        <td>{service.service_sale_id}</td>
                                        <td>{service.service_description}</td>
                                        <td>${service.price.toFixed(2)}</td>
                                        <td>{new Date(service.insert_date).toLocaleDateString()}</td>
                                        <td>xxxx-xxxx-xxxx-{service.card_last_four}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table> : <div>No Service History</div>}
                    </Col>
                </Row>

                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Loan Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Car Make:</strong> {selectedCar.c_make}</p>
                        <p><strong>Model:</strong> {selectedCar.c_model}</p>
                        <p><strong>Year:</strong> {selectedCar.c_year}</p>
                        <p><strong>VIN:</strong> {selectedCar.c_vin}</p>
                        <p><strong>Negotiation Price:</strong> {selectedCar.negotiation_price}</p>
                        <p><strong>Payment Method:</strong> {selectedCar.financeOrCash}</p>
                        {loanDetails && (
                            <>
                                <p><strong>Loan ID:</strong> {loanDetails.loan_id}</p>
                                <p><strong>Loan Amount:</strong> ${loanDetails.loan_amount.toFixed(2)}</p>
                                <p><strong>Monthly Payment:</strong> ${loanDetails.monthly_amount.toFixed(2)}</p>
                                <p><strong>Payment Sum:</strong> ${loanDetails.payment_sum.toFixed(2)}</p>
                                <p><strong>Account ID:</strong> {loanDetails.account_id}</p>
                                <p><strong>Loan Insert Date:</strong> {loanDetails.insert_date}</p>
                                <p><strong>Loan Update Date:</strong> {loanDetails.update_date}</p>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
}

export default CustomerPurchaseHistory;
