import { Exam, ErrorResponse, IFInitialExam } from "../contexts/ExamContext";

export interface IFAction {
    type: string,
    status: number,
    payload?: Exam[],
    pagination?: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number,
    },
    message?: string | ErrorResponse[],
}

export const ExamReducer = (state:IFInitialExam, action:IFAction) => {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, response: "", status: 0 };
        case "FETCH_SUCCESS":
            if (action.payload && action.payload.length > 0) {
                return {
                    ...state,
                    exams: action.payload,
                    loading: false,
                    response: action.message ?? "Fetch exam successfully.",
                    status: action.status ?? 0,
                    pagination: action.pagination ?? null
                };
            }
            return { ...state, exams: [], loading: false, response: action.message ?? "Fetch exam successfully.", status: action.status ?? 0, pagination: null };
        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                response: action.message ?? "Something went wrong.",
                status: action.status ?? 0
            };
        case "CLEAR_RESPONSE":
            return { ...state, response: "", status: 0 };
        default:
            return state;
    }
}