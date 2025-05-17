import { useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Landing/Topbar";
import AuthModal from "../components/Landing/AuthModal";
import CourseList from "../components/Landing/CourseList";
import { CategoryProvider } from "../contexts/CategoryContext";

import "../assets/css/landing/landing.css";
import Bag from "../assets/img/landing/Bag.png";
import Task from "../assets/img/landing/Task.png";
import Star from "../assets/img/landing/Star.png";
import FactoryImage from "../assets/img/landing/Factory Education.png";

export default function Landing() {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [typeModal, setTypeModal] = useState<number>(0);
    return (
        <CategoryProvider>
            <div className="landing">
                <Topbar
                    modalStatus={showModal}
                    setShowModal={setShowModal}
                    setTypeModal={setTypeModal}
                />
                <header>
                    <div className="content">
                        <h1>แพลตฟอร์มการเรียนรู้เทคโนโลยี ดีไซน์การเรียนรู้ของคุณและเติบโตไปพร้อมกับสื่อการเรียนรู้ของเรา</h1>
                        <p>JubeTech แพลตฟอร์มการเรียนรู้ที่เจาะกลุ่มเป้าหมายเทคโนโลยีมีจุดประสงค์เพื่อให้ผู้ใช้งานได้เข้าถึงสื่อการเรียนรู้คุณภาพที่เฉพาะด้านนั้นๆ</p>
                        <Link to="/courses">ค้นหาคอร์สเรียน</Link>
                    </div>
                    <img src={FactoryImage} alt="Education 3D" />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" d="M0,128L21.8,144C43.6,160,87,192,131,208C174.5,224,218,224,262,234.7C305.5,245,349,267,393,245.3C436.4,224,480,160,524,112C567.3,64,611,32,655,42.7C698.2,53,742,107,785,138.7C829.1,171,873,181,916,176C960,171,1004,149,1047,149.3C1090.9,149,1135,171,1178,197.3C1221.8,224,1265,256,1309,261.3C1352.7,267,1396,245,1418,234.7L1440,224L1440,320L1418.2,320C1396.4,320,1353,320,1309,320C1265.5,320,1222,320,1178,320C1134.5,320,1091,320,1047,320C1003.6,320,960,320,916,320C872.7,320,829,320,785,320C741.8,320,698,320,655,320C610.9,320,567,320,524,320C480,320,436,320,393,320C349.1,320,305,320,262,320C218.2,320,175,320,131,320C87.3,320,44,320,22,320L0,320Z"></path></svg>
                </header>
                <div className="sub-content">
                    <div className="fill-color"></div>
                    <div className="card-list">
                        <div className="card-container">
                            <img src={Bag} alt="bag" />
                            <p>คอร์สเรียนเทคโนโลยีที่มีราคาที่ย่อมเยาจนถึงคอร์สเรียนฟรี</p>
                        </div>
                        <div className="card-container">
                            <img src={Task} alt="task" />
                            <p>มีแบบทดสอบพร้อมมอบใบประกาศนียบัตร</p>
                        </div>
                        <div className="card-container">
                            <img src={Star} alt="star" />
                            <p>มี Compiler หลากหลายภาษาโดย JubeCodeLab</p>
                        </div>
                    </div>
                </div>
                <CourseList />
                <AuthModal
                    setShowModal={setShowModal}
                    typeModal={typeModal}
                    showModal={showModal}
                    setTypeModal={setTypeModal}
                />
            </div>
        </CategoryProvider>
    );
}