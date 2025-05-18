import { useState, useEffect } from "react";
import { Tabs, Tab, Box, CircularProgress, Typography, Button } from "@mui/material";
import { FaPlay, FaRegClock, FaRegStar, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import { CategoryProvider } from "../contexts/CategoryContext";
import Topbar from "../components/Landing/Topbar";
import "../assets/css/pages/my-courses.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import NoImage from "../assets/img/no image.jpg";
import AuthModal from "../components/Landing/AuthModal";

import { fetchFileFromStorageClient } from "../services/storage";

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  instructor?: {
    firstname: string;
    lastname: string;
  };
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  duration: number;
  price: number;
  status: string;
}

const MyCourses = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<number>(0);
  const [sortOption, setSortOption] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);

  const navigate = useNavigate();

  const filterCoursesBySearchTerm = (courses: Course[]) => {
    if (!searchTerm) return courses;

    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor?.firstname && course.instructor.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.instructor?.lastname && course.instructor.lastname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };


  const getCoursesByTab = () => {
    let courses: Course[] = [];

    switch (tabValue) {
      case 0:
        courses = activeCourses;
        break;
      case 1:
        courses = completedCourses;
        break;
      default:
        courses = activeCourses;
    }

    // กรองคอร์สตามคำค้นหา
    return filterCoursesBySearchTerm(courses);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ชั่วโมง ${m > 0 ? `${m} นาที` : ''}`;
  };


  const renderCoursesByTab = () => {
    const courses = getCoursesByTab();

    if (courses.length === 0) {
      return (
        <div className="no-courses">
          <Typography variant="h6" sx={{ marginTop: '30px', color: '#555' }}>
            {searchTerm
              ? `ไม่พบคอร์สเรียนที่ตรงกับคำค้นหา "${searchTerm}"`
              : tabValue === 0 ? "คุณยังไม่มีคอร์สที่กำลังเรียนอยู่"
                : "คุณยังไม่มีคอร์สที่เรียนจบแล้ว"}
          </Typography>
        </div>
      );
    }

    return (
      <div className={`${tabValue === 0 ? 'enrolled-courses' : tabValue === 1 ? 'archived-courses' : 'archived-courses'}`}>
        {courses.map((course: Course) => (
          <div className="course-card" key={course._id}>
            <div className="course-image">
              <img src={course.thumbnail || NoImage} alt={course.title} />
              <div className="course-overlay">
                <button className="play-button" onClick={() => navigate(`/course/learn/${course._id}`)}>
                  <FaPlay />
                  <span>{tabValue === 2 ? 'ดูอีกครั้ง' : 'เริ่มเรียนต่อ'}</span>
                </button>
              </div>
            </div>

            <div className="course-details">
              <h3 className="course-title">
                <a href={`/courses/${course.slug}`}>{course.title}</a>
              </h3>
              <p className="course-instructor">{course.instructor?.firstname} {course.instructor?.lastname}</p>

              {(tabValue === 0 || tabValue === 1) && (
                <div className="course-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress}% เสร็จสิ้น</span>
                </div>
              )}

              <div className="course-meta">
                {tabValue === 0 && (
                  <div className="last-accessed">
                    <FaRegClock />
                    <span>ลงทะเบียนเมื่อ: {formatDate(course.enrolledAt)}</span>
                  </div>
                )}

                {tabValue === 1 && (
                  <div className="wishlist-price">
                    <span className="price">฿{course.price.toLocaleString()}</span>
                  </div>
                )}

                {tabValue === 1 && (
                  <div className="completed-date">
                    <FaRegClock />
                    <span>เรียนจบเมื่อ: {formatDate(course.enrolledAt)}</span>
                  </div>
                )}

                <div className="course-duration">
                  <FaRegClock />
                  <span>{formatTime(course.duration)}</span>
                </div>
              </div>

              {/* Add certificate button for completed courses */}
              {tabValue === 1 && course.progress === 100 && (
                <div className="certificate-button-container">
                  <button
                    className="certificate-button"
                    onClick={() => navigate(`/certificate/${course._id}`)}
                  >
                    <span>ดูใบประกาศนียบัตร</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    const fetchCourses = async () => {
      try {
        // ดึงข้อมูลคอร์สที่ลงทะเบียน

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/enrollments/my-courses`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')?.replace(/"/g, '')}`
          }
        });

        const allCourses = response.data.data || [];


        const active = allCourses.filter((course: Course) => course.progress < 100);


        const activeCourses = await Promise.all(active.map(async (course: Course) => {
          const thumbnail = course.thumbnail;
          console.log("thumbnail", thumbnail)
          const thumbnailUrl = thumbnail.startsWith('http://') || thumbnail.startsWith('https://') ? thumbnail : await fetchFileFromStorageClient(thumbnail);
          return {
            ...course,
            thumbnail: thumbnailUrl
          };
        }));
        setActiveCourses(activeCourses);


        const completed = allCourses.filter((course: Course) => course.status === 'completed' || course.progress === 100);
        const completedCourses = await Promise.all(completed.map(async (course: Course) => {

          const thumbnail = course.thumbnail;
          const thumbnailUrl = thumbnail.startsWith('http://') || thumbnail.startsWith('https://') ? thumbnail : await fetchFileFromStorageClient(thumbnail);
          return {
            ...course,
            thumbnail: thumbnailUrl
          };
        }));
        console.log("completedCourses", completedCourses)
        setCompletedCourses(completedCourses);

        setWishlistCourses([]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    // ตรวจสอบว่ามีการล็อกอินหรือไม่
    const token = sessionStorage.getItem('token');
    if (token) {
      fetchCourses();
    } else {
      setShowModal(true);
      setTypeModal(0);
      setLoading(false);
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <CategoryProvider>
      <div className="my-courses-page">
        <Topbar modalStatus={showModal} setShowModal={setShowModal} setTypeModal={setTypeModal} />

        <div className="my-courses-header">
          <div className="container">
            <h1>คอร์สเรียนของฉัน</h1>
            <p>จัดการและติดตามความคืบหน้าในการเรียนของคุณได้ที่นี่</p>
          </div>
        </div>

        <div className="container">
          <div className="my-courses-content">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '16px',
                    fontFamily: "'Mitr', sans-serif",
                    color: '#555',
                    '&.Mui-selected': {
                      color: '#a906f5',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#a906f5',
                    height: '3px',
                  },
                }}
              >
                <Tab label="กำลังเรียน" />
                
                <Tab label="เรียนจบแล้ว" />
              </Tabs>
            </Box>

            <div className="search-and-filter">
              <div className="search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="ค้นหาคอร์สเรียน"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-options">
                <div className="sort-button">
                  <FaSort />
                  <select value={sortOption} onChange={handleSortChange}>
                    <option value="recent">ล่าสุด</option>
                    <option value="title-asc">ชื่อ A-Z</option>
                    <option value="title-desc">ชื่อ Z-A</option>
                    <option value="progress">ความคืบหน้า</option>
                  </select>
                </div>

                <button className="filter-button" onClick={toggleFilters}>
                  <FaFilter />
                  <span>ตัวกรอง</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <CircularProgress sx={{ color: '#a906f5' }} />
              </div>
            ) : (
              <div className="courses-grid">
                {renderCoursesByTab()}
              </div>
            )}
          </div>
        </div>


      </div>
    </CategoryProvider>
  );
};

export default MyCourses;
