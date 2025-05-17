// import { useEffect } from "react";
// import { IFToggleSidebar } from "../app";
// import { checkRole } from "../services/authorize";
// import MainDashboard from "../layouts/MainDashboard";
// import CardList from "../components/Tutor/dashboard/CardList";
// import EnrollGraph from "../components/Tutor/dashboard/EnrollGraph";
// import StatementTable from "../components/Tutor/dashboard/StatementTable";

// export default function TutorDashboard({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {

//     useEffect(() => {
//         const verifyRole = async() => {
//             const roles = await checkRole();
//             if (!roles.includes("Tutor")) window.location.href = "/";
//         }
//         verifyRole();
//     }, []);

//     return (
//         <MainDashboard
//             title=""
//             toggleSidebar={toggleSidebar}
//             setToggleSidebar={setToggleSidebar}
//             title_sidebar="แผนภูมิภาพรวมติวเตอร์"
//         >
//             <CardList />
//             <EnrollGraph />
//             <StatementTable />
//         </MainDashboard>
//     );
// }