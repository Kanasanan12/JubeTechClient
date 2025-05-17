import axios from "axios";
import { logoutFirebase } from "./storage";

// save token
export const authentication = (token:string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem("token", JSON.stringify(token));
    }
}

// get token
export const getToken = () => {
    if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        if (token) {
            return JSON.parse(token);
        } else {
            return false;
        }
    }
}

// check user
export const checkUser = () => {
    if (typeof window !== "undefined") {
        if (sessionStorage.getItem("token")) return true
    }
    return false;
}

// check role
export const checkRole = async() => {
    if (typeof window !== "undefined") {
        if (sessionStorage.getItem("token")) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/getRoleByUser`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });
                if (response.data.data.role_ids && response.data.data.role_ids.length > 0) {
                    return response.data.data.role_ids.map((role:{_id:string,role_name:string}) => role.role_name);
                } else {
                    return [];
                }
            } catch (error) {
                window.location.href = "/"
                console.error("Something went wrong.");
                return [];
            }
        }
    }
    window.location.href = "/"
    return false;
}

// logout
export const logout = async() => {
    try {
        await logoutFirebase();
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            window.location.href = "/";
        }
        return true;
    } catch (error) {
        return false;
    }
}