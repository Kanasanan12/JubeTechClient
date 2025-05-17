import axios from "axios";
import { getToken } from "../services/authorize";
import { GroupReducer, IFAction } from "../reducers/GroupReducer";
import { createContext, useContext, useReducer, useEffect } from "react";

/* Interface Section */
export interface Group {
    _id: string,
    name: string,
    updatedAt: Date
}
export interface ErrorResponse {
    path: (string | number)[],
    message: string
}
export interface GroupState {
    groups: Group[],
    loading: boolean,
    response: string | ErrorResponse[],
    status: number
}
interface IFGroupContext {
    state: GroupState,
    fetchAllGroups: (message:string) => Promise<void>,
    dispatch: React.Dispatch<IFAction>;
    fetchGroupById: (group_id: string) => Promise<void>,
    createGroups: (groups: { name: string }[]) => Promise<void>,
    updateGroup: (group_id:string, name:string) => Promise<void>,
    deleteGroups: (group_ids:string[]) => Promise<void>,
}
/* End Section */

// create group context
const GroupContext = createContext<IFGroupContext | null>(null);
const initialGroup:GroupState = {
    groups: [],
    loading: false,
    response: "",
    status: 0
}

export const GroupProvider = ({ children }:{ children:React.ReactNode }) => {
    const [state, dispatch] = useReducer(GroupReducer, initialGroup);

    useEffect(() => {
        //
    }, [state]);

    const fetchAllGroups = async(message:string = "") => {
        try {
            dispatch({ type: "FETCH_START", payload: null, message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/group/all`);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, message: message, status: response.status  });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", payload: null, message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", payload: null, message: "Something went wrong.", status: 404 });
            }
        }
    }

    const fetchGroupById = async(group_id:string) => {
        try {
            dispatch({ type: "FETCH_START", payload: null, message: "", status: 0 });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/group/id/${group_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, message: "",  status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", payload: null, message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", payload: null, message: "Something went wrong.", status: 404 });
            }
        }
    }

    const createGroups = async(groups:{ name: string }[]) => {
        try {
            dispatch({ type: "FETCH_START", payload: null, message: "", status: 0 });
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/group/create`, 
                { groups },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchAllGroups(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", payload: null, message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", payload: null, message: "Something went wrong.", status: 404 });
            }
        }
    }

    const updateGroup = async(group_id:string, name:string) => {
        try {
            dispatch({ type: "FETCH_START", payload: null, message: "", status: 0 });
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/group/update/${group_id}`,
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchAllGroups(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", payload: null, message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", payload: null, message: "Something went wrong.", status: 404 });
            }
        }
    }

    const deleteGroups = async(group_ids:string[]) => {
        try {
            dispatch({ type: "FETCH_START", payload: null, message: "", status: 0 });
            const response = await axios.request({
                method: "DELETE",
                url: `${import.meta.env.VITE_API_URL}/group/delete`,
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
                data: { group_ids }
            });
            dispatch({ type: "REMOVE_GROUP", ids: group_ids, payload: null, message: response.data.message, status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", payload: null, message: error.response?.data.message, status: error.response?.status as number });
            } else {
                dispatch({ type: "FETCH_ERROR", payload: null, message: "Something went wrong.", status: 404 });
            }
        }
    }

    return (
        <GroupContext.Provider value={{ state, fetchAllGroups, fetchGroupById, createGroups, updateGroup, deleteGroups, dispatch }}>
            {children}
        </GroupContext.Provider>
    );
}

export const useGroup = () => {
    const context = useContext(GroupContext);
    if (!context) throw new Error("useGroup must be used within GroupProvider");
    return context;
}