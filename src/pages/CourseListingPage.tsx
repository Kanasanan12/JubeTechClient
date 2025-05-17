import { useState, useEffect } from "react";
import { Rating, FormControlLabel, Radio, RadioGroup, CircularProgress, Pagination, Slider } from "@mui/material";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import "../assets/css/pages/course-listing.css";
import NoImage from "../assets/img/no image.jpg";
import Topbar from "../components/Landing/Topbar";
import { CategoryProvider } from "../contexts/CategoryContext";
import { CourseProvider } from "../contexts/CourseContext";
import AuthModal from "../components/Landing/AuthModal";
import { fetchFileFromStorage, fetchFileFromStorageClient } from "../services/storage";

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
          console.log("src", src)
          const url = await fetchFileFromStorageClient(src);
          console.log("url", url)
          if (url) {
            setImageSrc(url);
          } else {
            const img:any = new Image();
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
          <div className="search-bar">
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                placeholder="ค้นหาคอร์สเรียน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-button" onClick={toggleFilters}>
              <FaFilter /> ตัวกรอง {showFilters ? '▲' : '▼'}
            </button>
          </div>

          <div className={`filters-section ${showFilters ? 'show' : ''}`}>
            <div className="filter-group">
              <h3>ระดับคะแนน</h3>
              <div className="rating-filters">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <div key={rating} className="rating-filter-item">
                    <FormControlLabel
                      control={
                        <Radio
                          checked={filters.rating === rating}
                          onChange={() => handleFilterChange('rating', rating)}
                          size="small"
                        />
                      }
                      label={
                        <div className="rating-label">
                          <Rating value={rating} readOnly precision={0.5} size="small" />
                          <span>{rating} ขึ้นไป</span>
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>ระดับความยาก</h3>
              <RadioGroup
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <FormControlLabel
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'Mitr, sans-serif !important'
                  }}
                  value="beginner" control={<Radio size="small" />} label="สำหรับผู้เริ่มต้น" />
                <FormControlLabel
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'Mitr, sans-serif !important'
                  }}
                  value="intermediate" control={<Radio size="small" />} label="ระดับกลาง" />
                <FormControlLabel
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: 'Mitr, sans-serif !important'
                  }}
                  value="expert" control={<Radio size="small" />} label="ระดับสูง" />
              </RadioGroup>
            </div>

            <div className="filter-group">
              <h3>ระยะเวลา</h3>
              <RadioGroup
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
              >
                <FormControlLabel value="0-3" control={<Radio size="small" />} label="0-3 ชั่วโมง" />
                <FormControlLabel value="3-6" control={<Radio size="small" />} label="3-6 ชั่วโมง" />
                <FormControlLabel value="6-17" control={<Radio size="small" />} label="6-17 ชั่วโมง" />
                <FormControlLabel value="17+" control={<Radio size="small" />} label="17+ ชั่วโมง" />
              </RadioGroup>
            </div>

            <div className="filter-group">
              <h3>ราคา</h3>
              <div className="price-slider-container">
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={2000}
                  step={100}
                  marks={[
                    { value: 0, label: '฿0' },
                    { value: 500, label: '฿500' },
                    { value: 1000, label: '฿1000' },
                    { value: 1500, label: '฿1500' },
                    { value: 2000, label: '฿2000' }
                  ]}
                  sx={{
                    color: 'var(--purple-logo-primary)',
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'var(--purple-logo-primary)',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: 'var(--purple-logo-primary)',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: '#bfbfbf',
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                    }
                  }}
                />
                <div className="price-range-display">
                  <span>฿{priceRange[0]}</span>
                  <span>ถึง</span>
                  <span>฿{priceRange[1]}</span>
                </div>
              </div>
            </div>

            <button
              className="reset-filters-button"
              onClick={() => {
                setFilters({
                  rating: 0,
                  level: "",
                  duration: "",
                  priceRange: ""
                });
                setPriceRange([0, 2000]);
              }}
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
          <div className="course-main-content">

            <div className="filters-sidebar">
              <div className="filter-group">
                <h3>ระดับคะแนน</h3>
                <div className="rating-filters">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <div key={rating} className="rating-filter-item">
                      <FormControlLabel
                        control={
                          <Radio
                            checked={filters.rating === rating}
                            onChange={() => handleFilterChange('rating', rating)}
                            size="small"
                          />
                        }
                        label={
                          <div className="rating-label">
                            <Rating value={rating} readOnly precision={0.5} size="small" />
                            <span>{rating} ขึ้นไป</span>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>ระดับความยาก</h3>
                <RadioGroup
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <FormControlLabel value="beginner" control={<Radio size="small" />} label="สำหรับผู้เริ่มต้น" />
                  <FormControlLabel value="intermediate" control={<Radio size="small" />} label="ระดับกลาง" />
                  <FormControlLabel value="expert" control={<Radio size="small" />} label="ระดับสูง" />
                </RadioGroup>
              </div>

              <div className="filter-group">
                <h3>ระยะเวลา</h3>
                <RadioGroup
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                >
                  <FormControlLabel value="0-3" control={<Radio size="small" />} label="0-3 ชั่วโมง" />
                  <FormControlLabel value="3-6" control={<Radio size="small" />} label="3-6 ชั่วโมง" />
                  <FormControlLabel value="6-17" control={<Radio size="small" />} label="6-17 ชั่วโมง" />
                  <FormControlLabel value="17+" control={<Radio size="small" />} label="17+ ชั่วโมง" />
                </RadioGroup>
              </div>

              <div className="filter-group">
                <h3>ราคา</h3>
                <div className="price-slider-container">
                  <Slider
                    value={priceRange}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={2000}
                    step={100}
                    marks={[
                      { value: 0, label: '฿0' },
                      { value: 500, label: '฿500' },
                      { value: 1000, label: '฿1000' },
                      { value: 1500, label: '฿1500' },
                      { value: 2000, label: '฿2000' }
                    ]}
                    sx={{
                      color: 'var(--purple-logo-primary)',
                      '& .MuiSlider-thumb': {
                        backgroundColor: 'var(--purple-logo-primary)',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: 'var(--purple-logo-primary)',
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: '#e0e0e0',
                      },
                      '& .MuiSlider-mark': {
                        backgroundColor: '#bfbfbf',
                      },
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                      }
                    }}
                  />
                  <div className="price-range-display">
                    <span>฿{priceRange[0]}</span>
                    <span>ถึง</span>
                    <span>฿{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <button
                className="reset-filters-button"
                onClick={() => {
                  setFilters({
                    rating: 0,
                    level: "",
                    duration: "",
                    priceRange: ""
                  });
                  setPriceRange([0, 2000]);
                }}
              >
                รีเซ็ตตัวกรอง
              </button>
            </div>
            <div className="course-results">
              <div className="results-header">
                <p>ผลลัพธ์ {allCourses.length}</p>
              </div>

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
