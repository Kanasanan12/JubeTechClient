import { Select } from 'antd';
import { useState, useEffect } from "react";
import SkeletonCategory from './SkeletonCategory';
import { useGroup } from "../../../contexts/GroupContext";
import { ResponseMessage, ToastMessageContainer } from '../../ToastMessageContainer';
import { useCategory, CreateCategories, Category } from "../../../contexts/CategoryContext";
import {
    BsSearch,
    BsPlus,
    BsFillTrashFill,
    BsPencilSquare,
    BsX,
    BsCheck
} from "react-icons/bs";

import "../../../assets/css/category/category-list.css";
import { FaPlus } from 'react-icons/fa6';

interface IFEditCategory {
    category_id: string
    name: string,
    group_ids: string[],
}

interface CategoryListProp {
    startCategory: boolean,
    setStartCategory: (value:boolean | ((prev:boolean) => boolean)) => void
}

export default function CategoryList({ startCategory, setStartCategory }:CategoryListProp) {
    // Context
    const { state:groupsState } = useGroup();
    const { state:categoriesState, fetchAllCategories, createCategories, updateCategory, deleteCategories, dispatch } = useCategory();

    // State
    const [showModal, setShowModal] = useState<boolean>(false);
    const [searchCategory, setSearchCategory] = useState<string>("");
    const [deleteCategory, setDeleteCategory] = useState<string>("");
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);
    const [filterCategory, setFilterCategory] = useState<Category[]>(categoriesState.categories);
    const [categories, setCategories] = useState<CreateCategories[]>([{ name: "", group_ids: [] }]);
    const [editCategory, setEditCategory] = useState<IFEditCategory>({ category_id: "", name: "", group_ids: [] });
    const { name, group_ids, category_id } = editCategory;
    // Modify Data
    const options = groupsState.groups.map(group => ({ value: group._id, label: group.name }));

    // Effect
    useEffect(() => {
        if (categoriesState.categories.length === 0 && startCategory === false) {
            fetchAllCategories("");
            setFilterCategory(categoriesState.categories);
            setStartCategory(true);
        } else {
            if (searchCategory.trim() !== "") {
                setFilterCategory(
                    categoriesState.categories.filter(category =>
                        category.name.toLowerCase().includes(searchCategory.toLowerCase())
                    )
                );
            } else {
                setFilterCategory(categoriesState.categories);
            }
        }
        if (categoriesState.response) {
            if (Array.isArray(categoriesState.response)) {
                categoriesState.response.map((error) => {
                    const response:ResponseMessage = {
                        status: categoriesState.status,
                        message: error.message + " , value : " + error.path
                    }
                    setMessageList(prev => [...prev, response]);
                });
            } else {
                const response:ResponseMessage = {
                    status: categoriesState.status,
                    message: categoriesState.response
                }
                setMessageList(prev => [...prev, response]);
            }
            setTimeout(() => {
                setMessageList((prev) => prev.slice(1));
            }, 3000);
        }
        dispatch({ type: "CLEAR_RESPONSE", payload: null, message: "", status: 0 });
    }, [categoriesState.response, categoriesState.categories, searchCategory]);

    /* Function Section */
    const addCategory = () => {
        setCategories([...categories, { name: "", group_ids: [] }]);
    };

    const removeCategory = (removeIndex:number) => {
        if (categories.length > 1) setCategories(categories.filter((_, index) => removeIndex !== index))
    };

    const handleCategories = (currentIndex:number, field:string, value:string | string[]) => {
        setCategories((prev) => {
            return prev.map((category, index) => (
                (index === currentIndex ? { ...category, [field]: value } : category)
            ));
        });
    };

    const handleEditCategory = (key:string, value:string | string[]) => {
        setEditCategory(prevState => ({ ...prevState, [key]: value}));
    }

    const submitCreate = async(event: React.FormEvent) => {
        event.preventDefault();
        if (categories.length > 0 && categories[0].name.trim() !== "") {
            await createCategories(categories);
            await new Promise(resolve => setTimeout(resolve, 100));
            setCategories([{ name: "", group_ids: [] }]);
            setShowModal(false);
        } else {
            const response:ResponseMessage = {
                status: 0,
                message: "The category was not found."
            }
            setMessageList(prev => [...prev, response]);
        }
    }

    const modifyCategory = async(event: React.FormEvent) => {
        event.preventDefault();
        if (editCategory.category_id !== "") {
            await updateCategory(category_id, name, group_ids);
            await new Promise(resolve => setTimeout(resolve, 100));
            handleEditCategory("name", "");
            handleEditCategory("group_ids", []);
            handleEditCategory("category_id", "");
        } else {
            const response:ResponseMessage = {
                status: 0,
                message: "The category was not found."
            }
            setMessageList(prev => [...prev, response]);
        }
    }

    const removeCategoryById = async() => {
        if (deleteCategory !== "") {
            await deleteCategories([deleteCategory]);
            await new Promise(resolve => setTimeout(resolve, 100));
            setDeleteCategory("");
        } else {
            const response:ResponseMessage = {
                status: 0,
                message: "The category was not found."
            }
            setMessageList(prev => [...prev, response]);
        }
    }
    /* End Section */

    // Render
    return (
        <div className="category-list-container">
            {messageList.length > 0 &&
                <ToastMessageContainer messageList={messageList} setMessageList={setMessageList} />
            }
            {/* Option */}
            <div className="category-option-container">
                <div className="search-category-section">
                    <i><BsSearch /></i>
                    <input
                        type="text"
                        placeholder="search by category name..."
                        value={searchCategory}
                        onChange={(event) => setSearchCategory(event.target.value)}
                    />
                </div>
                <div className="btn-category-container">
                    {/* <button className="filter-advance">
                        <i><BsFillFilterCircleFill size={20} /></i>
                        Advance filter
                    </button> */}
                    <button className="create-category" onClick={() => setShowModal(true)}>
                        <i><BsPlus size={20} /></i>
                        Create category
                    </button>
                </div>
            </div>
            {/* Create Section */}
            <div className={"form-category-container " + (showModal ? "" : "hide-form")}>
                <div className={"form-category-content " + (showModal ? "" : "hide-content")}>
                    <div className="form-category-header">
                        <p>Create Category</p>
                        <button onClick={() => setShowModal(false)}>
                            <i><BsX /></i>
                        </button>
                    </div>
                    <div className="form-category-body">
                        <p className="create-hint">Hint : <span>Each category 🗂️ can be divided into multiple groups 🔹, helping you keep things organized and structured!</span></p>
                        <form onSubmit={submitCreate}>
                            {categories.map((category, index) => (
                                <div className="create-category-list" key={index}>
                                    <div className="input-category-name">
                                        <div>
                                            <span>Category {index + 1}</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Input your category name..."
                                            required
                                            value={category.name}
                                            onChange={(event) => handleCategories(index, "name", event.target.value)}
                                        />
                                    </div>
                                    <Select
                                        mode="multiple"
                                        options={options}
                                        style={{ width: "100%" }}
                                        placeholder="Select group in category..."
                                        showSearch={false}
                                        allowClear={true}
                                        value={category.group_ids}
                                        onChange={(selected) => handleCategories(index, "group_ids", selected)}
                                    />
                                    <button className="remove-create" type="button" onClick={() => removeCategory(index)}>
                                        <i><BsFillTrashFill /></i>
                                    </button>
                                </div>
                            ))}
                            <button className="add-create" type="button" onClick={addCategory}>
                                <i><FaPlus /></i>
                                Add Category
                            </button>
                            <button type="submit">
                                Create
                                <i><BsCheck size={20} /></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {categoriesState.loading
                ?
                <SkeletonCategory />
                :
                <div className="main-category-list">
                    {filterCategory.map((category, index) => (
                        <div className="category-list-card" key={index}>
                            {editCategory.category_id === category._id
                                ?
                                <form onSubmit={modifyCategory}>
                                    <div className="input-edit-category">
                                        <input
                                            type="text"
                                            value={name}
                                            placeholder="Input your category name..."
                                            onChange={(event) => handleEditCategory("name", event.target.value)}
                                            required
                                        />
                                        <Select
                                            mode="multiple"
                                            options={options}
                                            style={{ width: "100%" }}
                                            placeholder="Select group in category..."
                                            showSearch={false}
                                            allowClear={true}
                                            value={group_ids}
                                            onChange={(selected) => handleEditCategory("group_ids", selected)}
                                        />
                                    </div>
                                    <div className="button-confirm-edit">
                                            <button
                                                className="cancel-confirm"
                                                onClick={() => {
                                                    handleEditCategory("name", "");
                                                    handleEditCategory("group_ids", []);
                                                    handleEditCategory("category_id", "");
                                                }}
                                            >
                                                <i><BsX size={24} /></i>
                                            </button>
                                            <button className="confirm-edit">
                                                <i><BsCheck size={24} /></i>
                                            </button>
                                        </div>
                                </form>
                                :
                                <div>
                                    <div className="category-content">
                                        <p className="category-name">
                                            {index + 1}. {category.name} : &nbsp;
                                            <span className="category-updated">{new Date(category.updatedAt).toLocaleString()}</span>
                                        </p>
                                        <div className="option-category-card">
                                            <button
                                                className="edit-category-btn"
                                                onClick={() => {
                                                    handleEditCategory("category_id", category._id);
                                                    handleEditCategory("name", category.name);
                                                    handleEditCategory("group_ids", category.group_ids.map(group => group._id));
                                                }}
                                            >
                                                <i><BsPencilSquare /></i>
                                            </button>
                                            <button
                                                className="delete-category-btn"
                                                onClick={() => setDeleteCategory(category._id)}
                                            >
                                                <i><BsFillTrashFill /></i>
                                            </button>
                                        </div>
                                    </div>
                                    {deleteCategory === category._id
                                        ?
                                        <div className="confirm-delete-category">
                                            <button className="confirm-delete" onClick={removeCategoryById}>confirm delete</button>
                                            <button className="cancel-delete" onClick={() => setDeleteCategory("")}>cancel</button>
                                        </div>
                                        :
                                        ""
                                    }
                                    {category.group_ids.length > 0
                                        ?
                                        <ul className="category-group">
                                            {category.group_ids.map((group, index) => (
                                                <li className="sub-group" key={index}>
                                                    {group.name}
                                                </li>
                                            ))}
                                        </ul>
                                        :
                                        ""
                                    }
                                </div>
                            }
                            
                        </div>
                    ))}
                </div>
            }
        </div>
    );
}