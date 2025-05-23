
import React, { useState, useEffect } from 'react';

import '../../styles/EX_Styles/Navbar.css';
import { IconButton, Tooltip, Menu, MenuItem, Avatar } from '@mui/material';
import { 
    // Search,
    // Mail,
    // Bell,
    // Settings,
    LogOut,
    // User,
    Menu as MenuIcon
} from 'lucide-react';
// import ExNotification from './ExNotification';
// import ExEmail from './ExEmail';

const Navbar = ({ onLogout }) => {
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState({ name: '', email: '' });
    // const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    // const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUser({ name: decodedToken.name, email: decodedToken.email });
        }
    }, []);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        if (onLogout) onLogout();
    };

  

    // const toggleNotifications = () => {
    //     setIsNotificationOpen(!isNotificationOpen);
    //     setIsEmailOpen(false);
    // };

    // const toggleEmails = () => {
    //     setIsEmailOpen(!isEmailOpen);
    //     setIsNotificationOpen(false);
    // };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-start">
                <IconButton 
                    className="mobile-menu-button"
                    onClick={toggleMobileMenu}
                >
                    <MenuIcon size={24} />
                </IconButton>
                <h2>Examiner Dashboard</h2>
            </div>
            <div className={`navbar-end ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                {/* <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search..." className="search-input" />
                </div>
                <div className="navbar-actions">
                    <Tooltip title="Messages">
                        <IconButton 
                            className="navbar-icon-button"
                            onClick={toggleEmails}
                        >
                            <Mail size={20} />
                            <span className="notification-badge"></span>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Notifications">
                        <IconButton 
                            className="navbar-icon-button"
                            onClick={toggleNotifications}
                        >
                            <Bell size={20} />
                            <span className="notification-badge"></span>
                        </IconButton>
                    </Tooltip>
                    <ExNotification 
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                    />
                    <ExEmail 
                        isOpen={isEmailOpen}
                        onClose={() => setIsEmailOpen(false)}
                        userEmail={user.email}
                    />
                </div> */}
                <div className="profile-section">
                    {/* <div className="profile-info">
                        <div className="profile-name">{user.name || 'Examiner'}</div>
                        <div className="profile-role">{user.email || 'No Email'}</div>
                    </div> */}
                    <Tooltip title="Profile">
                        <IconButton onClick={handleProfileMenuOpen}>
                            <Avatar 
                                sx={{ 
                                    width: 40, 
                                    height: 40,
                                    bgcolor: '#4b7bec'
                                }}
                            >
                                {user.name ? user.name.charAt(0) : 'E'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            mt: 1.5,
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                            borderRadius: '12px',
                            minWidth: '200px',
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    {/* <MenuItem onClick={handleProfileClick} className="menu-item">
                        <User size={18} />
                        <span>My Profile</span>
                    </MenuItem>
                    <MenuItem onClick={handleProfileMenuClose} className="menu-item">
                        <Settings size={18} />
                        <span>Settings</span>
                    </MenuItem> */}
                    <MenuItem onClick={handleLogout} className="menu-item logout">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </MenuItem>
                </Menu>
            </div>
        </nav>
    );
};

export default Navbar;
