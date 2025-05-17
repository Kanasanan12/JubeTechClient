import {
    BsPlus,
    BsPencil,
    BsSearch,
    BsFillTrash3Fill,
    BsPencilSquare
} from "react-icons/bs";

import { Table } from 'antd';
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateExamModal from "./CreateExamModal";
import { useExam } from "../../../contexts/ExamContext";
import type { SorterResult } from 'antd/es/table/interface';
import type { TableColumnsType, TableProps, GetProp } from 'antd';
import { ResponseMessage, ToastMessageContainer } from "../../ToastMessageContainer";

import "../../../assets/css/exam/exam-table.css";

type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;

interface DataType {
    _id: string,
    title: string,
    updatedAt: string | Date,
    description: string,
    action?: React.ReactNode,
    question_ids: string[]
}

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: SorterResult<any>['field'];
    sortOrder?: SorterResult<any>['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

interface ExamTableProp {
    startExam: boolean,
    setStartExam: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ExamTable({ startExam, setStartExam }:ExamTableProp) {
    // dom
    const navigate = useNavigate();

    // context
    const { state, fetchManyExams, deleteExam } = useExam();

    // state
    const [editExamId, setEditExamId] = useState<string>("");
    const [deleteExamId, setDeleteExamId] = useState<string>("");
    const [searchTitle, setSearchTitle] = useState<string>("");
    const [reFetchExam, setReFetchExam] = useState<boolean>(false);
    const [showExamModal, setShowExamModal] = useState<boolean>(false);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [data, setData] = useState<DataType[]>([]);
    const [messageList, setMessageList] = useState<ResponseMessage[]>([]);

    // effect
    useEffect(() => {
        const startFetchExam = async() => await fetchManyExams("");
        if (state.exams.length === 0 && startExam) {
            setData([]);
            startFetchExam();
            setStartExam(false);
        }

        if (state.exams.length > 0) {
            const filterData = state.exams.map((exam) => {
                return {
                    key: uuidv4(),
                    _id: exam._id,
                    title: exam.title,
                    updatedAt: exam.updatedAt,
                    description: exam.description,
                    question_ids: exam.question_ids
                }
            });
            setData(filterData);
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: state.pagination?.total
                }
            })
        } else {
            setData([]);
        }
    }, [state.exams]);

    // effect
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

    useEffect(() => {
        const fetchExamFromFilter = async() => await fetchManyExams("", searchTitle, tableParams.pagination?.current, tableParams.pagination?.pageSize, tableParams.sortField, tableParams.sortOrder);
        if (reFetchExam) {
            fetchExamFromFilter();
            setReFetchExam(false);
        }
    }, [reFetchExam]);

    useEffect(() => {
        if (deleteExamId) {
            Swal.fire({
                title: "Do you want to delete exam?",
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#c924c4",
                cancelButtonColor: "#bfbdbf",
                confirmButtonText: "Yes, delete it!"
            }).then(async(result) => {
                if (result.isConfirmed) {
                    await deleteExam(deleteExamId);
                    setDeleteExamId("");
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success"
                    });
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    setDeleteExamId("");
                }
            });
        }
    }, [deleteExamId]);

    // function
    const handleTableChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }

        setReFetchExam(true);
    }

    const searchExam = async() => {
        await fetchManyExams("", searchTitle);
    }

    const modifyExam = (value:string) => {
        setEditExamId(value);
        setShowExamModal(true);
    }

    const deleteExamWithId = (value:string) => {
        setDeleteExamId(value);
    }

    // columns
    const columns:TableColumnsType<DataType> = [
        {
            title: "Exam Title",
            dataIndex: "title",
            key: "title",
            sorter: true,
            width: "25%"
        },
        {
            title: "Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            sorter: true,
            render: (_, record) => {
                return new Date(record.updatedAt).toLocaleString();
            },
            width: "20%"
        },
        {
            title: "Amount question",
            dataIndex: "question_ids",
            render: (_, record) => <p style={{ textAlign: "center" }}>{record.question_ids.length}</p>,
            width: "15%"
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="exam-action-container">
                    <button className="edit-question" type="button" onClick={(e) => navigate(`/dashboard/exam/${(e.target as any).value}/questions`)} value={record._id}>
                        Edit questions
                        <i><BsPencil size={16} /></i>
                    </button>
                    <button className="edit-exam" type="button" onClick={(e) => modifyExam((e.target as any).value)} value={record._id}>
                        <i><BsPencilSquare size={17} /></i>
                    </button>
                    <button className="delete-exam" type="button" onClick={(e) => deleteExamWithId((e.target as any).value)} value={record._id}>
                        <i><BsFillTrash3Fill size={17} /></i>
                    </button>
                </div>
            )
        }
    ];

    // render
    return (
        <div className="exam-table-container">
            {messageList.length > 0 &&
                <ToastMessageContainer messageList={messageList} setMessageList={setMessageList} />
            }
            <CreateExamModal
                editExamId={editExamId}
                setEditExamId={setEditExamId}
                showExamModal={showExamModal}
                setShowExamModal={setShowExamModal}
            />
            <div className="search-exam-container">
                <div className="exam-search-input">
                    <input
                        type="text"
                        value={searchTitle}
                        placeholder="Search exam by title..."
                        onChange={(e) => setSearchTitle(e.target.value)}
                    />
                    <button onClick={searchExam}>
                        <i><BsSearch size={18} /></i>
                    </button>
                </div>
                <button className="create-exam-btn" onClick={() => setShowExamModal(true)}>
                    Create exam
                    <i><BsPlus size={20} /></i>
                </button>
            </div>
            <Table<DataType>
                columns={columns}
                pagination={tableParams.pagination}
                expandable={{
                    expandedRowRender: (record) => <p style={{ margin: 0, padding: "10px", color: "gray" }}>{"Exam description : " + record.description}</p>,
                    rowExpandable: (record) => record.description.trim().length > 0
                }}
                loading={state.loading}
                dataSource={data}
                onChange={handleTableChange}
            />
            
        </div>
    );
}