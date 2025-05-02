import React, { useState, useEffect } from "react";
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

// Add new icons for report cards
import { Users, FileText, CheckSquare, FileOutput, Calendar, ClipboardList } from 'lucide-react';
import "../styles/LIC_Styles/Dashboard.css";

import LicSchedulesReport from "../components/LIC_Component/LicSchedulesReport";
import LicLectureAvalabilityReport from "../components/LIC_Component/LicLectureAvalabilityReport";
import LicExaminerAvalabilityReport from "../components/LIC_Component/LicExaminerAvalabilityReport";

// Import services
import lecDetailsService from "../services/LIC_Services/LecDetailsService";
import exDetailsService from "../services/LIC_Services/ExDetailsService";
import LicRequestService from "../services/LIC_Services/LicRequestService";
import LicViewScheduleService from "../services/LIC_Services/LicViewScheduleService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LicDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    
    // State variables for counts
    const [lecturersCount, setLecturersCount] = useState("N/A");
    const [examinersCount, setExaminersCount] = useState("N/A");
    const [rescheduleRequestsCount, setRescheduleRequestsCount] = useState("N/A");
    const [schedulesCount, setSchedulesCount] = useState("N/A");
    
    // State variable for LIC ID
    const [licId, setLicId] = useState(null);
    const [error, setError] = useState(null);

    // Get LIC ID from JWT token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setLicId(decodedToken.id);
            } catch (err) {
                console.error("Error decoding token:", err);
                setError("Failed to authenticate. Please login again.");
            }
        } else {
            setError("Not authenticated. Please login.");
        }
    }, []);

    // Fetch lecturers count
    useEffect(() => {
        const fetchLecturersCount = async () => {
            try {
                if (licId) {
                    const lecturers = await lecDetailsService.getLecturerDetails(licId);
                    // Calculate total unique lecturers
                    const uniqueLecturers = new Set();
                    lecturers.forEach(module => {
                        module.lecturers.forEach(lecturer => {
                            uniqueLecturers.add(lecturer.lec_id);
                        });
                    });
                    setLecturersCount(uniqueLecturers.size.toString());
                }
            } catch (error) {
                console.error("Error fetching lecturers count:", error);
                setLecturersCount("Error");
            }
        };

        fetchLecturersCount();
    }, [licId]);

    // Fetch examiners count
    useEffect(() => {
        const fetchExaminersCount = async () => {
            try {
                if (licId) {
                    const examiners = await exDetailsService.getExaminerDetails(licId);
                    // Calculate total unique examiners
                    const uniqueExaminers = new Set();
                    examiners.forEach(module => {
                        module.examiners.forEach(examiner => {
                            uniqueExaminers.add(examiner.examiner_id);
                        });
                    });
                    setExaminersCount(uniqueExaminers.size.toString());
                }
            } catch (error) {
                console.error("Error fetching examiners count:", error);
                setExaminersCount("Error");
            }
        };

        fetchExaminersCount();
    }, [licId]);

    // Fetch reschedule requests count
    useEffect(() => {
        const fetchRescheduleRequestsCount = async () => {
            try {
                if (licId) {
                    const response = await LicRequestService.getAllRescheduleRequests(licId);
                    const totalRequests = 
                        (response.data.lecturerRequests ? response.data.lecturerRequests.length : 0) +
                        (response.data.examinerRequests ? response.data.examinerRequests.length : 0);
                    setRescheduleRequestsCount(totalRequests.toString());
                }
            } catch (error) {
                console.error("Error fetching reschedule requests count:", error);
                setRescheduleRequestsCount("Error");
            }
        };

        fetchRescheduleRequestsCount();
    }, [licId]);

    // Fetch schedules count
    useEffect(() => {
        const fetchSchedulesCount = async () => {
            try {
                if (licId) {
                    const schedules = await LicViewScheduleService.getSchedulesByLic(licId);
                    setSchedulesCount(schedules.length.toString());
                }
            } catch (error) {
                console.error("Error fetching schedules count:", error);
                setSchedulesCount("Error");
            }
        };

        fetchSchedulesCount();
    }, [licId]);

    const cards = [
        { title: 'Lecturers', value: lecturersCount, icon: <Users className="card-icon" size={24} />, color: '#4b7bec', tab: 'lecturers' },
        { title: 'Examiners', value: examinersCount, icon: <Users className="card-icon" size={24} />, color: '#26de81', tab: 'examiners' },
        { title: 'Requested Reschedules', value: rescheduleRequestsCount, icon: <FileText className="card-icon" size={24} />, color: '#fd9644', tab: 'requested-reschedules' },
        { title: 'Scheduled Presentations', value: schedulesCount, icon: <CheckSquare className="card-icon" size={24} />, color: '#a55eea', tab: 'schedules-view' }
    ];

    // Define the report cards
    const reportCards = [
        { title: 'Generate Schedules Report', description: 'Create a detailed report of all scheduled presentations', icon: <FileOutput className="card-icon" size={24} />, color: '#2980b9', tab: 'schedules-report' },
        { title: 'Lecturers Availability Report', description: 'Generate a report showing lecturer availability', icon: <Calendar className="card-icon" size={24} />, color: '#16a085', tab: 'lecturers-report' },
        { title: 'Examiners Availability Report', description: 'Generate a report showing examiner availability', icon: <ClipboardList className="card-icon" size={24} />, color: '#c0392b', tab: 'examiners-report' }
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

                        {/* Report Generation Cards */}
                        <h2 className="report-section-title">Generate Reports</h2>
                        <div className="report-cards">
                            {reportCards.map((card, index) => (
                                <div className="report-card" key={index} onClick={() => handleCardClick(card.tab)}>
                                    <div className="report-card-header" style={{ backgroundColor: card.color }}>
                                        <div className="report-card-icon">
                                            {card.icon}
                                        </div>
                                    </div>
                                    <div className="report-card-content">
                                        <h3 className="report-card-title">{card.title}</h3>
                                        <p className="report-card-description">{card.description}</p>
                                        <button className="report-card-button" style={{ backgroundColor: card.color }}>
                                            Generate Report
                                        </button>
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
            case "schedules-report":
                return <LicSchedulesReport />;
            case "lecturers-report":
                return <LicLectureAvalabilityReport />;
            case "examiners-report":
                return <LicExaminerAvalabilityReport />;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="dashboard-container">
            {error && <div className="error-message">{error}</div>}
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
