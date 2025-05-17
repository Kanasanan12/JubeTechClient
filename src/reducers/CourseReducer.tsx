import { CourseCard, CourseDetail, FullCourse, ResponseError, IFInitialCourse, CreateCourse } from "../contexts/CourseContext"

export interface IFAction {
    type: string,
    payload?: {
        courseLists?: CourseCard[],
        courseDetail?: CourseDetail,
        fullCourses?: FullCourse[],
        editCourse?: FullCourse
    },
    pagination?: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number,
    },
    deleteIds?: string[],
    message: string | ResponseError[],
    status?: number
}

export const CourseReducer = (state:IFInitialCourse, action:IFAction) => {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, response: "", status: 0 };
        case "FETCH_SUCCESS":
            if (action.payload) {
                if (action.payload.courseLists) {
                    return { 
                        ...state,
                        courses: action.payload.courseLists,
                        loading: false,
                        status: action.status ?? 0,
                        response: action.message ?? "",
                        pagination: action.pagination ?? null
                    }
                } else if (action.payload.fullCourses) {
                    return { 
                        ...state,
                        full_courses: action.payload.fullCourses,
                        loading: false,
                        status: action.status ?? 0,
                        response: action.message ?? "",
                        pagination: action.pagination ?? null
                    }
                } else if (action.payload.courseDetail) {
                    return { 
                        ...state,
                        course_detail: action.payload.courseDetail,
                        loading: false,
                        status: action.status ?? 0,
                        response: action.message ?? "",
                    }
                } else if (action.payload.editCourse) {
                    return { 
                        ...state,
                        course_edit: action.payload.editCourse,
                        loading: false,
                        status: action.status ?? 0,
                        response: action.message ?? "",
                    }
                } else {
                    return state;
                }
            } else {
                return state;
            }
        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                response: action.message ?? "",
                status: action.status ?? 0,
            }
        case "CLEAR_RESPONSE":
            return { ...state, response: "" };
        case "CLEAR_EDIT":
            return {...state, course_edit: null};
        default:
            return state;
    }
}