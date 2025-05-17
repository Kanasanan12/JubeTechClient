import Card from "./Card";

import UserCountImage from "../../../assets/img/tutor_dashboard/enroll.png";
import RatingImage from "../../../assets/img/tutor_dashboard/rating.png";
import IncomeImage from "../../../assets/img/tutor_dashboard/income.png";

import "../../../assets/css/tutor_dashboard/card.css";

export default function CardList() {
    const card_data = [
        {
            title: "จำนวนผู้ลงทะเบียนเรียนทั้งหมดในเดือนนี้",
            result: 100,
            image: UserCountImage,
            unit: "คนต่อเดือน"
        },
        {
            title: "ผลรวมค่านิยมเฉลี่ย",
            result: 4.8,
            image: RatingImage,
            unit: "ค่านิยม"
        },
        {
            title: "ผลรวมรายได้ต่อเดือน",
            result: 5465,
            image: IncomeImage,
            unit: "บาทต่อเดือน"
        },
    ]
    return (
        <div className="card-list">
            {card_data && card_data.map((card, index) => (
                <Card {...card} key={index} />
            ))}
        </div>
    );
}