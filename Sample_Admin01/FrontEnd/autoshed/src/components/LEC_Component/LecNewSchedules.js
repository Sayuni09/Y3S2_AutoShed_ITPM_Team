import React, { useState, useEffect } from "react";
import {
    Search,
    Calendar,
    Clock,
    Users,
    MapPin,
    CheckCircle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import LecRequestComment from "./LecRequestComment";
import "../../styles/LEC_Styles/LecNewSchedules.css";
import LecNewScheduleService from "../../services/LEC_Services/LecNewScheduleService";
import { acceptSchedule } from '../../services/LEC_Services/LecAcceptedServices';
//import LecRequestService from "../../services/LEC_Services/LecRequestService";

const LecNewSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedScheduleForReschedule, setSelectedScheduleForReschedule] = useState(null);
    const [lecturerId, setLecturerId] = useState("");
    const [error, setError] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);
    const [noSchedulesMessage, setNoSchedulesMessage] = useState("");

    // Extract lecturer ID from JWT token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                setLecturerId(decodedToken.id);
            } catch (err) {
                console.error("Error decoding token:", err);
                setError("Authentication error. Please login again.");
            }
        } else {
            setError("Not authenticated. Please login.");
        }
    }, []);

    // Fetch schedules when lecturer ID is available
    useEffect(() => {
        const fetchSchedules = async () => {
            if (lecturerId) {
                try {
                    const data = await LecNewScheduleService.getLecturerSchedules(lecturerId);
                    // Group schedules by module
                    const grouped = data.reduce((acc, schedule) => {
                        const key = schedule.module_code;
                        if (!acc[key]) {
                            acc[key] = {
                                module_code: schedule.module_code,
                                module_name: schedule.module_name || schedule.module_code,
                                schedules: [], // Store complete schedule objects
                            };
                        }
                        // Add the complete schedule object
                        acc[key].schedules.push(schedule);
                        return acc;
                    }, {});
                    setSchedules(Object.values(grouped));
                    setNoSchedulesMessage("");
                } catch (error) {
                    console.error("Failed to fetch schedules:", error);
                    
                    // Check if it's a 404 error which means no schedules found
                    if (error.response && error.response.status === 404) {
                        setNoSchedulesMessage(error.response.data.message || "No new schedules found for your review. Schedules you've already accepted or requested to reschedule won't appear here.");
                        setSchedules([]);
                    } else {
                        setError("Failed to load schedules. Please try again later.");
                    }
                }
            }
        };

        fetchSchedules();
    }, [lecturerId]);

    // Search functionality
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Toggle module expansion
    const toggleModule = (moduleCode) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleCode]: !prev[moduleCode],
        }));
    };

    // View schedule details
    const handleViewSchedule = (schedule, moduleInfo) => {
        // Combine schedule with module info for complete context
        setSelectedSchedule({
            ...schedule,
            module_code: moduleInfo.module_code,
            module_name: moduleInfo.module_name
        });
        setIsModalOpen(true);
    };

    // Accept schedule
    const handleAcceptSchedule = async (scheduleId) => {
        if (isAccepting) return; // Prevent multiple clicks

        setIsAccepting(true);
        try {
            await acceptSchedule(scheduleId, lecturerId);
            
            // Update the local state to reflect the accepted schedule
            setSchedules(prev => {
                const newSchedules = [...prev];
                for (let i = 0; i < newSchedules.length; i++) {
                    const moduleIndex = newSchedules[i];
                    const scheduleIndex = moduleIndex.schedules.findIndex(s => s.schedule_id === scheduleId);
                    
                    if (scheduleIndex !== -1) {
                        // Remove the schedule from the array
                        moduleIndex.schedules.splice(scheduleIndex, 1);
                        
                        // If there are no more schedules in this module, remove the module
                        if (moduleIndex.schedules.length === 0) {
                            newSchedules.splice(i, 1);
                        }
                        break;
                    }
                }
                return newSchedules;
            });
            
            setIsModalOpen(false);
            
            // Show success notification (optional)
            alert("Schedule successfully accepted!");
        } catch (err) {
            setError(err.message);
            alert("Failed to accept schedule. Please try again.");
        } finally {
            setIsAccepting(false);
        }
    };

    // Request reschedule
    const handleRequestReschedule = (schedule) => {
        setSelectedScheduleForReschedule(schedule);
        setShowRescheduleModal(true);
        setIsModalOpen(false);
    };

    // Submit reschedule request
    const handleRescheduleSubmit = async (response) => {
        try {
            // Update the local state to remove the schedule
            setSchedules(prev => {
                const newSchedules = [...prev];
                for (let i = 0; i < newSchedules.length; i++) {
                    const moduleIndex = newSchedules[i];
                    const scheduleIndex = moduleIndex.schedules.findIndex(
                        s => s.schedule_id === selectedScheduleForReschedule.schedule_id
                    );
                    
                    if (scheduleIndex !== -1) {
                        // Remove the schedule from the array
                        moduleIndex.schedules.splice(scheduleIndex, 1);
                        
                        // If there are no more schedules in this module, remove the module
                        if (moduleIndex.schedules.length === 0) {
                            newSchedules.splice(i, 1);
                        }
                        break;
                    }
                }
                return newSchedules;
            });
            
            // Show success notification
            alert("Reschedule request submitted successfully!");
        } catch (err) {
            console.error("Error handling reschedule submission:", err);
            alert("Failed to process reschedule request. Please try again.");
        } finally {
            setShowRescheduleModal(false);
            setSelectedScheduleForReschedule(null);
        }
    };

    // Filter modules by search term
    const filteredModules = schedules.filter(
        (module) =>
            module.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.module_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Display error message if there is one
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="new-schedules-container">
            <div className="header">
                <h2>New Lecture Schedules</h2>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by module code or name..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {schedules.length === 0 ? (
                <div className="no-schedules">
                    <p className="no-schedules-main">{noSchedulesMessage || "No new schedules pending your review"}</p>
                    <p className="no-schedules-sub">Schedules you've already accepted or requested to reschedule won't appear here.</p>
                </div>
            ) : (
                <div className="modules-list">
                    {filteredModules.map((module) => (
                        <div key={module.module_code} className="module-card">
                            <div className="module-header" onClick={() => toggleModule(module.module_code)}>
                                <div className="module-info">
                                    <h3>{module.module_code}</h3>
                                    <span className="module-name">{module.module_name}</span>
                                </div>
                                <div className="module-meta">
                                    <span className="schedule-count">{module.schedules.length} schedule(s)</span>
                                    {expandedModules[module.module_code] ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </div>
                            </div>

                            {expandedModules[module.module_code] && (
                                <div className="schedules-list">
                                    {module.schedules.map((schedule) => (
                                        <div key={schedule.schedule_id} className="schedule-card">
                                            <div className="schedule-info" onClick={() => handleViewSchedule(schedule, module)}>
                                                <div className="schedule-primary">
                                                    <div className="info-item">
                                                        <Calendar size={16} />
                                                        <span>{formatDate(schedule.date)}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <Clock size={16} />
                                                        <span>
                                                            {schedule.start_time} - {schedule.end_time}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="schedule-secondary">
                                                    <div className="info-item">
                                                        <MapPin size={16} />
                                                        <span>{schedule.venue_name}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <Users size={16} />
                                                        <span>Type: {schedule.viva_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && selectedSchedule && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Schedule Details</h2>
                        
                        <div className="modal-section">
                            <h3>Module</h3>
                            <div className="detail-row">
                                <strong>{selectedSchedule.module_code}</strong>
                                <span>{selectedSchedule.module_name}</span>
                            </div>
                        </div>
                        
                        <div className="modal-section">
                            <h3>Date & Time</h3>
                            <div className="detail-row">
                                <Calendar size={20} />
                                <span>{formatDate(selectedSchedule.date)}</span>
                            </div>
                            <div className="detail-row">
                                <Clock size={20} />
                                <span>{selectedSchedule.start_time} - {selectedSchedule.end_time}</span>
                            </div>
                        </div>

                        <div className="modal-section">
                            <h3>Venue & Type</h3>
                            <div className="detail-row">
                                <MapPin size={20} />
                                <span>{selectedSchedule.venue_name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Type:</strong> {selectedSchedule.viva_type}
                            </div>
                        </div>

                        <div className="modal-section">
                            <h3>Batch Groups</h3>
                            {selectedSchedule.batch_groups && selectedSchedule.batch_groups.map((group) => (
                                <div key={group.group_id} className="batch-group-card">
                                    <h4>{group.batch_group_name}</h4>
                                    <div className="detail-row">
                                        <Clock size={16} />
                                        <span>{group.start_time} - {group.end_time}</span>
                                    </div>
                                    <div className="detail-row">
                                        <strong>Duration:</strong> {group.duration}
                                    </div>
                                    
                                    {group.sub_groups && group.sub_groups.length > 0 && (
                                        <div className="sub-section">
                                            <h5>Sub Groups</h5>
                                            <ul>
                                                {group.sub_groups.map((subGroup) => (
                                                    <li key={subGroup.id}>{subGroup.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {group.lecturers && group.lecturers.length > 0 && (
                                        <div className="sub-section">
                                            <h5>Assigned Lecturers</h5>
                                            <ul>
                                                {group.lecturers.map((lecturer) => (
                                                    <li key={lecturer.id}>{lecturer.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {group.examiners && group.examiners.length > 0 && (
                                        <div className="sub-section">
                                            <h5>Assigned Examiners</h5>
                                            <ul>
                                                {group.examiners.map((examiner) => (
                                                    <li key={examiner.id}>{examiner.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="accept-btn"
                                onClick={() => handleAcceptSchedule(selectedSchedule.schedule_id)}
                                disabled={isAccepting}
                            >
                                <CheckCircle size={20} />
                                {isAccepting ? "Accepting..." : "Accept Schedule"}
                            </button>
                            <button 
                                className="reschedule-btn"
                                onClick={() => handleRequestReschedule(selectedSchedule)}
                                disabled={isAccepting}
                            >
                                <RefreshCw size={20} />
                                Request Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRescheduleModal && selectedScheduleForReschedule && (
                <LecRequestComment
                    schedule={selectedScheduleForReschedule}
                    onClose={() => setShowRescheduleModal(false)}
                    onSubmit={handleRescheduleSubmit}
                    lecturerId={lecturerId}
                />
            )}
        </div>
    );
};

export default LecNewSchedules;