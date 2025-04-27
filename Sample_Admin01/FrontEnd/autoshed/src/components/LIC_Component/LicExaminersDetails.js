import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, MessageSquare } from 'lucide-react';
import exDetailsService from '../../services/LIC_Services/ExDetailsService';
import '../../styles/LIC_Styles/LicExaminersDetails.css';

const LicExaminersDetails = () => {
  const [examiners, setExaminers] = useState([]);
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
    const fetchExaminerDetails = async () => {
      if (!lecturerId) return;

      setLoading(true);
      try {
        const data = await exDetailsService.getExaminerDetails(lecturerId);
        setExaminers(data);
        // Extract unique module codes from the data
        const uniqueModules = [...new Set(data.map(item => item.module_code))];
        setModules(uniqueModules);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching examiner details:", err);
        setError("Failed to fetch examiner data. Please try again later.");
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchExaminerDetails();
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

  const filteredExaminers = examiners.filter(module => {
    const matchesSearch = module.examiners.some(examiner => 
      examiner.examiner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examiner.examiner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesModule = selectedModule === 'all' || module.module_code === selectedModule;
    return matchesSearch && matchesModule;
  });

  if (loading) {
    return <div className="loading">Loading examiners...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="examiner-details-container">
      <div className="examiner-header">
        <h1>Examiners Details</h1>
        {/* <button className="examiner-add-button">
          <User size={20} />
          Add New Examiner
        </button> */}
      </div>

      <div className="examiner-filters">
        <div className="examiner-search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search examiners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="examiner-module-filter">
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

      <div className="examiner-modules-grid">
        {filteredExaminers.map((moduleData) => (
          <div key={moduleData.module_code} className="examiner-module-card">
            <h2 className="examiner-module-title">{moduleData.module_code}</h2>
            <div className="examiner-list">
              {moduleData.examiners.map(examiner => (
                <div key={examiner.examiner_id} className="examiner-item-card">
                  <div className="examiner-item-info">
                    <h3>{examiner.examiner_name}</h3>
                    <p>{examiner.examiner_email}</p>
                    <p>{examiner.phone_number}</p>
                    <div className="examiner-contact-actions">
                      <button 
                        className="examiner-contact-button examiner-email-button"
                        onClick={() => handleEmailClick(examiner.examiner_email)}
                        title={`Send email to ${examiner.examiner_name}`}
                      >
                        <Mail size={18} />
                        <span>Email</span>
                      </button>
                      <button 
                        className="examiner-contact-button examiner-whatsapp-button"
                        onClick={() => handleWhatsAppClick(examiner.phone_number)}
                        title={`Message ${examiner.examiner_name} on WhatsApp`}
                      >
                        <MessageSquare size={18} />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                  <div className="examiner-item-modules">
                    <span className="examiner-module-tag">{moduleData.module_code}</span>
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

export default LicExaminersDetails;