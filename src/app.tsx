import './App.css';
import { useState, useEffect } from 'react';
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
const UserTable = lazy(() => import("./pages/UserTable"));
// const TutorDashboard = lazy(() => import("./pages/TutorDashboard"));
// @ts-ignore
const Landing = lazy(() => import("./pages/landing"));
const CourseManagement = lazy(() => import("./pages/CourseManagement"));
const RoleManagement = lazy(() => import("./pages/RoleTable"));
const PromotionManagement = lazy(() => import("./pages/PromotionTable"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));
const DashboardOverview = lazy(() => import("./pages/DashboardOverview.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CourseListingPage = lazy(() => import("./pages/CourseListingPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ExamManagement = lazy(() => import("./pages/ExamManagement"));
const QuestionManagement = lazy(() => import("./pages/QuestionManagement"));
const SubCourseManagement = lazy(() => import("./pages/SubCourseManagement.tsx"));
const CodeEditor = lazy(() => import("./pages/CodeEditor.tsx"));
const LearnCourse = lazy(() => import("./pages/LearnCourse.tsx"));
const QuizTest = lazy(() => import("./pages/QuizTest.tsx"));
const Certificate = lazy(() => import("./pages/Certificate.tsx"));

export interface IFToggleSidebar {
  toggleSidebar: boolean,
  setToggleSidebar: (value: boolean | ((prev: boolean) => boolean)) => void
}

function App() {
  const [toggleSidebar, setToggleSidebar] = useState<boolean>(true); // Toggle state
  useEffect(() => {
    const loadStorage = async () => {
      const storage = await import("./services/storage");
      console.log("Storage loaded:", storage);
    };
    loadStorage();
  }, []);
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Suspense fallback={<div className="preload-web"><div className="dots">.</div></div>}>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/dashboard/admin/user-management" element={<UserTable toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/dashboard/" element={<DashboardOverview toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          {/* <Route path="/dashboard/tutor/statistic" element={<TutorDashboard toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route> */}
          <Route path="/dashboard/admin/dashboard-overview" element={<AdminDashboard toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/dashboard/course-management" element={<CourseManagement toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/dashboard/admin/category-management" element={<CategoryManagement toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/dashboard/admin/role-management" element={<RoleManagement toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/dashboard/admin/promotion-management" element={<PromotionManagement toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/courses" element={<CourseListingPage />}></Route>
          <Route path="/courses/:slug" element={<CourseDetailPage />}></Route>
          <Route path="/my-courses" element={<MyCourses />}></Route>
          <Route path="/cart" element={<CartPage />}></Route>
          <Route path="/dashboard/exam-management" element={<ExamManagement toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/dashboard/exam/:exam_id/questions" element={<QuestionManagement />}></Route>
          <Route path="/dashboard/course/sub/:course_id" element={<SubCourseManagement />}></Route>
          <Route path="/dashboard/jube-code-lab" element={<CodeEditor toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} />}></Route>
          <Route path="/course/learn/:course_id/" element={<LearnCourse />}></Route>
          <Route path="/course/learn/:course_id/lesson/:lesson_id" element={<LearnCourse />}></Route>
          <Route path="/quiz/test/:exam_id" element={<QuizTest />}></Route>
          <Route path="/certificate/:course_id" element={<Certificate />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
