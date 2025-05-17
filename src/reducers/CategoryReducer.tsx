import { IFInitialCategory, Category, ErrorResponse } from "../contexts/CategoryContext";

export interface IFAction {
    type: string,
    ids?: string[],
    payload?: Category[] | null,
    pagination?: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number,
    }
    message?: string | ErrorResponse[],
    status?: number
}

export const CategoryReducer = (state:IFInitialCategory, action:IFAction) => {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, response: "", status: 0 };
        case "FETCH_SUCCESS":
            return {
                ...state,
                loading: false,
                status: action.status ?? 0,
                categories: action.payload ?? [],
                response: action.message ?? "",
                pagination: action.pagination ?? null
            };
        case "FETCH_ERROR":
            return {
                ...state,
                loading: false,
                status: action.status ?? 0,
                categories: action.payload ?? [],
                response: action.message ?? "",
                pagination: action.pagination ?? null
            };
        case "CLEAR_RESPONSE":
            return { ...state, response: "" };
        default:
            return state;
    }
}