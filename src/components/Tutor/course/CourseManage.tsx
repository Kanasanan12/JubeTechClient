import {
    BsPlus,
    BsCopy,
    BsGear,
    BsSearch,
    BsBookHalf,
    BsBookFill,
    BsFillPenFill,
    BsChevronLeft,
    BsPencilSquare,
    BsChevronRight,
    BsFillStarFill,
    BsFillTrash3Fill
} from "react-icons/bs";

import axios from "axios";
import { message } from "antd";
import CourseModal from "./CourseModal";
import Spinner from 'react-bootstrap/Spinner';
import React, { useEffect, useState } from "react";
import { getToken } from "../../../services/authorize";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { deleteFile, fetchFileFromStorage } from "../../../services/storage";
import { useCourse, CourseCard } from "../../../contexts/CourseContext";
import { ResponseMessage, ToastMessageContainer } from "../../ToastMessageContainer";

import "../../../assets/css/course/course-manage.css";
import NoImage from "../../../assets/img/no image.jpg";

export interface IFSearchCourse {
    title: string,
    sortField: string,
    sortOrder: "ascend" | "descend",
    page: number,
    pageSize: number
}

interface IFCourseTopOption {
    title: string,
    sortField: string,
    sortOrder: "ascend" | "descend",
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    handleSearchCourse: (target:string, value:string | number) => void
}

interface CourseImage {
    _id: string,
    path: string,
    url: string,
}

interface CourseCardProp {
    course: CourseCard,
    course_image: CourseImage[],
    showOption: string,
    setShowOption: React.Dispatch<React.SetStateAction<string>>,
    setEditCourseId: React.Dispatch<React.SetStateAction<string>>,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    searchCourse: IFSearchCourse,
    deleteCourseId: string,
    setDeleteCourseId: React.Dispatch<React.SetStateAction<string>>,
}

interface IFDeleteCourseModal {
    deleteCourseId: string,
    setDeleteCourseId: React.Dispatch<React.SetStateAction<string>>,
    searchCourse: IFSearchCourse,
    setIsRender: React.Dispatch<React.SetStateAction<boolean>>
}

const CourseTopOption = ({ title, sortField, sortOrder, handleSearchCourse, setShowModal }:IFCourseTopOption) => {
    return (
        <div className="course-option-container">
            <span>0 Content</span>
            <div className="vertical-line">|</div>
            <div className="search-course-container">
                <i><BsSearch size={18} /></i>
                <input
                    type="text"
                    value={title}
                    placeholder="Search course by title..."
                    onChange={(e) => handleSearchCourse("title", e.target.value)}
                />
            </div>
            <div className="course-option-btn">
                <button
                    onClick={() => setShowModal(true)}
                    className="create-course-btn"
                >
                    <i><BsPlus size={18} /></i>
                    Create course
                </button>
                <select
                    defaultValue={sortField + ":" + sortOrder}
                    onChange={(e) => {
                        const modifyValue = e.target.value.split(":");
                        handleSearchCourse("sortField", modifyValue[0]);
                        handleSearchCourse("sortOrder", modifyValue[1]);
                    }}
                >
                    <option value="createdAt:descend">Lastest</option>
                    <option value="createdAt:ascend">Oldest</option>
                    <option value="student_enrolled:descend">Highest enrolled</option>
                    <option value="student_enrolled:ascend">Lowest enrolled</option>
                </select>
            </div>
        </div>
    )
}

