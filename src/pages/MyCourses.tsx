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
        courses = wishlistCourses;
        break;
      case 2:
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
              : tabValue === 1 ? "คุณยังไม่มีคอร์สในรายการโปรด" 
              : "คุณยังไม่มีคอร์สที่เรียนจบแล้ว"}
          </Typography>
        </div>
      );
    }

    return (
      <div className={`${tabValue === 0 ? 'enrolled-courses' : tabValue === 1 ? 'wishlist-courses' : 'completed-courses'}`}>
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

              {(tabValue === 0 || tabValue === 2) && (
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

                {tabValue === 2 && (
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
        const completedCourses = completed.map((course: Course) => {
          const thumbnail = course.thumbnail;
          const thumbnailUrl = thumbnail.startsWith('http://') || thumbnail.startsWith('https://') ? thumbnail : fetchFileFromStorageClient(thumbnail);
          return {
            ...course,
            thumbnail: thumbnailUrl
          };
        });
        setCompletedCourses(completedCourses);

        setWishlistCourses([]);

      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดคอร์สเรียน:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };



  return (
    <div className="my-courses-page">
      <CategoryProvider>
        <Topbar
          modalStatus={showModal}
          setShowModal={setShowModal}
          setTypeModal={setTypeModal}
        />

        <AuthModal
          setShowModal={setShowModal}
          typeModal={typeModal}
          showModal={showModal}
          setTypeModal={setTypeModal}
        />
      </CategoryProvider>

      <div className="my-courses-header">
        <div className="container">
          <h1>คอร์สเรียนของฉัน</h1>
          <p>จัดการและติดตามความก้าวหน้าในการเรียนรู้ของคุณ</p>
        </div>
      </div>

      <div className="container">
        <div className="my-courses-content">
          <div className="search-and-filter">
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                placeholder="ค้นหาคอร์สเรียนของคุณ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-options">
              <div className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                <FaFilter />
                <span>ตัวกรอง</span>
              </div>

              <div className="sort-button">
                <FaSort />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="recent">เข้าชมล่าสุด</option>
                  <option value="title">ชื่อ A-Z</option>
                  <option value="progress">ความคืบหน้า</option>
                </select>
              </div>
            </div>
          </div>

          <Box sx={{ width: '100%', marginTop: '20px' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="my courses tabs"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    fontSize: '16px',
                    textTransform: 'none',
                    color: '#555',
                    '&.Mui-selected': {
                      color: 'var(--purple-logo-primary)',
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'var(--purple-logo-primary)',
                  }
                }}
              >
                <Tab label={`กำลังเรียน (${activeCourses.length})`} />
                <Tab label={`รายการโปรด (${wishlistCourses.length})`} />
                <Tab label={`คอร์สที่เรียนจบแล้ว (${completedCourses.length})`} />
              </Tabs>
            </Box>

            {loading ? (
              <div className="loading-container">
                <CircularProgress sx={{ color: 'var(--purple-logo-primary)' }} />
              </div>
            ) : ( 
              <div className="courses-grid">
                {renderCoursesByTab()}
              </div>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
}



export default MyCourses;
