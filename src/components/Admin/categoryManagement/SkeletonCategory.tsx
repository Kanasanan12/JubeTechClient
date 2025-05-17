import Skeleton from "@mui/material/Skeleton";

export default function SkeletonCategory() {
    return (
        <div className="skeleton-container">
            <div className="skeleton-card">
                <div className="content">
                    <Skeleton variant="text" sx={{ fontSize: '0.9rem' }} width={800} height={30} />
                    <div className="skeleton-button">
                        <Skeleton variant="rectangular" width={30} height={30} />
                        <Skeleton variant="rectangular" width={30} height={30} />
                    </div>
                </div>
                <div className="skeleton-group">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                </div>
            </div>
            <div className="skeleton-card">
                <div className="content">
                    <Skeleton variant="text" sx={{ fontSize: '0.9rem' }} width={800} height={30} />
                    <div className="skeleton-button">
                        <Skeleton variant="rectangular" width={30} height={30} />
                        <Skeleton variant="rectangular" width={30} height={30} />
                    </div>
                </div>
                <div className="skeleton-group">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                </div>
            </div>
            <div className="skeleton-card">
                <div className="content">
                    <Skeleton variant="text" sx={{ fontSize: '0.9rem' }} width={800} height={30} />
                    <div className="skeleton-button">
                        <Skeleton variant="rectangular" width={30} height={30} />
                        <Skeleton variant="rectangular" width={30} height={30} />
                    </div>
                </div>
                <div className="skeleton-group">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                </div>
            </div>
            <div className="skeleton-card">
                <div className="content">
                    <Skeleton variant="text" sx={{ fontSize: '0.9rem' }} width={800} height={30} />
                    <div className="skeleton-button">
                        <Skeleton variant="rectangular" width={30} height={30} />
                        <Skeleton variant="rectangular" width={30} height={30} />
                    </div>
                </div>
                <div className="skeleton-group">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                </div>
            </div>
            <div className="skeleton-card">
                <div className="content">
                    <Skeleton variant="text" sx={{ fontSize: '0.9rem' }} width={800} height={30} />
                    <div className="skeleton-button">
                        <Skeleton variant="rectangular" width={30} height={30} />
                        <Skeleton variant="rectangular" width={30} height={30} />
                    </div>
                </div>
                <div className="skeleton-group">
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                    <Skeleton variant="circular" sx={{ borderRadius: "25px" }} width={100} height={20} />
                </div>
            </div>
        </div>
    );
}