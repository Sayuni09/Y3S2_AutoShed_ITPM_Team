import React, { useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from "../components/LIC_Component/Navbar";
import Sidebar from "../components/LIC_Component/Sidebar";
import LicNewSchedules from "../components/LIC_Component/LicNewSchedules";
import LicViewSchedules from "../components/LIC_Component/LicViewSchedules";
import LicLecturersDetails from "../components/LIC_Component/LicLecturersDetails";
import LicExaminersDetails from "../components/LIC_Component/LicExaminersDetails";
import ExAvailability from "../components/LIC_Component/ExAvailability";
import LecAvailability from "../components/LIC_Component/LecAvailability";
import LicRequestRescheduls from "../components/LIC_Component/LicRequestRescheduls";
import LicTimeSlots from "../components/LIC_Component/LicTimeSlots";



import { Users, FileText, CheckSquare } from 'lucide-react';
import "../styles/LIC_Styles/Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LicDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

    const cards = [
        { title: 'Lecturers', value: 'N/A', icon: <Users className="card-icon" size={24} />, color: '#4b7bec', tab: 'lecturers' },
        { title: 'Examiners', value: 'N/A', icon: <Users className="card-icon" size={24} />, color: '#26de81', tab: 'examiners' },
        { title: 'Requested Reschedules', value: 'N/A', icon: <FileText className="card-icon" size={24} />, color: '#fd9644', tab: 'requested-reschedules' },
        { title: 'Scheduled Presentations', value: 'N/A', icon: <CheckSquare className="card-icon" size={24} />, color: '#a55eea', tab: 'schedules-view' }
    ];

    const handleCardClick = (tab) => {
        setActiveTab(tab);
        setSelectedTimeSlot(null); // Reset selected time slot when changing tabs
    };


    const handleBookSlot = (slot) => {
        setSelectedTimeSlot({
            slot_id: slot.id,
            module_code: slot.module_code,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            venue_name: slot.venue_name,
            semester: slot.semester,
            lecturers: slot.lecturers,
            examiners: slot.examiners
        });
        setActiveTab("schedules-new");
    };

    const handleBackToTimeSlots = () => {
        setActiveTab("time-slots");
        setSelectedTimeSlot(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="content-wrapper">
                        <div className="dashboard-cards">
                            {cards.map((card, index) => (
                                <div className="dashboard-card" key={index} onClick={() => handleCardClick(card.tab)}>
                                    <div className="card-icon-wrapper" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                                        {card.icon}
                                    </div>
                                    <div className="card-content">
                                        <h3>{card.title}</h3>
                                        <p className="card-value" style={{ color: card.color }}>{card.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "schedules-new":
                return <LicNewSchedules timeSlotData={selectedTimeSlot} onBackClick={handleBackToTimeSlots} />;
            case "schedules-view":
                return <LicViewSchedules />;
            case "lecturers":
                return <LicLecturersDetails />;
            case "examiners":
                return <LicExaminersDetails />;
            case "availability-lecturers":
                return <LecAvailability />;
            case "availability-examiners":
                return <ExAvailability />;
            case "requested-reschedules":
                return <LicRequestRescheduls />;
            case "time-slots":
                return <LicTimeSlots onBookSlot={handleBookSlot} />;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar onLogout={onLogout} onNavChange={setActiveTab} activeTab={activeTab} />
            <div className="dashboard-content">
                <Navbar onLogout={onLogout} />
                <main className="main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default LicDashboard;

