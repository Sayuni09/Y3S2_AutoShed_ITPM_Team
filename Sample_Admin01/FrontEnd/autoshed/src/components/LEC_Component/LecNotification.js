import React, { useState, useEffect, useRef } from 'react';
import '../../styles/LEC_Styles/LecNotification.css';
import { X, Clock, Circle } from 'lucide-react';

const LecNotification = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const dropdownRef = useRef(null);

    // Mock notifications data - replace with actual data fetching
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                title: 'New Module Assignment',
                message: 'You have been assigned to teach a new module.',
                time: '2 hours ago',
                status: 'unread',
                type: 'assignment',
                details: 'You have been assigned to teach Module CS101: Introduction to Computer Science for the upcoming semester. Please review the course materials and confirm your acceptance.'
            },
            {
                id: 2,
                title: 'Examination Schedule Update',
                message: 'Changes have been made to the examination schedule.',
                time: '5 hours ago',
                status: 'unread',
                type: 'schedule',
                details: 'The examination schedule for Module CS202 has been updated. The new date is set for March 25, 2024. Please review and confirm your availability for invigilation duties.'
            },
            {
                id: 3,
                title: 'Department Meeting',
                message: 'Reminder: Monthly department meeting tomorrow.',
                time: '1 day ago',
                status: 'read',
                type: 'meeting',
                details: 'The monthly department meeting is scheduled for tomorrow at 10:00 AM in Room 301. Agenda includes discussion of new curriculum changes and examination procedures.'
            }
        ]);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
                setSelectedNotification(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        // Mark notification as read
        setNotifications(notifications.map(n => 
            n.id === notification.id ? { ...n, status: 'read' } : n
        ));
    };

    const closeDetailView = () => {
        setSelectedNotification(null);
    };

    const getStatusColor = (status) => {
        return status === 'unread' ? '#4b7bec' : '#a0aec0';
    };

    if (!isOpen) return null;

    return (
        <div className="notification-container" ref={dropdownRef}>
            {selectedNotification ? (
                <div className="notification-detail">
                    <div className="notification-detail-header">
                        <h3>{selectedNotification.title}</h3>
                        <button className="close-button" onClick={closeDetailView}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="notification-detail-content">
                        <p>{selectedNotification.details}</p>
                        <div className="notification-detail-footer">
                            <span className="notification-time">
                                <Clock size={14} />
                                {selectedNotification.time}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <button className="close-button" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.status}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <Circle
                                    size={8}
                                    fill={getStatusColor(notification.status)}
                                    stroke="none"
                                    className="status-indicator"
                                />
                                <div className="notification-content">
                                    <h4>{notification.title}</h4>
                                    <p>{notification.message}</p>
                                    <span className="notification-time">
                                        <Clock size={14} />
                                        {notification.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LecNotification;