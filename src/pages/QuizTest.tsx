import {
    BsCheck,
    BsChevronLeft,
    BsFillPlayFill,
    BsFillTerminalFill
} from "react-icons/bs";

import axios from "axios";
import { useParams } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import { getToken } from "../services/authorize";
import { useEffect, useState, useRef } from "react";
import { message, Collapse, Space, Tooltip } from "antd";
import { fetchFileFromStorage } from "../services/storage";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// @ts-ignore
import CodeMirror from "codemirror";
import "codemirror/theme/dracula.css";
import "codemirror/lib/codemirror.css";
import "../assets/css/quiztest/quiz_test.css";
import NoImage from "../assets/img/no image.jpg";

import "codemirror/mode/clike/clike"; // C, C++, Objective-C, C#, Java, Kotlin
import "codemirror/mode/clojure/clojure"; // Clojure
import "codemirror/mode/cobol/cobol"; // Cobol
import "codemirror/mode/commonlisp/commonlisp"; // Common Lisp
import "codemirror/mode/crystal/crystal"; // Crystal
import "codemirror/mode/d/d"; // D
import "codemirror-mode-elixir/dist/codemirror-mode-elixir"; // Elixir
import "codemirror/mode/erlang/erlang"; // Erlang
import "codemirror/mode/mllike/mllike"; // F#, Ocaml
import "codemirror/mode/fortran/fortran"; // Fortran
import "codemirror/mode/go/go"; // Go
import "codemirror/mode/groovy/groovy"; // Groovy
import "codemirror/mode/haskell/haskell"; // Haskell
import "codemirror/mode/javascript/javascript"; // JavaScript
import "codemirror/mode/lua/lua"; // Lua
import "codemirror/mode/octave/octave"; // Octave
import "codemirror/mode/pascal/pascal"; // Pascal
import "codemirror/mode/perl/perl"; // Perl
import "codemirror/mode/php/php"; // PHP
import "codemirror/mode/python/python"; // Python
import "codemirror/mode/r/r"; // R
import "codemirror/mode/ruby/ruby"; // Ruby
import "codemirror/mode/rust/rust"; // Rust
import "codemirror/mode/sql/sql"; // SQL
import "codemirror/mode/swift/swift"; // Swift
import "codemirror/mode/vb/vb"; // VB.Net
import { FaBroomBall } from "react-icons/fa6";

interface IFImage {
    _id: string,
    url: string
}

interface IFExam {
    _id: string,
    title: string,
    description: string,
    random_question: boolean,
    createdBy: string,
    createdAt: string | Date,
}

interface IFQuestion {
    _id: string,
    question: string,
    question_image: string,
    type: "open_ended" | "coding" | "multiple_choice",
    choices: string[],
    solution: string,
    test_case: {
        stdin: string,
        stdout: string
    }[]
}

interface IFProgrammingLanguage {
    id: number,
    name: string
}

interface IFAnswer {
    _id: string,
    remain: number,
    answer: string,
    output: string[],
    testcase: {
        stdin: string,
        stdout: string
        status: "correct" | "pending" | "incorrect"
    }[]
}

interface IFCodeEditor {
    _id: string,
    answer: string,
    solution: string | number,
    handleAnswer: (questionId:string, target:string, value:string | string[] | number) => void
}

const languageModes: { [key: string]: { ids: number[]; mode: string } } = {
    ClikeMode: { ids: [75, 76, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 48, 52, 49, 53, 50, 54, 17, 16,51, 62, 28, 27, 26, 78, 79], mode: "clike" },
    ClojureMode: { ids: [86, 18], mode: "clojure" },
    CobolMode: { ids: [77], mode: "cobol" },
    CommonLispMode: { ids: [55], mode: "commonlisp" },
    CrystalMode: { ids: [19], mode: "crystal" },
    DMode: { ids: [56], mode: "d" },
    ElixirMode: { ids: [20, 57], mode: "elixir" },
    ErlangMode: { ids: [21, 58], mode: "erlang" },
    MlikeMode: { ids: [87, 31, 65], mode: "mllike" },
    FortranMode: { ids: [59], mode: "fortran" },
    GoMode: { ids: [22, 60], mode: "go" },
    GroovyMode: { ids: [88], mode: "groovy" },
    HaskellMode: { ids: [24, 23, 61], mode: "haskell" },
    JavaScriptMode: { ids: [63, 30, 29], mode: "javascript" },
    LuaMode: { ids: [64], mode: "lua" },
    OctaveMode: { ids: [32, 66], mode: "octave" },
    PascalMode: { ids: [33, 67], mode: "pascal" },
    PerlMode: { ids: [85], mode: "perl" },
    PhpMode: { ids: [68], mode: "php" },
    PythonMode: { ids: [70, 36, 35, 34, 71], mode: "python" },
    RMode: { ids: [80], mode: "r" },
    RubyMode: { ids: [41, 40, 39, 38, 72], mode: "ruby" },
    RustMode: { ids: [42, 73], mode: "rust" },
    SqlMode: { ids: [82], mode: "sql" },
    SwiftMode: { ids: [83], mode: "swift" },
    VbMode: { ids: [84], mode: "vb" },
};

