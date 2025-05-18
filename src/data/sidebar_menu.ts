import {
    FaFileCode,
    FaHouse,
    FaBookOpenReader,
    FaUser,
    FaSitemap,
    FaUserPlus,
    FaFilePen
} from "react-icons/fa6";

import { IconType } from "react-icons";
import { MdDiscount, MdLeaderboard } from "react-icons/md";

export interface Menu {
    title: string,
    href: string,
    icon: IconType,
    roles: string[]
}

export const menus:Menu[] = [
    // { 
    //     title: "แผนภูมิภาพรวมติวเตอร์",
    //     href: "/dashboard/tutor/statistic",
    //     icon: FaHouse,
    //     roles: ["Tutor"]
    // },
    {
        title: "ภาพรวม",
        href: "/dashboard/admin/dashboard-overview",
        icon: MdLeaderboard,
        roles: ["Admin"]
    },
    {
        title: "จัดการคอร์สเรียน",
        href: "/dashboard/course-management",
        icon: FaBookOpenReader,
        roles: ["Tutor"]
    },
    {
        title: "จัดการผู้ใช้งาน",
        href: "/dashboard/admin/user-management",
        icon: FaUser,
        roles: ["Admin"]
    },
    {
        title: "จัดการหมวดหมู่",
        href: "/dashboard/admin/category-management",
        icon: FaSitemap,
        roles: ["Admin"]
    },
    {
        title: "จัดการบทบาท",
        href: "/dashboard/admin/role-management",
        icon: FaUserPlus,
        roles: ["Admin"]
    },
    {
        title: "จัดการโปรโมชั่น",
        href: "/dashboard/admin/promotion-management",
        icon: MdDiscount,
        roles: ["Admin"]
    },
    {
        title: "จัดการแบบทดสอบ",
        href: "/dashboard/exam-management",
        icon: FaFilePen,
        roles: ["Tutor"]
    },
    {
        title: "JubeCodeLab",
        href: "/dashboard/jube-code-lab/",
        icon: FaFileCode,
        roles: ["Tutor", "Student"]
    }
]