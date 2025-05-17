import { GroupState, Group, ErrorResponse } from "../contexts/GroupContext";

export interface IFAction {
    type: string,
    ids?: string[],
    payload: Group[] | null,
    message: string | ErrorResponse[],
    status: number,
}

export const GroupReducer = (state:GroupState, action:IFAction) => {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, response: "", status: 0 };
        case "FETCH_SUCCESS":
            if (action.payload !== null && action.payload.length > 0) {
                return { ...state, groups: action.payload, loading: false, response: action.message, status: action.status };
            }
            return { ...state, loading: false, response: action.message, status: action.status };
        case "FETCH_UNIQUE":
            if (action.payload !== null && action.payload.length > 0) {
                return { ...state, groups: action.payload, loading: false, response: action.message, status: action.status };
            }
            return { ...state, loading: false, response: action.message, status: action.status };
        case "REMOVE_GROUP":
            if (action.ids && action.ids.length > 0) {
                const filterGroups = state.groups.filter(group => !action.ids?.includes(group._id));
                return { ...state, groups: filterGroups, loading: false, response: action.message, status: action.status };
            }
            return { ...state, loading: false, response: action.message, status: action.status };
        case "FETCH_ERROR":
            return { ...state, loading: false, response: action.message, status: action.status };
        case "CLEAR_RESPONSE":
            return { ...state, response: "" }
        default:
            return state;
    }
}