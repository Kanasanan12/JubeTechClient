import axios from "axios";
import { getToken } from "../services/authorize";
import { QuestionReducer, IFAction } from "../reducers/QuestionReducer";
import { createContext, useContext, useReducer, useEffect } from "react";

/* Type & Interface */
export interface Question {
    _id: string,
    question: string,
    question_image: string,
    type: "multiple_choice" | "coding" | "open_ended",
    choices: string[],
    test_case: {
        stdin: string,
        stdout: string
    }[],
    has_solution: boolean,
    solution: string,
    updatedAt: string | Date
}

export interface ErrorResponse {
    path: (string | number)[],
    message: string
}

export interface IFCreateQuestion {
    question: string,
    question_image: string,
    type: "multiple_choice" | "coding" | "open_ended",
    choices: string[],
    test_case: {
        stdin: string,
        stdout: string
    }[],
    has_solution: boolean,
    solution: string,
}

export interface IFInitialQuestion {
    questions: Question[],
    status: number,
    loading: boolean,
    response: string | ErrorResponse[],
}

interface IFQuestionContext {
    state: IFInitialQuestion,
    dispatch: React.Dispatch<IFAction>,
    fetchQuestionFromExamId: (message:string, exam_id:string) => Promise<void>,
    createQuestion: (exam_id:string, question:IFCreateQuestion) => Promise<void>,
    updateQuestion: (questions:Question[], exam_id:string) => Promise<void>,
    deleteQuestion: (question_id:string, exam_id:string) => Promise<void>,
    updateOneQuestion: (question:Question, exam_id:string) => Promise<void>
}
/* End section */

const QuestionContext = createContext<IFQuestionContext | null>(null);
const initialQuestion:IFInitialQuestion = {
    questions: [],
    status: 0,
    loading: false,
    response: ""
}

export const QuestionProvider = ({ children }:{ children:React.ReactNode }) => {
    // reducer
    const [state, dispatch] = useReducer(QuestionReducer, initialQuestion);

    useEffect(() => {
        //
    }, [state]);

    // function
    const fetchQuestionFromExamId = async(message:string = "", exam_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/exam/id/${exam_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data[0].question_ids, message, status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const createQuestion = async(exam_id:string, question:IFCreateQuestion) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/question/create`,
                { ...question, exam_id },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            await fetchQuestionFromExamId(response.data.message, exam_id);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const updateQuestion = async(questions:Question[], exam_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/question/update/`,
                { questions, exam_id },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchQuestionFromExamId(response.data.message, exam_id);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const updateOneQuestion = async(question:Question, exam_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/question/update/${question._id}`,
                { ...question },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchQuestionFromExamId(response.data.message, exam_id);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const deleteQuestion = async(question_id:string, exam_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/question/delete/${question_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    },
                    params: { exam_id }
                }
            );
            fetchQuestionFromExamId(response.data.message, exam_id);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    return (
        <QuestionContext.Provider value={{ state, dispatch, fetchQuestionFromExamId, createQuestion, updateQuestion, deleteQuestion, updateOneQuestion }}>
            {children}
        </QuestionContext.Provider>
    );
}

export const useQuestion = () => {
    const context = useContext(QuestionContext);
    if (!context) throw new Error("useQuestion must be used within QuestionProvider");
    return context;
}