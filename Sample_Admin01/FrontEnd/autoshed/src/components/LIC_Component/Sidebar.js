import React, { useState, useEffect } from 'react';
import '../../styles/LIC_Styles/Sidebar.css';
import { 
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    User,
    Send,
    Presentation
} from 'lucide-react';

const Sidebar = ({ onNavChange, activeTab }) => {
    const [isSchedulesOpen, setSchedulesOpen] = useState(false);
    const [isUserDetailsOpen, setUserDetailsOpen] = useState(false);
    const [isAvailabilityOpen, setAvailabilityOpen] = useState(false);
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUser({ name: decodedToken.name, email: decodedToken.email });
        }
    }, []);

    const menuItems = [
        { 
            icon: <LayoutDashboard size={20} />, 
            label: 'Dashboard', 
            id: 'dashboard'
        },
        { 
            icon: <Calendar size={20} />, 
            label: 'Schedules', 
            id: 'schedules',
            dropdown: [
                { label: 'Time Slots', id: 'time-slots' },
                // { label: 'New Schedule', id: 'schedules-new' },
                { label: 'View Schedules', id: 'schedules-view' }
            ]
        },
        { 
            icon: <Users size={20} />, 
            label: 'User  Details', 
            id: 'user-details',
            dropdown: [
                { label: 'Lecturers', id: 'lecturers' },
                { label: 'Examiners', id: 'examiners' }
            ]
        },
        { 
            icon: <Send size={20} />, 
            label: 'Availability', 
            id: 'availability',
            dropdown: [
                { label: 'Lecturers', id: 'availability-lecturers' },
                { label: 'Examiners', id: 'availability-examiners' }
            ]
        },
        { 
            icon: <FileText size={20} />, 
            label: 'Requested Reschedules', 
            id: 'requested-reschedules'
        }
    ];

    const toggleDropdown = (type) => {
        if (type === 'schedules') {
            setSchedulesOpen(!isSchedulesOpen);
        } else if (type === 'user-details') {
            setUserDetailsOpen(!isUserDetailsOpen);
        } else if (type === 'availability') {
            setAvailabilityOpen(!isAvailabilityOpen);
        }
    };

    const handleItemClick = (id) => {
        if (onNavChange) {
            onNavChange(id);
        }
    };

    return (
        <div className="sidebar">
            <div className="logo">
                <Presentation size={32} className="logo-icon" />
                <h1>AutoShed</h1>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <div 
                            className={`nav-link ${item.dropdown ? 'has-dropdown' : ''} ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                if (item.dropdown) {
                                    toggleDropdown(item.id);
                                } else {
                                    handleItemClick(item.id);
                                }
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.dropdown && (
                                <span className={`dropdown-arrow ${
                                    (item.id === 'schedules' && isSchedulesOpen) || 
                                    (item.id === 'user-details' && isUserDetailsOpen) || 
                                    (item.id === 'availability' && isAvailabilityOpen) ? 
                                    'open' : ''}`}>▼</span>
                            )}
                        </div>
                        {item.dropdown && (
                            <div className={`dropdown ${
                                (item.id === 'schedules' && isSchedulesOpen) || 
                                (item.id === 'user-details' && isUserDetailsOpen) || 
                                (item.id === 'availability' && isAvailabilityOpen) ? 
                                'open' : ''}`}>
                                {item.dropdown.map((subItem, subIndex) => (
                                    <div 
                                        key={subIndex} 
                                        className={`dropdown-link ${activeTab === subItem.id ? 'active' : ''}`}
                                        onClick={() => handleItemClick(subItem.id)}
                                    >
                                        {subItem.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        <User size={24} />
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.name || 'LIC'}</div>
                        <div className="user-email">{user.email || 'No Email'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;