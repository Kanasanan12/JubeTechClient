import { IFInitialQuestion, Question, ErrorResponse } from "../contexts/QuestionContext"

export interface IFAction {
    type: string,
    status: number,
    payload?: Question[],
    message?: string | ErrorResponse[]
}

export const QuestionReducer = (state:IFInitialQuestion, action:IFAction) => {
    switch (action.type) {
        case "FETCH_START":
                return { ...state, loading: true, response: "", status: 0 };
        case "FETCH_SUCCESS":
            if (action.payload && action.payload.length > 0) {
                return {
                    ...state,
                    questions: action.payload,
                    loading: false,
                    response: action.message ?? "",
                    status: action.status ?? 0
                };
            }
            return {...state, questions: [], response: "", status: 0, loading: false };
        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                response: action.message ?? "",
                status: action.status ?? 0
            };
        case "CLEAR_RESPONSE":
            return { ...state, response: "", status: 0 };
        default:
            return state;
    }
}