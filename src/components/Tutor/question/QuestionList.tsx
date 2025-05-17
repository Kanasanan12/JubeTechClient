import {
    BsPlus,
    BsCopy,
    BsTrash3,
    BsThreeDots,
    BsGrid3X2GapFill
} from "react-icons/bs";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Popover, Select } from "antd";
import { useState, useEffect } from "react";
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from "react-router-dom";
import { ReactSortable } from "react-sortablejs";
import QuestionSkeleton from "./QuestionSkeleton";
import { getToken } from "../../../services/authorize";
import UploadImageQuestion from "./UploadImageQuestion";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { fetchFileFromStorage, deleteFile } from "../../../services/storage";
import { ResponseMessage, ToastMessageContainer } from "../../ToastMessageContainer";
import { useQuestion, Question, IFCreateQuestion } from "../../../contexts/QuestionContext";

import NoImage from "../../../assets/img/no image.jpg"
import "../../../assets/css/question/question-list.css";

interface QuestionData extends Question {
    id: string,
    name: string
}

interface QuestionListProp {
    examId: string,
    searchQuestion:string,
    isUpdate: boolean,
    toggleBackModal: boolean,
    setIsUpdate: React.Dispatch<React.SetStateAction<boolean>>
}

interface SelectType {
    label: string,
    value: string
}

interface ProgrammingLanguage {
    id: number,
    name: string,
    is_archived: boolean
}

const questionType:SelectType[] = [
    {
        label: "None",
        value: ""
    },
    {
        label: "Multiple Choice",
        value: "multiple_choice"
    },
    {
        label: "Coding",
        value: "coding"
    },
    {
        label: "Open Ended",
        value: "open_ended"
    }
];

interface IFImageQuestion {
    name: string,
    file: File
}

interface IFPreviewImage {
    _id: number | string,
    path: string,
    url: string
}

