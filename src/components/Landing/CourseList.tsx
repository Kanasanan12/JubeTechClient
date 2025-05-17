import { useState, useEffect } from "react";
import { Rating, FormControlLabel, Radio, RadioGroup, CircularProgress, Pagination, Slider } from "@mui/material";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../assets/css/pages/course-listing.css";
import NoImage from "../../assets/img/no image.jpg";
import Topbar from "../../components/Landing/Topbar";
import { CategoryProvider } from "../../contexts/CategoryContext";
import { CourseProvider } from "../../contexts/CourseContext";
import AuthModal from "../../components/Landing/AuthModal";
import { fetchFileFromStorage, fetchFileFromStorageClient } from "../../services/storage";

// Add CSS for course image loading states
const courseImageStyles = `
  .course-thumbnail img.loading {
    filter: blur(5px);
    transition: filter 0.3s ease-in-out;
  }
  .course-thumbnail img.loaded {
    filter: blur(0);
    transition: filter 0.3s ease-in-out;
  }
`;

// Add styles to document head
const styleElement = document.createElement('style');
styleElement.innerHTML = courseImageStyles;
document.head.appendChild(styleElement);

// Course Image component with loading state management
const CourseImage = ({ src, alt }: { src: string, alt: string }) => {
  const [imageSrc, setImageSrc] = useState<string>(NoImage);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // If there's no source, keep using NoImage
    if (!src) return;

    const loadImage = async () => {
      try {
        if (src.startsWith('http://') || src.startsWith('https://')) {
          setImageSrc(src);
        } else { 
          const url = await fetchFileFromStorageClient(src);
          if (url) {
            setImageSrc(url);
          } else {
            const img: any = new Image();
            img.src = src;
            img.onload = () => setImageSrc(src);
            img.onerror = () => setImageSrc(NoImage);
          }
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageSrc(NoImage);
      } finally {
        setIsLoaded(true);
      }
    };

    loadImage();


  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={isLoaded ? 'loaded' : 'loading'}
      style={{
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

interface CourseItem {
  _id: string;
  thumbnail: string;
  title: string;
  description: string;
  price: number;
  point: number;
  rating: number;
  instructor: {
    firstname: string;
    lastname: string;
  };
  student_enrolled: number;
  duration: number;
  level: string;
  slug: string;
};

const CourseListingPageContent = () => {
  const [allCourses, setAllCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRender, setIsRender] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    rating: 0,
    level: "",
    duration: "",
    priceRange: ""
  });
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<number>(0);
  const coursesPerPage = 20;

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/course/pagination`, {
          params: {
            page: page,
            limit: coursesPerPage,
            search: searchTerm,
            rating: filters.rating,
            level: filters.level,
            duration: filters.duration,
            priceRange: filters.priceRange
          }
        });
        console.log("response", response.data.data);
        setAllCourses(response.data.data);

      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดคอร์สเรียน:", error);
      } finally {
        setLoading(false);
        setIsRender(true);

      }
    };

    loadCourses();
  }, [page, coursesPerPage, searchTerm, filters.rating, filters.level, filters.duration, filters.priceRange]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    setPage(1);
  };

  const handlePriceChange = (_: Event, newValue: any) => {
    setPriceRange(newValue as number[]);
    setFilters({
      ...filters,
      priceRange: newValue.join("-")
    });
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const indexOfLastCourse = page * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = allCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(allCourses.length / coursesPerPage);

  return (
    <CategoryProvider>
      <div className="course-listing-page">
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

        <div className="course-listing-header">
          <div className="container">
            <h1>คอร์สเรียนทั้งหมด</h1>
            <p>เรียนรู้ทักษะใหม่ๆ ด้านเทคโนโลยีกับคอร์สเรียนคุณภาพจาก JubeTech</p>
          </div>
        </div>

        <div className="course-listing-content container">
     

          <div className="course-main-content">

            <div className="course-results">

              {loading ? (
                <div className="loading-container">
                  <CircularProgress />
                </div>
              ) : (
                <>
                  {isRender && allCourses.length === 0 ? (
                    <div className="no-results">
                      <p>ไม่พบคอร์สเรียนที่ตรงกับเงื่อนไขการค้นหา</p>
                    </div>
                  ) : (
                    <div className="course-grid">
                      {currentCourses?.map((course) => (
                        <Link to={`/courses/${course.slug}`} className="course-card-link" key={course._id}>
                          <div className="course-card">
                            <div className="course-thumbnail">
                              <CourseImage
                                src={course.thumbnail}
                                alt={course.title}
                              />
                            </div>
                            <div className="course-info">
                              <h3 className="course-title">{course.title}</h3>
                              <p className="course-instructor">{course?.instructor?.firstname + " " + course?.instructor?.lastname}</p>
                              <div className="course-rating">
                                <span className="rating-value">{course.rating}</span>
                                <Rating value={course.rating} readOnly precision={0.5} size="small" />
                                <span className="student-count">({course.student_enrolled.toLocaleString()})</span>
                              </div>
                              <div className="course-meta">
                                <span className="course-level">
                                  {course.level === "beginner" && "สำหรับผู้เริ่มต้น"}
                                  {course.level === "intermediate" && "ระดับกลาง"}
                                  {course.level === "expert" && "ระดับสูง"}
                                </span>
                                <span className="course-duration">{course.duration} ชั่วโมง</span>
                              </div>
                              <div className="course-price">
                                {course.price > 0 ? (
                                  <span className="price">฿{course.price.toLocaleString()}</span>
                                ) : (
                                  <span className="free">เรียนฟรี</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="pagination-container">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </div>

                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </CategoryProvider>
  );
};

const CourseListingPage = () => {
  return (
    <CourseProvider>
      <CourseListingPageContent />
    </CourseProvider>
  );
};

export default CourseListingPage;
