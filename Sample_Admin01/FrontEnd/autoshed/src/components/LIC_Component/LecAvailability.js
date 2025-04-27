import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, Eye } from 'lucide-react';
import lecAvailabilityService from '../../services/LIC_Services/LecAvailabilityService';
import '../../styles/LIC_Styles/LecExAvailability.css';

const LecAvailability = () => {
  const [moduleData, setModuleData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [modules, setModules] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lecturerId, setLecturerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchLecturers = async () => {
      if (!lecturerId) return;
      
      setLoading(true);
      try {
        const data = await lecAvailabilityService.getLecturers(lecturerId);
        setModuleData(data);
        
        // Extract all unique module codes
        const uniqueModules = [...new Set(data.map(module => module.module_code))];
        setModules(uniqueModules);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lecturers:", err);
        setError("Failed to fetch lecturer data. Please try again later.");
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchLecturers();
    }
  }, [lecturerId]);

  // Filter modules and lecturers based on search and module selection
  const filteredModules = moduleData.filter(module => {
    // If a specific module is selected, only show that module
    if (selectedModule !== 'all' && module.module_code !== selectedModule) {
      return false;
    }
    
    // Check if any lecturer in this module matches the search term
    return module.lecturers.some(lecturer => 
      lecturer.lec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lec_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewAvailability = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsModalOpen(true);
  };

  const getSlotLabel = (slot) => {
    switch(slot) {
      case 'morning_slot': return '9:00 AM - 11:00 AM';
      case 'mid_day_slot': return '11:00 AM - 1:00 PM';
      case 'afternoon_slot': return '2:00 PM - 4:00 PM';
      default: return '';
    }
  };

  // Get total number of available dates from all availability forms
  const getTotalAvailableDates = (lecturer) => {
    return lecturer.availability.reduce((total, form) => total + form.slots.length, 0);
  };

  // Get max sessions per day from the first availability form (assuming it's consistent)
  const getMaxSessions = (lecturer) => {
    if (lecturer.availability.length === 0 || lecturer.availability[0].slots.length === 0) {
      return 'N/A';
    }
    return lecturer.availability[0].slots[0].max_sessions_per_day;
  };

  if (loading) {
    return <div className="loading">Loading lecturer availability data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="availability-container">
      <div className="header">
        <h1>Lecturer Availability</h1>
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
      </div>

      <div className="modules-container">
        {filteredModules.length === 0 ? (
          <div className="no-data">No lecturers found matching your criteria.</div>
        ) : (
          filteredModules.map(module => (
            <div key={module.module_code} className="module-section">
              <div className="module-title">
                <h2>{module.module_code}</h2>
              </div>
              <div className="cards-row">
                {module.lecturers.filter(lecturer => 
                  lecturer.lec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  lecturer.lec_email.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(lecturer => (
                  <div key={lecturer.lec_id} className="person-card">
                    <div className="person-info">
                      <h3>{lecturer.lec_name}</h3>
                      <p className="email">{lecturer.lec_email}</p>
                      <div className="availability-summary">
                        <div className="info-row">
                          <Calendar size={16} />
                          <span>Available: {getTotalAvailableDates(lecturer)} dates</span>
                        </div>
                        <div className="info-row">
                          <Clock size={16} />
                          <span>Max Sessions: {getMaxSessions(lecturer)}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewAvailability(lecturer)}
                      disabled={lecturer.availability.length === 0}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && selectedLecturer && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedLecturer.lec_name}'s Availability</h2>
            
            {selectedLecturer.availability.length === 0 ? (
              <div className="no-availability">No availability information provided.</div>
            ) : (
              selectedLecturer.availability.map((form, formIndex) => (
                <div key={form.form_id} className="availability-form">
                  <h3>Availability Form {formIndex + 1}</h3>
                  <p className="form-date">Submitted: {new Date(form.created_at).toLocaleDateString()}</p>
                  
                  <div className="modal-section">
                    <h4>Available Dates</h4>
                    {form.slots.map((slot, slotIndex) => (
                      <div key={slot.slot_id} className="date-slot">
                        <p className="date">{formatDate(slot.available_date)}</p>
                        <div className="time-slots">
                          {slot.morning_slot && (
                            <span className="available-slot">
                              {getSlotLabel('morning_slot')}
                            </span>
                          )}
                          {slot.mid_day_slot && (
                            <span className="available-slot">
                              {getSlotLabel('mid_day_slot')}
                            </span>
                          )}
                          {slot.afternoon_slot && (
                            <span className="available-slot">
                              {getSlotLabel('afternoon_slot')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="modal-section">
                    <h4>Additional Information</h4>
                    <p>Maximum Sessions per Day: {form.slots[0]?.max_sessions_per_day || 'N/A'}</p>
                    <p>Comments: {form.comments || 'No comments provided'}</p>
                  </div>
                </div>
              ))
            )}

            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecAvailability;