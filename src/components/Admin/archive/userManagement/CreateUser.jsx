import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';

function CreateUser({ onClose }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: false,
    password: '',
    confirmPassword: '',
    role: [],
  });

  const [errorMessage] = useState('');
  const [roles, setRoles] = useState([]);
  const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'role'];
  const emptyFields = requiredFields.filter((field) => !formData[field]);

  // Static roles for selection
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getAllRoles`)
      .then((response) => response.json())
      .then((data) => {
        setRoles(
          data.map((role) => ({
            value: role._id,
            label: role.role_name,
          }))
        );
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }, []);

  const handleChange = (input, action) => {
    if (action?.name === 'role') {
      // สำหรับ react-select แบบ Multiple
      setFormData((prevState) => ({
        ...prevState,
        role: input ? input.map((option) => option.value) : [], // เก็บค่าหลายค่าใน array
      }));
    } else if (input.target) {
      // สำหรับ Form.Control
      const { name, value } = input.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'OK',
      });
      return;
    }

     // Validate email format
     if (!formData.email) {
       Swal.fire({
         icon: "error",
         title: "Invalid Email",
         text: "Please enter a valid email address.",
         confirmButtonText: "OK",
       });
       return;
     }

    if (formData.password.length < 8 || formData.password.length > 30) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be between 8 and 20 characters.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate password and confirmPassword
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: "Passwords don't match.",
        confirmButtonText: 'OK',
      });
      return;
    }

    // Make sure formData.role is an array of role IDs
    const dataToSubmit = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      status: formData.status,
      password: formData.password,
      role_ids: formData.role,
    };
    console.log(formData.role);

    // Send data to API
    fetch(`${import.meta.env.VITE_API_URL}/createUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSubmit),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Email is already in use') {
        Swal.fire({
          icon: 'error',
          title: 'Email Already Exists',
          text: 'The email address you entered is already in use. Please try another one.',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'User Created',
          text: 'User created successfully!',
          confirmButtonText: 'OK',
        }).then(() => {
          onClose();
          window.location.reload();
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error creating user. Please try again later.',
        confirmButtonText: 'OK',
      });
      console.error('Error creating user:', error);
    });
};

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Add User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
              />
            </Form.Group>
            <Form.Group as={Col} controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="role">
              <Form.Label>Role</Form.Label>
              <Select
                isMulti
                name="roles"
                options={roles}
                value={roles.filter((role) => formData.role.includes(role.value))}
                onChange={(selectedOptions) => handleChange(selectedOptions, { name: 'role' })}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter Confirm Password"
              />
            </Form.Group>
          </Row>

          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Stack>
            <Button variant="success" type="submit">
              Save
            </Button>
          </Stack>
        </Form>
      </Modal.Body>
    </div>
  );
}

export default CreateUser;
