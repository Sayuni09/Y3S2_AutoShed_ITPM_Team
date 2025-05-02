import React, { useState, useEffect } from 'react';
import '../../styles/LEC_Styles/Sidebar.css';
import { 
    LayoutDashboard,
    FileText,
    Calendar,
    Send,
    Presentation,
    User
} from 'lucide-react';

const Sidebar = ({ onLogout, onNavChange, activeTab }) => {
    const [isSchedulesOpen, setSchedulesOpen] = useState(false);
    const [isAvailabilityOpen, setAvailabilityOpen] = useState(false);
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUser({ name: decodedToken.name, email: decodedToken.email });
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'schedules-new' || activeTab === 'schedules-confirmed') {
            setSchedulesOpen(true);
        }
        if (activeTab === 'availability-new' || activeTab === 'availability-sent') {
            setAvailabilityOpen(true);
        }
    }, [activeTab]);

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
                { label: 'New', id: 'schedules-new' },
                { label: 'Accepted', id: 'schedules-accepted' },
                { label: 'Confirmed', id: 'schedules-confirmed' }
            ]
        },
        { 
            icon: <FileText size={20} />, 
            label: 'Requested Reschedules', 
            id: 'reschedules'
        },
        { 
            icon: <Send size={20} />, 
            label: 'Availability', 
            id: 'availability',
            dropdown: [
                { label: 'New Forms', id: 'availability-new' },
                { label: 'Sent', id: 'availability-sent' }
            ]
        }
    ];

    const toggleDropdown = (type) => {
        if (type === 'schedules') {
            setSchedulesOpen(!isSchedulesOpen);
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
                                    (item.id === 'availability' && isAvailabilityOpen) ? 
                                    'open' : ''}`}>▼</span>
                            )}
                        </div>
                        {item.dropdown && (
                            <div className={`dropdown ${
                                (item.id === 'schedules' && isSchedulesOpen) || 
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
                        <div className="user-name">{user.name || 'Lecturer'}</div>
                        <div className="user-email">{user.email || 'No Email'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;