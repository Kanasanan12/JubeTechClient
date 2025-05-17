import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import "../../assets/css/components/cart-dropdown.css";

interface CartItem {
  _id: string;
  title: string;
  instructor: string;
  price: number;
  thumbnail: string;
  slug: string;
}

const CartDropdown = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // ดึงข้อมูลจาก localStorage
    loadCartItems();
    
    // เพิ่ม event listener สำหรับการอัพเดตตะกร้า
    window.addEventListener('cartUpdated', loadCartItems);
    
    // ลบ event listener เมื่อ component unmount
    return () => {
      window.removeEventListener('cartUpdated', loadCartItems);
    };
  }, []);
  
  // โหลดข้อมูลตะกร้าจาก localStorage
  const loadCartItems = () => {
    const cartItemsStr = localStorage.getItem('cartItems');
    if (cartItemsStr) {
      try {
        const items = JSON.parse(cartItemsStr);
        setCartItems(items);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลตะกร้า:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
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
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  return (
    <div className="cart-dropdown-container">
      <div 
        className="cart-icon-wrapper"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        <FaShoppingCart />
        {cartItems.length > 0 && (
          <span className="cart-count">{cartItems.length}</span>
        )}
      </div>

      {isOpen && (
        <div 
          className="cart-dropdown" 
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="cart-dropdown-header">
            <h3>ตะกร้าสินค้า ({cartItems.length})</h3>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <p>ตะกร้าของคุณว่างเปล่า</p>
              <Link to="/courses" onClick={() => setIsOpen(false)}>
                เลือกดูคอร์สเรียน
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items-container">
                {cartItems.map(item => (
                  <div className="cart-item" key={item._id}>
                    <div className="cart-item-thumbnail">
                      <img src={item.thumbnail} alt={item.title} />
                    </div>
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">
                        <Link to={`/courses/${item.slug}`} onClick={() => setIsOpen(false)}>
                          {item.title}
                        </Link>
                      </h4>
                      <p className="cart-item-instructor">โดย {item.instructor}</p>
                      <p className="cart-item-price">฿{item.price.toLocaleString()}</p>
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-dropdown-footer">
                <div className="cart-total">
                  <span>ยอดรวม:</span>
                  <span>฿{calculateTotal().toLocaleString()}</span>
                </div>
                <Link 
                  to="/cart" 
                  className="checkout-btn"
                  onClick={() => setIsOpen(false)}
                >
                  ไปที่ตะกร้าสินค้า
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
