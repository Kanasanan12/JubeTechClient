import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Rating, Button, Tabs, Tab, Box, CircularProgress, Modal, IconButton } from "@mui/material";
import { FaPlay, FaRegClock, FaSignal, FaGlobe, FaRegCalendarAlt, FaRegFileAlt, FaInfinity, FaMobileAlt, FaTrophy, FaLock } from "react-icons/fa";
import axios from 'axios'
import "../assets/css/pages/course-detail.css";

const previewBadgeStyle = `
  .preview-badge {
    background-color: var(--purple-logo-primary);
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: 500;
  }
  .lock-badge {
    background-color: #f44336;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: 500;
  }
  .lecture-item {
    cursor: pointer;
  }
  .lecture-item:hover {
    background-color: rgba(165, 41, 210, 0.05);
  }
  .locked-content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    border-radius: 8px;
  }
  .locked-content-overlay svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #f44336;
  }
  .locked-content-overlay h3 {
    margin: 0.5rem 0;
    font-size: 1.2rem;
  }
  .locked-content-overlay p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    max-width: 80%;
  }
  .locked-content-overlay button {
    margin-top: 1rem;
    background-color: var(--purple-logo-primary);
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .locked-content-overlay button:hover {
    background-color: #a529d2;
    transform: translateY(-2px);
  }
`;


const styleElement = document.createElement('style');
styleElement.textContent = previewBadgeStyle;
document.head.appendChild(styleElement);
import TestImage from "../assets/img/landing/course-test.png";
import Topbar from "../components/Landing/Topbar";
import { CategoryProvider } from "../contexts/CategoryContext";
import { getImageUrl } from "../utils/imageUtils";
import AuthModal from "../components/Landing/AuthModal";

