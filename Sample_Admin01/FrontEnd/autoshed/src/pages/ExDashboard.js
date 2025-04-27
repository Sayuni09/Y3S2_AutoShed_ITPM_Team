import React, { useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from "../components/EX_Component/Navbar";
import Sidebar from "../components/EX_Component/Sidebar";
import ExAvalabilityNewForm from "../components/EX_Component/ExAvailabilityNewForm";
import ExAvalabilitySent from "../components/EX_Component/ExAvalabilitySent";
import ExNewSchedules from "../components/EX_Component/ExNewSchedules";
import ExAcceptedSchedules from "../components/EX_Component/ExAcceptedSchedules";
import ExRequestRescheduls from "../components/EX_Component/ExRequestRescheduls";
import ExConfirmedSchedules from "../components/EX_Component/ExConfirmedSchedules";



import ExamCalendar from "../components/EX_Component/ExamCalendar";
import { Calendar, CheckSquare, FileText, Send } from 'lucide-react';
import "../styles/EX_Styles/Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");

  

    const cards = [
        { title: 'Module wise Schedules', value: 'N/A', icon: <Calendar className="card-icon" size={24} />, color: '#4b7bec', tab: 'schedules-new' },
        { title: 'Confirmed Schedules', value: 'N/A', icon: <CheckSquare className="card-icon" size={24} />, color: '#26de81', tab: 'schedules-confirmed' },
        { title: 'Reschedules Requested', value: 'N/A', icon: <FileText className="card-icon" size={24} />, color: '#fd9644', tab: 'reschedules' },
        { title: 'Sent Availability', value: 'N/A', icon: <Send className="card-icon" size={24} />, color: '#a55eea', tab: 'availability-sent' }
    ];

    const handleNavChange = (tab) => {
        setActiveTab(tab);
    };

    const handleCardClick = (tab) => {
        setActiveTab(tab);
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
                        <ExamCalendar />
                   
                    </div>
                );
            case "availability-new":
                return <ExAvalabilityNewForm />;
            case "schedules-new":
                return <ExNewSchedules />;
            case "schedules-Accepted":
                return <ExAcceptedSchedules />;
            case "schedules-confirmed":
                return <ExConfirmedSchedules />;
            case "reschedules":
                return <ExRequestRescheduls />;
            case "availability-sent":
                return <ExAvalabilitySent />;
            case "reports":
                return <div>Reports Content</div>;
            default:
                return <div>Select a tab</div>;
        }




    };

    return (
        <div className="dashboard-container">
            <Sidebar onLogout={onLogout} onNavChange={handleNavChange} activeTab={activeTab} />
            <div className="dashboard-content">
                <Navbar onLogout={onLogout} />
                <main className="main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ExDashboard;