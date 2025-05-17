import axios from "axios";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checkUser, getToken } from "../services/authorize";

interface IFCourse {
    _id: string,
    title: string,
    instructor: {
        firstname: string,
        lastname: string
    },
}

export default function Certificate({
  date = new Date().toLocaleDateString(),
}) {
    const { course_id } = useParams();

    const [user, setUser] = useState<{ firstname:string, lastname:string }>({
        firstname: "",
        lastname: "",
    });
    const [course, setCourse] = useState<IFCourse>();

    useEffect(() => {
        if (!checkUser() || !course_id) message.error("The data was not found.");
        else {
            fetchUser();
            fetchCourse();
            window.print();
        }
    }, []);

    const fetchUser = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/personal`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const user = response.data.data;
                const { firstname, lastname } = user;
                setUser({ firstname, lastname });
            }
        } catch (error) {
            message.error("The user could not be fetched.");
        }
    }

    const fetchCourse = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/info/${course_id}`);
            if (response.data.data) {
                const course = response.data.data;
                setCourse(course);
            }
        } catch (error) {
            message.error("The course could not be fetched.");
        }
    }

  return (
    <div
      style={{
        fontFamily: "'Mitr', 'Segoe UI', Arial, sans-serif",
        background: "linear-gradient(135deg, #f8fafc 0%, #e9e4f0 100%)",
        border: "8px solid #6c47ff",
        borderRadius: "24px",
        width: "900px",
        margin: "40px auto",
        padding: "48px 56px",
        boxShadow: "0 8px 32px rgba(108,71,255,0.12)",
        position: "relative"
      }}
    >
      {/* Decorative Ribbon */}
      <div
        style={{
          position: "absolute",
          top: "-32px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#6c47ff",
          color: "#fff",
          padding: "8px 40px",
          borderRadius: "16px",
          fontWeight: 600,
          fontSize: "1.5rem",
          letterSpacing: "2px",
          boxShadow: "0 2px 8px rgba(108,71,255,0.18)"
        }}
      >
        Certificate of Completion
      </div>

      {/* Main Content */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <h2 style={{ color: "#6c47ff", fontSize: "2.5rem", margin: "0 0 16px" }}>
          {course?.title}
        </h2>
        <p style={{ fontSize: "1.2rem", color: "#444", margin: "0 0 32px" }}>
          This is to certify that
        </p>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            color: "#222",
            marginBottom: "16px"
          }}
        >
          {user.firstname + " " + user.lastname}
        </div>
        <p style={{ fontSize: "1.1rem", color: "#444", margin: "0 0 32px" }}>
          has successfully completed the course requirements.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "48px"
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                borderTop: "2px solid #6c47ff",
                width: "180px",
                marginBottom: "4px"
              }}
            ></div>
            <div style={{ fontWeight: 500, color: "#6c47ff" }}>{course?.instructor.firstname + " " + course?.instructor.lastname}</div>
            <div style={{ fontSize: "0.95rem", color: "#888" }}>Instructor</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 500, color: "#6c47ff" }}>{date}</div>
            <div style={{ fontSize: "0.95rem", color: "#888" }}>Date</div>
          </div>
        </div>
      </div>
    </div>
  );
}