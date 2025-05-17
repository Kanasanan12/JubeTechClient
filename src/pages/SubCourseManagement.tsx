import {
    BsPlus,
    BsGridFill,
    BsTrashFill,
    BsTrash3Fill,
    BsChevronLeft,
    BsFillSaveFill,
    BsGrid3X2GapFill
} from "react-icons/bs";

import axios from "axios";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { message, Select, Spin } from "antd";
import { useParams } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import { getToken } from "../services/authorize";
import { ReactSortable } from "react-sortablejs";
import { fetchFileFromStorage } from "../services/storage";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { ResponseMessage, ToastMessageContainer } from "../components/ToastMessageContainer";

import NoImage from "../assets/img/no image.jpg";
import "../assets/css/subcourse/main_section.css";
import "../assets/css/subcourse/main_subcourse.css";

interface IFSubCourse {
    thumbnail: string,
    title: string,
    description: string,
    objectives: string[],
    group_ids: {
        name: string
    }[],
    status: "draft" | "published" | "archived",
    note: string,
    pretest: {
        _id: string,
        title: string,
        description: string,
        random_question: boolean
    }[] | null,
    posttest: {
        _id: string,
        title: string,
        description: string,
        random_question: boolean
    }[] | null,
    section_ids: {
        id: string,
        _id: string,
        title: string,
        lesson_ids: {
            id: string,
            _id: string,
            name: string,
            type: string,
            sub_file: string[],
            main_content: string,
            duration: number,
            isFreePreview: boolean,
            createdBy: string,
            updatedBy: string,
            createdAt: string | Date,
            updatedAt: string | Date,
            __v: number
        }[],
    }[]
}

interface IFCourseImage {
    path: string,
    url: string,
    render: boolean,
    hasThumbnail: boolean
}

interface IFExam {
    _id: string,
    title: string
}

interface IFOption {
    label: string,
    value: string
}

const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" }
]

