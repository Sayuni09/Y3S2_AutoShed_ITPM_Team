import React, { useState, useEffect } from "react";
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
import ExNewScheduleService from "../services/EX_Services/ExNewScheduleService";
import { fetchAcceptedSchedules } from "../services/EX_Services/ExAcceptedService";
import ExRequestService from "../services/EX_Services/ExRequestService";
import exAvailabilityService from "../services/EX_Services/ExAvailabilityService";
import "../styles/EX_Styles/Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [newSchedulesCount, setNewSchedulesCount] = useState("N/A");
    const [acceptedSchedulesCount, setAcceptedSchedulesCount] = useState("N/A");
    const [reschedulesCount, setReschedulesCount] = useState("N/A");
    const [availabilityFormsCount, setAvailabilityFormsCount] = useState("N/A");
    const [examinerId, setExaminerId] = useState(null);
    const [error, setError] = useState(null);
    
    // Get examiner ID from JWT token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setExaminerId(decodedToken.id);
            } catch (err) {
                console.error("Error decoding token:", err);
                setError("Failed to authenticate. Please login again.");
            }
        } else {
            setError("Not authenticated. Please login.");
        }
    }, []);
    
    // Fetch new schedules when examiner ID is available
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (examinerId) {
                    const schedules = await ExNewScheduleService.getExaminerSchedules(examinerId);
                    setNewSchedulesCount(schedules.length.toString());
                }
            } catch (error) {
                console.error("Error fetching schedules:", error);
                setNewSchedulesCount("Error");
            }
        };

        fetchSchedules();
    }, [examinerId]);

    // Fetch accepted schedules when examiner ID is available
    useEffect(() => {
        const fetchAcceptedSchedulesData = async () => {
            try {
                if (examinerId) {
                    const schedules = await fetchAcceptedSchedules(examinerId);
                    setAcceptedSchedulesCount(schedules.length.toString());
                }
            } catch (error) {
                console.error("Error fetching accepted schedules:", error);
                setAcceptedSchedulesCount("Error");
            }
        };

        fetchAcceptedSchedulesData();
    }, [examinerId]);

    // Fetch reschedule requests when examiner ID is available
    useEffect(() => {
        const fetchRescheduleRequests = async () => {
            try {
                if (examinerId) {
                    const requests = await ExRequestService.getExaminerRescheduleRequests(examinerId);
                    setReschedulesCount(requests.length.toString());
                }
            } catch (error) {
                console.error("Error fetching reschedule requests:", error);
                setReschedulesCount("Error");
            }
        };

        fetchRescheduleRequests();
    }, [examinerId]);

    // Fetch availability forms when examiner ID is available
    useEffect(() => {
        const fetchAvailabilityForms = async () => {
            try {
                if (examinerId) {
                    const forms = await exAvailabilityService.getAvailability(examinerId);
                    setAvailabilityFormsCount(forms.length.toString());
                }
            } catch (error) {
                console.error("Error fetching availability forms:", error);
                setAvailabilityFormsCount("Error");
            }
        };

        fetchAvailabilityForms();
    }, [examinerId]);

    const cards = [
        { title: 'Module wise Schedules', value: newSchedulesCount, icon: <Calendar className="card-icon" size={24} />, color: '#4b7bec', tab: 'schedules-new' },
        { title: 'Accepted Schedules', value: acceptedSchedulesCount, icon: <CheckSquare className="card-icon" size={24} />, color: '#26de81', tab: 'schedules-Accepted' },
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

export default ExDashboard;
