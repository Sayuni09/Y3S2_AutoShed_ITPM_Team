import React, { useState, useEffect, useRef } from 'react';
import '../../styles/EX_Styles/ExNotification.css';
import { X, Clock, Circle } from 'lucide-react';

const ExNotification = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const dropdownRef = useRef(null);

    // Mock notifications data - replace with actual data fetching
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                title: 'New Schedule Request',
                message: 'You have received a new schedule request for Module A examination.',
                time: '2 hours ago',
                status: 'unread',
                type: 'schedule',
                details: 'The examination department has requested your availability for Module A examination scheduled for next week. Please review the details and confirm your availability at your earliest convenience.'
            },
            {
                id: 2,
                title: 'Rescheduling Notice',
                message: 'A student has requested to reschedule their examination.',
                time: '5 hours ago',
                status: 'unread',
                type: 'reschedule',
                details: 'Student ID: ST123 has requested to reschedule their Module B examination due to medical emergency. Original date: March 15, 2024. Please review the request and take necessary action.'
            },
            {
                id: 3,
                title: 'Examination Confirmed',
                message: 'Module C examination has been confirmed.',
                time: '1 day ago',
                status: 'read',
                type: 'confirmation',
                details: 'The Module C examination has been confirmed for March 20, 2024. Location: Room 301, Building A. Time: 10:00 AM - 1:00 PM. Please ensure to arrive 30 minutes before the scheduled time.'
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

export default ExNotification;