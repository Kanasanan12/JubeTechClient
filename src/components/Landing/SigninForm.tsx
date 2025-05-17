import axios from "axios";
import Swal from "sweetalert2";
import { useState } from "react";
import { FaRegCircleUser, FaKey } from "react-icons/fa6";
import { authentication } from "../../services/authorize.ts";
import { loginFirebase } from "../../services/storage.ts";

import 'animate.css';

interface SigninState {
    email: string,
    password: string
}

interface ResponseSuccess {
    token: string,
    message: string
}

export default function SigninForm() {
    const [signinForm, setSigninForm] = useState<SigninState>({
        email: "",
        password: ""
    });
    const { email, password } = signinForm;
    function handleSigninChange(value:string, name:string) {
        setSigninForm({ ...signinForm, [name]: value });
    }

    function prepareSignin(event: React.FormEvent) {
        event.preventDefault();
        Swal.fire({
            title: "ระบบกำลังทำงาน",
            html: "ระบบกำลังทำการตรวจสอบข้อมูล",
            didOpen: () => {
                Swal.showLoading();
                submitSignin().then(async(response) => {
                    const info = response as ResponseSuccess;
                    authentication(info.token);
                    await loginFirebase(signinForm.email, signinForm.password);
                    Swal.fire({
                        title: "เข้าสู่ระบบ",
                        text: info.message ?? "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
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
                    if (error.response.status === 401) {
                        Swal.fire({title: "สถานะเข้าสู่ระบบ",text: message,icon: "error"});
                    } else {
                        if (typeof message === "string") {
                            ResponseError(".email-signin", message);
                            ResponseError(".password-signin", message);
                        } else {
                            for (let index:number = 0; index < message.length; index++) {
                                if (message[index].path[0] === "email") {
                                    ResponseError(".email-signin", message[index].message);
                                }
                                if (message[index].path[0] === "password") {
                                    ResponseError(".password-signin", message[index].message);
                                }
                            }
                        }
                        Swal.close();
                    }
                });
            }
        });
    }

    function submitSignin() {
        return new Promise(async(resolve, reject) => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/signin`, signinForm);
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        })
    }

    function ResponseError(ref:string, response:string) {
        const input = document.querySelector<HTMLInputElement>(`${ref} input`)!;
        const span = document.querySelector<HTMLSpanElement>(`${ref} span.text-danger`)!;
        span.innerText = response;
        input.classList.add("animate__animated", "animate__headShake", "is-invalid");
        setTimeout(() => {
            span.innerText = "";
            input.classList.remove("animate__animated", "animate__headShake", "is-invalid");
        }, 3000);
    }

    return (
        <div className="signin-form-container">
            <p className="auth-title">เข้าสู่ระบบ</p>
            <span className="auth-description">ลงชื่อเข้าใช้งานระบบเพื่อปลดล็อคการทำงานและยืนยันตัวตนผู้ใช้งาน</span>
            <form id="signin-section" onSubmit={prepareSignin}>
                {/* Email */}
                <div className="email-signin form-group">
                    <label htmlFor="email">อีเมล</label>
                    <div className="input-group">
                        <div className="input-group-text">
                            <i><FaRegCircleUser size={20} /></i>
                        </div>
                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            placeholder="ป้อนอีเมลของคุณ..."
                            maxLength={250}
                            value={email}
                            onChange={(event) => handleSigninChange(event.target.value, "email")}
                            required
                        />
                    </div>
                    <span className="text-danger"></span>
                </div>
                {/* Password */}
                <div className="password-signin form-group">
                    <label htmlFor="password">รหัสผ่าน</label>
                    <div className="input-group">
                        <div className="input-group-text">
                            <i><FaKey size={15} /></i>
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            placeholder="ป้อนรหัสผ่านของคุณ..."
                            value={password}
                            maxLength={150}
                            onChange={(event) => handleSigninChange(event.target.value, "password")}
                            required
                        />
                    </div>
                    <span className="text-danger"></span>
                </div>
                <a href="#">ลืมรหัสผ่าน ?</a>

                <div className="btn-sign-container">
                    <button type="submit" id="signin-submit">เข้าสู่ระบบ</button>
                </div>
            </form>
        </div>
    );
}