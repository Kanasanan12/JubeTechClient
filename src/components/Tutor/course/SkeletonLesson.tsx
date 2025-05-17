import Skeleton from "@mui/material/Skeleton";

export default function SkeletonLesson() {
    return (
        <div className="lesson-card-list">
            <div className="lesson-card">
                <div className="card-option-container">
                    <Skeleton variant="rectangular" width={30} height={30} />
                    <Skeleton variant="rectangular" width={30} height={30} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
                <div className="condition-info">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
            </div>
            <div className="lesson-card">
                <div className="card-option-container">
                    <Skeleton variant="rectangular" width={30} height={30} />
                    <Skeleton variant="rectangular" width={30} height={30} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
                <div className="condition-info">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
            </div>
            <div className="lesson-card">
                <div className="card-option-container">
                    <Skeleton variant="rectangular" width={30} height={30} />
                    <Skeleton variant="rectangular" width={30} height={30} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
                <div className="condition-info">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
            </div>
            <div className="lesson-card">
                <div className="card-option-container">
                    <Skeleton variant="rectangular" width={30} height={30} />
                    <Skeleton variant="rectangular" width={30} height={30} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
                <div className="condition-info">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
            </div>
            <div className="lesson-card">
                <div className="card-option-container">
                    <Skeleton variant="rectangular" width={30} height={30} />
                    <Skeleton variant="rectangular" width={30} height={30} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
                <div className="condition-info">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={80} height={20} />
                </div>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width={250} height={30} />
            </div>
        </div>
    );
}