export default function QuestionList({ examId, searchQuestion, isUpdate, setIsUpdate, toggleBackModal }:QuestionListProp) {
    // context
    const { state, fetchQuestionFromExamId, deleteQuestion, updateQuestion, updateOneQuestion, createQuestion } = useQuestion();

    // navigate
    const navigate = useNavigate();

    // firebase
    const auth = getAuth();

    // state
    const [isRender, setIsRender] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [deleteFocus, setDeleteFocus] = useState<string>("");
    const [updateFocus, setUpdateFocus] = useState<string>("");
    const [currentFocus, setCurrentFocus] = useState<string>("");
    const [updateOnce, setUpdateOnce] = useState<boolean>(false);
    const [prepareImage, setPrepareImage] = useState<boolean>(false);
    const [currentDropdown, setCurrentDropdown] = useState<string>("");
    const [languageData, setLanguageData] = useState<SelectType[]>([]);
    const [questionData, setQuestionData] = useState<QuestionData[]>([]);
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);
    const [uploadImages, setUploadImages] = useState<IFImageQuestion[]>([]);
    const [previewImages, setPreviewImages] = useState<IFPreviewImage[]>([]);
    const [duplicateData, setDuplicateData] = useState<QuestionData>({
        id: "",
        name: "",
        _id: "",
        question: "",
        question_image: "",
        type: "open_ended",
        choices: [],
        test_case: [],
        has_solution: false,
        solution: "",
        updatedAt: ""
    });

    // effect
    useEffect(() => {
        setIsRender(false);
        const trackauth = onAuthStateChanged(auth, (user) => {
            if (user && examId.trim() !== "") {
                fetchLanguage();
                fetchQuestionFromExamId("", examId);
            }
        });
    
        return () => trackauth();
    }, [examId]);

    useEffect(() => {
        if (state.questions.length > 0 && searchQuestion.trim() === "") {
            setQuestionData(state.questions.map((question, _index) => {
                if (question.question_image.trim() !== "") {
                    setPreviewImages((prev) => [...prev, {
                        _id: question._id,
                        path: question.question_image,
                        url: ""
                    }]);
                }
                return {
                    ...question,
                    id: uuidv4(),
                    name: question.question
                }
            }));
            setPrepareImage(true);
        } else {
            setQuestionData([]);
            setPrepareImage(true);
        }
    }, [state.questions]);

    useEffect(() => {
        if (searchQuestion.trim() !== "") {
            const filterData = questionData.filter(
                question => question.question.toLowerCase().includes(searchQuestion.toLowerCase())
            );
            setQuestionData(filterData.map(question => {
                return {
                    ...question,
                    id: uuidv4(),
                    name: question.question
                }
            }));
        } else {
            setQuestionData(state.questions.map((question) => {
                return {
                    ...question,
                    id: uuidv4(),
                    name: question.question
                }
            }));
        }
    }, [searchQuestion]);

    useEffect(() => {
        if (state.response) {
            if (Array.isArray(state.response)) {
                state.response.map((error) => {
                    const response:ResponseMessage = {
                        status: state.status,
                        message: error.message + " , value : " + error.path
                    }
                    setMessageList(prev => [...prev, response]);
                });
            } else {
                const response:ResponseMessage = {
                    status: state.status,
                    message: state.response
                }
                setMessageList(prev => [...prev, response]);
            }
            setTimeout(() => {
                setMessageList((prev) => prev.slice(1));
            }, 2000);
        }
    }, [state.response]);

    useEffect(() => {
        const processEffect = async () => {
            const allUrlsReady = previewImages.every(img => img.url && img.url.trim() !== "");
            if (previewImages.length > 0 && !allUrlsReady) {
                await prepareRenderImage();
            } else if (!prepareImage || previewImages.length === 0) {
                setIsRender(true);
            }

            if (isUpdate) {
                await modifyAllQuestion();
            }

            if (updateOnce && updateFocus.trim() !== "") {
                await modifyOneData();
            } else if (!updateOnce) {
                setUpdateFocus("");
            }
        };
        processEffect();
    }, [prepareImage, updateOnce, isUpdate, previewImages]);

    // dom
    document.addEventListener("mousemove", (e) => {
        const scrollMargin = 50;
        const scrollSpeed = 10;
    
        if (e.clientY < scrollMargin) {
            window.scrollBy(0, -scrollSpeed);
        } else if (e.clientY > window.innerHeight - scrollMargin) {
            window.scrollBy(0, scrollSpeed);
        }
    });

    // function
    const handleFocus = (key:string) => {
        if (currentFocus === key) {
            setCurrentFocus("");
        } else {
            scrollToSection(key);
            setCurrentFocus(key);
        }
    }

    const scrollToSection = (id: string) => {
        const card = document.getElementById(id);
        if (card) {
            card.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleQuestion = (target:string, key:string, value:string | boolean) => {
        setQuestionData((prev) => {
            return prev.map((question) => (question._id === target ? { ...question, [key]:value } : question));
        });

        if (key === "type") {
            setQuestionData((prev) => {
                return prev.map((question) => (question._id === target ? {...question} : question));
            });
        }

        if (key === "type" && value === "open_ended") {
            setQuestionData((prev) => {
                return prev.map((question) => (question._id === target ? {...question, has_solution: false} : question));
            });
        }
    }

    const handleChoice = (target:string, currentIndex:number, value:string) => {
        const radio_check = document.getElementById("choice" + currentIndex) as HTMLInputElement;
        if (radio_check.checked) {
            handleQuestion(target, "solution", value);
        }
        setQuestionData(prev =>
            prev.map(question => {
                if (question._id === target) {
                    const updatedChoices = question.choices.map((choice, index) =>
                    index === currentIndex ? value : choice
                    );
                    return {
                    ...question,
                    choices: updatedChoices,
                    };
                }
                return question;
            })
        );
    }

    const handleCase = (target:string, currentIndex:number, type:string, value:string) => {
        setQuestionData(prev =>
            prev.map(question => {
                if (question._id === target) {
                    const updatedCase = question.test_case.map((testcase, index) =>
                    index === currentIndex ? {...testcase, [type]: value} : testcase
                    );
                    return {
                    ...question,
                    test_case: updatedCase,
                    };
                }
                return question;
            })
        );
    }

    const addChoice = (target:string) => {
        const currentData = questionData.filter((question) => question._id === target);
        if (currentData[0].choices.length < 5) {
            setQuestionData((prev) => {
                return prev.map((question) => (question._id === target ? { ...question, choices: [...question.choices, ""] } : question));
            });
        }
    }

    const removeChoice = (target:string, currentIndex:number) => {
        const currentData = questionData.filter((question) => question._id === target);
        const radio_check = document.getElementById("choice" + currentIndex) as HTMLInputElement;
        if (radio_check.checked) handleQuestion(target, "solution", "");
        if (currentData[0].choices.length > 0) {
            const result = currentData[0].choices.filter((_choice, index) => index !== currentIndex);
            setQuestionData((prev) => {
                return prev.map((question) => (question._id === target ? { ...question, choices: result } : question));
            });
        }
    }

    const addCase = (target:string) => {
        const currentData = questionData.filter((question) => question._id === target);
        if (currentData[0].test_case.length < 4) {
            setQuestionData((prev) => {
                return prev.map((question) => (question._id === target ? { ...question, test_case: [...question.test_case, { stdin: "", stdout: "" }] } : question));
            });
        }
    }

    const removeCase = (target:string, currentIndex:number) => {
        const currentData = questionData.filter((question) => question._id === target);
        if (currentData[0].test_case.length > 0) {
            const result = currentData[0].test_case.filter((_testcase, index) => index !== currentIndex);
            setQuestionData((prev) => {
                return prev.map((question) => (question._id === target ? { ...question, test_case: result } : question));
            });
        }
    }

    const fetchLanguage = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/coding/languages/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                setLanguageData(
                    response.data.data
                    .filter((language: ProgrammingLanguage) => ![1, 2, 46, 3, 47, 44, 25, 89, 43].includes(language.id))
                    .map((language: ProgrammingLanguage) => ({
                        label: language.name,
                        value: language.id.toString()
                    }))
                );
                setLanguageData((prev) => ([...prev, { label: "None", value: "" }]));
            } else {
                setLanguageData([]);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const response:ResponseMessage = {
                    status: error.response?.status ?? 0,
                    message: error.response?.data.message ?? "Something went wrong."
                }
                setMessageList(prev => [...prev, response]);
            } else {
                const response:ResponseMessage = {
                    status: 404,
                    message: "Something went wrong."
                }
                setMessageList(prev => [...prev, response]);
            }
        }
    }

    const prepareRenderImage = async () => {
        const updatedImages = await Promise.all(previewImages
            .filter((value, index, self) => 
                index === self.findIndex((t) => (
                    t._id === value._id
                ))
            ).map(async (preview_image) => {
                const fileurl = await fetchFileFromStorage(preview_image.path);
                return {
                    ...preview_image,
                    url: fileurl
                };
            })
        );
        setPreviewImages([...updatedImages]);
        setPrepareImage(false);
    };

    const modifyOneData = async() => {
        const updateData = questionData.find(
            question => question._id === updateFocus
        );
        const filterData:Question = {
            _id: updateData!._id,
            question: updateData!.question,
            question_image: updateData!.question_image,
            type: updateData!.type,
            choices: updateData!.choices,
            test_case: updateData!.test_case,
            has_solution: updateData!.has_solution,
            solution: updateData!.solution,
            updatedAt: updateData!.updatedAt
        }
        await updateOneQuestion(filterData, examId);
        setUpdateOnce(false);
    }

    const modifyAllQuestion = async() => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const filterQuestion: Question[] = questionData.map(({ _id, question, question_image, type, choices, test_case, has_solution, solution, updatedAt }) => ({
            _id, question, question_image, type, choices, test_case, has_solution, solution, updatedAt
        }));
        await updateQuestion(filterQuestion, examId);
        setIsUpdate(false);
    }

    const uniquePreviews = previewImages.filter(
        (value, index, self) =>
            index === self.findIndex((obj) => obj._id === value._id)
    );
    
    // render
    return (
        <>
            {isUpdate && (
                <div className="preload-update-question">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
            {messageList.length > 0 &&
                <ToastMessageContainer messageList={messageList} setMessageList={setMessageList} />
            }
            {isRender ?
                <>
                    <div className="question-list-container">
                        <div className="side-question-container">
                            <ReactSortable className="side-question-list" list={questionData} setList={setQuestionData}>
                                {questionData.map((question, index) => (
                                    <div
                                        key={index}
                                        onDoubleClick={() => handleFocus(question.id)}
                                        className={"side-question-card " + (currentFocus === question.id ? "active-side-card" : "")}
                                    >
                                        <div className="side-question-topbar">
                                            <div className="side-question-index">
                                                {index + 1}
                                            </div>
                                            <Popover
                                                placement="right"
                                                className="side-question-title"
                                                content={<span>Double click to focus!</span>}
                                            >
                                                {question.question.length > 23 ?
                                                    question.question.slice(0, 23) + "..."
                                                    :
                                                    question.question
                                                }
                                            </Popover>
                                        </div>
                                        <div className="side-question-footer">
                                            {question.type && (
                                                <div className="side-question-type">
                                                    {question.type.replace("_", " ")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>
                        <div className="question-list-content">
                            <ReactSortable list={questionData} setList={setQuestionData} className="question-list-content" handle=".drag-position">
                                {questionData.map((question, index) => (
                                    <div
                                        id={question.id}
                                        key={question.id}
                                        className={"question-manage-card " + (currentFocus === question.id ? "active-manage-card" : "")}
                                    >
                                        <button type="button" className="drag-position">
                                            <i>
                                                <BsGrid3X2GapFill />
                                            </i>
                                        </button>
                                        <div className="question-manage-header">
                                            <div className="question-manage-type">
                                                <Select
                                                    options={questionType}
                                                    defaultValue={question.type}
                                                    onChange={(selected) => handleQuestion(question._id, "type", selected)}
                                                />
                                            </div>
                                            <div className="question-manage-option">
                                                <button className="question-option" onClick={() => {
                                                    if (currentDropdown === question._id) {
                                                        setCurrentDropdown("");
                                                    } else {
                                                        setCurrentDropdown(question._id);
                                                    }
                                                }}>
                                                    <i><BsThreeDots /></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="question-manage-body">
                                            <div className="question-info-input">
                                                <div className="question-manage-info">
                                                    <label htmlFor="question-title">Question : </label>
                                                    <textarea
                                                        value={question.question}
                                                        onChange={(e) => handleQuestion(question._id, "question", e.target.value)}
                                                    ></textarea>
                                                    <span>{question.question.length}</span>
                                                </div>
                                                <div className="question-manage-image">
                                                    {question.question_image.trim() !== "" ? (
                                                        <>
                                                            {uniquePreviews.map((preview) => {
                                                                if (preview._id === question._id) {
                                                                    return (
                                                                        <div className="preview-img" key={preview._id}>
                                                                            <img
                                                                                className="preview-question-img"
                                                                                src={preview.url.trim() !== "" ? preview.url : NoImage}
                                                                            />
                                                                            <button
                                                                                className="remove-preview-img"
                                                                                onClick={async () => {
                                                                                    await deleteFile([state.questions[index].question_image]);
                                                                                    const removePrepare = previewImages.filter(prepare_img => prepare_img._id !== question._id);
                                                                                    setPreviewImages([...removePrepare]);
                                                                                    setUpdateFocus(question._id);
                                                                                    handleQuestion(question._id, "question_image", "");
                                                                                    setUpdateOnce(true);
                                                                                }}
                                                                            >
                                                                                <i><BsTrash3 size={18} /></i>
                                                                                Remove image
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })}
                                                        </>
                                                    ) : (
                                                        <UploadImageQuestion
                                                            currentIndex={index}
                                                            questionId={question._id}
                                                            previewImages={previewImages}
                                                            setUpdateOnce={setUpdateOnce}
                                                            setUpdateFocus={setUpdateFocus}
                                                            handleQuestion={handleQuestion}
                                                            setPreviewImages={setPreviewImages}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="main-body-question">
                                                {question.type === "multiple_choice" && (
                                                    <>
                                                        <form className="input-choice">
                                                            {question.choices.map((choice, index) => (
                                                                <div className="choice-info" key={index}>
                                                                    <input
                                                                        id={"choice" + index}
                                                                        name="choice-radio"
                                                                        type="radio"
                                                                        value={choice}
                                                                        checked={question.solution === choice}
                                                                        onChange={(e) => handleQuestion(question._id, "solution", e.target.value)}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={choice}
                                                                        onChange={(e) => handleChoice(question._id, index, e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeChoice(question._id, index)}
                                                                    >
                                                                        <i><BsTrash3 size={18} /></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </form>
                                                        <button
                                                            className="create-selection-btn"
                                                            onClick={() => addChoice(question._id)}
                                                        >
                                                            <i><BsPlus size={18} /></i>
                                                            Add selection
                                                        </button>
                                                    </>
                                                )}
                                                {question.type === "coding" && (
                                                    <>
                                                        <form className="code-input">
                                                            <div className="select-code">
                                                                <label htmlFor="code-language">
                                                                    Code language : 
                                                                </label>
                                                                <Select
                                                                    id="code-language"
                                                                    options={languageData}
                                                                    value={languageData.some((code) => String(code.value) === question.solution) ? question.solution : ""}
                                                                    onChange={(selected) => handleQuestion(question._id, "solution", selected)}
                                                                />
                                                            </div>
                                                            {question.test_case.map((testcase, index) => (
                                                                <div className="case-info" key={index}>
                                                                    {question.solution !== "82" && (
                                                                        <div className="stdin-input">
                                                                            <label htmlFor={"stdin-inp" + index}>stdin : </label>
                                                                            <input
                                                                                id={"stdin-inp" + index}
                                                                                type="text"
                                                                                value={testcase.stdin}
                                                                                onChange={(e) => handleCase(question._id, index, "stdin", e.target.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="stdout-input">
                                                                    <label htmlFor={"stdout-inp" + index}>stdout : </label>
                                                                        <input
                                                                            id={"stdout-inp" + index}
                                                                            type="text"
                                                                            value={testcase.stdout}
                                                                            onChange={(e) => handleCase(question._id, index, "stdout", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="delete-case-btn"
                                                                        onClick={() => removeCase(question._id, index)}
                                                                    >
                                                                        <i><BsTrash3 size={18} /></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {Number(question.solution) > 0 && (
                                                                <button
                                                                    className="create-case-btn"
                                                                    type="button"
                                                                    onClick={() => addCase(question._id)}
                                                                >
                                                                    <i><BsPlus size={18} /></i>
                                                                    Add case
                                                                </button>
                                                            )}
                                                        </form>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {currentDropdown === question._id && (
                                            <div className="question-dropdown">
                                                <ul>
                                                    <li onClick={async() => {
                                                        const filterData:IFCreateQuestion = questionData.filter(quest => quest._id === question._id).map(({ question, type, choices, test_case, has_solution, solution }) => ({
                                                            question, question_image: "", type, choices, test_case, has_solution, solution
                                                        }))[0]!;
                                                        await createQuestion(examId, filterData);
                                                        setCurrentDropdown("");
                                                    }}>
                                                        <i><BsCopy /></i>
                                                        <span>duplicate</span>
                                                    </li>
                                                    <li onClick={async() => {
                                                        await deleteFile([state.questions[index].question_image]);
                                                        const removePrepare = previewImages.filter(prepare_img => prepare_img._id !== question._id);
                                                        setPreviewImages([...removePrepare]);
                                                        await deleteQuestion(question._id, examId);
                                                        setCurrentDropdown("");
                                                    }}>
                                                        <i><BsTrash3 /></i>
                                                        <span>delete</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>
                    </div>
                </>
                :
                <QuestionSkeleton />
            }
        </>
    );
}