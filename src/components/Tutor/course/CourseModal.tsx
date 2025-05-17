import {
    BsX,
    BsGear,
    BsPlus,
    BsBoxes,
    BsClock,
    BsTrash,
    BsPencil,
    BsImages,
    BsBookFill,
    BsJournalText,
    BsFillPenFill,
    BsFillStarFill,
    BsRocketTakeoff,
    BsFillPlusCircleFill,
} from "react-icons/bs";

import Spinner from 'react-bootstrap/Spinner';
import { IFSearchCourse } from "./CourseManage";
import { useState, useEffect, useRef } from "react";
import { Select, message, InputNumber } from "antd";
import { useGroup } from "../../../contexts/GroupContext";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useCourse, CreateCourse } from "../../../contexts/CourseContext";
import { fetchFileFromStorage, uploadFile, deleteFile } from "../../../services/storage";

import "../../../assets/css/course/course-modal.css";
import NoImage from "../../../assets/img/no image.jpg"

interface IFModalProp {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>
    editCourseId: string,
    setEditCourseId: React.Dispatch<React.SetStateAction<string>>,
    searchCourse: IFSearchCourse
}

interface CreateCourseCardProp {
    thumbnail: string,
    title: string,
    description: string,
    level: string,
    price: string | number,
    action: string
}

interface IFThumbnailImage {
    file: File | null,
    url: string
}

const levelOptions = [
    {
        value: "beginner",
        label: "Beginner"
    },
    {
        value: "intermediate",
        label: "Intermediate"
    },
    {
        value: "expert",
        label: "Expert"
    }
]

