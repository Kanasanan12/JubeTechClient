import { useState, ChangeEvent, FormEvent } from 'react';
import { Modal, Button, Form, Row, Stack } from 'react-bootstrap';
import Swal from 'sweetalert2';

// Define the props for the component
interface CreateUserProps {
  onClose: () => void;
}

// Define the form data type
interface FormData {
  roleName: string;
}

export default function CreateRole({ onClose }: CreateUserProps) {
  const [formData, setFormData] = useState<FormData>({
    roleName: '',
  });

  const requiredFields: (keyof FormData)[] = ['roleName'];
  const emptyFields = requiredFields.filter((field) => !formData[field]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    const dataToSubmit = {
      role_name: formData.roleName,
    };

    fetch(`${import.meta.env.VITE_API_URL}/createRole`, {
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
            title: 'Role Created',
            text: 'Role created successfully!',
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
          text: 'Error creating role. Please try again later.',
          confirmButtonText: 'OK',
        });
        console.error('Error creating role:', error);
      });
  };

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Add Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Control
                type="text"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                placeholder="Enter Role"
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
