import { useEffect, useState } from "react";
import { IFToggleSidebar } from "../app";
import { checkUser } from "../services/authorize";
import MainDashboard from "../layouts/MainDashboard";
import { Row, Col, Card } from "react-bootstrap";
import ReactECharts from "echarts-for-react";
import { FaTag, FaUsers } from "react-icons/fa6";
import { LiaCoinsSolid } from "react-icons/lia";
import { MdLibraryBooks } from "react-icons/md";

import "../assets/css/adminConfig/setting.css";

interface DashboardData {
  users: {
    total: number;
    active: number;
    inactive: number;
    monthlyNewUsers: {
      month: number;
      student: number;
      tutor: number;
    }[];
  };
  courses: {
    total: number;
    topCourses: {
      title: string;
      student_enrolled: number;
    }[];
  };
  promotions: {
    active: number;
  };
  revenue: {
    total: number;
  };
}

export default function DashboardOverview({ toggleSidebar, setToggleSidebar }: IFToggleSidebar) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!checkUser()) window.location.href = "/";

    fetch(`${import.meta.env.VITE_API_URL}/getAdminDashboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((jsonData: DashboardData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Error loading data</p>;

  const thaiMonths = [
    "",
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  const colors = ["#b29cfa", "#84aade", "#f7b447", "#18eda4", "#f57c7c"];

  const earningsOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["นักเรียน", "ติวเตอร์"] },
    xAxis: {
      type: "category",
      data: data.users.monthlyNewUsers.map((item) => thaiMonths[item.month]),
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "นักเรียน",
        type: "line",
        smooth: true,
        data: data.users.monthlyNewUsers.map((item) => item.student),
        itemStyle: { color: "#10B981" },
      },
      {
        name: "ติวเตอร์",
        type: "line",
        smooth: true,
        data: data.users.monthlyNewUsers.map((item) => item.tutor),
        itemStyle: { color: "#3B82F6" },
      },
    ],
  };

  const userStatusOption = {
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "สถานะผู้ใช้",
        type: "pie",
        radius: "50%",
        data: [
          { value: data.users.active, name: "Active" },
          { value: data.users.inactive, name: "Inactive" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <MainDashboard
      title="Admin Dashboard"
      toggleSidebar={toggleSidebar}
      setToggleSidebar={setToggleSidebar}
      title_sidebar="ภาพรวม"
    >
      <div className="dashboard-form-container">
        <div className="px-4 pb-3">
          <Row xs={1} sm={2} lg={4} className="g-4">
            <Col>
              <Card style={{ backgroundColor: "#fde3e4" }}>
                <Card.Body>
                  <div className="dashboard_title">
                    <div className="dashboard_icon" style={{ backgroundColor: "#e76383" }}>
                      <FaUsers size={20} color="#ffff" />
                    </div>
                    <Card.Title>ผู้ใช้งานทั้งหมด</Card.Title>
                  </div>
                  <Card.Text className="fs-3 fw-bold ms-5">
                    {data.users.total}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card style={{ backgroundColor: "#fef3dd" }}>
                <Card.Body>
                  <div className="dashboard_title">
                    <div className="dashboard_icon" style={{ backgroundColor: "#f49586" }}>
                      <MdLibraryBooks size={20} color="#ffff" />
                    </div>
                    <Card.Title>คอร์สทั้งหมด</Card.Title>
                  </div>
                  <Card.Text className="fs-3 fw-bold ms-5">
                    {data.courses.total}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card style={{ backgroundColor: "#dcfce5" }}>
                <Card.Body>
                  <div className="dashboard_title">
                    <div className="dashboard_icon" style={{ backgroundColor: "#4fce64" }}>
                      <FaTag size={20} color="#ffff" />
                    </div>
                    <Card.Title>โปรโมชั่นที่ใช้งาน</Card.Title>
                  </div>
                  <Card.Text className="fs-3 fw-bold  ms-5">
                    {data.promotions.active}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card style={{ backgroundColor: "#f2e8ff" }}>
                <Card.Body>
                  <div className="dashboard_title">
                    <div className="dashboard_icon" style={{ backgroundColor: "#b889f1" }}>
                      <LiaCoinsSolid size={20} color="#ffff" />
                    </div>
                    <Card.Title>รายได้รวม</Card.Title>
                  </div>
                  <Card.Text className="fs-3 fw-bold  ms-5">
                    {Number(data.revenue.total).toLocaleString()} ฿
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
          <Card className="mb-3">
            <Card.Body>
              <Card.Title> User Overview </Card.Title>
              <ReactECharts option={earningsOption} style={{ height: "300px" }} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title> ผู้ใช้งาน Active / Inactive </Card.Title>
              <ReactECharts option={userStatusOption} style={{ height: "300px" }} />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title> Top 5 คอร์สที่มีนักเรียนมากที่สุด </Card.Title>
              <div className="space-y-3 mt-3">
                {data.courses.topCourses.map((course, index) => {
                  const max = data.courses.topCourses[0].student_enrolled || 1;
                  const percent = (course.student_enrolled / max) * 100;

                  return (
                    <div key={index}>
                      <div className="d-flex justify-content-between">
                        {course.title}
                        <span>{course.student_enrolled} คน</span>
                      </div>
                      <div className="progress" style={{ height: "20px", marginBottom: "10px" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${percent}%`, backgroundColor: colors[index % colors.length] }}
                          aria-valuenow={course.student_enrolled}
                          aria-valuemin={0}
                          aria-valuemax={max}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </MainDashboard>
  );
}
