import { IFToggleSidebar } from "../app";
import { useState, useEffect } from "react";
import { checkRole } from "../services/authorize";
import MainDashboard from "../layouts/MainDashboard";
import { ExamProvider } from "../contexts/ExamContext";
import ExamTable from "../components/Tutor/exam/ExamTable";

import "../assets/css/exam/main-exam.css";

export default function ExamManagement({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {
    // state
    const [startExam, setStartExam] = useState<boolean>(true);

    // effect
    useEffect(() => {
        const verifyRole = async() => {
            const roles = await checkRole();
            if (!roles.includes("Tutor")) window.location.href = "/";
        }
        verifyRole();
    }, []);

    // render
    return (
        <MainDashboard
            title="Exam Management"
            title_sidebar="จัดการแบบทดสอบ"
            toggleSidebar={toggleSidebar}
            setToggleSidebar={setToggleSidebar}
        >
            <ExamProvider>
                <div className="main-exam-container">
                    <ExamTable startExam={startExam} setStartExam={setStartExam} />
                </div>
            </ExamProvider>
        </MainDashboard>
    );
}