import { fetchFileFromStorageClient } from "../services/storage";
import parse from 'html-react-parser';

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<number>(0);
  const [previewVideo, setPreviewVideo] = useState<string>("");
  const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false);
  const [openLockedModal, setOpenLockedModal] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [openContentPreviewModal, setOpenContentPreviewModal] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await getCouseDetail(slug as string);
    })();
  }, [slug]);



  const getCouseDetail = (slug: string) => {
    axios.get(`${import.meta.env.VITE_API_URL}/course/slug/${slug}`)
      .then(async (res) => {
        console.log("Response", res.data.data[0])
        const courseData = res.data.data[0]
        courseData.thumbnail = await fetchFileFromStorageClient(courseData.thumbnail)
        setCourse(courseData)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const AddCourseToCart = () => {
    if (!course) return;

    try {

      const cartItemsStr = localStorage.getItem('cartItems');
      let cartItems = cartItemsStr ? JSON.parse(cartItemsStr) : [];
      const existingItemIndex = cartItems.findIndex((item: any) => item._id === course._id);

      if (existingItemIndex >= 0) {
        alert('คอร์สนี้อยู่ในตะกร้าของคุณแล้ว');
        return;
      }
      const cartItem = {
        _id: course._id,
        title: course.title,
        instructor: `${course.instructor.firstname} ${course.instructor.lastname}`,
        price: course.price,
        thumbnail: getImageUrl(course.thumbnail),
        slug: course.slug
      };

      // เพิ่มคอร์สลงในตะกร้า
      cartItems.push(cartItem);

      // บันทึกข้อมูลตะกร้าลงใน localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));

      // แจ้งเตือนผู้ใช้
      alert('เพิ่มคอร์สลงในตะกร้าเรียบร้อยแล้ว');

      // อัพเดทจำนวนสินค้าในตะกร้า (ถ้ามีการแสดงจำนวนสินค้าในตะกร้า)
      const cartCountEvent = new CustomEvent('cartUpdated');
      window.dispatchEvent(cartCountEvent);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มคอร์สลงในตะกร้า:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มคอร์สลงในตะกร้า');
    }
  }



  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />

      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-not-found">
        <h2>ไม่พบคอร์สเรียนที่คุณต้องการ</h2>
        <p>กรุณาตรวจสอบ URL หรือกลับไปที่หน้ารายการคอร์สเรียน</p>
      </div>
    );
  }

  const ContentPreviewModal = () => {
    return (
      <Modal
        open={openContentPreviewModal}
        onClose={() => setOpenContentPreviewModal(false)}
        aria-labelledby="content-preview-modal"
        aria-describedby="preview content of the lesson"
        sx={{
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          bgcolor: 'white',
          color: '#333',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          p: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translate(-50%, -48%)' },
            '100%': { opacity: 1, transform: 'translate(-50%, -50%)' }
          }
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(90deg, var(--purple-logo-primary) 0%, #7928ca 100%)'
          }}>
            <h2 id="content-preview-modal" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>ตัวอย่างเนื้อหาบทเรียน</h2>
            <IconButton 
              onClick={() => setOpenContentPreviewModal(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </IconButton>
          </Box>
          
          <Box sx={{ p: 4, maxHeight: '70vh', overflowY: 'auto' }}>
            {previewContent && parse(previewContent)}
          </Box>
          
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <Button 
              onClick={() => setOpenContentPreviewModal(false)}
              variant="contained"
              sx={{ 
                bgcolor: 'var(--purple-logo-primary)',
                fontWeight: 600,
                px: 4,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#a529d2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(165, 41, 210, 0.4)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              ปิด
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

  const LockedContentModal = () => {
    return (
      <Modal
        open={openLockedModal}
        onClose={() => setOpenLockedModal(false)}
        aria-labelledby="locked-content-modal"
        aria-describedby="locked content information"
        sx={{
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          bgcolor: '#1a1a2e',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          p: 4,
          borderRadius: '12px',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translate(-50%, -48%)' },
            '100%': { opacity: 1, transform: 'translate(-50%, -50%)' }
          }
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FaLock style={{ fontSize: '3rem', color: '#f44336', marginBottom: '1rem' }} />
            <h2 id="locked-content-modal" style={{ margin: '0 0 1rem', fontSize: '1.8rem', fontWeight: 600 }}>เนื้อหานี้ถูกล็อค</h2>
            <p style={{ fontSize: '1rem', color: '#ccc', marginBottom: '1.5rem' }}>คุณต้องซื้อคอร์สนี้เพื่อเข้าถึงเนื้อหาทั้งหมด</p>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              onClick={() => {
                setOpenLockedModal(false);
                AddCourseToCart();
              }}
              variant="contained"
              sx={{ 
                bgcolor: 'var(--purple-logo-primary)',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#a529d2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(165, 41, 210, 0.4)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              เพิ่มลงตะกร้า
            </Button>
            <Button 
              onClick={() => setOpenLockedModal(false)}
              variant="outlined"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              ปิด
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

  const VideoPreviewModal = () => {
    return (
      <Modal
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        aria-labelledby="video-preview-modal"
        aria-describedby="preview video of the lesson"
        sx={{
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1000px',
          bgcolor: '#1a1a2e',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          p: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translate(-50%, -48%)' },
            '100%': { opacity: 1, transform: 'translate(-50%, -50%)' }
          }
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(90deg, var(--purple-logo-primary) 0%, #7928ca 100%)'
          }}>
            <h2 id="video-preview-modal" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>ตัวอย่างบทเรียน</h2>
            <IconButton 
              onClick={() => setOpenPreviewModal(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </IconButton>
          </Box>
          
          <Box sx={{ p: 0, position: 'relative', backgroundColor: '#000' }}>
            {previewVideo ? (
              <video 
                controls 
                autoPlay 
                style={{ 
                  width: '100%', 
                  maxHeight: '70vh',
                  display: 'block',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                src={previewVideo}
              />
            ) : (
              <Box sx={{ 
                height: '50vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={60} sx={{ color: 'var(--purple-logo-primary)' }} />
                <p>กำลังโหลดวิดีโอ...</p>
              </Box>
            )}
          </Box>
          
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => setOpenPreviewModal(false)}
              variant="contained"
              sx={{ 
                bgcolor: 'var(--purple-logo-primary)',
                fontWeight: 600,
                px: 4,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#a529d2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(165, 41, 210, 0.4)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              ปิด
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

  return (
    <CategoryProvider>
      <div className="course-detail-page">
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

        <div className="course-header">
          <div className="container">
            <div className="course-header-content">
              <div className="course-info">
                <h1>{course.title}</h1>
                <div className="course-meta">
                  <div className="course-rating">
                    <span className="rating-value">{course.rating}</span>
                    <Rating value={course.rating} readOnly precision={0.5} size="small" />
                    <span className="student-count">({course.student_enrolled.toLocaleString()} นักเรียน)</span>
                  </div>

                  <div className="course-instructor">
                    <span>สร้างโดย </span>
                    <a href="#instructor">{course?.instructor?.name}</a>
                  </div>

                  <div className="course-details-meta">
                    <span><FaRegCalendarAlt /> อัพเดทล่าสุด {course.last_updated}</span>
                    <span><FaGlobe /> {course.language}</span>
                    <span>
                      <FaSignal />
                      {course.level === "beginner" && "สำหรับผู้เริ่มต้น"}
                      {course.level === "intermediate" && "ระดับกลาง"}
                      {course.level === "expert" && "ระดับสูง"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="course-content container">
          <div className="course-main">
            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="course detail tabs">
                <Tab label="ภาพรวม" id="tab-0" />
                <Tab label="เนื้อหาคอร์ส" id="tab-1" />
                <Tab label="ผู้สอน" id="tab-2" />
                <Tab label="รีวิว" id="tab-3" />
              </Tabs>
            </Box>
            <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0">
              {activeTab === 0 && (
                <div className="course-overview">
                  <div className="course-section">
                    <h2>สิ่งที่คุณจะได้เรียนรู้</h2>

                  </div>


                  <div className="course-section">
                    <h2>รายละเอียดคอร์ส</h2>
                    <div className="course-description-full">
                      {course.description && parse(course.description)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1">
              {activeTab === 1 && (
                <div className="course-curriculum">
                  <h2>เนื้อหาคอร์ส</h2>
                  <div className="course-sections">
                    {course.section_ids.map((section: any, sectionIndex: number) => (
                      <div className="curriculum-section" key={sectionIndex}>
                        <div className="section-header">
                          <h3>{section.title}</h3>
                          <span>{section.lesson_ids.length} บทเรียน</span>
                        </div>
                        <div className="section-lectures">
                          {section?.lesson_ids?.map((lesson: any, lesson_idIndex: number) => (
                            <div className="lecture-item" key={lesson_idIndex}>
                              <div className="lecture-icon">
                                {lesson.isFreePreview && (lesson.main_content.endsWith(".mp4") || lesson.main_content.endsWith(".MP4")
                                 || lesson.main_content.endsWith(".webm") || lesson.main_content.endsWith(".WEBM"))
                                ? (
                                  <IconButton 
                                    size="small" 
                                    onClick={async () => {
                                      if (lesson.main_content) {
                                        try {
                                          console.log("lesson.main_content", lesson.main_content)
                                          const videoUrl = await fetchFileFromStorageClient(lesson.main_content);
                                          setPreviewVideo(videoUrl);
                                          setOpenPreviewModal(true);
                                        } catch (error) {
                                          console.error("Error fetching video:", error);
                                          // ถ้าเป็น URL เต็มอยู่แล้ว
                                          if (lesson.main_content.startsWith('http://') || lesson.main_content.startsWith('https://')) {
                                            setPreviewVideo(lesson.main_content);
                                            setOpenPreviewModal(true);
                                          }
                                        }
                                      }
                                    }}
                                    sx={{ color: 'var(--purple-logo-primary)' }}
                                  >
                                    <FaPlay />
                                  </IconButton>
                                ) :  !lesson.isFreePreview  && (lesson.main_content.endsWith(".mp4") || lesson.main_content.endsWith(".MP4") || lesson.main_content.endsWith(".webm") || lesson.main_content.endsWith(".WEBM")) ? (
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      // Show purchase modal or auth modal if not logged in
                                      const isLoggedIn = localStorage.getItem('token');
                                      if (!isLoggedIn) {
                                        setTypeModal(0); // Login modal
                                        setShowModal(true);
                                      } else {
                                        // Show locked content modal
                                        setOpenLockedModal(true);
                                      }
                                    }}
                                    sx={{ 
                                      color: '#f44336',
                                      '&:hover': {
                                        color: '#d32f2f',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <FaLock />
                                  </IconButton>
                                ) : lesson.isFreePreview && !lesson.main_content.endsWith(".mp4") && !lesson.main_content.endsWith(".MP4") && !lesson.main_content.endsWith(".webm") && !lesson.main_content.endsWith(".WEBM") ? (
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      if (lesson.main_content) {
                                        setPreviewContent(lesson.main_content);
                                        setOpenContentPreviewModal(true);
                                      }
                                    }}
                                    sx={{ 
                                      color: 'var(--purple-logo-primary)',
                                      '&:hover': {
                                        color: '#a529d2',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <FaRegFileAlt />
                                  </IconButton>
                                ) : (
                                  <>
                                    {parse(lesson.name)}
                                   </>
                                )}
                              </div>
                              <div className="lecture-title">
                                {lesson.name}
                                {lesson.isFreePreview && <span className="preview-badge">ตัวอย่าง</span>}
                                {!lesson.isFreePreview && (lesson.main_content.endsWith(".mp4") || lesson.main_content.endsWith(".MP4") || lesson.main_content.endsWith(".webm") || lesson.main_content.endsWith(".WEBM")) && 
                                  <span className="lock-badge" style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginLeft: '8px',
                                    fontWeight: 500
                                  }}>ล็อค</span>
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>



            <div role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2">
              {activeTab === 2 && (
                <div className="course-instructor-tab" id="instructor">
                  <h2>ผู้สอน</h2>
                  <div className="instructor-profile">
                    {/* <div className="instructor-avatar">
                      
                    </div> */}
                    <div className="instructor-info">
                      <h3>{course.instructor.firstname} {course.instructor.lastname} </h3>

                    </div>
                  </div>
                </div>
              )}
            </div>




            <div role="tabpanel" hidden={activeTab !== 3} id="tabpanel-3">
              {activeTab === 3 && (
                <div className="course-reviews">
                  <h2>รีวิวจากผู้เรียน</h2>
                  <div className="reviews-summary">
                    <div className="average-rating">
                      <div className="rating-number">{course.rating}</div>
                      <div className="rating-stars">
                        <Rating value={course.rating} readOnly precision={0.5} size="large" />
                      </div>
                      <div className="rating-count">{course.student_enrolled} รีวิว</div>
                    </div>
                  </div>
                  <div className="no-reviews-message">
                    <p>ยังไม่มีรีวิวสำหรับคอร์สนี้</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="course-sidebar">
            <div className="course-card">
              <div className="course-thumbnail">
                <img src={course.thumbnail} alt={course.title} />
                <div className="play-overlay">
                  <FaPlay />
                </div>
              </div>
              <div className="course-card-content">
                <div className="course-price">
                  {course.price > 0 ? (
                    <span className="price">฿{course.price.toLocaleString()}</span>
                  ) : (
                    <span className="free">เรียนฟรี</span>
                  )}
                </div>

                <div className="course-actions">
                  <Button variant="contained"

                    onClick={() => {
                      AddCourseToCart()
                    }}
                    color="primary" fullWidth className="enroll-button">
                    ลงทะเบียนเรียน
                  </Button>
                  <Button variant="outlined" color="primary" fullWidth className="wishlist-button">
                    เพิ่มในรายการโปรด
                  </Button>
                </div>

                <div className="course-includes">
                  <h3>คอร์สนี้ประกอบด้วย:</h3>
                  <ul>
                    <li><FaRegClock /> {course.duration} ชั่วโมงของวิดีโอ</li>
                    {/* <li><FaRegFileAlt /> {course.sections.reduce((acc: number, section: any) => acc + section.lectures.length, 0)} บทเรียน</li> */}
                    <li><FaInfinity /> เข้าถึงตลอดชีพ</li>
                    <li><FaMobileAlt /> เข้าถึงได้ทุกอุปกรณ์</li>
                    <li><FaTrophy /> ใบประกาศนียบัตรเมื่อเรียนจบ</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <VideoPreviewModal />
        <LockedContentModal />
        <ContentPreviewModal />
      </div>
    </CategoryProvider>
  );
};

export default CourseDetailPage;
