import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Carousel from 'react-bootstrap/Carousel';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { checkUser, checkRole } from "../../services/authorize.ts";
import { useCategory, Category } from "../../contexts/CategoryContext.tsx";

import "../../assets/css/landing/topbar.css";
import { FaAngleDown, FaAngleRight, FaSistrix, FaCartShopping, FaNewspaper, FaBars } from "react-icons/fa6";

interface TopbarProp {
    modalStatus: boolean,
    setShowModal: (value: boolean | ((prev: boolean) => boolean)) => void,
    setTypeModal: (value: number | ((prev: number) => number)) => void
}

const MUIButton = styled(Button)({
    boxShadow: "none",
    fontSize: "0.8rem",
    color: "#c13dff",
    borderColor: "#c13dff",
    "&:hover": {
        backgroundColor: "#c13dff10",
        boxShadow: "0px 1px 2px 1px #00000030"
    }
});

function ButtonContainer({ modalStatus, setShowModal, setTypeModal }:TopbarProp) {
    return (
        <div className="btn-container">
            <button
                id="signin-btn"
                onClick={() => {
                    setShowModal(!modalStatus)
                    setTypeModal(0);
                }}
            >
                เข้าสู่ระบบ
            </button>
            <button
                id="signup-btn"
                onClick={() => {
                    setShowModal(!modalStatus)
                    setTypeModal(1);
                }}
            >
                สมัครสมาชิก
            </button>
        </div>
    );
}

export default function Topbar({ modalStatus, setShowModal, setTypeModal }:TopbarProp) {
    const { state:categoryState, fetchAllCategories } = useCategory();
    const [showOffcanvas, setShowOffCanvas] = useState<boolean>(false); // Canvas state
    const [showPopover, setShowPopover] = useState<boolean>(false); // Popover state
    const [carouselIndex, setCarouselIndex] = useState<number>(0); // Carousel state
    const [isRender, setIsRender] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<Category>({
        _id: "",
        name: "",
        group_ids: [],
        updatedAt: "",
    });
    const [roles, setRole] = useState<string[]>([]);
    const [cartItemCount, setCartItemCount] = useState<number>(0);

    useEffect(() => {
        if (isRender === false) {
            fetchAllCategories("");
            setIsRender(true);
        }
        const prepareRole = async() => {
            setRole(await checkRole());
        }
        if (checkUser()) prepareRole();
        
        // ดึงข้อมูลจำนวนสินค้าในตะกร้าจาก localStorage
        updateCartCount();
        
        // เพิ่ม event listener สำหรับการอัพเดตตะกร้า
        window.addEventListener('cartUpdated', updateCartCount);
        
        // ลบ event listener เมื่อ component unmount
        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);
    
    // ฟังก์ชันอัพเดตจำนวนสินค้าในตะกร้า
    const updateCartCount = () => {
        const cartItemsStr = localStorage.getItem('cartItems');
        if (cartItemsStr) {
            const cartItems = JSON.parse(cartItemsStr);
            setCartItemCount(cartItems.length);
        } else {
            setCartItemCount(0);
        }
    };

    // Render
    return (
        <nav className="topbar">
            {/* Left Section */}
            <div className="left-container">
                {/* Logo */}
                <div className="logo-container">
                    <a href="/"><span>Jube<span>Tech</span></span></a>
                </div>
                {/* Category */}
                <div className={"category-container " + (showPopover ? "active" : null)}>
                    <MUIButton
                        className={showPopover ? "active" : ""}
                        id="category-tab"
                        aria-describedby="category-tab"
                        variant="outlined"
                        endIcon={<FaAngleDown size={14} />}
                        onMouseEnter={() => setShowPopover(true)}
                        onClick={() => setShowPopover(!showPopover)}
                    >
                        <span>หมวดหมู่</span>
                    </MUIButton>
                    {categoryState.categories.length > 0 && (
                        <div
                        className="category-info"
                        style={{display: showPopover ? "flex" : "none"}}
                        onMouseLeave={() => setShowPopover(false)}
                        >
                            <div className="main-category">
                                <p>ค้นหาหมวดหมู่ที่คุณสนใจ</p>
                                <ul>
                                    {categoryState.categories && categoryState.categories.map((category, index) => (
                                        <li key={index} onMouseEnter={() => setCurrentCategory(category)}>
                                            {category.name}
                                            <i><FaAngleRight /></i>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="sub-category">
                                <ul>
                                    {currentCategory._id !== "" && currentCategory.group_ids.map((group, index) => (
                                        <li key={index}>{group.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                {/* Search */}
                <div className="search-container">
                    <input type="text" placeholder="ค้นหาคอร์สเรียน..." />
                    <i><FaSistrix /></i>
                </div>
            </div>
            {/* Right Section */}
            <div className="right-container">
                {/* Link */}
                <a href="#">
                    สมัครเป็นติวเตอร์
                </a>
                {roles.includes("Student") && (
                    <a href="/my-courses">คอร์สเรียนของเรา</a>
                )}
                {/* Cart */}
                <a href="/cart" className="cart-icon-container">
                    <i><FaCartShopping /></i>
                    {cartItemCount > 0 && (
                        <span className="cart-count">{cartItemCount}</span>
                    )}
                </a>
                {/* Notification */}
                <a href="#"><i><FaNewspaper /></i></a>
                {checkUser()
                    ?
                    <>
                        {roles.includes("Admin") && (
                            <a className="main-link" href="/dashboard">เข้าสู่ระบบแอดมิน</a>
                        )}
                        {roles.includes("Tutor") && (
                            <a className="main-link" href="/dashboard">เข้าสู่การจัดการของติวเตอร์</a>
                        )}
                        {roles.includes("Student") && (
                            <a className="main-link" href="/dashboard">เข้าสู่ระบบการเรียน</a>
                        )}
                    </>
                    :
                    <ButtonContainer
                        modalStatus={modalStatus}
                        setShowModal={setShowModal}
                        setTypeModal={setTypeModal}
                    />
                }
                {}
                <div className="sidetab-container" onClick={() => setShowOffCanvas(true)}>
                    <i><FaBars /></i>
                </div>
            </div>

            <Offcanvas show={showOffcanvas} placement="end" onHide={() => setShowOffCanvas(false)}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>รายการเมนู</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Carousel activeIndex={carouselIndex}>
                        <Carousel.Item>
                            123
                        </Carousel.Item>
                        <Carousel.Item>
                            456
                        </Carousel.Item>
                    </Carousel>
                </Offcanvas.Body>
            </Offcanvas>
        </nav>
    );
}