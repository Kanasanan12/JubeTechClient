import LessonCard from "./LessonCard";
import LessonModal from "./LessonModal";
import { useState, useEffect } from "react";
import SkeletonLesson from "./SkeletonLesson";
import { deleteFile } from "../../../services/storage";
import { ResponseMessage, ToastMessageContainer } from "../../ToastMessageContainer";
import { useLesson, IFSearchParam, LessonCard as IFLessonCard } from "../../../contexts/LessonContext";
import {
    BsSearch,
    BsFolderPlus,
    BsFillFilterCircleFill
} from "react-icons/bs";

import "../../../assets/css/course/lesson-manage.css";

export default function LessonManage() {
    // context
    const { state, dispatch, fetchLessonByTutor, deleteLesson:removeLesson, fetchLessonById } = useLesson();
    // state
    const [requestProcess, setRequestProcess] = useState<boolean>(false);
    const [editLesson, setEditLesson] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [startFetch, setStartFetch] = useState<boolean>(true);
    const [filterLesson, setFilterLesson] = useState<IFLessonCard[]>([]);
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);
    const [deleteLesson, setDeleteLesson] = useState<string>("");
    const [searchLesson, setSearchLesson] = useState<IFSearchParam>({
        name: "",
        type: "",
        isFreePreview: null,
        startDate: "",
        endDate: "",
        page: 1,
        pageSize: 20
    });
    const { name } = searchLesson;

    // useEffect
    useEffect(() => {
        // trigger lesson
        if (state.lessons.length === 0 && startFetch) {
            fetchLessonByTutor("", searchLesson);
            setStartFetch(false);
        } else {
            if (name.trim() !== "") {
                setFilterLesson(state.lessons.filter(lesson => 
                    lesson.name.toLowerCase().includes(name.toLowerCase())
                ));
            } else {
                setFilterLesson(state.lessons);
            }
        }

        if (requestProcess && deleteLesson) {
            setRequestProcess(false);
            removeLessonById();
            setDeleteLesson("");
        }

        if (state.editLesson !== null && deleteLesson.trim() !== "" && editLesson === "") {
            removeFile();
        }

        if (state.editLesson !== null && editLesson.trim() !== "") {
            setShowModal(true);
        }

        // trigger response
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
        }
        dispatch({ type: "CLEAR_RESPONSE", message: "" });
    }, [state.lessons, searchLesson, state.response, requestProcess, state.editLesson]);

    // useEffect(() => {
    //     const fetchUniqueLesson = async() => {
    //         console.log(1);
    //         try {
    //             await fetchLessonById(editLesson);
    //         } catch (error) {
    //             const response:ResponseMessage = {
    //                 status: 0,
    //                 message: "The lesson was not found."
    //             }
    //             setMessageList(prev => [...prev, response]);
    //         }
    //         setRequestProcess(false);
    //     }

    //     if (editLesson.trim() !== "" && requestProcess === true) {
    //         fetchUniqueLesson();
    //     };
    // }, [requestProcess]);

    /* Function section */
    const handleSearch = (key:string, value:string | number | Date) => {
        setSearchLesson((prev) => ({...prev, [key]:value}));
    }

    const clearSearch = () => {
        setSearchLesson({ name: "", type: "", isFreePreview: null, startDate: "", endDate: "", page: 1, pageSize: 20 });
    }

    const removeFile = async () => {
        if (state.editLesson && state.editLesson.sub_file.length > 0) {
            try {
                await deleteFile(state.editLesson.sub_file);
            } catch (error) {
                console.error('Error deleting files:', error);
            }
        }
        if (state.editLesson && state.editLesson.type === "video") {
            try {
                await deleteFile([state.editLesson.main_content]);
            } catch (error) {
                console.error('Error deleting files:', error);
            }
        }
        dispatch({ type: "CLEAR_EDIT", message: "" });
        setRequestProcess(true);
    };

    const prepareRemoveLesson = async() => {
        if (deleteLesson !== "") {
            clearSearch();
            await fetchLessonById(deleteLesson);
        } else {
            const response:ResponseMessage = {
                status: 0,
                message: "The lesson was not found."
            }
            setMessageList(prev => [...prev, response]);
        }
    }

    const removeLessonById = async() => {
        await removeLesson(deleteLesson, searchLesson);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    /* End section */

    // render
    return (
        <div className="lesson-container">
            <LessonModal
                showModal={showModal}
                setShowModal={setShowModal}
                editLesson={editLesson}
                setEditLesson={setEditLesson}
                messageList={messageList}
                setMessageList={setMessageList}
                searchLesson={searchLesson}
            />
            {messageList.length > 0 &&
                <ToastMessageContainer messageList={messageList} setMessageList={setMessageList} />
            }
            <div className="search-lesson-container">
                <div className="search-input">
                    <input
                        type="text"
                        className="search-inp"
                        placeholder="Search by title for lesson..."
                        onChange={(event) => handleSearch("name", event.target.value)}
                    />
                    <i><BsSearch size={15} /></i>
                </div>
                <div className="option-btn-container">
                    <button id="create-lesson" onClick={() => {
                        setEditLesson("");
                        setShowModal(!showModal);
                        dispatch({ type: "CLEAR_EDIT", status: 0, message: "" });
                    }}>
                        <i><BsFolderPlus size={19} /></i>
                        Add lesson
                    </button>
                </div>
            </div>
            {state.loading === true
                ?
                <SkeletonLesson />
                :
                <div className="lesson-card-list">
                    {filterLesson.map((lesson, index) => (
                        <LessonCard
                            {...lesson}
                            key={index}
                            setEditLesson={setEditLesson}
                            setDeleteLesson={setDeleteLesson}
                        />
                    ))}
                </div>
            }
            <div className={"confirm-delete-lesson " + (deleteLesson.trim() !== "" ? "active-confirm" : "")}>
                <div className={"confirm-delete-card " + (deleteLesson.trim() !== "" ? "active-confirm" : "")}>
                    <p>Are you absolutely sure to delete lesson?</p>
                    <span>This action cannot be undone. This will permanently delete your lesson and remove your data from our servers.</span>
                    <div className="confirm-btn-lesson">
                        <button onClick={() => setDeleteLesson("")}>Cancel</button>
                        <button onClick={prepareRemoveLesson}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}