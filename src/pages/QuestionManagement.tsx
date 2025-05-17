import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ExamProvider } from "../contexts/ExamContext";
import { QuestionProvider } from "../contexts/QuestionContext";
import QuestionList from "../components/Tutor/question/QuestionList";
import QuestionTopbar from "../components/Tutor/question/QuestionTopbar";

import "../assets/css/question/main-question.css";

export default function QuestionManagement() {

    // get exam id
    const { exam_id } = useParams();

    // state
    const [examId, setExamId] = useState<string>("");
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [searchQuestion, setSearchQuestion] = useState<string>("");
    const [toggleBackModal, setToggleBackModal] = useState<boolean>(false);

    // effect
    useEffect(() => {
        setExamId(exam_id ?? "");
    }, []);

    // function


    // render
    return (
        <ExamProvider>
            <QuestionProvider>
                <div className="main-question-container">
                    <QuestionTopbar
                        examId={examId}
                        toggleBackModal={toggleBackModal}
                        setToggleBackModal={setToggleBackModal}
                        searchQuestion={searchQuestion}
                        setIsUpdate={setIsUpdate}
                        setSearchQuestion={setSearchQuestion}
                    />
                    <QuestionList
                        examId={examId}
                        toggleBackModal={toggleBackModal}
                        isUpdate={isUpdate}
                        setIsUpdate={setIsUpdate}
                        searchQuestion={searchQuestion}
                    />
                </div>
            </QuestionProvider>
        </ExamProvider>
    );
}