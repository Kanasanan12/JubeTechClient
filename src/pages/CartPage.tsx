import { useState, useEffect } from "react";
import { Button, Typography, IconButton, Divider, Checkbox, FormControlLabel, CircularProgress, Snackbar, Alert } from "@mui/material";
import { FaTrash, FaArrowLeft, FaShoppingCart, FaTag, FaCreditCard } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CategoryProvider } from "../contexts/CategoryContext";
import Topbar from "../components/Landing/Topbar";
import OmiseCheckout from "../components/Payment/OmiseCheckout";
import { checkUser } from "../services/authorize";
import { getImageUrl } from "../utils/imageUtils";
import "../assets/css/pages/cart.css";


interface CartCourse {
  _id: string;
  thumbnail: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isSelected: boolean;
  slug: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage
    loadCartItems();

    // เพิ่ม event listener สำหรับการอัพเดตตะกร้า
    window.addEventListener('cartUpdated', loadCartItems);

    // ตรวจสอบว่าผู้ใช้ลงชื่อเข้าใช้หรือไม่
    const checkUserLogin = async () => {
      const isLoggedIn = checkUser();
      setIsLoggedIn(isLoggedIn);

      if (isLoggedIn) {
        // ดึงข้อมูลผู้ใช้จาก localStorage
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        setUserId(userInfo._id || "");
        setUserEmail(userInfo.email || "");
        setUserName(`${userInfo.firstname || ""} ${userInfo.lastname || ""}`);
      }
    };

    checkUserLogin();

