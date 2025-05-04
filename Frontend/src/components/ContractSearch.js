import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Modal,
  Button,
  Card,
} from "react-bootstrap";
import "../styles/ManagerLoanNSign.css"; // Make sure to create and import this CSS file

function ContractSearch() {
  const [userId, setUserId] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  useEffect(() => {
    fetchContracts(null); // Fetch all unsigned contracts on load
  }, []);

  const fetchContracts = async (userId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/getUnsignedContracts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
      } else {
        throw new Error("Failed to fetch contracts");
      }
    } catch (error) {
      console.error("Error:", error);
      console.log("Error fetching contracts");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchContracts(userId);
  };

  const handleRowClick = (contractId) => {
    setSelectedContractId(contractId);
    setShowModal(true);
  };

  const handleSignContract = async () => {
    const managerId = localStorage.getItem("user_id"); // Assuming manager's ID is stored in local storage
    try {
      const response = await fetch("http://localhost:5000/updateContract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_id: selectedContractId,
          user_id2: managerId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        //alert("Contract signed successfully");
        setShowModal(false);
        fetchContracts(userId); // Refresh the contracts list
      } else {
        throw new Error(data.message || "Failed to sign contract");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container fluid className="mt-5">
      <Row fluid className="justify-content-center">
        <Col style={{ margin: "0" }}>
          <Card>
            <Card.Header>
              <h4>Search for Contracts</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="userIdInput" className="mb-3">
                  <Form.Label>Enter User ID:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by User ID"
                    value={userId || ""}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                  <br />
                  <Button variant="primary" type="submit">
                    Search
                  </Button>
                </Form.Group>
              </Form>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Contract ID</th>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Last 4 SSN</th>
                    <th>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract, index) => (
                    <tr
                      key={contract.contract_id}
                      onClick={() => handleRowClick(contract.contract_id)}
                      id={"Contract-" + contract.contract_id}
                    >
                      <td>{contract.contract_id}</td>
                      <td>{contract.user_id1}</td>
                      <td>{contract.first_name}</td>
                      <td>{contract.last_name}</td>
                      <td>{contract.ssn_last_4}</td>
                      <td>{contract.phone_number}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Sign Contract</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Signing this contract will finalize the agreement.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSignContract}
            id="signContract"
          >
            Sign Contract
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ContractSearch;
