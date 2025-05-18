import {
    BsDownload,
    BsChevronLeft,
    BsFillFolderFill,
    BsFileEarmarkFontFill
} from "react-icons/bs";

import axios from "axios";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import { useEffect, useState, useRef } from "react";
// @ts-ignore
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { fetchFileFromStorage } from "../services/storage";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { HTMLsanitization } from "../services/sanitization";
import { message, Collapse, Space, Popover, Dropdown } from "antd";

import videojs from "video.js";
import "video.js/dist/video-js.min.css";
import "../assets/css/course/tiptap.css";
import "@videojs/themes/fantasy/index.css";
import "../assets/css/learncourse/learn_course.css";

import NotFound from "../assets/img/undraw_not-found_6bgl.png";
import { getToken } from "../services/authorize";

interface IFCourse {
    _id: string,
    thumbnail: string,
    title: string,
    description: string,
    objectives: string[],
    group_ids: {
        name: string
    }[],
    rating: number,
    instructor: {
        firstname: string,
        lastname: string,
        email: string
    },
    pretest: string | null,
    posttest: string | null,
    useCertificate: boolean,
    duration: number,
    level: "beginner" | "intermediate" | "expert",
    section_ids: {
        title: string,
        lesson_ids: {
            _id: string,
            name: string,
            type: "lecture" | "video",
            sub_file: string[],
            main_content: string
        }[]
    }[]
}

interface IFLesson {
    _id: string,
    name: string,
    type: "lecture" | "video",
    sub_file: string[],
    main_content: string
}

const VideoComponent = ({ videoContent, onEnded }: { videoContent: string, onEnded: () => Promise<void> }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoContent.trim() !== "") {
            const videoElement = videoRef.current;

            if (videoElement) {
                videoElement.innerHTML = '';

                setTimeout(() => {
                    if (videoRef.current) {
                        const videoElement = videoRef.current;

                        // Initialize video player
                        const player = videojs(videoElement, {
                            theme: "fantasy",
                        });

                        if (videoContent.includes(".mp4")) {
                            const source = document.createElement('source');
                            source.src = videoContent;
                            source.type = "video/mp4";
                            videoElement.appendChild(source);
                        }

                        if (videoContent.includes(".webm")) {
                            const source = document.createElement('source');
                            source.src = videoContent;
                            source.type = "video/webm";
                            videoElement.appendChild(source);
                        }

                        player.load();

                        return () => {
                            player.dispose();
                        };
                    }
                }, 1000);
            }
        }
    }, [videoContent]);

    return (
        <div className="video-content">
            <video
                ref={videoRef}
                className="video-js vjs-theme-fantasy manual-video"
                preload="metadata"
                onLoadedMetadata={(e) => {
                    const duration = e.currentTarget.duration;
                    console.log("Video duration:", duration);
                }}
                onEnded={() => {
                    if (onEnded) onEnded();
                }}
                controls
            />
        </div>
    );
};

