// src/pages/LecDashboard.js

import React, { useState, useEffect } from "react";
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
import LecNewScheduleService from "../services/LEC_Services/LecNewScheduleService";
import { fetchAcceptedSchedules } from "../services/LEC_Services/LecAcceptedServices";
import LecRequestService from "../services/LEC_Services/LecRequestService";
import lecAvailabilityService from "../services/LEC_Services/LecAvailabilityService";
import "../styles/LEC_Styles/Dashboard.css";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LecDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [newSchedulesCount, setNewSchedulesCount] = useState("N/A");
    const [acceptedSchedulesCount, setAcceptedSchedulesCount] = useState("N/A");
    const [reschedulesCount, setReschedulesCount] = useState("N/A");
    const [availabilityFormsCount, setAvailabilityFormsCount] = useState("N/A");
    const [lecturerId, setLecturerId] = useState(null);
    const [error, setError] = useState(null);
    
    // Get lecturer ID from JWT token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setLecturerId(decodedToken.id);
            } catch (err) {
                console.error("Error decoding token:", err);
                setError("Failed to authenticate. Please login again.");
            }
        } else {
            setError("Not authenticated. Please login.");
        }
    }, []);
    
    // Fetch new schedules when lecturer ID is available
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (lecturerId) {
                    const schedules = await LecNewScheduleService.getLecturerSchedules(lecturerId);
                    setNewSchedulesCount(schedules.length.toString());
                }
            } catch (error) {
                console.error("Error fetching schedules:", error);
                setNewSchedulesCount("Error");
            }
        };

        fetchSchedules();
    }, [lecturerId]);

    // Fetch accepted schedules when lecturer ID is available
    useEffect(() => {
        const fetchAcceptedSchedulesData = async () => {
            try {
                if (lecturerId) {
                    const schedules = await fetchAcceptedSchedules(lecturerId);
                    setAcceptedSchedulesCount(schedules.length.toString());
                }
            } catch (error) {
                console.error("Error fetching accepted schedules:", error);
                setAcceptedSchedulesCount("Error");
            }
        };

        fetchAcceptedSchedulesData();
    }, [lecturerId]);

    // Fetch reschedule requests when lecturer ID is available
    useEffect(() => {
        const fetchRescheduleRequests = async () => {
            try {
                if (lecturerId) {
                    const requests = await LecRequestService.getLecturerRescheduleRequests(lecturerId);
                    setReschedulesCount(requests.length.toString());
                }
            } catch (error) {
                console.error("Error fetching reschedule requests:", error);
                setReschedulesCount("Error");
            }
        };

        fetchRescheduleRequests();
    }, [lecturerId]);

    // Fetch availability forms when lecturer ID is available
    useEffect(() => {
        const fetchAvailabilityForms = async () => {
            try {
                if (lecturerId) {
                    const forms = await lecAvailabilityService.getAvailability(lecturerId);
                    setAvailabilityFormsCount(forms.length.toString());
                }
            } catch (error) {
                console.error("Error fetching availability forms:", error);
                setAvailabilityFormsCount("Error");
            }
        };

        fetchAvailabilityForms();
    }, [lecturerId]);

    const cards = [
        { title: 'Module wise Schedules', value: newSchedulesCount, icon: <Calendar className="card-icon" size={24} />, color: '#4b7bec', tab: 'schedules-new' },
        { title: 'Accepted Schedules', value: acceptedSchedulesCount, icon: <CheckSquare className="card-icon" size={24} />, color: '#26de81', tab: 'schedules-accepted' },
        { title: 'Reschedules Requested', value: reschedulesCount, icon: <FileText className="card-icon" size={24} />, color: '#fd9644', tab: 'reschedules' },
        { title: 'Sent Availability', value: availabilityFormsCount, icon: <Send className="card-icon" size={24} />, color: '#a55eea', tab: 'availability-sent' }
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
            {error && <div className="error-message">{error}</div>}
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
