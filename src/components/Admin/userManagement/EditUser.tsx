import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import Select from 'react-select';
import Swal from 'sweetalert2';

type Role = {
  _id: string;
  role_name: string;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  role: string[];
  currentPassword: string;
  newPassword: string;
  status: boolean;
};

type EditUserProps = {
  userId: string;
  onClose: () => void;
};

export default function EditUser({ userId, onClose }: EditUserProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: [],
    currentPassword: '',
    newPassword: '',
    status: false,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [errorMessage] = useState<string>('');
  const requiredFields = ['firstName', 'lastName', 'email', 'role'] as const;
  const emptyFields = requiredFields.filter((field) => !formData[field]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getUser/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData({
          firstName: data.firstname,
          lastName: data.lastname,
          email: data.email,
          currentPassword: '',
          newPassword: '',
          role: data.role_ids ? data.role_ids.map((role: { _id: string }) => role._id) : [],
          status: data.status,
        });
      })
      .catch((error) => console.error('Error fetching user data:', error));

    fetch(`${import.meta.env.VITE_API_URL}/getAllRoles`)
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error('Error fetching roles:', error));
  }, [userId]);

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
        [input.name]: typeof input.value === "boolean" ? input.value : input.value,
      }));
    }
  };
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    if (!formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Too Short',
        text: 'New password must be at least 8 characters long.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Current Password Required',
        text: 'Please enter your current password to change the password.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const dataToSubmit = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      status: formData.status,
      role_ids: formData.role,
      currentPassword: formData.currentPassword,
      ...(formData.newPassword && { password: formData.newPassword }),
    };

    fetch(`${import.meta.env.VITE_API_URL}/updateUser/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSubmit),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Current password is incorrect') {
          Swal.fire({
            icon: 'error',
            title: 'Current Password Error',
            text: 'The current password you entered is incorrect. Please try again.',
            confirmButtonText: 'OK',
          });
          return;
        }
        Swal.fire({
          icon: 'success',
          title: 'User Updated',
          text: 'User information updated successfully!',
          confirmButtonText: 'OK',
        }).then(() => {
          onClose();
          window.location.reload();
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating user. Please try again later.',
          confirmButtonText: 'OK',
        });
        console.error('Error updating user:', error);
      });
  };

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
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
                options={roles.map((role) => ({
                  value: role._id,
                  label: role.role_name,
                }))}
                value={roles
                  .filter((role) => formData.role.includes(role._id))
                  .map((role) => ({
                    value: role._id,
                    label: role.role_name,
                  }))}
                onChange={(selectedOptions) => handleChange(selectedOptions, { name: "role" })}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="currentPassword">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                placeholder="Enter Current Password"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                placeholder="Enter New Password (Leave blank to keep current)"
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group controlId="status">
              <Form.Check
                type="checkbox"
                label="Activate User"
                name="status"
                checked={formData.status}
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    status: e.target.checked,
                  }));
                }}
              />
            </Form.Group>
          </Row>

          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

          <Stack>
            <Button variant="success" type="submit">
              Save Changes
            </Button>
          </Stack>
        </Form>
      </Modal.Body>
    </div>
  );
}
