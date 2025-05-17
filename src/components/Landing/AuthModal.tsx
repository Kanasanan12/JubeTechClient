import SigninForm from "./SigninForm";
import SignupForm from "./SignupForm";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Modal from 'react-bootstrap/Modal';

import "../../assets/css/landing/modal.css";

interface AuthModalProp {
    showModal: boolean,
    typeModal: number,
    setTypeModal: (value: number | ((prev: number) => number)) => void,
    setShowModal: (value: boolean | ((prev: boolean) => boolean)) => void,
}

export default function AuthModal({ showModal, setShowModal, typeModal, setTypeModal }:AuthModalProp) {
    return (
        <Modal
            className="modal-auth"
            show={showModal}
            onHide={() => setShowModal(false)}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body>
                <Tabs
                    defaultActiveKey={typeModal}
                    variant="pills"
                    fill
                >
                    <Tab eventKey={0} title="เข้าสู่ระบบ" onClick={() => setTypeModal(0)}>
                        <SigninForm />
                    </Tab>
                    <Tab eventKey={1} title="สมัครสมาชิก" onClick={() => setTypeModal(1)}>
                        <SignupForm />
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
}