export default function LearnCourse() {
    // params
    const { course_id, lesson_id } = useParams();

    // auth
    const auth = getAuth();

    // ref
    const contentRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // state
    const [isRender, setIsRender] = useState<boolean>(false);
    const [course, setCourse] = useState<IFCourse>({
        _id: "",
        thumbnail: "",
        title: "",
        description: "",
        objectives: [],
        group_ids: [],
        rating: 0,
        instructor: {
            firstname: "",
            lastname: "",
            email: ""
        },
        pretest: null,
        posttest: null,
        useCertificate: false,
        duration: 0,
        level: "beginner",
        section_ids: []
    });
    const [currentLesson, setCurrentLesson] = useState<IFLesson>({
        _id: "",
        name: "",
        type: "lecture",
        sub_file: [],
        main_content: ""
    });
    const [initialVideo, setInitialVideo] = useState<boolean>(false);
    const [videoContent, setVideoContent] = useState<string>("");


    const updateLessonProgress = async () => {
        try {
            if (!course_id || !currentLesson._id) return;

     
            let totalLessons = 0;
            let completedLessons = 0;


            const completedLessonsKey = `course_${course_id}_completed_lessons`;
            const completedLessonsData = localStorage.getItem(completedLessonsKey);
            const completedLessonIds = completedLessonsData ? JSON.parse(completedLessonsData) : [];

            if (!completedLessonIds.includes(currentLesson._id)) {
                completedLessonIds.push(currentLesson._id);
                localStorage.setItem(completedLessonsKey, JSON.stringify(completedLessonIds));
            }

     
            course.section_ids.forEach(section => {
                totalLessons += section.lesson_ids.length;
                section.lesson_ids.forEach(lesson => {
                    if (completedLessonIds.includes(lesson._id)) {
                        completedLessons++;
                    }
                });
            });


            const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

     
            await axios.put(`${import.meta.env.VITE_API_URL}/enrollments/progress`, {
                courseId: course_id,
                progress: progressPercentage
            },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            if (progressPercentage >= 100) message.success("The course was learn successfully.");

            console.log(`Progress updated: ${progressPercentage}%`);
        } catch (error) {
            console.error("Error updating progress:", error);
            message.error("Failed to update course progress");
        }
    };

    // effect
    useEffect(() => {
        if (!course_id) message.error("The course was not found.");
        else {
            const trackauth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    fetchCourse();
                    updateLessonProgress();
                };
            });

            return () => trackauth();
        }
    }, []);

    useEffect(() => {
        if (currentLesson._id.trim() !== "" && currentLesson.type === "video") {
            const videoElement = videoRef.current;
            if (videoElement) {
                videoElement.src = "";
                videoElement.load();
            }
            setInitialVideo(false);
            fetchFile();
        }
        updateLessonProgress();
    }, [currentLesson]);

    // function
    const fetchCourse = async () => {
        try {
            setIsRender(false);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/learn/${course_id}`);
            if (response.data.course) {
                const course = response.data.course as IFCourse;
                setCourse(course);
                if (course.section_ids.length > 0) {
                    if (lesson_id) {
                        let foundLesson = null;
                        for (const section of course.section_ids) {
                            const match = section.lesson_ids.find(lesson => lesson._id === lesson_id);
                            if (match) {
                                foundLesson = match;
                                break;
                            }
                        }
                        if (foundLesson) {
                            setCurrentLesson(foundLesson);
                        } else {
                            message.warning("Lesson not found. Showing first lesson.");
                            if (course.section_ids[0].lesson_ids.length > 0) {
                                setCurrentLesson(course.section_ids[0].lesson_ids[0]);
                            }
                        }
                    } else {
                        if (course.section_ids[0].lesson_ids.length > 0) {
                            setCurrentLesson(course.section_ids[0].lesson_ids[0]);
                        }
                    }
                }
                message.success("The course was fetched successfully.");
            } else message.error("Error from fetch course.");
            setIsRender(true);
        } catch (error) {
            if (axios.isAxiosError(error)) message.error(error.response?.data.message || "Error from fetch course.");
            else message.error("Error from fetch course.");
        }
    }

    const fetchFile = async () => {
        try {
            const newUrl = await fetchFileFromStorage(currentLesson.main_content);
            setVideoContent(newUrl);
        } catch (error) {
            message.error("Error from fetch file.");
        }
    }

    const handleDownloadPDF = async () => {
        // const element = contentRef.current;
        // if (!element) return;

        // const canvas = await html2canvas(element, {
        //     scale: 2,
        //     scrollY: -window.scrollY,
        //     useCORS: true,
        // });

        // const imgData = canvas.toDataURL("image/png");
        // const pdf = new jsPDF("p", "mm", "a4");

        // const pdfWidth = pdf.internal.pageSize.getWidth();
        // const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        // pdf.save(`${currentLesson.name}.pdf`);
        const original = contentRef.current;
        if (!original) return;
        let container = document.getElementById("pdf-clone-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "pdf-clone-container";
            container.style.position = "fixed";
            container.style.left = "-99999px";
            container.style.top = "0";
            document.body.appendChild(container);
        }
        const clone = original.cloneNode(true) as HTMLElement;
        clone.style.width = original.scrollWidth + "px";
        clone.style.height = original.scrollHeight + "px";
        clone.style.maxHeight = "none";
        clone.style.overflow = "visible";
        clone.style.background = "#fff";
        clone.style.visibility = "visible";
        clone.style.display = "block";
        container.appendChild(clone);
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight,
        });
        container.removeChild(clone);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        let position = 0;
        while (position < pdfHeight) {
            pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
            position += pdf.internal.pageSize.getHeight();
            if (position < pdfHeight) pdf.addPage();
        }

        pdf.save(`${currentLesson.name}.pdf`);
    }

    const downloadSubFile = async (path: string) => {
        try {
            const newUrl = await fetchFileFromStorage(path);
            if (!newUrl) {
                message.error("The sub file was not found.");
                return;
            }
            const link = document.createElement("a");
            link.href = newUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            message.error("Failed to download the sub file.");
        }
    };

    const ChangeLesson = (lesson_id: string) => {
        if (lesson_id) location.href = `/course/learn/${course_id}/lesson/${lesson_id}`;
        else message.error("The lesson was not found.");
    }

    // render
    return (
        <>
            {isRender ?
                <div className="learn-course-container">
                    {!course_id || !course.title ?
                        <div className="not-found-course">
                            <img src={NotFound} alt="not found" />
                            <span>The course was not found.</span>
                            <button onClick={() => location.href = "/my-courses"}>Back page</button>
                        </div>
                        :
                        <>
                            <div className="header-course-content">
                                <button onClick={() => location.href = "/my-courses"}>
                                    <i><BsChevronLeft size={15} /></i>
                                    <span>Back page</span>
                                </button>
                                <span>
                                    {course.title.length > 30 ?
                                        course.title.slice(0, 30) + "..."
                                        :
                                        course.title
                                    }
                                </span>
                                <div></div>
                            </div>
                            <div className="learn-course">
                                <div className="course-content">
                                    <div className="main-lesson-content">
                                        {currentLesson._id.trim() !== "" ?
                                            <>
                                                {currentLesson.type === "lecture" ?
                                                    <div className="lecture-content">
                                                        <div className="lesson-title">
                                                            {currentLesson.name.length > 60 ?
                                                                currentLesson.name.slice(0, 60) + "..."
                                                                :
                                                                currentLesson.name
                                                            }
                                                        </div>
                                                        <div className="lesson-html tiptap" ref={contentRef}>
                                                            {parse(HTMLsanitization(currentLesson.main_content))}
                                                        </div>
                                                        <button
                                                            className="download-pdf"
                                                            onClick={handleDownloadPDF}
                                                        >
                                                            <i><BsDownload size={15} /></i>
                                                            Download PDF
                                                        </button>
                                                    </div>
                                                    :
                                                    <div className="video-content">
                                                        <VideoComponent videoContent={videoContent}
                                                            onEnded={updateLessonProgress}
                                                        />
                                                    </div>
                                                }
                                            </>
                                            :
                                            ""
                                        }
                                    </div>
                                </div>
                                <div className="side-section">
                                    <Space direction="vertical">
                                        {course.pretest && (
                                            <div className="pretest-container" onClick={() => location.href = "/quiz/test/" + course.pretest}>
                                                <i><BsFileEarmarkFontFill size={18} /></i>
                                                Pretest
                                            </div>
                                        )}
                                        {course.section_ids.map((section, index) => (
                                            <Collapse
                                                key={index}
                                                defaultActiveKey={[...index.toString()]}
                                                collapsible="header"
                                                style={{ width: "340px", overflow: "hidden", paddingRight: "10px", backgroundColor: "#b81ce8" }}
                                                items={[
                                                    {
                                                        key: `${index}`,
                                                        label: (
                                                            <Popover
                                                                placement="top"
                                                                content={<span>{section.title}</span>}
                                                                trigger="hover"
                                                            >
                                                                <span style={{ color: "#FFFFFF" }}>
                                                                    {section.title.length > 35 ?
                                                                        section.title.slice(0, 35) + " ..."
                                                                        :
                                                                        section.title
                                                                    }
                                                                </span>
                                                            </Popover>
                                                        ),
                                                        children: (
                                                            <div className="sub-lesson-card">
                                                                {section.lesson_ids.map((lesson, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className={"lesson-card-content " + (currentLesson._id === lesson._id ? "active-lesson" : "")}
                                                                    >
                                                                        <span
                                                                            className="lesson-name"
                                                                            onClick={() => ChangeLesson(lesson._id)}
                                                                        >
                                                                            {lesson.name.length > 40 ?
                                                                                lesson.name.slice(0, 40)
                                                                                :
                                                                                lesson.name
                                                                            }
                                                                        </span>
                                                                        {lesson.sub_file.length > 0 && (
                                                                            <Dropdown
                                                                                className="sub-file-download"
                                                                                menu={{
                                                                                    items: lesson.sub_file.map((subfile, index) => ({
                                                                                        key: `${index}`,
                                                                                        label: (
                                                                                            <span
                                                                                                className="subfile-name"
                                                                                                onClick={() => downloadSubFile(subfile)}
                                                                                            >
                                                                                                {subfile.split("_")[2].length > 15
                                                                                                    ? subfile.split("_")[2].slice(0, 15) + "..."
                                                                                                    : subfile.split("_")[2]}
                                                                                            </span>
                                                                                        ),
                                                                                    })),
                                                                                }}
                                                                            >
                                                                                <a
                                                                                    className="subfile-download"
                                                                                    onClick={(e) => e.preventDefault()}
                                                                                >
                                                                                    <i><BsFillFolderFill size={15} /></i> Lesson file
                                                                                </a>
                                                                            </Dropdown>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    }
                                                ]}
                                            />
                                        ))}
                                        {course.posttest && (
                                            <div className="posttest-container" onClick={() => location.href = "/quiz/test/" + course.posttest}>
                                                <i><BsFileEarmarkFontFill size={18} /></i>
                                                Posttest
                                            </div>
                                        )}
                                    </Space>
                                </div>
                            </div>
                            <div id="pdf-clone-container" style={{ position: "fixed", left: "-99999px", top: 0 }}></div>
                        </>
                    }
                </div>
                :
                <div
                    className="preload-learn-course"
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
        </>
    );
}