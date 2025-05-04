import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, InputGroup, FormControl, FormLabel } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../styles/ManagerLoanNSign.css'
import ManagerNavbar from '../components/ManagerDealershipNavbarLogged';
import ContractSearch from '../components/ContractSearch';

const ManagerLoanNSign = () => {
    const [custId, setCustId] = useState('');
    const [carSales, setCarSales] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loanDetails, setLoanDetails] = useState(null);

    const user_id = localStorage.getItem('user_id');

    const handleSearch = async () => {
        const response = await fetch('http://localhost:5000/getUserCarSales', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "user_id": custId })
        });

        if (response.ok) {
            const data = await response.json();
            setCarSales(data.carSales);
        } else {
            alert('Failed to fetch car sales details');
            setCarSales([]); // Clear previous results if any
        }
    };

    const handleRowClick = async (car) => {
        if (car.financeOrCash === 'loan') {
            const response = await fetch('http://localhost:5000/proxy_get_loan_details_by_sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "sales_id": car.sales_id })
            });

            if (response.ok) {
                const data = await response.json();
                setLoanDetails(data.loan_details);
                setShowModal(true);
            } else {
                alert('Failed to fetch loan details');
                setLoanDetails(null);
            }
        }
    };


    const handleClose = () => {
        setShowModal(false);
        setLoanDetails(null);
    };

    return (
        <div>
            <ManagerNavbar userId={user_id}/>
            <Container fluid className='manager-loan-sign-page'>
                <Row>
                    <Col md={12}>
                    <FormLabel>Customer Loan Report Lookup</FormLabel>

                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Enter Customer ID"
                                aria-label="Customer ID"
                                aria-describedby="basic-addon2"
                                value={custId}
                                onChange={e => setCustId(e.target.value)}
                            />
                            <Button variant="outline-secondary" id="button-addon2" onClick={handleSearch}>
                                <FaSearch /> Search
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    {carSales.map((car, index) => (
                        <Col md={4} key={index}>
                            <Card onClick={() => handleRowClick(car)}>
                                <Card.Header>VIN: {car.vin}</Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        Sales ID: {car.sales_id}<br />
                                        User ID: {car.user_id}<br />
                                        Finance or Cash: {car.financeOrCash}<br />
                                        Insert Date: {car.insert_date}<br />
                                        Update Date: {car.update_date}<br />
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row>
                    <Col>
                    <ContractSearch />
                    </Col>
                </Row>
                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Loan Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {loanDetails ? (
                            <>
                                <p><strong>Loan ID:</strong> {loanDetails.loan_id}</p>
                                <p><strong>Loan Amount:</strong> ${loanDetails.loan_amount.toFixed(2)}</p>
                                <p><strong>Monthly Payment:</strong> ${loanDetails.monthly_amount.toFixed(2)}</p>
                                <p><strong>Payment Sum:</strong> ${loanDetails.payment_sum.toFixed(2)}</p>
                                <p><strong>Account ID:</strong> {loanDetails.account_id}</p>
                                <p><strong>Loan Insert Date:</strong> {loanDetails.insert_date}</p>
                                <p><strong>Loan Update Date:</strong> {loanDetails.update_date}</p>
                            </>
                        ) : <p>No loan details available.</p>}
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

export default ManagerLoanNSign;
