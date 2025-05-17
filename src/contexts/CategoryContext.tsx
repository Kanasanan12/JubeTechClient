import axios from "axios";
import { getToken } from "../services/authorize";
import { CategoryReducer, IFAction } from "../reducers/CategoryReducer";
import { createContext, useContext, useReducer, useEffect } from "react";

/* Interface Section */
export interface Category {
    _id: string,
    name: string,
    group_ids: {
        _id: string,
        name: string
    }[],
    updatedAt: Date | string
}
export interface ErrorResponse {
    path: (string | number)[],
    message: string
}
export interface IFInitialCategory {
    categories: Category[],
    loading: boolean,
    response: string | ErrorResponse[],
    status: number,
    pagination: {
        total: number,
        page: number,
        pageSize: number,
        totalPages: number,
    } | null
}
export interface CreateCategories {
    name: string,
    group_ids: string[]
}
export interface IFSearchParam {
    name: string,
    startDate: string | Date,
    endDate: string | Date,
    page: number,
    pageSize: number,
    group_ids: number[]
}
interface IFCategoryContext {
    state: IFInitialCategory,
    dispatch: React.Dispatch<IFAction>,
    createCategories: (categories:CreateCategories[]) => Promise<void>,
    fetchAllCategories: (message:string) => Promise<void>,
    fetchPaginationCategories: (page:number, pageSize:number) => Promise<void>,
    fetchcategoryById: (category_id:string) => Promise<void>,
    searchCategories: (searchParam:IFSearchParam) => Promise<void>,
    updateCategory: (category_id:string, name:string, group_ids:string[]) => Promise<void>,
    deleteCategories: (category_ids:string[]) => Promise<void>,
}
/* End Section */

const CategoryContext = createContext<IFCategoryContext | null>(null);
const initialCategory:IFInitialCategory = {
    categories: [],
    loading: false,
    response: "",
    status: 0,
    pagination: null
}

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(CategoryReducer, initialCategory);

    useEffect(() => {
        //
    }, [state]);

    const fetchAllCategories = async(message:string = "") => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/category/all`);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, message: message, status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const fetchPaginationCategories = async(page:number, pageSize:number) => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/category/pagination`, {
                params: { page, pageSize }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, pagination: response.data.pagination, message: "Categories were queried successfully.", status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const fetchcategoryById = async(category_id:string) => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/category/id/${category_id}`);
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, message: "The category was queried successfully.", status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const searchCategories = async(searchParam:IFSearchParam) => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/category/search`, {
                params: { ...searchParam }
            });
            dispatch({ type: "FETCH_SUCCESS", payload: response.data.data, message: "Categories were searched successfully", status: response.status });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const createCategories = async(categories:CreateCategories[]) => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/category/create`,
                { categories },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchAllCategories(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const updateCategory = async(category_id:string, name:string, group_ids:string[]) => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/category/update/${category_id}`,
                { name, group_ids },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            fetchAllCategories(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    const deleteCategories = async(category_ids:string[]) => {
        try {
            dispatch({ type: "FETCH_START" });
            const response = await axios.request({
                method: "DELETE",
                url: `${import.meta.env.VITE_API_URL}/category/delete`,
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
                data: { category_ids }
            });
            fetchAllCategories(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                dispatch({ type: "FETCH_ERROR", message: error.response?.data.message, status: error.response?.status });
            } else {
                dispatch({ type: "FETCH_ERROR", message: "Something went wrong.", status: 404 });
            }
        }
    }

    return (
        <CategoryContext.Provider value={{ state, dispatch, fetchAllCategories, fetchPaginationCategories, fetchcategoryById, searchCategories, createCategories, updateCategory, deleteCategories }}>
            {children}
        </CategoryContext.Provider>
    );
}

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error("useCategory must be used within CategoryProvider");
    return context;
}