export default function SubCourseManagement() {
    // params & auth
    const auth = getAuth();
    const { course_id } = useParams();

    // state
    const [isRender, setIsRender] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [examOptions, setExamOptions] = useState<IFOption[]>([]);
    const [lessonOptions, setLessonOptions] = useState<IFOption[]>([]);
    const [courseImage, setCourseImage] = useState<IFCourseImage>({
        path: "",
        url: "",
        render: false,
        hasThumbnail: false
    });
    const [courseData, setCourseData] = useState<IFSubCourse>({
        thumbnail: "",
        title: "",
        description: "",
        objectives: [],
        group_ids: [],
        status: "draft",
        note: "",
        pretest: null,
        posttest: null,
        section_ids: []
    });
    const [deleteSectionId, setDeleteSectionId] = useState<string>("");
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);

    // effect
    useEffect(() => {
        setIsRender(false);
        const trackauth = onAuthStateChanged(auth, (user) => {
            if (!user || course_id?.trim() === "") {
                alert("Unauthorize from firebase");
                location.href = "/dashboard/course-management";
            } else {
                fetchSubCourse();
                fetchExamOption();
                fetchLessonOption();
            };
        });
        return () => trackauth();
    }, []);

    // function
    const fetchSubCourse = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/sub/id/${course_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const course = {
                    ...response.data.data,
                    section_ids: response.data.data.section_ids.map((section: any) => ({
                        ...section,
                        id: section._id,
                        lesson_ids: section.lesson_ids.map((lesson: any) => ({
                        ...lesson,
                        id: lesson._id
                        }))
                    }))
                };
                setCourseData(course);
                if (course.thumbnail.trim() !== "") {
                    const newUrl = await fetchFileFromStorage(course.thumbnail);
                    setCourseImage({ path: course.thumbnail, url: newUrl, render: true, hasThumbnail: true });
                } else setCourseImage({ path: "", url: "", render: true, hasThumbnail: false });
                message.success("The course was fetched successfully.");
                setIsRender(true);
            } else redirectErrorPage();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data.message || "Something went wrong.");
                location.href = "/dashboard/course-management";
            } else redirectErrorPage();
        }
    }

    const fetchExamOption = async(title:string = "") => {
        try {
            setFetching(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/exam/search`, {
                params: { title },
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const exams = response.data.data.map((exam:IFExam) => ({
                    label: exam.title,
                    value: exam._id
                }));
                setExamOptions([{ label: "None", value: "" },...exams]);
                setFetching(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("Error from fetch exam.");
        }
    }

    const fetchLessonOption = async(name:string = "") => {
        try {
            setFetching(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/lesson/search`, {
                params: { name },
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const lessons = response.data.data.map((lesson:any) => 
                    ({ label: lesson.name, value: lesson._id })
                );
                setLessonOptions([{ label: "None", value: "" }, ...lessons]);
                setFetching(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("Error from fetch lesson.");
        }
    }

    const handleCourseData = (target:string, value:string | string[] | null) => {
        setCourseData((prev) => ({ ...prev, [target]: value }));
    }

    const addSection = async() => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/section/create`, {
                title: "Enter your section of course !", lesson_ids: [], course_id
            }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.message) {
                message.success(response.data.message);
                await fetchSubCourse();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (Array.isArray(error.response?.data.message)) {
                    const messages = error.response.data.message;
                    messages.map((err:any) => {
                        const response:ResponseMessage = {
                            status: error.response?.status as number,
                            message: err.message + " , value : " + err.path
                        }
                        setMessageList(prev => [...prev, response]);
                    });
                } else message.error(error.response?.data.message);
            }
        }
    }

    const attachLesson = async(lessonId:string, sectionId:string) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/section/attach`, {
                lesson_id: lessonId, section_id: sectionId
            },{
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.message) {
                message.success(response.data.message);
                await fetchSubCourse();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) message.error(error.response?.data.message);
        }
    }

    const detachLesson = async(lessonId:string, sectionId:string) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/section/detach`, {
                lesson_id: lessonId, section_id: sectionId
            },{
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.message) {
                message.success(response.data.message);
                await fetchSubCourse();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) message.error(error.response?.data.message);
        }
    }

    const handleChangeSection = (sectionId:string, target:string, value:string | string[]) => {
        setCourseData(prev => ({
            ...prev,
            section_ids: prev.section_ids.map(section =>
            section._id === sectionId ? { ...section, [target]: value } : section
            )
        }));
    }

    const saveCourseInfo = async() => {
        try {
            setIsRender(false);
            const sections = courseData.section_ids.map(section => ({
                _id: section._id,
                title: section.title,
                lesson_ids: section.lesson_ids.map(lesson => lesson._id)
            }));
            await updateCourse();
            // if (courseData.pretest) {
            //     await axios.post(`${import.meta.env.VITE_API_URL}/course/attach/exam/${course_id}`, {
            //         exam_id: courseData.pretest, type: "pretest"
            //     }, {
            //         headers: {
            //             Authorization: `Bearer ${getToken()}`
            //         }
            //     });
            // }
            // if (courseData.posttest) {
            //     await axios.post(`${import.meta.env.VITE_API_URL}/course/attach/exam/${course_id}`, {
            //         exam_id: courseData.posttest, type: "posttest"
            //     }, {
            //         headers: {
            //             Authorization: `Bearer ${getToken()}`
            //         }
            //     });
            // }
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/section/update`, {
                sections, course_id
            }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.message) message.success(response.data.message);
            await fetchSubCourse();
        } catch (error) {
            if (axios.isAxiosError(error)) message.error(error.response?.data.message);
            else message.error("Error from save section.");
        }
    }

    const removeSectionFromCourse = async() => {
        try {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#c603fc",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
                }).then(async(result) => {
                if (result.isConfirmed && deleteSectionId.trim() !== "") {
                    try {
                        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/section/delete/${deleteSectionId}`, {
                        params: { course_id },
                        headers: {
                            Authorization: `Bearer ${getToken()}`
                        }
                        });
                        if (response.data.message) message.success(response.data.message);
                        setDeleteSectionId("");
                        await fetchSubCourse();
                    } catch (error) {
                        if (axios.isAxiosError(error)) message.error(error.response?.data.message);
                    }
                }
            });
        } catch (error) {
            message.error("Error from delete section.");
        }
    }

    const reConfirmExit = async() => {
        Swal.fire({
            title: "Reminder to update",
            text: "Going back without updating may result in data loss. Would you like to update before proceeding?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#c603fc",
            cancelButtonColor: "#d33",
            confirmButtonText: "Update"
            }).then(async(result) => {
            if (result.isConfirmed) {
                await saveCourseInfo();
                location.href = "/dashboard/course-management";
            } else {
                location.href = "/dashboard/course-management";
            }
        });
    }

    const updateCourse = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/id/${course_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const resCourse = response.data.data;
                const course = {
                    ...resCourse,
                    objectives: courseData.objectives,
                    status: courseData.status,
                    pretest: courseData.pretest,
                    posttest: courseData.posttest
                }
                delete course._id;
                const response2 = await axios.put(`${import.meta.env.VITE_API_URL}/course/update/${course_id}`, {
                    ...course
                }, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                })
                if (response2.data.message) message.success("The course was updated successfully.");
            }
        } catch (error) {
            message.error("Error from update course");
        }
    }

    const redirectErrorPage = () => {
        alert("Something went wrong.");
        location.href = "/dashboard/course-management";
    }

    // render
    return (
        <div className="sub-course-container">
            {isRender ?
                <>
                    {messageList.length > 0 &&
                        <ToastMessageContainer messageList={messageList} setMessageList={setMessageList} />
                    }
                    <div className="sub-course-topbar">
                        <div className="back-course" onClick={reConfirmExit}>
                            <button>
                                <i><BsChevronLeft size={18} /></i>
                            </button>
                            <span style={{ cursor: "pointer" }}>Back to main course</span>
                        </div>
                        <span>Manage section</span>
                        <button onClick={saveCourseInfo}>
                            <i><BsFillSaveFill size={14} /></i>
                            Save section
                        </button>
                    </div>
                    <div className="sub-course-content">
                        <div className="course-header-info">
                            <div className="preview-sub-course">
                                <img
                                    alt={courseData.title}
                                    src={courseImage.hasThumbnail ? courseImage.url : NoImage}
                                />
                                <div className="sub-course-info">
                                    <p className="sub-title">
                                        {courseData.title.length > 60 ?
                                            courseData.title.slice(0, 60) + "..."
                                            :
                                            courseData.title
                                        }
                                    </p>
                                    <div className="sub-groups">
                                        {courseData.group_ids.map((group) => (
                                            <div className="sub-group-card" key={uuidv4()}>{group.name}</div>
                                        ))}
                                    </div>
                                    <span className="sub-description">
                                        {courseData.description.length > 300 ?
                                            courseData.description.slice(0, 300) + "..."
                                            :
                                            courseData.description
                                        }
                                    </span>
                                    <br />
                                    <div className="sub-status" style={
                                        courseData.status === "draft" ? { backgroundColor: "#ababab", color: "#FFFFFF" } :
                                        courseData.status === "published" ? { backgroundColor: "#caffc4" } :
                                        courseData.status === "archived" ? { backgroundColor: "#fff394" } : {}
                                    }>
                                        {courseData.status.slice(0, 1).toUpperCase() + courseData.status.slice(1)}
                                    </div>
                                </div>
                            </div>
                            <div className="sub-course-input">
                                <form>
                                    <div className="sub-status-input">
                                        <label htmlFor="status-input">Status : </label>
                                        <Select
                                            options={statusOptions}
                                            value={courseData.status}
                                            style={{ width: "130px" }}
                                            onChange={(value) => handleCourseData("status", value)}
                                        />
                                    </div>
                                    <div className="sub-objectives-input mt-2">
                                        <label htmlFor="objectives-input">Objectives : </label>
                                        <button
                                            type="button"
                                            id="objectives-input"
                                            onClick={() => {
                                                if (courseData.objectives.length <= 5) handleCourseData("objectives", [...courseData.objectives, ""]);
                                            }}
                                        >
                                            <i><BsPlus size={16} /></i>
                                            Add objective {courseData.objectives.length + " / 6"}
                                        </button>
                                    </div>
                                    <div className="objectives-container">
                                        {courseData.objectives.map((objective, index) => (
                                            <div className="objective-section" key={index}>
                                                <span>{index + 1} : </span>
                                                <input
                                                    type="text"
                                                    maxLength={60}
                                                    value={objective}
                                                    placeholder="Enter your objective..."
                                                    onChange={(e) => {
                                                        const newObjective = courseData.objectives;
                                                        newObjective[index] = e.target.value;
                                                        handleCourseData("objectives", [...newObjective]);
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newObjective = courseData.objectives.filter((_, currentIndex) => currentIndex !== index);
                                                        handleCourseData("objectives", [...newObjective]);
                                                    }}
                                                >
                                                    <i><BsTrash3Fill size={14} /></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                                    >
                                        <div className="pretest-select-input">
                                            <label htmlFor="pretest-input">Pretest : </label>
                                            <Select
                                                id="pretest-input"
                                                value={courseData.pretest === null ? "" : courseData.pretest}
                                                showSearch
                                                options={examOptions}
                                                filterOption={false}
                                                style={{ width: "350px" }}
                                                onSearch={fetchExamOption}
                                                onChange={(value) => {
                                                    if (value) handleCourseData("pretest", value as string);
                                                    else handleCourseData("pretest", null);
                                                }}
                                                placeholder="Select your pretest of course.. (Optional)"
                                                notFoundContent={fetching ? <Spin size="small" /> : null}
                                            />
                                        </div>
                                        <div className="postest-select-input">
                                            <label htmlFor="postest-input">Posttest : </label>
                                            <Select
                                                id="postest-input"
                                                value={courseData.posttest === null ? "" : courseData.posttest}
                                                showSearch
                                                options={examOptions}
                                                filterOption={false}
                                                style={{ width: "350px" }}
                                                onSearch={fetchExamOption}
                                                onChange={(value) => {
                                                    if (value) handleCourseData("posttest", value as string);
                                                    else handleCourseData("posttest", null);
                                                }}
                                                placeholder="Select your posttest of course.. (Optional)"
                                                notFoundContent={fetching ? <Spin size="small" /> : null}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="main-section-container">
                            <button
                                className="add-new-section"
                                onClick={addSection}
                            >
                                <i><BsPlus size={18} /></i>
                                Add section
                            </button>
                            <ReactSortable
                                list={courseData.section_ids}
                                setList={(newList) =>
                                    setCourseData((prev) => {
                                        if (!prev) return prev as IFSubCourse;

                                        return {
                                            ...prev,
                                            section_ids: newList
                                        };
                                    })
                                }
                                animation={200}
                                className="section-list-content"
                                handle=".drag-section"
                            >
                                {courseData.section_ids.map((section, index) => (
                                    <div className="section-card-manage" key={index}>
                                        <div className="drag-section">
                                            <i><BsGrid3X2GapFill size={18} /></i>
                                        </div>
                                        <div className="section-card">
                                            <div className="header-section-content">
                                                <div className="title-section-input">
                                                    <label htmlFor="title-section-input">Title : </label>
                                                    <input
                                                        type="text"
                                                        maxLength={60}
                                                        value={section.title}
                                                        id="title-section-input"
                                                        onChange={(e) => handleChangeSection(section._id, "title", e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    className="delete-section-btn"
                                                    onClick={() => {
                                                        setDeleteSectionId(section._id);
                                                        removeSectionFromCourse();
                                                    }}
                                                >
                                                    <i><BsTrash3Fill size={15} /></i>
                                                </button>
                                            </div>
                                            <div className="sub-lesson-container">
                                                <div className="search-sub-lesson mt-2">
                                                    <Select
                                                        showSearch
                                                        suffixIcon={null}
                                                        filterOption={false}
                                                        options={lessonOptions}
                                                        style={{ width: "300px" }}
                                                        onSearch={fetchLessonOption}
                                                        placeholder="Search lesson by using name..."
                                                        onChange={async(value) => {
                                                            if (value) await attachLesson(value, section._id);
                                                        }}
                                                        notFoundContent={fetching ? <Spin size="small" /> : null}
                                                    />
                                                </div>
                                                <ReactSortable
                                                    className="section-lesson-container mt-2"
                                                    id="lesson"
                                                    list={section.lesson_ids}
                                                    setList={(newList) => {
                                                        setCourseData((prev) => {
                                                            if (!prev) return prev as IFSubCourse;

                                                            return {
                                                                ...prev,
                                                                section_ids: prev.section_ids.map((current_section) =>
                                                                    current_section._id === section._id
                                                                    ? { ...current_section, lesson_ids: newList }
                                                                    : current_section
                                                                )
                                                            };
                                                        });
                                                    }}
                                                    animation={200}
                                                    handle=".drag-lesson"
                                                >
                                                    {section.lesson_ids.map((lesson, index) => (
                                                        <div className="sub-lesson-manage" key={index}>
                                                            <div className="drag-lesson">
                                                                <i><BsGridFill size={10} /></i>
                                                            </div>
                                                            <div className="sub-lesson-card">
                                                                <span>
                                                                    {lesson.name.length > 65 ?
                                                                        lesson.name.slice(0, 65) + "..."
                                                                        :
                                                                        lesson.name
                                                                    }
                                                                </span>
                                                            </div>
                                                            <button
                                                                className="remove-attach"
                                                                onClick={() => detachLesson(lesson._id, section._id)}
                                                            >
                                                                <i><BsTrashFill size={14} /></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </ReactSortable>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ReactSortable>
                        </div>
                    </div>
                </>
                :
                <div
                    className="preload-sub-course"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
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