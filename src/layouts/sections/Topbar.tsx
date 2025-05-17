import axios from "axios";
import { message } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/dashboard/topbar.css";
import Avatar from "../../assets/img/avatar-test.png";
import { logout, getToken } from "../../services/authorize.ts";

import { FaAngleDown, FaPowerOff } from "react-icons/fa6";

interface UserInfo {
    _id: string
    firstname: string,
    lastname: string,
    role_ids: {
        _id: string,
        role_name: string,
    }[],
}

export default function Topbar({ title }:{ title:string }) {
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserInfo>({
        _id: "",
        firstname: "Unknown",
        lastname: "user",
        role_ids: []
    });
    const name = userData.firstname + " " + userData.lastname;
    const roles = userData.role_ids.map(role => role.role_name).join(", ");

    useEffect(() => {
        (async() => {
            await fetchUserById();
        })();
    }, []);

    // function
    const fetchUserById = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/personal`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const userInfo = response.data.data;
                setUserData(userInfo);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("Unauthorized");
        }
    }

    return (
        <div className="topbar">
            <div></div>
            <div className="title-dashboard">
                <h1>{title}</h1>
            </div>
            {/* Avatar */}
            <div className="avatar-info" onClick={() => setToggleDropdown(!toggleDropdown)}>
                <img src={Avatar} alt="avatar" />
                <div className="avatar-content">
                    <p>{name.length > 20 ? name.slice(0, 20) + "..." : name}</p>
                    <span>{roles.length > 20 ? roles.slice(0, 20) + "..." : roles}</span>
                </div>
                <i><FaAngleDown /></i>
            </div>
            {/* Dropdown */}
            <div className={"avatar-dropdown " + (toggleDropdown ? "active-dropdown" : "")}>
                <ul>
                    <Link to="#">
                        <li>
                            โปรไฟล์ของฉัน
                        </li>
                    </Link>
                    <Link to="#">
                        <li>
                            ตั้งค่าบัญชี
                        </li>
                    </Link>
                    <Link to="#">
                        <li>
                            สอบถามและรายงานปัญหา
                        </li>
                    </Link>
                    <hr />
                    <Link to="#" onClick={logout}>
                        <li>
                            ออกจากระบบ
                            <i><FaPowerOff /></i>
                        </li>
                    </Link>
                </ul>
            </div>
        </div>
    );
}