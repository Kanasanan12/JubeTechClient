import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Stack } from 'react-bootstrap';
import Swal from 'sweetalert2';

type FormData = {
  role_name: string;
};

type EditRoleProps = {
  roleId: string;
  onClose: () => void;
};

export default function EditRole({ roleId, onClose }: EditRoleProps) {
  const [formData, setFormData] = useState<FormData>({
    role_name: '',
  });

  const [errorMessage] = useState<string>('');
  const requiredFields = ['role_name'] as const;
  const emptyFields = requiredFields.filter((field) => !formData[field]);

  useEffect(() => {
    // Fetch role data by ID
    fetch(`${import.meta.env.VITE_API_URL}/getRole/${roleId}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData({
          role_name: data.role_name,
        });
      })
      .catch((error) => console.error('Error fetching role data:', error));
  }, [roleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    const dataToSubmit = {
      role_name: formData.role_name,
    };

    fetch(`${import.meta.env.VITE_API_URL}/updateRole/${roleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSubmit),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Role Updated',
            text: 'The role has been updated successfully.',
            confirmButtonText: 'OK',
          }).then(() => {
            onClose();
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'An error occurred while updating the role.',
            confirmButtonText: 'OK',
          });
        }
      })
      .catch((error) => {
        console.error('Error updating role:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'An error occurred while updating the role.',
          confirmButtonText: 'OK',
        });
      });
  };

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Edit Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="roleName">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
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
