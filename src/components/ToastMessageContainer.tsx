import Toast from 'react-bootstrap/Toast';
import { useEffect } from "react";
import ToastContainer from 'react-bootstrap/ToastContainer';

const isUnknown = (status:number) => status < 200;
const isSuccess = (status:number) => status >= 200 && status < 300;
const isClientError = (status:number) => status >= 400 && status < 500;
const isServerError = (status:number) => status >= 500 && status < 600;

const alertStyle = {
    width: "15px",
    height: "15px",
    marginRight: "10px",
    borderRadius: "5px",
}

interface ToastProp {
    messageList: ResponseMessage[],
    setMessageList: React.Dispatch<React.SetStateAction<ResponseMessage[]>>
}

export interface ResponseMessage {
    status: number,
    message: string
}

export function ToastMessageContainer({ messageList, setMessageList }:ToastProp) {
    // effect
    useEffect(() => {
        // setTimeout(() => {
        //     setMessageList((prev) => prev.slice(1));
        // }, 8000);
    }, [messageList]);

    // function
    const removeToast = (removeIndex:number) => {
        setMessageList(messageList.filter((_, index) => index !== removeIndex));
    }

    // render
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 99 }}>
            {messageList.map((alert, index) => (
                <Toast onClose={() => removeToast(index)} key={index}>
                    <Toast.Header>
                        {isUnknown(alert.status) &&
                            <div style={{ ...alertStyle, backgroundColor: "gray" }}></div>
                        }
                        {isSuccess(alert.status) &&
                            <div style={{ ...alertStyle, backgroundColor: "green" }}></div>
                        }
                        {isClientError(alert.status) &&
                            <div style={{ ...alertStyle, backgroundColor: "red" }}></div>
                        }
                        {isServerError(alert.status) &&
                            <div style={{ ...alertStyle, backgroundColor: "red" }}></div>
                        }
                        <p className='me-auto'>System Alert</p>
                    </Toast.Header>
                    <Toast.Body>
                        <p style={{ fontSize: "0.75rem" }}>{alert.message}</p>
                    </Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
}