export const CreateCourseCard = ({ thumbnail, title, description, level, price, action }:CreateCourseCardProp) => {
    return (
        <div className="course-card-container">
            <div className="course-card-image">
                <button>
                    <i><BsGear size={18} /></i>
                </button>
                <img
                    alt={title}
                    src={thumbnail.trim() !== "" ? thumbnail : NoImage}
                />
            </div>
            <div className="course-card-info" style={{ padding: "5px" }}>
                <span className="course-title">
                    {title.length > 25 ?
                        title.slice(0, 25) + "..."
                        :
                        title
                    }
                </span>
                <span className="course-description">
                    {description.length > 80 ?
                        description.slice(0, 80) + "..."
                        :
                        description
                    }
                </span>
                <div className="course-sub-info">
                    <div className="rating-info">
                        <i><BsFillStarFill size={10} fill="#f5d002" /></i>
                        0
                    </div>
                    <div className="level-info">
                        <i><BsBookFill size={10} /></i>
                        {level}
                    </div>
                </div>
                <div className="author">
                    <i><BsFillPenFill size={14} /></i>
                    test course
                </div>
                <div className="course-card-footer">
                    <span className="price">{price.toLocaleString()} ฿</span>
                    <button className="see-detail">
                        {action}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function CourseModal({ showModal, setShowModal, editCourseId, setEditCourseId, searchCourse }:IFModalProp) {
    // firebase
    const auth = getAuth();

    // context
    const { state:groupState, fetchAllGroups } = useGroup();
    const { state:courseState, updateCourse, createCourse, fetchCourseById, dispatch } = useCourse();

    // ref
    const inputFileRef = useRef<HTMLInputElement | null>(null);

    // state
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [isRender, setIsRender] = useState<boolean>(false);
    const [createData, setCreateData] = useState<CreateCourse>({
        thumbnail: "",
        title: "",
        usePoint: false,
        price: 200,
        point: 0,
        objectives: [],
        status: "draft",
        useCertificate: true,
        duration: 1,
        level: "beginner",
        pretest: null,
        posttest: null,
        description: "",
        note: "",
        group_ids: [],
        section_ids: []
    });
    const { thumbnail, title, description, price, level, group_ids, duration, useCertificate, usePoint, point } = createData;
    const [thumbnailImage, setThumbnailImage] = useState<IFThumbnailImage>({
        file: null,
        url: ""
    });
    const [groupData, setGroupData] = useState<{ value:string, label:string }[]>([]);

    // effect
    useEffect(() => {
        setIsRender(false);
        const trackauth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                alert("Unauthenticate on firebase.");
            } else {
                (async() => {
                    await fetchAllGroups("");
                    if (editCourseId.trim() !== "") {
                        await fetchCourseById(editCourseId);
                    }
                })();
            }
        });
    
        return () => trackauth();
    }, [editCourseId]);

    useEffect(() => {
        if (groupState.groups.length > 0) {
            const groups = groupState.groups.map(group => ({ value: group._id, label: group.name }));
            setGroupData(groups);
        } else {
            setGroupData([]);
        }
        setIsRender(true);
    }, [groupState.groups]);

    useEffect(() => {
        if (courseState.course_edit !== null) {
            (async() => {
                const editCourse = courseState.course_edit;
                const thumbnailUrl = await fetchFileFromStorage(editCourse?.thumbnail ?? "");
                setThumbnailImage({ file: null, url: thumbnailUrl ?? "" });
                setCreateData({
                    thumbnail: editCourse?.thumbnail ?? "",
                    title: editCourse?.title ?? "",
                    usePoint: editCourse?.usePoint ?? false,
                    price: editCourse?.price ?? 0,
                    point: editCourse?.point ?? 0,
                    objectives: editCourse?.objectives ?? [],
                    status: editCourse?.status ?? "draft",
                    useCertificate: editCourse?.useCertificate ?? true,
                    duration: editCourse?.duration ?? 1,
                    level: editCourse?.level ?? "beginner",
                    pretest: editCourse?.pretest ?? null,
                    posttest: editCourse?.posttest ?? null,
                    description: editCourse?.description ?? "",
                    note: editCourse?.note ?? "",
                    group_ids: editCourse?.group_ids ?? [],
                    section_ids: editCourse?.section_ids ?? [],
                });
            })();
        }
    }, [courseState.course_edit]);

    useEffect(() => {
        if (isUpdate) {
            (async() => {
                await updateCourse(editCourseId, createData, searchCourse);
                setIsUpdate(false);
                setIsRender(true);
            })();
        }
    }, [isUpdate]);

    // function
    const handleCreateCourse = (target:string, value: boolean | string | number | string[]) => {
        setCreateData((prev) => ({ ...prev, [target]: value }));
    }

    const handleFileChange = () => {
        if (inputFileRef.current && inputFileRef.current.files && inputFileRef.current.files.length > 0) {
            const maxSize = 6 * 1024 * 1024;
            const file = inputFileRef.current.files[0];
            if (!(file.size < maxSize)) {
                message.error("The file size must be less than 6MB!!");
                return;
            };
            if (file.type.startsWith("image/")) {
                const newUrl = URL.createObjectURL(file);
                const newFileName = new Date().getTime() + "_" + file.name;
                setThumbnailImage({ file, url: newUrl });
                handleCreateCourse("thumbnail", "/course/course_image/" + newFileName);
            } else {
                message.error("The file must be image type!!");
                return;
            }
        } else {
            setThumbnailImage({ file: null, url: "" });
            handleCreateCourse("thumbnail", "");
        }
    }

    const handleSubmitForm = async(e:React.FormEvent, type: string) => {
        e.preventDefault();
        // validate data
        let validate = true;
        if (createData.thumbnail.trim() === "") {
            alertErrorMessage("Please, upload your image file to update.");
            validate = false;
        }
        if (createData.group_ids.length === 0) {
            alertErrorMessage("Please, select your group.");
            validate = false;
        }
        if (validate) {
            switch (type) {
                case "create":
                    setIsRender(false);
                    const createThumbnail = createData.thumbnail.split("/course/course_image/")[1];
                    await uploadFile(thumbnailImage.file as File, "/course/course_image", createThumbnail);
                    await createCourse(createData, searchCourse);
                    clearForm();
                    setIsRender(true);
                    setShowModal(false);
                    break;
                case "update":
                    setIsRender(false);
                    const updateThumbnail = createData.thumbnail.split("/course/course_image/")[1];
                    await uploadFile(thumbnailImage.file as File, "/course/course_image", updateThumbnail);
                    await updateCourse(editCourseId, createData, searchCourse);
                    dispatch({ type: "CLEAR_EDIT", message: "", status: 0 });
                    clearForm();
                    setEditCourseId("");
                    setIsRender(true);
                    setShowModal(false);
                    // location.reload();
                    break;
                default:
                    break;
            }
        }
    }

    const alertErrorMessage = (error_msg:string) => message.error(error_msg);

    const clearForm = () => {
        setCreateData({
            thumbnail: "",
            title: "",
            usePoint: false,
            price: 200,
            point: 0,
            objectives: [],
            status: "draft",
            useCertificate: true,
            duration: 1,
            level: "beginner",
            pretest: "",
            posttest: "",
            description: "",
            note: "",
            group_ids: [],
            section_ids: []
        });
    }

    // render
    return (
        <div className={"course-modal-container " + (showModal ? "active-modal" : "")}>
            <div className={"main-course-modal " + (showModal ? "active-modal" : "")}>
                {isRender ?
                    <form
                        onSubmit={(e) => {
                            editCourseId.trim() !== "" ?
                            handleSubmitForm(e, "update") :
                            handleSubmitForm(e, "create")
                        }}
                    >
                        <div className="course-modal-header">
                            <button
                                type="button"
                                className="close-course-modal"
                                onClick={() => {
                                    clearForm();
                                    setEditCourseId("");
                                    dispatch({ type: "CLEAR_EDIT", message: "", status: 0 });
                                    setShowModal(!showModal);
                                }}
                            >
                                <i><BsX size={23} /></i>
                            </button>
                            <span>{editCourseId.trim() !== "" ? "Update Course" : "Create New Course"}</span>
                            <button
                                type="submit"
                                className="submit-create-course"
                            >
                                <i><BsPlus size={19} /></i>
                                {editCourseId.trim() !== "" ? "Update" : "Create"}
                            </button>
                        </div>
                        <div className="course-modal-body">
                            <div className="thumbnail-container">
                                <div className="background-thumbnail"></div>
                                <div className="thumbnail-input">
                                    {thumbnail.trim() === "" ?
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={inputFileRef}
                                                onChange={handleFileChange}
                                                hidden
                                            />
                                            <button
                                                type="button"
                                                onClick={() => inputFileRef.current?.click()}
                                            >
                                                <i><BsImages size={13} /></i>
                                                Upload
                                            </button>
                                        </>
                                        :
                                        <div className="preview-course-thumbnail">
                                            <button
                                                type="button"
                                                onClick={async() => {
                                                    if (editCourseId.trim() === "") {
                                                        handleCreateCourse("thumbnail", "");
                                                        setThumbnailImage({ file: null, url: "" });
                                                    } else {
                                                        setIsRender(false);
                                                        await deleteFile([courseState.course_edit?.thumbnail ?? ""]);
                                                        setTimeout(() => {
                                                            setThumbnailImage({ file: null, url: "" });
                                                            handleCreateCourse("thumbnail", "");
                                                            setIsUpdate(true);
                                                        }, 2000);
                                                    }
                                                }}
                                            >
                                                <i><BsTrash size={11} /></i>
                                                Remove
                                            </button>
                                            <img src={thumbnailImage.url ?? NoImage} alt="Preview image" />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="main-course-input">
                                <div className="title-input">
                                    <label htmlFor="course-title">
                                        <i><BsPencil size={12} /></i>
                                        Title : 
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        minLength={3}
                                        maxLength={150}
                                        id="course-title"
                                        onChange={(e) => handleCreateCourse("title", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="group-course-input">
                                    <label htmlFor="course-group">
                                        <i><BsBoxes size={15} /></i>
                                        Group
                                    </label>
                                    <Select
                                        allowClear={true}
                                        showSearch={false}
                                        maxCount={3}
                                        suffixIcon={(
                                            <>
                                                <span>{group_ids.length} / 3</span>
                                                <BsFillPlusCircleFill size={14} />
                                            </>
                                        )}
                                        mode="multiple"
                                        value={group_ids}
                                        id="course-group"
                                        options={groupData}
                                        style={{ width: "100%" }}
                                        onChange={(value) => handleCreateCourse("group_ids", value)}
                                        placeholder="Select your course group..."
                                    />
                                </div>
                                <div className="d-flex gap-3 flex-wrap mt-2">
                                    <div className="course-duration-input">
                                        <label htmlFor="course-duration">
                                            <i><BsClock size={15} /></i>
                                            Duration (Per Days) : 
                                        </label>
                                        <InputNumber
                                            min={1}
                                            type="number"
                                            value={duration}
                                            id="course-duraion"
                                            style={{ fontSize: "0.85rem" }}
                                            onChange={(value) => handleCreateCourse("duration", value ?? 0)}
                                            required
                                        />
                                    </div>
                                    <div className="course-level-input">
                                        <label htmlFor="course-level">
                                            <i><BsRocketTakeoff size={14} /></i>
                                            Level : 
                                        </label>
                                        <Select
                                            value={level}
                                            id="course-level"
                                            options={levelOptions}
                                            style={{ width: "140px" }}
                                            onChange={(value) => handleCreateCourse("level", value)}
                                        />
                                    </div>
                                </div>
                                <div className="course-description-input mt-2">
                                    <label htmlFor="course-description">
                                        <i><BsJournalText size={14} /></i>
                                        Description : 
                                    </label>
                                    <textarea
                                        minLength={5}
                                        maxLength={500}
                                        value={description}
                                        id="course-description"
                                        placeholder="Enter your course description..."
                                        onChange={(e) => handleCreateCourse("description", e.target.value)}
                                        required
                                    ></textarea>
                                    <span>{description.length} / 500</span>
                                </div>
                                <div className="course-number">
                                    <div className="course-price-input">
                                        <label htmlFor="course-price">Price : </label>
                                        <InputNumber
                                            min={0}
                                            max={2000}
                                            type="number"
                                            value={price}
                                            onChange={(value) => handleCreateCourse("price", Number(value))}
                                            required
                                        />
                                    </div>
                                    <div className="course-point-input">
                                        <div className="check-point">
                                            <input
                                                type="checkbox"
                                                checked={usePoint}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleCreateCourse("point", 100);
                                                        handleCreateCourse("usePoint", true);
                                                    } else {
                                                        handleCreateCourse("point", 0);
                                                        handleCreateCourse("usePoint", false);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="course-point">Can use point ? </label>
                                        </div>
                                        {usePoint && (
                                            <InputNumber
                                                min={100}
                                                max={1000}
                                                type="number"
                                                value={point}
                                                onChange={(value) => handleCreateCourse("point", Number(value))}
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap mt-2 gap-4">
                                    <div className="course-certificate-input">
                                        <input
                                            type="checkbox"
                                            checked={useCertificate}
                                            onChange={(e) => {
                                                e.target.checked ?
                                                handleCreateCourse("useCertificate", true) :
                                                handleCreateCourse("useCertificate", false);
                                            }}
                                        />
                                        <label htmlFor="">Select if the student should receive a certificate.</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    :
                    <div className="preload-course-modal">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                }
            </div>
        </div>
    );
}