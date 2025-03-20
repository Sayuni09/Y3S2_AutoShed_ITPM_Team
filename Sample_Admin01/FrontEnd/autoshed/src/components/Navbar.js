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
        // { id: "admins-list", label: "Admin List" },
        { id: "admins-add", label: "Add Admin" },
        // { id: "admins-roles", label: "Role Management" }
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
  
    
  ];

  const handleNavItemClick = (id, subItemId) => {
    if (subItemId) {
      // Handle sub-item click
      onNavChange(subItemId);
    } else {
      // Handle main item click
      onNavChange(id);
      
      // For main items without dropdown, we may want to collapse others
      if (!navItems.find(item => item.id === id).subItems) {
        // Collapse all other dropdowns
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
          <li key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`}>
            <div 
              className={`nav-link ${activeTab === item.id ? "active" : ""}`}
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