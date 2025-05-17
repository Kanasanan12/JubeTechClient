import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { menus, Menu } from "../../data/sidebar_menu.ts";
import "../../assets/css/dashboard/sidebar.css";
import Logo from "../../assets/img/jubetech_logo.png";

import { checkRole } from "../../services/authorize.ts";

interface SidebarProp {
    title_sidebar: string,
    toggleSidebar: boolean,
    setToggleSidebar: (value: boolean | ((prev: boolean) => boolean)) => void,
}

export default function Sidebar({ title_sidebar, toggleSidebar, setToggleSidebar }:SidebarProp) {
    const [currentUserRole, setCurrentUserRole] = useState<string[]>([]);
    const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
    const [isRender, setIsRender] = useState(false);

    useEffect(() => {
        const fetchRoles = async() => {
            const roles = await checkRole();
            setCurrentUserRole(roles);
        }
        fetchRoles();
    }, []);

    useEffect(() => {
        setFilteredMenus(menus.filter((menu) =>
            menu.roles.some(role => currentUserRole.includes(role))
        ));
    }, [currentUserRole]);

    useEffect(() => {
        setIsRender(true);
    }, [filteredMenus]);

    return (
        <div className="sidebar">
            {isRender && (
                <>
                    <div
                        className={"toggle-sidebar " + (toggleSidebar ? "active-toggle" : "")}
                        onClick={() => setToggleSidebar(!toggleSidebar)}
                    >
                        <i className={toggleSidebar ? "active-icon" : ""}><FaChevronRight size={14} /></i>
                    </div>
                    <div className="sidebar-content">
                        <div className="logo-section">
                            <img src={Logo} alt="JubeTech Logo" />
                            <span className="logo-title" hidden={!toggleSidebar}>JubeTech</span>
                        </div>
                        <hr />
                        <div className="link-sidebar">
                            <ul className={toggleSidebar ? "active-list" : "normal-list"}>
                                {filteredMenus.map((menu:Menu, index) => (
                                    <Link to={menu.href} key={index}>
                                        <li 
                                            className={toggleSidebar ? "active-link " + (title_sidebar === menu.title ? "active-order" : "") : "normal-link " + (title_sidebar === menu.title ? "active-order" : "")}
                                        >
                                            <i><menu.icon size={15} /></i>
                                            <span hidden={!toggleSidebar}>{menu.title}</span>
                                        </li>
                                    </Link>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}