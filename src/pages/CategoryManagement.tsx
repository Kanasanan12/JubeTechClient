import { useState } from "react";
import { IFToggleSidebar } from "../app";
import { BsChevronRight } from "react-icons/bs";
import MainDashboard from "../layouts/MainDashboard";
import { GroupProvider } from "../contexts/GroupContext";
import { CategoryProvider } from "../contexts/CategoryContext";
import GroupForm from "../components/Admin/categoryManagement/GroupForm";
import CategoryList from "../components/Admin/categoryManagement/CategoryList";

import "../assets/css/category/category.css";

export default function CategoryManagement({ toggleSidebar, setToggleSidebar }:IFToggleSidebar) {
    const [toggleCategory, setToggleCategory] = useState<boolean>(false);
    const [startCategory, setStartCategory] = useState<boolean>(false);
    const [startGroup, setStartGroup] = useState<boolean>(false);

    return (
        <MainDashboard title="Category Management" title_sidebar="จัดการหมวดหมู่" toggleSidebar={toggleSidebar} setToggleSidebar={setToggleSidebar} >
            <CategoryProvider>
                <GroupProvider>
                    <div className={"category-manage-container " + (toggleCategory ? "active-toggle" : "")}>
                        <button
                            onClick={() => setToggleCategory(!toggleCategory)}
                            className={"toggle-category " + (toggleCategory ? "active-toggle" : "")}
                        >
                            <i><BsChevronRight /></i>
                        </button>
                        <CategoryList startCategory={startCategory} setStartCategory={setStartCategory} />
                        <GroupForm startGroup={startGroup} setStartGroup={setStartGroup} />
                    </div>
                </GroupProvider>
            </CategoryProvider>
        </MainDashboard>
    );
}