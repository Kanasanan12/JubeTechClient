import { Lesson, IFInitialLesson, ErrorResponse } from "../contexts/LessonContext"

export interface IFAction {
    type: string,
    payload?: {
        normalLesson?: Lesson[],
        editLesson?: Lesson
    },
    _id?:string,
    message: string | ErrorResponse[],
    status?: number,
    pagination?: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number
    }
}

export const LessonReducer = (state:IFInitialLesson, action:IFAction) => {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, response: "", status: 0 };
        case "FETCH_SUCCESS":
            if (action.payload) {
                const data = action.payload;
                if (data.normalLesson && data.normalLesson.length > 0) {
                    return {
                        ...state,
                        lessons: data.normalLesson ?? [],
                        editLesson: null,
                        loading: false,
                        response: action.message ?? "",
                        status: action.status ?? 0,
                        pagination: action.pagination ?? null,
                    }
                } else if (data.editLesson) {
                    return {
                        ...state,
                        editLesson: data.editLesson ?? null,
                        loading: false,
                        response: action.message ?? "",
                        status: action.status ?? 0
                    }
                } else {
                    return {...state, loading: false};
                }
            } else {
                return {...state, loading: false};
            }
        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                response: action.message ?? "",
                status: action.status ?? 0
            }
        case "DELETE_LESSON":
            const oldLesson = state.lessons;
            return {
                ...state,
                lessons: oldLesson.filter(lesson => lesson._id !== action._id),
                response: action.message ?? "",
                status: action.status ?? 0,
                loading: false
            };
        case "CLEAR_SUB_FILE":
            if (state.editLesson !== null) {
                const newSubfile = { ...state.editLesson };
                newSubfile.sub_file = [];
                return { ...state, editLesson: newSubfile };
            } else {
                return {...state};
            }
        case "CLEAR_EDIT":
            return { ...state, editLesson: null };
        case "CLEAR_RESPONSE":
            return { ...state, response: "", status: 0 };
        default:
            return state
    }
}