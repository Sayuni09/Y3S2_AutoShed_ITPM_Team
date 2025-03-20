import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/EX_Styles/Sidebar.css';
import { 
    LayoutDashboard,
    Users,
    FileText,
    DollarSign,
    BarChart2,
    Settings,
    LogOut,
    Presentation
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/lic/dashboard', active: true },
        { icon: <Users size={20} />, label: 'Users', path: '/ex/users' },
        { icon: <FileText size={20} />, label: 'Policies', path: '/ex/policies' },
        { icon: <DollarSign size={20} />, label: 'Claims', path: '/ex/claims' },
        { icon: <BarChart2 size={20} />, label: 'Reports', path: '/ex/reports' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/ex/settings' }
    ];

    return (
        <div className="sidebar">
            <div className="logo">
                <Presentation size={32} className="logo-icon" />
                <h1>AutoShed</h1>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <Link 
                        key={index}
                        to={item.path} 
                        className={`nav-link ${item.active ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button className="logout-button" onClick={onLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;