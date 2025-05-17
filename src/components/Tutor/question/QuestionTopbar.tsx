import {
    BsPlus,
    BsChevronLeft,
    BsX
} from "react-icons/bs";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExam } from "../../../contexts/ExamContext";
import { useQuestion, IFCreateQuestion } from "../../../contexts/QuestionContext";

interface QuestionTopbarProp {
    examId: string,
    searchQuestion: string,
    setSearchQuestion: React.Dispatch<React.SetStateAction<string>>,
    setIsUpdate: React.Dispatch<React.SetStateAction<boolean>>,
    toggleBackModal: boolean,
    setToggleBackModal: React.Dispatch<React.SetStateAction<boolean>>,
}

const createQuestionData:IFCreateQuestion = {
    question: "Enter your question!",
    question_image: "",
    type: "open_ended",
    choices: [],
    test_case: [],
    has_solution: false,
    solution: "",
}

export default function QuestionTopbar({ examId, searchQuestion,setIsUpdate, setSearchQuestion, toggleBackModal, setToggleBackModal }:QuestionTopbarProp) {
    // dom
    const navigate = useNavigate();

    // context
    const { createQuestion } = useQuestion();
    const { state, fetchExamById } = useExam();

    useEffect(() => {
        if (examId) {
            fetchExamById(examId);
        }
    }, [examId]);
    return (
        <div className="question-manage-topbar">
            {toggleBackModal && (
                <div className="confirm-back-modal">
                    <div className="confirm-back-content">
                        <div className="confirm-back-header">
                            <span>Reminder to update the information</span>
                            <button onClick={() => setToggleBackModal(false)}>
                                <i><BsX size={25} /></i>
                            </button>
                        </div>
                        <div className="confirm-back-body">
                            <span>
                                Going back without updating may result in data loss. Would you like to update before proceeding?
                            </span>
                            <div className="confirm-back-btn">
                                <button
                                    onClick={() => navigate("/dashboard/exam-management")}
                                    className="cancel-update-question"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsUpdate(true)}
                                    className="confirm-update-question"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {state.loading ? 
                ""
                :
                <>
                    {state.exams.length > 0 ? 
                        <>
                            <div className="back-exam-page">
                                <button onClick={() => setToggleBackModal(!toggleBackModal)}>
                                    <i><BsChevronLeft size={20} /></i>
                                    <span>Go back</span>
                                </button>
                            </div>
                            <div className="exam-title">
                                <p>
                                    <span>📝</span>
                                    {state.exams[0].title}
                                </p>
                            </div>
                            <div className="question-option">
                                <div className="search-question-input">
                                    <input
                                        type="text"
                                        value={searchQuestion}
                                        placeholder="Search question..."
                                        onChange={(e) => setSearchQuestion(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="create-question-btn"
                                    onClick={async() => await createQuestion(examId, createQuestionData)}
                                >
                                    <i><BsPlus size={20} /></i>
                                    Create question
                                </button>
                                <button
                                    className="save-question"
                                    onClick={() => setIsUpdate(true)}
                                >
                                    Save
                                </button>
                            </div>
                        </>
                        :
                        ""
                    }
                </>
            }
        </div>
    );
}