import axios from "axios";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { authentication } from "../../services/authorize.ts";
import { FaRegCircleUser, FaKey, FaRegEnvelope } from "react-icons/fa6";
import { registerFirebase } from "../../services/storage.ts";

import "animate.css";

interface SignupState {
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    confirm_password: string,
    otp: number,
    ref_code: string
}

interface ResponseSuccessSignup {
    token: string,
    message: string
}

interface ResponseSuccessOTP {
    message: string,
    ref_no: string
}

export default function SignupForm() {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [signupForm, setSignupForm] = useState<SignupState>({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirm_password: "",
        otp: 0,
        ref_code: ""
    });
    const { firstname, lastname, email, password, confirm_password, otp, ref_code } = signupForm;

    // useEffect track time
    useEffect(() => {
        if (timeLeft === 0) {
            setIsResendDisabled(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);
    
    function handleSignupChange(value:string, name:string) {
        setSignupForm({ ...signupForm, [name]: value });
    }

    function prepareSignup(event: React.FormEvent) {
        event.preventDefault();
        if (ref_code.trim().length === 0) {
            Swal.fire({title: "สถานะการสมัครสมาชิก",text: "กรุณาทำการยืนยันอีเมลก่อนสมัครสมาชิก",icon: "error"});
        } else {
            Swal.fire({
                title: "ระบบกำลังทำงาน",
                html: "ระบบกำลังทำการตรวจสอบข้อมูล",
                didOpen: () => {
                    Swal.showLoading();
                    submitSignup().then(async(response) => {
                        const info = response as ResponseSuccessSignup;
                        authentication(info.token);
                        await registerFirebase(signupForm.email, signupForm.password);
                        Swal.fire({
                            title: "สถานะการสมัครสมาชิก",
                            text: info.message ?? "เกิดข้อผิดพลาดในการสมัครสมาชิก",
                            icon: info.message ? "success" : "error"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                if (typeof window !== "undefined") {
                                    window.location.href = "/";
                                }
                            }
                        });
                    }).catch((error) => {
                        const message = error.response.data.message;
                        if (typeof message === "string") {
                            Swal.fire({title: "สถานะการสมัครสมาชิก",text: message,icon: "error"});
                        } else {
                            for (let index:number = 0; index < message.length; index++) {
                                if (message[index].path[0] === "firstname") {
                                    ResponseError(".fname-error", message[index].message);
                                }
                                if (message[index].path[0] === "lastname") {
                                    ResponseError(".lname-error", message[index].message);
                                }
                                if (message[index].path[0] === "email") {
                                    ResponseError(".email-signup", message[index].message);
                                }
                                if (message[index].path[0] === "password") {
                                    ResponseError(".password-signup", message[index].message);
                                }
                                if (message[index].path[0] === "confirm_password") {
                                    ResponseError(".password-signup", message[index].message);
                                    ResponseError(".confirm-password-signup", message[index].message);
                                }
                                if (message[index].path[0] === "otp") {
                                    ResponseError(".otp-signup", message[index].message);
                                }
                                if (message[index].path[0] === "ref_code") {
                                    ResponseError(".otp-signup", "มีข้อผิดพลาดบางอย่างเกิดขึ้น");
                                }
                            }
                            Swal.close();
                        }
                    });
                }
            });
        }
    }

    // Preload resend otp
    function prepareResendOTP() {
        Swal.fire({
            title: "ระบบกำลังทำงาน",
            html: "ระบบกำลังทำการส่งรหัสยืนยัน",
            didOpen: () => {
                Swal.showLoading();
                handleResendOTP().then((response) => {
                    const resp_otp = response as ResponseSuccessOTP;
                    handleSignupChange(resp_otp.ref_no, "ref_code");
                    Swal.fire({
                        title: "สถานะการส่ง OTP",
                        text: resp_otp.message ?? "เกิดข้อผิดพลาดในการอัพเดตหมวดหมู่",
                        icon: resp_otp.message ? "success" : "error"
                    });
                }).catch((error) => {
                    if (error.message) {
                        ResponseError(".email-signup", error.message);
                        Swal.close();
                    } else {
                        const message = error.response.data.message;
                        Swal.fire({
                            title: "สถานะการส่ง OTP",
                            text: message ?? "เกิดข้อผิดพลาดในการอัพเดตหมวดหมู่",
                            icon: "error"
                        });
                    }
                });
            }
        });
    }

    function handleResendOTP() {
        return new Promise(async(resolve, reject) => {
            try {
                const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const validateMail = regexMail.test(email);
                if (email.trim().length > 0 && validateMail) {
                    setIsResendDisabled(true);
                    setTimeLeft(30);
                    const response = await axios.post(`${import.meta.env.VITE_API_URL}/request/otp`, { email });
                    resolve(response.data);
                } else {
                    reject({ message: "กรุณทำการป้อนอีเมล" });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    function submitSignup() {
        return new Promise(async(resolve, reject) => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, signupForm);
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    function ResponseError(ref:string, response:string) {
        if (ref === ".fname-error" || ref === ".lname-error") {
            const span = document.querySelector<HTMLSpanElement>(`${ref}`)!;
            span.innerText = response;
            setTimeout(() => {
                span.innerText = ""; 
            }, 3000);
        } else {
            const input = document.querySelector<HTMLInputElement>(`${ref} input`)!;
            const span = document.querySelector<HTMLSpanElement>(`${ref} span.text-danger`)!;
            span.innerText = response;
            input.classList.add("animate__animated", "animate__headShake", "is-invalid");
            setTimeout(() => {
                span.innerText = "";
                input.classList.remove("animate__animated", "animate__headShake", "is-invalid");
            }, 3000);
        }
    }

    // Render
    return (
        <div className="signup-form-container">
            <p className="auth-title">สมัครสมาชิก</p>
            <span className="auth-description">ลงทะเบียนผู้ใช้งานเพื่อเริ่มต้นในการเป็นสมาชิกภายในแอปพลิเคชั่นและเรียนรู้คอร์สเรียนของเรา</span>
            <form id="signup-section" onSubmit={prepareSignup}>
                <div className="row">
                    <div className="col-12 col-lg-6">
                        {/* First Name */}
                        <div className="fname-signup form-group">
                            <label htmlFor="firstname_signup">ชื่อจริง (ไม่ต้องใส่คำนำหน้า)</label>
                            <div className="input-group">
                                <div className="input-group-text">
                                    <i><FaRegCircleUser size={20} /></i>
                                </div>
                                <input
                                    id="firstname_signup"
                                    type="text"
                                    className="form-control"
                                    placeholder="ป้อนชื่อจริงของคุณ..."
                                    maxLength={150}
                                    value={firstname}
                                    onChange={(event) => handleSignupChange(event.target.value, "firstname")}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        {/* Lastname */}
                        <div className="lname-signup form-group">
                            <label htmlFor="lastname_signup">นามสกุล</label>
                            <div className="input-group">
                                <input
                                    id="lastname_signup"
                                    type="text"
                                    className="form-control"
                                    placeholder="ป้อนนามสกุลของคุณ..."
                                    maxLength={150}
                                    value={lastname}
                                    onChange={(event) => handleSignupChange(event.target.value, "lastname")}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="name-error">
                    <span className="fname-error text-danger"></span><br />
                    <span className="lname-error text-danger"></span>
                </div>
                {/* Email */}
                <div className="email-signup form-group">
                    <label htmlFor="email_signup">อีเมล</label>
                    <div className="input-group">
                        <div className="input-group-text">
                            <i><FaRegEnvelope size={20} /></i>
                        </div>
                        <input
                            id="email_signup"
                            type="text"
                            className="form-control"
                            placeholder="ป้อนอีเมลของคุณ..."
                            maxLength={250}
                            value={email}
                            onChange={(event) => handleSignupChange(event.target.value, "email")}
                            required
                        />
                    </div>
                    <span className="text-danger"></span>
                </div>
                {/* Password */}
                <div className="password-signup form-group">
                    <label htmlFor="password_signup">รหัสผ่าน</label>
                    <div className="input-group">
                        <div className="input-group-text">
                            <i><FaKey size={15} /></i>
                        </div>
                        <input
                            id="password_signup"
                            type="password"
                            className="form-control"
                            placeholder="ป้อนรหัสผ่านของคุณ..."
                            minLength={6}
                            maxLength={150}
                            value={password}
                            onChange={(event) => handleSignupChange(event.target.value, "password")}
                            required
                        />
                    </div>
                    <span className="text-danger"></span>
                </div>
                {/* Confirm Password */}
                <div className="confirm-password-signup form-group">
                    <label htmlFor="password_confirm">ยืนยันรหัสผ่าน</label>
                    <div className="input-group">
                        <input
                            id="password_confirm"
                            type="password"
                            className="form-control"
                            placeholder="ป้อนรหัสผ่านยืนยันของคุณ..."
                            value={confirm_password}
                            minLength={6}
                            maxLength={150}
                            onChange={(event) => handleSignupChange(event.target.value, "confirm_password")}
                            required
                        />
                    </div>
                    <span className="text-danger"></span>
                </div>
                {/* OTP */}
                <div className="otp-signup form-group">
                    <label htmlFor="otp_password">ยืนยัน OTP</label>
                    <div className="input-group">
                        <input
                            id="otp_password"
                            type="number"
                            className="form-control"
                            placeholder="ป้อนรหัสผ่านยืนยันของคุณ..."
                            value={otp === 0 ? "" : otp}
                            min={100000}
                            max={999999}
                            onChange={(event) => handleSignupChange(event.target.value, "otp")}
                            required
                        />
                        <input type="hidden" value={ref_code} readOnly />
                    </div>
                    <span className="text-danger"></span>
                </div>
                <button
                    className="resend-otp"
                    type="button"
                    onClick={prepareResendOTP}
                    disabled={isResendDisabled}
                >
                    ส่ง OTP ไปยังอีเมล
                </button>
                <br />
                {timeLeft !== 0 ? <span className="count-otp">สามารถส่งอีกครั้งภายใน {timeLeft} วิ</span> : ""}
        
                <div className="btn-sign-container">
                    <button
                        type="submit"
                        id="signup-submit"
                    >
                        สมัครสมาชิก
                    </button>
                </div>
            </form>
        </div>
    );
}