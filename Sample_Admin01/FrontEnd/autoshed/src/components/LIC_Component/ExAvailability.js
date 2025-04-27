import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, Eye } from 'lucide-react';
import exAvailabilityService from '../../services/LIC_Services/ExAvailabilityService';
import '../../styles/LIC_Styles/ExAvailability.css';

const ExAvailability = () => {
  const [examinerData, setExaminerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [modules, setModules] = useState([]);
  const [selectedExaminer, setSelectedExaminer] = useState(null);
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
    const fetchExaminers = async () => {
      if (!lecturerId) return;
      
      setLoading(true);
      try {
        const data = await exAvailabilityService.getExaminers(lecturerId);
        setExaminerData(data);
        
        // Extract all unique module codes
        const uniqueModules = [...new Set(data.map(module => module.module_code))];
        setModules(uniqueModules);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching examiners:", err);
        setError("Failed to fetch examiner data. Please try again later.");
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchExaminers();
    }
  }, [lecturerId]);

  // Filter modules and examiners based on search and module selection
  const filteredModules = examinerData.filter(module => {
    // If a specific module is selected, only show that module
    if (selectedModule !== 'all' && module.module_code !== selectedModule) {
      return false;
    }
    
    // Check if any examiner in this module matches the search term
    return module.examiners.some(examiner => 
      examiner.examiner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examiner.examiner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewAvailability = (examiner) => {
    setSelectedExaminer(examiner);
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
  const getTotalAvailableDates = (examiner) => {
    return examiner.availability.reduce((total, form) => total + form.slots.length, 0);
  };

  // Get max sessions per day from the first availability form (assuming it's consistent)
  const getMaxSessions = (examiner) => {
    if (examiner.availability.length === 0 || examiner.availability[0].slots.length === 0) {
      return 'N/A';
    }
    return examiner.availability[0].slots[0].max_sessions_per_day;
  };

  if (loading) {
    return <div className="loading">Loading examiner availability data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="availability-container">
      <div className="header">
        <h1>Examiner Availability</h1>
        <div className="filters">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search examiners..."
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
          <div className="no-data">No examiners found matching your criteria.</div>
        ) : (
          filteredModules.map(module => (
            <div key={module.module_code} className="module-section">
              <div className="module-title">
                <h2>{module.module_code}</h2>
              </div>
              <div className="cards-row">
                {module.examiners.filter(examiner => 
                  examiner.examiner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  examiner.examiner_email.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(examiner => (
                  <div key={examiner.examiner_id} className="person-card">
                    <div className="person-info">
                      <h3>{examiner.examiner_name}</h3>
                      <p className="email">{examiner.examiner_email}</p>
                      <div className="availability-summary">
                        <div className="info-row">
                          <Calendar size={16} />
                          <span>Available: {getTotalAvailableDates(examiner)} dates</span>
                        </div>
                        <div className="info-row">
                          <Clock size={16} />
                          <span>Max Sessions: {getMaxSessions(examiner)}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewAvailability(examiner)}
                      disabled={examiner.availability.length === 0}
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

      {isModalOpen && selectedExaminer && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedExaminer.examiner_name}'s Availability</h2>
            
            {selectedExaminer.availability.length === 0 ? (
              <div className="no-availability">No availability information provided.</div>
            ) : (
              selectedExaminer.availability.map((form, formIndex) => (
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

export default ExAvailability;