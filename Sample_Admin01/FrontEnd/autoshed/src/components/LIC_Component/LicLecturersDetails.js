import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, MessageSquare } from 'lucide-react';
import lecDetailsService from '../../services/LIC_Services/LecDetailsService';
import '../../styles/LIC_Styles/LicLecturersDetails.css';

const LicLecturersDetails = () => {
  const [lecturers, setLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecturerId, setLecturerId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setLecturerId(decodedToken.id);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Failed to authenticate. Please login again.");
      }
    } else {
      setError("Not authenticated. Please login.");
    }
  }, []);

  useEffect(() => {
    const fetchLecturerDetails = async () => {
      if (!lecturerId) return;

      setLoading(true);
      try {
        const data = await lecDetailsService.getLecturerDetails(lecturerId);
        setLecturers(data);
        // Extract unique module codes from the data
        const uniqueModules = [...new Set(data.map(item => item.module_code))];
        setModules(uniqueModules);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lecturer details:", err);
        setError("Failed to fetch lecturer data. Please try again later.");
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchLecturerDetails();
    }
  }, [lecturerId]);

  // Function to open email client with better support
const handleEmailClick = (email, lecturerName) => {
  try {
    // Set up email parameters
    const subject = encodeURIComponent(`Query regarding ${selectedModule !== 'all' ? selectedModule : 'module'}`);
    const body = encodeURIComponent(`Dear ${lecturerName},\n\nI would like to inquire about...\n\nRegards,\n[Your Name]`);
    
    // Option 1: Open default mail client
    // window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    
    // Option 2: Open Gmail specifically (recommended)
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
  } catch (error) {
    console.error("Error opening email client:", error);
    alert("Could not open email client. Please try again or send email manually to: " + email);
  }
};


  // Function to open WhatsApp
  const handleWhatsAppClick = (phoneNumber) => {
    // Remove any non-digit characters from phone number
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  // Filter lecturers based on search term and selected module
  const filteredLecturers = lecturers.filter(module => {
    const matchesSearch = module.lecturers.some(lecturer => 
      lecturer.lec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lec_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesModule = selectedModule === 'all' || module.module_code === selectedModule;
    return matchesSearch && matchesModule;
  });

  if (loading) {
    return <div className="loading">Loading lecturers...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="lecturers-container">
      <div className="header">
        <h1>Lecturers Details</h1>
        {/* <button className="add-button">
          <User size={20} />
          Add New Lecturer
        </button> */}
      </div>

      <div className="filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search lecturers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="module-filter">
          <Filter size={20} />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="modules-grid">
        {filteredLecturers.map((moduleData) => (
          <div key={moduleData.module_code} className="module-card">
            <h2 className="module-title">{moduleData.module_code}</h2>
            <div className="lecturers-list">
              {moduleData.lecturers.map(lecturer => (
                <div key={lecturer.lec_id} className="lecturer-card">
                  <div className="lecturer-info">
                    <h3>{lecturer.lec_name}</h3>
                    <p>{lecturer.lec_email}</p>
                    <p>{lecturer.phone_number}</p>
                    <div className="contact-actions">
                      <button 
                        className="contact-button email-button"
                        onClick={() => handleEmailClick(lecturer.lec_email)}
                        title={`Send email to ${lecturer.lec_name}`}
                      >
                        <Mail size={18} />
                        <span>Email</span>
                      </button>
                      <button 
                        className="contact-button whatsapp-button"
                        onClick={() => handleWhatsAppClick(lecturer.phone_number)}
                        title={`Message ${lecturer.lec_name} on WhatsApp`}
                      >
                        <MessageSquare size={18} />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                  <div className="lecturer-modules">
                    <span className="module-tag">{moduleData.module_code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LicLecturersDetails;