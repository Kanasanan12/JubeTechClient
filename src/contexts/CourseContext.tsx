import axios from "axios";
import { getToken } from "../services/authorize";
import { CourseReducer, IFAction } from "../reducers/CourseReducer";
import { createContext, useContext, useReducer, useEffect } from "react";
import { IFSearchCourse as SearchCourseProp } from "../components/Tutor/course/CourseManage";

/* Interface & Type Section */
export interface CourseCard {
    _id: string,
    thumbnail: string,
    title: string,
    description: string,
    price: number,
    group_ids: {
        name: string
    }[],
    status: string,
    rating: number,
    instructor: {
        firstname: string,
        lastname: string
    },
    level: string,
    slug: string,
    createdAt: string | Date
}
export interface CourseDetail extends CourseCard {
    objectives: string[],
    section_ids: {
        _id: string,
        title: string,
        lesson_ids: {
            _id: string,
            name: string,
            type: string,
            duration: number,
            order: number,
            isFreePreview: boolean
        }[]
    }[],
    status: string,
    note: string,
    pretest: { title: string } | null,
    posttest: { title: string } | null
}
export interface FullCourse extends CreateCourse {
    //
}
export interface IFInitialCourse {
    courses: CourseCard[],
    full_courses: FullCourse[],
    course_edit: FullCourse | null,
    course_detail: CourseDetail | null,
    loading: boolean,
    response: string | ResponseError[],
    status: number,
    pagination: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number,
    } | null,
}
export interface ResponseError {
    path: (string | number)[],
    message: string
}
export interface CreateCourse {
    thumbnail: string,
    title: string,
    usePoint: boolean,
    price: number,
    point: number,
    objectives: string[],
    status: string,
    useCertificate: boolean,
    duration: number,
    level: string,
    pretest: string | null,
    posttest: string | null,
    description: string,
    note: string,
    group_ids: string[],
    section_ids: string[],
}
export interface IFSearchCourse {
    title: string,
    rating: number,
    duration: number,
    group_ids: string[],
    minPrice: number,
    maxPrice: number,
    minPoint: number,
    maxPoint: number,
    sort: {
        [key: string]: 1 | -1
    }
}
export type SortField = "rating" | "student_enrolled" | "price" | "point" | "updatedAt";
export interface IFCourseContext {
    state: IFInitialCourse,
    dispatch: React.Dispatch<IFAction>,
    fetchAllCourses: (message:string) => Promise<void>,
    fetchCourseByTutor: (message:string, searchCourse:SearchCourseProp) => Promise<void>,
    paginationCourse: (message:string, searchCourse:IFSearchCourse) => Promise<void>,
    fetchCourseBySlug: (message:string, slug:string) => Promise<void>,
    fetchCourseById: (course_id:string) => Promise<void>,
    createCourse: (course:CreateCourse, searchCourse:SearchCourseProp) => Promise<void>,
    updateCourse: (course_id:string, course:CreateCourse, searchCourse:SearchCourseProp) => Promise<void>,
    deleteCourse: (course_id:string, searchCourse:SearchCourseProp) => Promise<void>
}
/* End Section */

const CourseContext = createContext<IFCourseContext | null>(null);
const InitialCourse:IFInitialCourse =  {
    courses: [],
    full_courses: [],
    course_edit: null,
    course_detail: null,
    loading: false,
    response: "",
    status: 0,
    pagination: null,
}

export const CourseProvider = ({ children }:{ children:React.ReactNode }) => {
    const [state, dispatch] = useReducer(CourseReducer, InitialCourse);
    
    useEffect(() => {
        //
    }, [state]);

    const fetchAllCourses = async(message:string = "") => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/all`);
            dispatch({ type: "FETCH_SUCCESS", payload: { courseLists: response.data.data }, message: message, status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const fetchCourseByTutor = async(message:string = "", searchCourse:SearchCourseProp) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/tutor`, {
                params: {...searchCourse},
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: { courseLists: response.data.data }, message: message, status: response.status, pagination: response.data.pagination });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const paginationCourse = async(message:string = "", searchCourse:IFSearchCourse) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/pagination`, {
                params: {...searchCourse}
            });
            dispatch({ type: "FETCH_ERROR", payload: { courseLists: response.data }, message: message, status: response.status, pagination: response.data.pagination });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const fetchCourseBySlug = async(message:string = "", slug:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/slug/${slug}`);
            dispatch({ type: "FETCH_SUCCESS", payload: { courseDetail: response.data }, message: message, status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const fetchCourseById = async(course_id:string) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/id/${course_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: { editCourse: response.data.data }, message: "", status: response.status })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const createCourse = async(course:CreateCourse, searchCourse:SearchCourseProp) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/course/create`, { ...course }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            await fetchCourseByTutor(response.data.message, searchCourse);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const updateCourse = async(course_id:string, course:CreateCourse, searchCourse:SearchCourseProp) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/course/update/${course_id}`, {...course}, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            await fetchCourseByTutor(response.data.message, searchCourse);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    const deleteCourse = async(course_id:string, searchCourse:SearchCourseProp) => {
        try {
            dispatch({ type: "FETCH_START", message: "", status: 0 });
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/course/delete/${course_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            await fetchCourseByTutor(response.data.message, searchCourse);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status  })
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404  });
            }
        }
    }

    return (
        <CourseContext.Provider value={{ state, dispatch, fetchAllCourses, fetchCourseByTutor, paginationCourse, fetchCourseBySlug, fetchCourseById, createCourse, updateCourse, deleteCourse }}>
            {children}
        </CourseContext.Provider>
    );
}

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) throw new Error("useCourse must be used within CourseProvider");
    return context;
}