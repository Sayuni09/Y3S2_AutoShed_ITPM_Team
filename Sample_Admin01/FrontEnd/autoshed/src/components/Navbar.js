import React, { useState } from "react";
import "../styles/Navbar.css"; 

const Navbar = ({ activeTab, onNavChange, onLogout }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleDropdown = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: "📊",
    },
    { 
      id: "admins", 
      label: "Admin Management", 
      icon: "👥",
      subItems: [
        { id: "admins-list", label: "View Admin" },
        { id: "admins-add", label: "Add Admin" },
      ]
    },
    { 
      id: "lecturers", 
      label: "Lecturer Management", 
      icon: "👨‍🏫",
      subItems: [
        { id: "lecturers-add", label: "Add Lecturer" },
      ]
    },
    { 
      id: "lic", 
      label: "Lecturer in Charge Management", 
      icon: "👨‍🏫",
      subItems: [
        { id: "lic-add", label: "Add Lecturer in Charge" },
      ]
    },
    { 
      id: "examiner", 
      label: "Examiner Management", 
      icon: "👨‍🏫",
      subItems: [
        { id: "examiner-add", label: "Add Examiner" },
      ]
    },
  
    { 
      id: "available-slots", 
      label: "Timeslot Management", 
      icon: "⏱️",
      subItems: [
        { id: "timeslot-list", label: "View Available Slots" },
        { id: "timeslot-add", label: "Add Available Slots" }
      ]
    }
  ];

  const handleNavItemClick = (id, subItemId) => {
    if (subItemId) {
      onNavChange(subItemId);
    } else {
      onNavChange(id);
      if (!navItems.find(item => item.id === id)?.subItems) {
        const newExpandedItems = {};
        Object.keys(expandedItems).forEach(key => {
          if (key !== id) newExpandedItems[key] = false;
        });
        setExpandedItems(newExpandedItems);
      }
    }
  };

  return (
    <nav className="admin-sidebar">
      <div className="logo">
        <h2>AutoShed</h2>
      </div>
      
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.id} className={`nav-item ${activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab)) ? "active" : ""}`}>
            <div 
              className={`nav-link ${activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab)) ? "active" : ""}`}
              onClick={() => {
                if (item.subItems) {
                  toggleDropdown(item.id);
                } else {
                  handleNavItemClick(item.id);
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.subItems && (
                <span className={`dropdown-arrow ${expandedItems[item.id] ? "expanded" : ""}`}>
                  ▼
                </span>
              )}
            </div>
            {item.subItems && (
              <ul className={`submenu ${expandedItems[item.id] ? "expanded" : ""}`}>
                {item.subItems.map((subItem) => (
                  <li 
                    key={subItem.id} 
                    className={`submenu-item ${activeTab === subItem.id ? "active" : ""}`}
                    onClick={() => handleNavItemClick(item.id, subItem.id)}
                  >
                    <span className="submenu-dot">•</span>
                    {subItem.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      
      <div className="user-section">
        <div className="user-profile">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <h4>Admin</h4>
            <p>Administrator</p>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;