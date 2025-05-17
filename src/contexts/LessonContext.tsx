import axios from "axios";
import { getToken } from "../services/authorize";
import { LessonReducer, IFAction } from "../reducers/LessonReducer";
import { createContext, useContext, useReducer, useEffect } from "react";

/* Interface & Type Section */
export interface LessonCard {
    _id: string,
    name: string,
    sub_file: string[],
    type: "lecture" | "video",
    isFreePreview: boolean,
    updatedAt: Date
}
export interface Lesson extends LessonCard {
    sub_file: string[],
    main_content: string,
    duration: number,
    createdBy: string,
    updatedBy: string,
    createdAt: Date,
}
export interface ErrorResponse {
    path: (string | number)[],
    message: string
}
export interface IFInitialLesson {
    lessons: Lesson[] | LessonCard[],
    editLesson: Lesson | null,
    loading: boolean,
    response: string | ErrorResponse[],
    status: number,
    pagination: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number
    } | null
}
export interface CreateLesson {
    name: string,
    type: "lecture" | "video" | "",
    sub_file: string[],
    main_content: string,
    duration: number,
    isFreePreview: boolean,
}
export interface UpdateLesson extends CreateLesson {
    lesson_id?: string
}
export interface IFSearchParam {
    name: string,
    type: "lecture" | "video" | "",
    isFreePreview: boolean | null,
    startDate: Date | string,
    endDate: Date | string,
    page: number,
    pageSize: number
}
export interface IFLessonContext {
    state: IFInitialLesson,
    dispatch: React.Dispatch<IFAction>,
    fetchLessonByTutor: (message:string, searchLesson:IFSearchParam) => Promise<void>,
    createLesson: (lesson:CreateLesson, searchLesson:IFSearchParam) => Promise<void>,
    fetchLessonById: (lesson_id:string) => Promise<void>,
    updateLesson: (lesson:UpdateLesson, searchLesson:IFSearchParam) => Promise<void>,
    deleteLesson: (lesson_id:string, searchLesson:IFSearchParam) => Promise<void>
}
/* End Section */

const LessonContext = createContext<IFLessonContext | null>(null);
const initialLesson:IFInitialLesson = {
    lessons: [],
    editLesson: null,
    loading: false,
    response: "",
    pagination: null,
    status: 0
}

export const LessonProvider = ({ children }:{ children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(LessonReducer, initialLesson);

    useEffect(() => {
        //
    }, [state]);

    const fetchLessonByTutor = async(message:string = "", searchLesson:IFSearchParam) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/lesson/filter`, {
                params: {...searchLesson},
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: { normalLesson: response.data.data }, message: message, status: response.status, pagination: response.data.pagination });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const createLesson = async(lesson:CreateLesson, searchLesson:IFSearchParam) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/lesson/create`, { ...lesson }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            fetchLessonByTutor(response.data.message, searchLesson);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const fetchLessonById = async(lesson_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/lesson/id/${lesson_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: { editLesson: response.data.data }, message: "", status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const updateLesson = async(lesson:UpdateLesson, searchLesson:IFSearchParam) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const lesson_id = lesson.lesson_id;
            delete lesson.lesson_id;
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/update/${lesson_id}`, { ...lesson }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            fetchLessonByTutor(response.data.message, searchLesson);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const deleteLesson = async(lesson_id:string, _searchLesson:IFSearchParam) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/lesson/delete/${lesson_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "DELETE_LESSON", _id: lesson_id, message: response.data.message, status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    return (
        <LessonContext.Provider value={{ state, dispatch, fetchLessonByTutor, fetchLessonById, createLesson, updateLesson, deleteLesson }}>
            {children}
        </LessonContext.Provider>
    );
}

export const useLesson = () => {
    const context = useContext(LessonContext);
    if (!context) throw new Error("useLesson must be used with in LessonProvider");
    return context;
}