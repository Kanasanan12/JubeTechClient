import { Modal, Button, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

interface DeletePromotionProps {
  promotionId: string;
  onClose: () => void;
}

export default function DeletePromotion({ promotionId, onClose }: DeletePromotionProps) {
    const handleDelete = (): void => {
        fetch(`${import.meta.env.VITE_API_URL}/deletePromotion/${promotionId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete promotion');
                }
                return response.json();
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Promotion deleted successfully',
                    confirmButtonText: 'OK',
                }).then(() => {
                    onClose();
                    window.location.reload();
                });
            })
            .catch((error: Error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: `Error deleting promotion: ${error.message}`,
                    confirmButtonText: 'OK',
                });
                console.error('Error deleting promotion:', error);
            });
    };

    return (
        <div>
            <Modal.Header closeButton>
                <Modal.Title>Delete Promotion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Are you sure you want to delete this promotion?</strong></p>
                <Col md={{ offset: 10 }}>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Col>
            </Modal.Body>
        </div>
    );
}
