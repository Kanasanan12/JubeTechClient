import { IFToggleSidebar } from "../app";
import { useState, useRef, useEffect } from "react";
import MainDashboard from "../layouts/MainDashboard";

import {
    BsCode,
    BsPlay,
    BsCopy,
    BsTerminal
} from "react-icons/bs";
import { FaBroomBall } from "react-icons/fa6";

// @ts-ignore
import CodeMirror from "codemirror";

import axios from "axios";
import "codemirror/lib/codemirror.css";
import { message, Select } from "antd";
import Spinner from 'react-bootstrap/Spinner';
import { getToken } from "../services/authorize";
import "../assets/css/codeeditor/code_editor.css";

// mode
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

// No Extension Prolog, Scala, Typescript

// theme
import "codemirror/theme/dracula.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/eclipse.css";
import "codemirror/theme/solarized.css";

export default function CodeEditor({toggleSidebar, setToggleSidebar}:IFToggleSidebar) {
    // ref
    const editorRef = useRef<HTMLDivElement | null>(null);

    // state
    const [code, setCode] = useState<string>("");
    const [output, setOutput] = useState<string[]>([]);
    const [mode, setMode] = useState<string>("javascript");
    const [isRender, setIsRender] = useState<boolean>(false);
    const [isCompile, setIsCompile] = useState<boolean>(false);
    const [compile, setCompile] = useState<number | null>(null);
    const [languageValue, setLanguageValue] = useState<string>("");
    const [languageData, setLanguageData] = useState<{ label: string; value: string }[]>([]);
    const [theme, setTheme] = useState<"dracula" | "monokai" | "eclipse" | "solarized">("dracula");

    // effect
    useEffect(() => {
        setIsRender(false);
        fetchProgrammingLanguage();
    }, []);

    useEffect(() => {
        if (editorRef.current) {
            while (editorRef.current.firstChild) {
                editorRef.current.removeChild(editorRef.current.firstChild);
            }

            const instance = CodeMirror(editorRef.current, {
                value: code,
                lineNumbers: true,
                theme,
                mode,
            });

            instance.on("change", (editor:any) => {
                setCode(editor.getValue());
            });
        }
    }, [isRender, theme, mode]);

    // function
    const fetchProgrammingLanguage = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/coding/languages/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                setLanguageData(
                    response.data.data
                    .filter((language:any) => ![1, 2, 46, 3, 47, 44, 25, 89, 43].includes(language.id))
                    .map((language:any) => ({
                        label: language.name,
                        value: language.id.toString()
                    }))
                );
                setLanguageData((prev) => ([...prev, { label: "None", value: "" }]));
            } else {
                setLanguageData([]);
            }
            setIsRender(true);
        } catch (error) {
            if (axios.isAxiosError(error)) message.error(error.response?.data.message || "Error fetching programming languages");
            else message.error("Error fetching programming languages");
        }
    }

    const handleLanguge = (value:string) => {
        const languageModes: { [key: string]: { ids: number[]; mode: string } } = {
            ClikeMode: { ids: [75, 76, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 48, 52, 49, 53, 50, 54, 17, 16, 51, 62, 28, 27, 26, 78, 79], mode: "clike" },
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
        setLanguageValue(value);
        setCompile(Number(value));
        const selectedMode = Object.values(languageModes).find((lang) => lang.ids.includes(Number(value)));
        if (selectedMode) setMode(selectedMode.mode);
        else setMode("");
    }

    const compileCode = async() => {
        try {
            if (!compile) {
                message.error("Please, select your programming language.");
                return;
            }
            setIsCompile(true);
            if (isCompile) {
                return
            };
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/coding/submissions`, {
                source_code: code, language_id: compile
            }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.data.data) {
                const result = response.data.data;
                if (result.stdout) setOutput((prev) => ([...prev, result.stdout]));
                if (result.stderr) setOutput((prev) => ([...prev, result.stderr]));
                if (result.compile_output) setOutput((prev) => ([...prev, result.compile_output]));
            }
            setIsCompile(false);
        } catch (error) {
            message.error("Error from compile code.");
            setIsCompile(false);
        }
    }


    // render
    return (
        <MainDashboard
            title="Code Editor"
            toggleSidebar={toggleSidebar}
            setToggleSidebar={setToggleSidebar}
            title_sidebar="ภาพรวมแดชบอร์ด"
        >
            <div className="code-editor-container">
                {isRender ?
                <>
                    <div className="main-code-editor">
                        <div className="main-code-content">
                            <div className="header-editor">
                                <span>
                                    <i><BsCode size={18} /></i>
                                    Code
                                </span>
                                <div className="header-editor-option">
                                    <button
                                        className="copy-code"
                                        onClick={() => {
                                            navigator.clipboard.writeText(code);
                                            message.success("Code copied to clipboard!");
                                        }}
                                    >
                                        <i><BsCopy size={13} /></i>
                                        copy
                                    </button>
                                    <button className="run-code" onClick={compileCode}>
                                        {isCompile ?
                                            <Spinner animation="border" role="status" style={{ width: "18px", height: "18px" }}>
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                            :
                                            <i><BsPlay size={20} /></i>
                                        }
                                        Run
                                    </button>
                                </div>
                            </div>
                            <div
                                id="code-editor"
                                ref={editorRef}
                                className="code-editor-content"
                            >
                            </div>
                        </div>
                        <div className="code-option">
                            <div className="select-language">
                                <label htmlFor="select-language">Language : </label>
                                <Select
                                    suffixIcon={null}
                                    value={languageValue}
                                    options={languageData}
                                    onChange={handleLanguge}
                                    placeholder="Select programming language..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="result-compile">
                        <span>
                            <i><BsTerminal size={14} /></i>
                            Output
                        </span>
                        <button
                            className="copy-output"
                            onClick={() => {
                                navigator.clipboard.writeText(output[output.length - 1]);
                                message.success("Code copied to clipboard!");
                            }}
                        >
                            <i><BsCopy size={14} /></i>
                            Copy latest output
                        </button>
                        <button className="clear-output" onClick={() => setOutput([])}>
                            <i><FaBroomBall size={14} /></i>
                            Clear
                        </button>
                        <div className="result-output" style={{ whiteSpace: "pre-line" }}>
                            {output.map((out, index) => (
                                <p style={{ whiteSpace: "pre-line" }} key={index}>{out}</p>
                            ))}
                        </div>
                    </div>
                </>
                :
                <div
                    className="preload-editor-container"
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
        </MainDashboard>
    );
}