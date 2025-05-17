import { Popover } from "antd";
import { LessonCard as IFLessonCard } from "../../../contexts/LessonContext";
import { BsBookHalf, BsCameraVideoFill, BsFillTrashFill, BsFillFolderFill } from "react-icons/bs";

interface LessonCardProp {
    setEditLesson: React.Dispatch<React.SetStateAction<string>>,
    setDeleteLesson: React.Dispatch<React.SetStateAction<string>>
}

export default function LessonCard({ _id, name, type, sub_file,  isFreePreview, updatedAt, setDeleteLesson }:IFLessonCard & LessonCardProp) {
    return (
        <div className="lesson-card">
            <Popover placement="right" content={<span>{name}</span>} title="ℹ️ Full lesson name.">
                <div className="d-flex align-items-center justify-content-between">
                <p
                    className="title-name"
                    style={{ margin: "0" }}
                >
                    {name.length > 20 ? name.substring(0, 20) + "..." : name}
                </p>
                <div className="card-option-container">
                    <button onClick={() => setDeleteLesson(_id)}>
                        <i><BsFillTrashFill /></i>
                    </button>
                </div>
                </div>
            </Popover>
            <div className="condition-info">
                <span className={"type " + (type === "lecture" ? "active-lecture" : "active-video")}>
                    {type === "lecture" ? <i><BsBookHalf size={15} /></i> : <i><BsCameraVideoFill size={18} /></i>}
                    {type.slice(0, 1).toUpperCase() + type.slice(1)}
                </span>
                {isFreePreview === true && <span className="preview">Preview</span>}
            </div>
            {sub_file.length > 0 && (
                <div className="sub_files">
                    <i><BsFillFolderFill size={14} /></i>
                    Sub file : {sub_file.length > 1 ? sub_file.length + " files" : sub_file.length + " file"}
                </div>
            )}
            <span className="lesson-updated">Updated At : {new Date(updatedAt).toLocaleString()}</span>
        </div>
    );
}