const CodeEditor = ({ _id, answer, solution, handleAnswer }:IFCodeEditor) => {
    // ref
    const editorRef = useRef<HTMLDivElement | null>(null);

    // variable
    const selectedMode = Object.values(languageModes).find((lang) => lang.ids.includes(Number(solution)));

    // effect
    useEffect(() => {
        if (editorRef.current) {
            while (editorRef.current.firstChild) {
                editorRef.current.removeChild(editorRef.current.firstChild);
            }

            const instance = CodeMirror(editorRef.current, {
                value: answer,
                lineNumbers: true,
                theme: "dracula",
                mode: selectedMode ? selectedMode.mode : ""
            })

            instance.on("change", (editor:any) => handleAnswer(_id, "answer", editor.getValue()));
        }
    }, []);

    // render
    return (
        <div
            id="code-answer-editor"
            ref={editorRef}
        >
        </div>
    )
}

export default function QuizTest() {
    // auth
    const auth = getAuth();

    // param
    const { exam_id } = useParams();

    // state
    const [exam, setExam] = useState<IFExam>({
        _id: "",
        title: "",
        description: "",
        random_question: false,
        createdBy: "",
        createdAt: "",
    });
    const [answers, setAnswers] = useState<IFAnswer[]>([]);
    const [isCompile, setIsCompile] = useState<boolean>(false);
    const [questions, setQuestions] = useState<IFQuestion[]>([]);
    const [prepareImage, setPrepareImage] = useState<IFImage[]>([]);
    const [languages, setLanguages] = useState<IFProgrammingLanguage[]>([]);

    // effect
    useEffect(() => {
        if (!exam_id) message.error("The exam was not found.");
        else {
            const trackauth = onAuthStateChanged(auth, (user) => {
                if (user) {
                    queryQuestion();
                    queryProgrammingLanguage();
                }
                else message.error("Unauthorize.");
            })
            return () => trackauth();
        }
    }, []);

    // function
    const queryQuestion = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/exam/test/${exam_id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                setAnswers([]);
                setPrepareImage([]);
                const exam = response.data.data[0];
                if (exam.random_question) setQuestions(shuffle(exam.question_ids));
                else setQuestions(exam.question_ids);
                exam.question_ids.map(async(question:IFQuestion) => {
                    setAnswers((prev) => {
                        const newAnswer: IFAnswer = {
                            _id: question._id,
                            remain: 8,
                            answer: "",
                            output: [],
                            testcase: question.test_case.map((test) => {
                                return {
                                stdin: test.stdin,
                                stdout: test.stdout,
                                status: "pending"
                                }
                            })
                        }
                        return [...prev, newAnswer];
                    });
                    if (question.question_image.trim() !== "") {
                        const newUrl = await fetchFileFromStorage(question.question_image);
                        setPrepareImage((prev) => [...prev, { _id: question._id, url: newUrl }]);
                    }
                });
                delete exam.question_ids;
                setExam(exam);
            }
            message.success("The exam was fetched successfully.");
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("The exam could not be fetched.")
            else message.error("The exam could not be fetched.")
        }
    }

    const queryProgrammingLanguage = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/coding/languages/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const languages = response.data.data;
                setLanguages(
                    languages.map(
                        (language:IFProgrammingLanguage) => ({ id: language.id, name: language.name })
                    )
                )
            }
            message.success("The language was fetched successfully.");
        } catch (error) {
            if (axios.isAxiosError(error)) message.error("The language could not be fetched.");
            else message.error("The language could not be fetched.");
        }
    }

    const shuffle = (array:any[]) => {
        for (let index = array.length - 1; index > 0; index--) {
            const rand = Math.floor(Math.random() * (index + 1));
            [array[index], array[rand]] = [array[rand], array[index]];
        }
        return array;
    }

    const handleAnswer = (questionId:string, target:string, value:string | any[] | number) => {
        setAnswers((prev) => {
            return prev.map((ans) => {
                if (ans._id === questionId) return { ...ans, [target]: value };
                else return ans;
            });
        })
    }

    const compileCode = async (questionId: string) => {
        try {
            if (isCompile) return;
            const filterAns = answers.find(ans => ans._id === questionId);
            const filterQuestion = questions.find(quest => quest._id === questionId);
            if (!filterAns || !filterQuestion || filterAns.remain <= 0) {
                message.error("The answer was not found.");
                return;
            }
            if (filterAns.answer.trim() === "") {
                message.error("Please, input your code");
                return;
            }
            handleAnswer(questionId, "remain", filterAns.remain - 1);
            setIsCompile(true);
            const results = await Promise.all(
                filterAns.testcase.map(async (test) => {
                    try {
                        const response = await axios.post(`${import.meta.env.VITE_API_URL}/coding/submissions`, {
                            source_code: filterAns.answer,
                            language_id: Number(filterQuestion.solution),
                            stdin: test.stdin.trim() !== "" ? test.stdin : null,
                            stdout: test.stdout.trim() !== "" ? test.stdout : null
                        }, {
                            headers: { Authorization: `Bearer ${getToken()}` }
                        });
                        const result = response.data.data;
                        const rawOutput = result.stdout || result.stderr || result.compile_output || "";
                        const normalizedUserOutput = normalizeOutput(result.stdout || "");
                        const normalizedExpectedOutput = normalizeOutput(test.stdout);
                        const isCorrect = normalizedUserOutput === normalizedExpectedOutput;
                        return {
                            status: isCorrect ? "correct" : "incorrect",
                            stdout: test.stdout,
                            stdin: test.stdin,
                            actualOutput: rawOutput
                        };
                    } catch (error) {
                        return {
                            status: "incorrect",
                            stdout: test.stdout,
                            stdin: test.stdin,
                            actualOutput: "Error compiling"
                        };
                    }
                })
            );
            const newTestcases = results.map(({ status, stdin, stdout }) => ({ status, stdin, stdout }));
            const newOutputs = results.map(r => r.actualOutput);

            handleAnswer(questionId, "testcase", newTestcases);
            handleAnswer(questionId, "output", [...filterAns.output, ...newOutputs]);

            setIsCompile(false);
        } catch (error) {
            message.error("The code could not be compiled.");
            setIsCompile(false);
        }
    }

    const preSubmit = () => {
        const check = answers.every(ans => ans.answer.trim() !== "");
        if (check) {
            message.success("The exam was sent successfully.");
            setTimeout(() => {
                location.href = "/";
            }, 2000);
        } else message.error("Please answer all questions.");
    }

    const normalizeOutput = (output:string) => output.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    // render
    return (
        <div className="quiz-test-container">
            <div className="quiz-header-content">
                <button className="back-course" onClick={() => window.history.back()}>
                    <i><BsChevronLeft size={16} /></i>
                    <span>Back page</span>
                </button>
                <button className="submit-quiz" onClick={preSubmit}>
                    <i><BsCheck size={20} /></i>
                    Submit
                </button>
            </div>
            <div className="main-quiz">
                <div className="quiz-body-content">
                    <span className="exam-title">{exam.title}</span> <br />
                    <span className="exam-description">{exam.description}</span>
                    <div className="quiz-list">
                        {questions.map((question, index) => (
                            <div id={question._id} className="quiz-card" key={index}>
                                <span className="question-title">{question.question}</span>
                                {question.question_image.trim() !== "" && (
                                    <div className="preview-quiz-image">
                                        <img
                                            alt={question.question}
                                            src={
                                                prepareImage.filter(quest => quest._id === question._id).length > 0 ?
                                                prepareImage.filter(quest => quest._id === question._id)[0].url
                                                : NoImage
                                            }
                                        />
                                    </div>
                                )}
                                <div className="answer-question">
                                    {question.type === "multiple_choice" && (
                                        <div className="multiple-section">
                                            {question.choices.map((choice ,index) => (
                                                <div className="select-choice" key={index}>
                                                    <input
                                                        id={choice}
                                                        type="radio"
                                                        name={question._id}
                                                        onChange={() => handleAnswer(question._id, "answer", choice)}
                                                    />
                                                    <label htmlFor={choice}>{choice}</label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {question.type === "open_ended" && (
                                        <textarea
                                            value={
                                                answers.filter(ans => ans._id === question._id).length > 0 ?
                                                answers.filter(ans => ans._id === question._id)[0].answer
                                                : ""
                                            }
                                            className="open-answer"
                                            placeholder="Enter your answer of question..."
                                            onChange={(e) => handleAnswer(question._id, "answer", e.target.value)}
                                        ></textarea>
                                    )}
                                    {question.type === "coding" && (
                                        <div className="coding-answer">
                                            <div className="coding-answer-header">
                                                <span>
                                                    {languages.filter(lang => lang.id === Number(question.solution)).length > 0 ?
                                                        languages.filter(lang => lang.id === Number(question.solution))[0].name
                                                        : "No Language"
                                                    }
                                                </span>
                                                <button onClick={() => compileCode(question._id)}>
                                                    {isCompile ?
                                                        <Spinner animation="border" role="status" style={{ width: "18px", height: "18px" }}>
                                                            <span className="visually-hidden">Loading...</span>
                                                        </Spinner>
                                                        :
                                                        <i><BsFillPlayFill size={17} /></i>
                                                    }
                                                    Run &nbsp;
                                                    {
                                                        answers.filter(ans => ans._id === question._id).length > 0 ?
                                                        answers.filter(ans => ans._id === question._id)[0].remain + "/8"
                                                        : ""
                                                    }
                                                </button>
                                            </div>
                                            <div className="coding-answer-content">
                                                <CodeEditor
                                                    _id={question._id}
                                                    answer={
                                                        answers.filter(ans => ans._id === question._id).length > 0 ?
                                                        answers.filter(ans => ans._id === question._id)[0].answer
                                                        : ""
                                                    }
                                                    solution={question.solution}
                                                    handleAnswer={handleAnswer}
                                                />
                                            </div>
                                            <div className="coding-answer-output">
                                                <div className="compile-output">
                                                    <span>
                                                        <i><BsFillTerminalFill size={14} /></i>
                                                        Output
                                                    </span>
                                                    <button
                                                        className="clear-editor"
                                                        onClick={() => handleAnswer(question._id, "output", [])}>
                                                        <i><FaBroomBall size={14} /></i>
                                                        Clear
                                                    </button>
                                                    <div className="result-output" style={{ whiteSpace: "pre-line" }}>
                                                        {answers.filter(ans => ans._id === question._id).map((ans) => (
                                                            <div key={index} className="mt-5">
                                                                {ans.output.map((out, index) => (
                                                                    <p style={{ whiteSpace: "pre-line" }} key={index}>
                                                                        {out}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="case-container">
                                                        {answers.filter(ans => ans._id === question._id).map((ans, index) => (
                                                            <Space direction="vertical" key={index}>
                                                                {ans.testcase.map((test, index) => (
                                                                    <Collapse
                                                                    style={{ width: "200px", border: "none" }}
                                                                        key={index}
                                                                        collapsible="header"
                                                                        items={[
                                                                            {
                                                                                key: '1',
                                                                                label: (
                                                                                    <div className="case-title">
                                                                                        <div
                                                                                            className={"case-status " + (test.status === "pending" ? "active-pending" : test.status === "correct" ? "active-correct" : test.status === "incorrect" ? "active-incorrect" : "")}
                                                                                        ></div>
                                                                                        Case : &nbsp;
                                                                                        <Tooltip title={test.stdin}>
                                                                                            <span>{test.stdin.length > 10 ? test.stdin.slice(0, 10) + "..." : test.stdin}</span>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                ),
                                                                                children: (
                                                                                    <div>
                                                                                        <span>Answer : </span>
                                                                                        <Tooltip title={test.stdout}>
                                                                                            <span>{test.stdout.length > 15 ? test.stdout.slice(0, 15) + "..." : test.stdout}</span>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                ),
                                                                            },
                                                                        ]}
                                                                    />
                                                                ))}
                                                            </Space>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}