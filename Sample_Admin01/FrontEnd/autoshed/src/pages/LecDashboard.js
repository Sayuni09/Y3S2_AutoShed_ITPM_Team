// src/pages/LecDashboard.js

import React, { useState } from "react";
//import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from "../components/LEC_Component/Navbar";
import Sidebar from "../components/LEC_Component/Sidebar";
import LecAvailabilityForm from "../components/LEC_Component/LecAvailabilityForm"; 
import LecAvailabilitySent from "../components/LEC_Component/LecAvailabilitySent";
import LecNewSchedules from "../components/LEC_Component/LecNewSchedules";
import ExamCalendar from "../components/LEC_Component/LecCalendar";
import LecAcceptedSchedules from "../components/LEC_Component/LecAcceptedSchedules";
import LecConfirmedSchedules from "../components/LEC_Component/LecConfirmedSchedules";
import LecRequestRescheduls from "../components/LEC_Component/LecRequestRescheduls";
import { Calendar, CheckSquare, FileText, Send } from 'lucide-react';
import "../styles/LEC_Styles/Dashboard.css";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LecDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");

    // const data = {
    //     labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    //     datasets: [
    //         {
    //             label: 'Premium Collected',
    //             data: [12000, 19000, 30000, 50000, 20000, 30000],
    //             backgroundColor: 'rgba(75, 123, 236, 0.6)',
    //             borderColor: 'rgba(75, 123, 236, 1)',
    //             borderWidth: 1,
    //         },
    //     ],
    // };

    // const options = {
    //     responsive: true,
    //     maintainAspectRatio: false,
    //     plugins: {
    //         legend: {
    //             position: 'top',
    //             labels: {
    //                 font: {
    //                     size: 12,
    //                     family: "'Inter', sans-serif"
    //                 }
    //             }
    //         },
    //         tooltip: {
    //             backgroundColor: 'rgba(0, 0, 0, 0.8)',
    //             padding: 12,
    //             titleFont: {
    //                 size: 14,
    //                 family: "'Inter', sans-serif"
    //             },
    //             bodyFont: {
    //                 size: 13,
    //                 family: "'Inter', sans-serif"
    //             }
    //         }
    //     },
    //     scales: {
    //         y: {
    //             beginAtZero: true,
    //             grid: {
    //                 color: 'rgba(0, 0, 0, 0.1)',
    //                 drawBorder: false
    //             },
    //             ticks: {
    //                 font: {
    //                     size: 12,
    //                     family: "'Inter', sans-serif"
    //                 }
    //             }
    //         },
    //         x: {
    //             grid: {
    //                 display: false
    //             },
    //             ticks: {
    //                 font: {
    //                     size: 12,
    //                     family: "'Inter', sans-serif"
    //                 }
    //             }
    //         }
    //     }
    // };

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
                        {/* <div className="chart-container">
                            <div className="chart-header">
                                <h2>Premium Collection Trends</h2>
                                <div className="chart-actions">
                                    <select className="chart-select">
                                        <option value="6months">Last 6 Months</option>
                                        <option value="1year">Last Year</option>
                                        <option value="all">All Time</option>
                                    </select>
                                </div>
                            </div>
                            <div className="chart-wrapper">
                                <Bar data={data} options={options} height={300} />
                            </div>
                        </div> */}
                    </div>
                );
            case "availability-new":
                return <LecAvailabilityForm />; // Render the new form here
            case "schedules-new":
                return <LecNewSchedules />;
            case "schedules-accepted":
                return <LecAcceptedSchedules />;
            case "schedules-confirmed":
                return <LecConfirmedSchedules />;
            case "reschedules":
                return <LecRequestRescheduls />;
            case "availability-sent":
                return <LecAvailabilitySent />;
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

export default LecDashboard;