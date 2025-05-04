import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavBar";
import { Button, Table, Alert, Modal, Form } from "react-bootstrap";

function ManageAccounts() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([
    { job_id: 2, job_title: "Technician" },
    { job_id: 3, job_title: "Manager" },
    // Add other job roles as needed
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/getUsers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/deleteUser/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.user_id !== userId));
        //alert("User deleted successfully");
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/updateUser/${editUser.user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(editUser),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.user_id === editUser.user_id ? { ...user, ...editUser } : user
          )
        );
        setShowModal(false);
        alert("User updated successfully");
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div style={{ padding: "20px" }}>
        <h1>Manage Accounts</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => openEditModal(user)}
                    id={user.username + "edit"}
                  >
                    Edit
                  </Button>
                  <Button
                    id={user.username + "delete"}
                    variant="danger"
                    onClick={() => deleteUser(user.user_id)}
                    style={{ marginLeft: "5px" }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={editUser.username || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editUser.email || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={editUser.first_name || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={editUser.last_name || ""}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Job Role</Form.Label>
                <Form.Select
                  name="job_id"
                  value={editUser.job_id || ""}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Job Role</option>
                  {jobs.map((job) => (
                    <option key={job.job_id} value={job.job_id}>
                      {job.job_title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              id="adminEditCloseButton"
            >
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ManageAccounts;