const CourseCardInfo = ({ course, course_image, showOption, setShowOption, setShowModal, setEditCourseId, searchCourse, setDeleteCourseId }:CourseCardProp) => {
    // props
    const filterImage = course_image.filter(image => image._id === course._id);
    const urlImage = filterImage.length > 0 ? filterImage[0].url : "";

    // context
    const { createCourse } = useCourse();

    // function
    const duplicateCourse = async(course_id:string) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/id/${course_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const courseInfo = { ...response.data.data, title: response.data.data.title + " " + new Date().toLocaleString(), thumbnail: "" };
                delete courseInfo._id;
                await createCourse(courseInfo, searchCourse);
            };
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("Error from duplicate course.");
        }
    }

    return (
        <div className="course-card-container">
            <div className="course-card-image">
                <button onClick={() => {
                    if (showOption === course._id) setShowOption("");
                    else setShowOption(course._id);
                }}>
                    <i><BsGear size={18} /></i>
                </button>
                <img
                    alt={course.title}
                    src={urlImage.trim() !== "" ? urlImage : NoImage}
                />
            </div>
            <div className="course-card-info">
                <span className="course-title">
                    {course.title.length > 25 ?
                        course.title.slice(0, 25) + "..."
                        :
                        course.title
                    }
                </span>
                <span className="course-description">
                    {course.description.length > 80 ?
                        course.description.slice(0, 80) + "..."
                        :
                        course.description
                    }
                </span>
                <div className="course-sub-info">
                    <div className="rating-info">
                        <i><BsFillStarFill size={10} fill="#f5d002" /></i>
                        {course.rating.toFixed(2)}
                    </div>
                    <div className="level-info">
                        <i><BsBookFill size={10} /></i>
                        {course.level}
                    </div>
                </div>
                <div className="author">
                    <i><BsFillPenFill size={14} /></i>
                    {course.instructor ? `${course.instructor.firstname} ${course.instructor.lastname}` : ""}
                </div>
                <div className="course-card-footer">
                    <span className="price">{course.price > 0 ? course.price.toLocaleString() + "฿" : "Free"}</span>
                    <button className="see-detail">
                        See detail
                    </button>
                </div>
            </div>
            {showOption === course._id && (
                <div
                    onMouseLeave={() => setShowOption("")}
                    className="course-option-list"
                >
                    <ul>
                        <li onClick={() => location.href = "/dashboard/course/sub/" + course._id}>
                            <i><BsBookHalf size={13} /></i>
                            Manage section
                        </li>
                        <li
                            onClick={() => {
                                setEditCourseId(course._id);
                                setShowModal(true);
                            }}
                        >
                            <i><BsPencilSquare size={13} /></i>
                            Edit course
                        </li>
                        <li onClick={() => duplicateCourse(course._id)}>
                            <i><BsCopy size={13} /></i>
                            Duplicate
                        </li>
                        <li onClick={() => setDeleteCourseId(course._id)}>
                            <i><BsFillTrash3Fill size={13} /></i>
                            Delete course
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

const DeleteCourseModal = ({ deleteCourseId, setDeleteCourseId, searchCourse, setIsRender }:IFDeleteCourseModal) => {
    // context
    const { deleteCourse } = useCourse();

    // function
    const prepareRemoveCourse = async() => {
        setIsRender(false);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/id/${deleteCourseId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const currentCourse = response.data.data;
                if (currentCourse.thumbnail.trim() !== "") await deleteFile([currentCourse.thumbnail]);
                await deleteCourse(deleteCourseId, searchCourse);
            }
            setDeleteCourseId("");
            setIsRender(true);
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("Error from delete course.");
        }
    }

    return (
        <div className={"confirm-delete-course " + (deleteCourseId.trim() !== "" ? "active-confirm" : "")}>
            <div className={"confirm-delete-card " + (deleteCourseId.trim() !== "" ? "active-confirm" : "")}>
                <p>Are you absolutely sure to delete course?</p>
                <span>This action cannot be undone. This will permanently delete your course and remove your data from our servers.</span>
                <div className="confirm-btn-course">
                    <button onClick={() => setDeleteCourseId("")}>Cancel</button>
                    <button onClick={prepareRemoveCourse}>Continue</button>
                </div>
            </div>
        </div>
    );
}

export default function CourseManage() {
    // firebase
    const auth = getAuth();

    // context
    const { state, fetchCourseByTutor } = useCourse();

    // state
    const [searchCourse, setSearchCourse] = useState<IFSearchCourse>({
        title: "",
        sortField: "createdAt",
        sortOrder: "ascend",
        page: 1,
        pageSize: 12
    });
    const [showOption, setShowOption] = useState<string>("");
    const [isRender, setIsRender] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const { title, page, sortField, sortOrder } = searchCourse;
    const [editCourseId, setEditCourseId] = useState<string>("");
    const [deleteCourseId, setDeleteCourseId] = useState<string>("");
    const [prepareCourse, setPrepareCourse] = useState<boolean>(true);
    const [courseImages, setCourseImages] = useState<CourseImage[]>([]);
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);


    // effect
    useEffect(() => {
        setIsRender(false);
        const trackauth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                alert("Unauthenticate on firebase.");
            }
        });
    
        return () => trackauth();
    }, []);

    useEffect(() => {
        fetchCourseFromTutor();
    }, [searchCourse]);

    useEffect(() => {
        if (state.courses.length > 0) {
            const imageDatas = state.courses.map(
                course => ({ _id:course._id, path: course.thumbnail, url: "" })
            );
            setCourseImages(imageDatas);
        } else {
            setCourseImages([]);
        }
    }, [state.courses]);

    useEffect(() => {
        const allUrlsReady = courseImages.every(img => {
            const matchedCourse = state.courses.find(course => course._id === img._id);
            if (matchedCourse?.thumbnail && matchedCourse.thumbnail.trim() !== "") {
                return img.url && img.url.trim() !== "";
            }
            return true;
        });
        if (courseImages.length > 0 && !allUrlsReady) {
            prepareImages();
        } else {
            setIsRender(true);
        }
    }, [courseImages]);

    useEffect(() => {
            if (state.response) {
                if (Array.isArray(state.response)) {
                    state.response.map((error) => {
                        const response:ResponseMessage = {
                            status: state.status,
                            message: error.message + " , value : " + error.path
                        }
                        setMessageList(prev => [...prev, response]);
                    });
                } else {
                    const response:ResponseMessage = {
                        status: state.status,
                        message: state.response
                    }
                    setMessageList(prev => [...prev, response]);
                }
                setTimeout(() => {
                    setMessageList((prev) => prev.slice(1));
                }, 2000);
            }
        }, [state.response]);

    // function
    const handleSearchCourse = (target:string, value:string | number) => {
        setSearchCourse({ ...searchCourse, [target]: value });
    }

    const fetchCourseFromTutor = async() => {
        setPrepareCourse(true);
        await fetchCourseByTutor("", searchCourse);
        setPrepareCourse(false);
    }

    const changePage = (type:string) => {
        switch (type) {
            case "increase":
                handleSearchCourse(
                    "page",
                    Number(page) === Number(state.pagination?.totalPages) ? page : page + 1
                );
                break;
            case 'decrease':
                handleSearchCourse(
                    "page",
                    Number(page) <= 1 ? 1 : Number(page) - 1
                );
                break;
            default:
                handleSearchCourse("page",page);
                break;
        }
    }

    const prepareImages = async() => {
        if (courseImages.length === 0) {
            setIsRender(true);
            return;
        }
        const newCourseImages = await Promise.all(courseImages.map(async (course) => {
            if (course.url && course.url.trim() !== "") return course;
            if (course.path && course.path.trim() !== "") {
                const newUrl = await fetchFileFromStorage(course.path);
                if (newUrl && newUrl.trim() !== "") {
                    return { ...course, url: newUrl };
                }
            }
            return course;
        }));
        setCourseImages(newCourseImages);
        setIsRender(true);
    }

    // render
    return (
        <div className="course-manage-container">
            <DeleteCourseModal
                setIsRender={setIsRender}
                deleteCourseId={deleteCourseId}
                setDeleteCourseId={setDeleteCourseId}
                searchCourse={searchCourse}
            />
            {messageList.length > 0 &&
                <ToastMessageContainer messageList={messageList} setMessageList={setMessageList} />
            }
            <CourseModal
                showModal={showModal}
                editCourseId={editCourseId}
                setShowModal={setShowModal}
                searchCourse={searchCourse}
                setEditCourseId={setEditCourseId}
            />
            {isRender ?
                <>
                    <CourseTopOption
                        title={title}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        setShowModal={setShowModal}
                        handleSearchCourse={handleSearchCourse}
                    />
                    {prepareCourse ?
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#00000020",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: "100000"
                            }}
                        >
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                        :
                        <>
                            <div className="course-list-container">
                                {state.courses.map((course, index) => (
                                    <CourseCardInfo
                                        key={index}
                                        course={course}
                                        showOption={showOption}
                                        course_image={courseImages}
                                        setShowModal={setShowModal}
                                        searchCourse={searchCourse}
                                        deleteCourseId={deleteCourseId}
                                        setDeleteCourseId={setDeleteCourseId}
                                        setShowOption={setShowOption}
                                        setEditCourseId={setEditCourseId}
                                    />
                                ))}
                            </div>
                            <div className="course-pagination-container">
                                <button onClick={() => changePage("decrease")}>
                                    <i><BsChevronLeft size={14} /></i>
                                </button>
                                <input
                                    min={1}
                                    value={page}
                                    type="number"
                                    onChange={(e) => handleSearchCourse("page", e.target.value)}
                                />
                                <button onClick={() => changePage("increase")}>
                                    <i><BsChevronRight size={14} /></i>
                                </button>
                                <span className="total-page">
                                    Total pages : {state.pagination?.totalPages.toLocaleString()}
                                </span>
                            </div>
                        </>
                    }
                </>
                :
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#00000020",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: "100000"
                    }}
                >
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            }
        </div>
    );
}