    // ลบ event listener เมื่อ component unmount
    return () => {
      window.removeEventListener('cartUpdated', loadCartItems);
    };
  }, []);

  const loadCartItems = () => {
    setLoading(true);
    const cartItemsStr = localStorage.getItem('cartItems');

    if (cartItemsStr) {
      try {
        const items = JSON.parse(cartItemsStr);
        // เพิ่มค่า isSelected เป็น true สำหรับทุกรายการและตรวจสอบ URL รูปภาพ
        const cartItemsWithSelection = items.map((item: any) => ({
          ...item,
          isSelected: true,
          // ตรวจสอบและแปลง URL รูปภาพให้สมบูรณ์
          thumbnail: item.thumbnail ? item.thumbnail : ''
        }));
        setCartItems(cartItemsWithSelection);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลตะกร้า:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  };

  const handleToggleSelect = (id: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
    updateSelectAllStatus();
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(prevItems =>
      prevItems.map(item => ({ ...item, isSelected: newSelectAll }))
    );
  };

  const updateSelectAllStatus = () => {
    const allSelected = cartItems.every(item => item.isSelected);
    setSelectAll(allSelected);
  };

  const handleRemoveItem = (id: string) => {
    // ลบสินค้าออกจากตะกร้า
    const updatedItems = cartItems.filter(item => item._id !== id);
    setCartItems(updatedItems);

    // บันทึกลง localStorage
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));

    // ส่ง event เพื่ออัพเดตจำนวนสินค้าในตะกร้า
    const cartCountEvent = new CustomEvent('cartUpdated');
    window.dispatchEvent(cartCountEvent);
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => item.isSelected)
      .reduce((total, item) => total + item.price, 0);
  };

  const calculateSavings = () => {
    return cartItems
      .filter(item => item.isSelected && item.originalPrice)
      .reduce((total, item) => total + ((item.originalPrice || 0) - item.price), 0);
  };

  const selectedItemsCount = cartItems.filter(item => item.isSelected).length;

  return (
    <CategoryProvider>
      <div className="cart-page">
        <Topbar
          modalStatus={showModal}
          setShowModal={setShowModal}
          setTypeModal={() => { }}
        />

        <div className="cart-header">
          <div className="container">
            <h1>ตะกร้าสินค้า</h1>
            <p>รายการคอร์สเรียนที่คุณเลือกไว้</p>
          </div>
        </div>

        <div className="cart-content container">
          <div className="back-to-courses">
            <Link to="/courses" className="back-link">
              <FaArrowLeft /> กลับไปเลือกคอร์สเรียนเพิ่มเติม
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <CircularProgress style={{ color: "#a906f5" }} />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <FaShoppingCart />
              </div>
              <Typography variant="h5" className="empty-cart-title">ตะกร้าของคุณว่างเปล่า</Typography>
              <Typography variant="body1" className="empty-cart-message">
                ดูเหมือนว่าคุณยังไม่ได้เพิ่มคอร์สเรียนใดๆ ลงในตะกร้า
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/courses"
                className="browse-courses-btn"
              >
                เลือกดูคอร์สเรียน
              </Button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="cart-header-row">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        color="secondary"
                        sx={{
                          color: "#a906f5",
                          '&.Mui-checked': {
                            color: "#a906f5",
                          },
                        }}
                      />
                    }
                    label={`เลือกทั้งหมด (${cartItems.length} คอร์ส)`}
                    className="select-all-label"
                  />
                </div>

                <Divider />

                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-select">
                      <Checkbox
                        checked={item.isSelected}
                        onChange={() => handleToggleSelect(item._id)}
                        color="secondary"
                        sx={{
                          color: "#a906f5",
                          '&.Mui-checked': {
                            color: "#a906f5",
                          },
                        }}
                      />
                    </div>
                    <div className="item-thumbnail">
                      <img src={item.thumbnail} alt={item.title} />
                    </div>
                    <div className="item-details">
                      <Typography variant="h6" className="item-title">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" className="item-instructor">
                        โดย {item.instructor}
                      </Typography>
                      {item.discount && (
                        <div className="discount-badge">
                          <FaTag /> ลด {item.discount}%
                        </div>
                      )}
                    </div>
                    <div className="item-price">
                      <Typography variant="h6" className="current-price">
                        ฿{item.price.toLocaleString()}
                      </Typography>
                      {item.originalPrice && (
                        <Typography variant="body2" className="original-price">
                          ฿{item.originalPrice.toLocaleString()}
                        </Typography>
                      )}
                    </div>
                    <div className="item-actions">
                      <IconButton
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        <FaTrash />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-header">
                  <Typography variant="h6">สรุปคำสั่งซื้อ</Typography>
                </div>
                <div className="summary-content">
                  <div className="summary-row">
                    <span>คอร์สเรียนที่เลือก ({selectedItemsCount})</span>
                    <span>฿{calculateTotal().toLocaleString()}</span>
                  </div>
                  {calculateSavings() > 0 && (
                    <div className="summary-row savings">
                      <span>ส่วนลด</span>
                      <span>-฿{calculateSavings().toLocaleString()}</span>
                    </div>
                  )}
                  <Divider className="summary-divider" />
                  <div className="summary-row total">
                    <span>ยอดรวมทั้งสิ้น</span>
                    <span>฿{calculateTotal().toLocaleString()}</span>
                  </div>
                  {isLoggedIn ? (
                    <OmiseCheckout
                      amount={calculateTotal()}
                      courseIds={cartItems.filter(item => item.isSelected).map(item => item._id)}
                      userId={userId}
                      email={userEmail}
                      name={userName}
                      onSuccess={() => setShowSuccessAlert(true)}
                      onError={(error) => {
                        setErrorMessage(typeof error === 'string' ? error : 'เกิดข้อผิดพลาดในการชำระเงิน');
                        setShowErrorAlert(true);
                      }}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      className="checkout-btn"
                      disabled={selectedItemsCount === 0}
                      component={Link}
                      onClick={()=>{
                        alert("กรุณาเข้าสู่ระบบเพื่อชำระเงิน");
                      }}
                      sx={{
                        backgroundColor: "#a906f5",
                        '&:hover': {
                          backgroundColor: "#8205c0",
                        },
                        '&.Mui-disabled': {
                          backgroundColor: "#e0e0e0",
                          color: "#a0a0a0"
                        }
                      }}
                    >
                      เข้าสู่ระบบเพื่อชำระเงิน
                    </Button>
                  )}
                  <div className="payment-methods">
                    <Typography variant="body2">วิธีการชำระเงิน:</Typography>
                    <div className="payment-icons">
                      <div className="payment-method-item">
                        <FaCreditCard /> <span>บัตรเครดิต/เดบิต</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* แจ้งเตือนการชำระเงินสำเร็จ */}
      <Snackbar 
        open={showSuccessAlert} 
        autoHideDuration={5000} 
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccessAlert(false)}>
          ชำระเงินสำเร็จ! กำลังนำคุณไปยังหน้าคอร์สของฉัน...
        </Alert>
      </Snackbar>
      
      {/* แจ้งเตือนข้อผิดพลาด */}
      <Snackbar 
        open={showErrorAlert} 
        autoHideDuration={5000} 
        onClose={() => setShowErrorAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setShowErrorAlert(false)}>
          {errorMessage || 'เกิดข้อผิดพลาดในการชำระเงิน'}
        </Alert>
      </Snackbar>
    </CategoryProvider>
  );
};

export default CartPage;
