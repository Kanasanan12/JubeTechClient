import { message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { uploadFileWithProgress, fetchFileFromStorage } from '../../../services/storage';

const { Dragger } = Upload;

interface IFPreviewImage {
    _id: number | string,
    path: string,
    url: string
}

interface UploadImageProp {
    questionId: string,
    currentIndex: number,
    previewImages: IFPreviewImage[],
    setUpdateOnce: React.Dispatch<React.SetStateAction<boolean>>,
    setUpdateFocus: React.Dispatch<React.SetStateAction<string>>,
    setPreviewImages: React.Dispatch<React.SetStateAction<IFPreviewImage[]>>,
    handleQuestion: (target:string, key:string, value:string | boolean) => void,
}

export default function UploadImageQuestion(
    { questionId, currentIndex, previewImages, setUpdateOnce, setUpdateFocus, setPreviewImages, handleQuestion }:UploadImageProp
) {
    // upload property
    const props: UploadProps = {
        name: "file",
        multiple: false,
        maxCount: 1,
        style: {
            width: "100%",
            height: "100%"
        },
        beforeUpload(file) {
            const checkFile = file.type.startsWith("image/");
            const maxSize = 6 * 1024 * 1024;
            if (!checkFile) {
                message.error("The file must be image type!");
                return Upload.LIST_IGNORE;
            }
            if (!(file.size < maxSize)) {
                message.error("The file size must be less than 6MB!");
                return Upload.LIST_IGNORE;
            }
            return true;
        },
        async customRequest({ onSuccess, onProgress, file }) {
            const realfile = file as File;
            const filename = new Date().getTime() + "_" + realfile.name;
            await uploadFileWithProgress(realfile, "/question/", filename, (currentProgress:number) => {
                onProgress?.({ percent: Number(currentProgress.toFixed(2)) });
            });
            const fileurl = await fetchFileFromStorage("/question/" + filename);
            setPreviewImages((prev) => {
                const filtered = prev.filter(item => item._id !== questionId);
                return [
                    ...filtered,
                    { _id: questionId, path: "/question/" + filename, url: fileurl }
                ];
            });
            handleQuestion(questionId, "question_image", "/question/" + filename);
            setUpdateFocus(questionId);
            setUpdateOnce(true);
            onSuccess?.("ok");
        },
        onChange(info) {
            const { status } = info.file;
            if (status === "done") {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onRemove(file) {
            //
        }
    };

    return (
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "purple" }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: "0.95rem" }}>Click or drag image of question (optional)</p>
            <p className="ant-upload-hint">
                Allow image file, maximum size 6MB
            </p>
        </Dragger>
    );
}