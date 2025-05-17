import { useState, useEffect, FormEvent } from 'react';
import { Modal, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';

// Define the props for the component
interface CreateUserProps {
  onClose: () => void;
}

// Define the role type
interface Role {
  value: string;
  label: string;
}

interface RoleData {
  _id: string;
  role_name: string;
}

// Define the form data type
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  status: boolean;
  password: string;
  confirmPassword: string;
  role: string[]; // Array of role IDs
}

export default function CreateUser({ onClose }: CreateUserProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    status: false,
    password: '',
    confirmPassword: '',
    role: [],
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const requiredFields: (keyof FormData)[] = [
    'firstName',
    'lastName',
    'email',
    'password',
    'confirmPassword',
    'role',
  ];
  const emptyFields = requiredFields.filter((field) => !formData[field]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getAllRoles`)
      .then((response) => response.json())
      .then((data: RoleData[]) => {
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

  const handleChange = (
    input: | { name: string; value: string | boolean } | ReadonlyArray<{ value: string }>,
    action?: { name: string }
    ) => {
      if (!input) return;
    
      if (action?.name === "role" && Array.isArray(input)) {
        setFormData((prevState) => ({
          ...prevState,
          role: input.map((option) => option.value),
        }));
      } else if (!Array.isArray(input) && "name" in input) {
        setFormData((prevState) => ({
          ...prevState,
          [input.name]: input.value,
        }));
      }
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    if (formData.password.length < 8 || formData.password.length > 30) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be between 8 and 30 characters.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: "Passwords don't match.",
        confirmButtonText: 'OK',
      });
      return;
    }

    const dataToSubmit = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      status: formData.status,
      password: formData.password,
      role_ids: formData.role,
    };

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
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                placeholder="Enter First Name"
              />
            </Form.Group>
            <Form.Group as={Col} controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
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
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                placeholder="Enter Email"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="role">
              <Form.Label>Role</Form.Label>
              <Select
                isMulti
                name="role"
                options={roles}
                value={roles.filter((role) => formData.role.includes(role.value))}
                onChange={(selectedOptions) => handleChange(selectedOptions, { name: "role" })}
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
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
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
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                placeholder="Enter Confirm Password"
              />
            </Form.Group>
          </Row>

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
