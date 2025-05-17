import React from 'react';
import { Modal, Button, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

function DeleteUser({ userId, onClose }) {
  const handleDelete = () => {
    fetch(`${import.meta.env.VITE_API_URL}/deleteUser/${userId}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User deleted successfully',
          confirmButtonText: 'OK',
        }).then(() => {
          onClose();
          window.location.reload();
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Error deleting user: ${error.message}`,
          confirmButtonText: 'OK',
        });
        console.error('Error delete user:', error);
      });
  };

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Are you sure you want to delete this user?</strong></p>
        <Col md= {{offset: 10}}><Button variant="danger" onClick={handleDelete}>Delete</Button> </Col>
      </Modal.Body>
    </div>
  );
}

export default DeleteUser;
