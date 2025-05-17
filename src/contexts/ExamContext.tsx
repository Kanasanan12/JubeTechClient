import axios from "axios";
import { getToken } from "../services/authorize";
import type { SorterResult } from 'antd/es/table/interface';
import { ExamReducer, IFAction } from "../reducers/ExamReducer";
import { createContext, useContext, useReducer, useEffect } from "react";

/* Type & Interface */
export interface Exam {
    _id: string,
    title: string,
    description: string,
    random_question: boolean,
    updatedAt: Date | string,
    question_ids: string[],
}

export interface IFSearchExam {
    title: string,
    page: number,
    total: number,
    pageSize: number,
    totalPages: number,
}

export interface ErrorResponse {
    path: (string | number)[],
    message: string
}

export interface IFInitialExam {
    exams: Exam[],
    status: number,
    loading: boolean,
    response: string | ErrorResponse[],
    pagination: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number
    } | null
}

export interface IFCreateExam {
    title: string,
    description: string,
    random_question: boolean,
    question_ids: string[],
}

interface IFExamContext {
    state: IFInitialExam,
    dispatch: React.Dispatch<IFAction>,
    fetchManyExams: (message:string, title?:string, page?:number, pageSize?:number, sortField?:SorterResult<any>['field'], sortOrder?:SorterResult<any>['order']) => Promise<void>,
    fetchExamById: (exam_id:string) => Promise<void>,
    createExam: (exam:IFCreateExam) => Promise<void>,
    updateExam: (exam_id:string, exam:IFCreateExam) => Promise<void>,
    deleteExam: (exam_id:string) => Promise<void>
}
/* End section */

const ExamContext = createContext<IFExamContext | null>(null);
const initialExam:IFInitialExam = {
    exams: [],
    status: 0,
    loading: false,
    response: "",
    pagination: null
}

export const ExamProvider = ({ children }:{ children: React.ReactNode }) => {
    // reducer
    const [state, dispatch] = useReducer(ExamReducer, initialExam);
    // effect
    useEffect(() => {
        //
    }, [state]);
    
    // function
    const fetchManyExams = async(message:string = "", title:string = "", page:number = 1, pageSize:number = 10, sortField:SorterResult<any>['field'] = "title", sortOrder:SorterResult<any>['order'] = "ascend") => {
        try {
            dispatch({ type: "FETCH_START", message: "" ,status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/exam/all`, {
                params: { title, page, pageSize, sortField, sortOrder },
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, message, status: response.status, pagination: response.data.pagination  });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const fetchExamById = async(exam_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "" ,status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/exam/id/${exam_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, status: response.status  });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const createExam = async(exam:IFCreateExam) => {
        try {
            dispatch({ type: "FETCH_START", message: "" ,status: 0 });
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/exam/create`,
                { ...exam },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchManyExams(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const updateExam = async(exam_id:string, exam:IFCreateExam) => {
        try {
            dispatch({ type: "FETCH_START", message: "" ,status: 0 });
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/exam/update/${exam_id}`,
                { ...exam },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchManyExams(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const deleteExam = async(exam_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "" ,status: 0 });
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/exam/delete/${exam_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            fetchManyExams(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    // render
    return (
        <ExamContext.Provider value={{ state, dispatch, fetchManyExams, fetchExamById, createExam, updateExam, deleteExam }}>
            {children}
        </ExamContext.Provider>
    );
}

export const useExam = () => {
    const context = useContext(ExamContext);
    if (!context) throw new Error("useExam must be used within ExamProvider");
    return context;
}