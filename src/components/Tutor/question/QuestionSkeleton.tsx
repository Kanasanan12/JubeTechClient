import Skeleton from '@mui/material/Skeleton';

export default function QuestionSkeleton() {
    return (
        <div className="question-list-container">
            <div className="side-question-list">

                <div className="side-question-card">
                    <div className="side-question-topbar">
                        <div className="side-question-index">
                            <Skeleton variant="rounded" width={25} height={25} />
                        </div>
                        <div className="side-question-title">
                            <Skeleton variant="rectangular" width={160} height={15} />
                        </div>
                    </div>
                    <div className="side-question-footer">
                        <div className="side-question-type">
                            <Skeleton variant="rounded" width={130} height={13} />
                        </div>
                        <div className="side-question-option">
                            <Skeleton variant="circular" width={25} height={25} />
                        </div>
                    </div>
                </div>

                <div className="side-question-card">
                    <div className="side-question-topbar">
                        <div className="side-question-index">
                            <Skeleton variant="rounded" width={25} height={25} />
                        </div>
                        <div className="side-question-title">
                            <Skeleton variant="rectangular" width={160} height={15} />
                        </div>
                    </div>
                    <div className="side-question-footer">
                        <div className="side-question-type">
                            <Skeleton variant="rounded" width={130} height={13} />
                        </div>
                        <div className="side-question-option">
                            <Skeleton variant="circular" width={25} height={25} />
                        </div>
                    </div>
                </div>

                <div className="side-question-card">
                    <div className="side-question-topbar">
                        <div className="side-question-index">
                            <Skeleton variant="rounded" width={25} height={25} />
                        </div>
                        <div className="side-question-title">
                            <Skeleton variant="rectangular" width={160} height={15} />
                        </div>
                    </div>
                    <div className="side-question-footer">
                        <div className="side-question-type">
                            <Skeleton variant="rounded" width={130} height={13} />
                        </div>
                        <div className="side-question-option">
                            <Skeleton variant="circular" width={25} height={25} />
                        </div>
                    </div>
                </div>

            </div>
            <div className="question-list-content">

                <div className="question-manage-card">
                    <div className="question-manage-header">
                        <div className="question-manage-type">
                            <Skeleton variant="rounded" width={170} height={33} />
                        </div>
                        <div className="question-manage-option">
                            <Skeleton variant="circular" width={32} height={32} />
                        </div>
                    </div>
                    <div className="question-manage-body">
                        <div className="question-manage-image">
                            <Skeleton variant="rounded" width={240} height={225} />
                        </div>
                    </div>
                </div>

                <div className="question-manage-card">
                    <div className="question-manage-header">
                        <div className="question-manage-type">
                            <Skeleton variant="rounded" width={170} height={33} />
                        </div>
                        <div className="question-manage-option">
                            <Skeleton variant="circular" width={32} height={32} />
                        </div>
                    </div>
                    <div className="question-manage-body">
                        <div className="question-manage-image">
                            <Skeleton variant="rounded" width={240} height={225} />
                        </div>
                    </div>
                </div>

                <div className="question-manage-card">
                    <div className="question-manage-header">
                        <div className="question-manage-type">
                            <Skeleton variant="rounded" width={170} height={33} />
                        </div>
                        <div className="question-manage-option">
                            <Skeleton variant="circular" width={32} height={32} />
                        </div>
                    </div>
                    <div className="question-manage-body">
                        <div className="question-manage-image">
                            <Skeleton variant="rounded" width={240} height={225} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}