import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavBar";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";

function AdminPage() {
  const navigate = useNavigate();
  const jobTitle = localStorage.getItem("job_title");

  useEffect(() => {
    // Redirect if not an admin
    if (jobTitle !== "Admin") {
      navigate("/"); // Assuming '/' is your login or public dashboard
    }
  }, [navigate, jobTitle]);

  const [userData, setUserData] = useState({
    jobId: "", // Default is empty until a selection is made
    phoneNumber: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.jobId) {
      setError("Please select a job role for the account.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/createAccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        //alert("Account created successfully");
        navigate("/adminDashboard"); // Redirect to admin dashboard or refresh page
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    }
  };

  return (
    <div>
      <AdminNavbar />
      <Container className="admin-holder">
        <h1>Admin Dashboard</h1>
        <h2>Create Account</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Job Role</Form.Label>
            <Form.Select
              id="adminPageJobDropdown"
              name="jobId"
              value={userData.jobId}
              onChange={handleChange}
              required
            >
              <option value="">Select Job Role</option>
              <option value="2" id="adminJobTitleTech">
                Technician
              </option>
              <option value="3" id="adminJobTitleManager">
                Manager
              </option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              id="adminPagePhone"
              type="text"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              id="adminPageFirstName"
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              id="adminPageLastName"
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              id="adminPageUsername"
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="adminPageEmail"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              id="adminPagePassword"
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            id="adminPageCreateAccountButton"
          >
            Create Account
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default AdminPage;
