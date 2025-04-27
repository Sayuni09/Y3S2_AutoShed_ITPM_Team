import React, { useEffect, useState } from 'react';
import { Search, Calendar, Clock, Users, MapPin, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { fetchAcceptedSchedules } from '../../services/EX_Services/ExAcceptedService';
import '../../styles/EX_Styles/ExAcceptedSchedules.css';

const ExAcceptedSchedules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedSchedules, setGroupedSchedules] = useState([]);
  const [examinerId, setExaminerId] = useState("");

  // Extract examiner ID from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setExaminerId(decodedToken.id);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Authentication error. Please login again.");
      }
    } else {
      setError("Not authenticated. Please login.");
    }
  }, []);

  // Fetch accepted schedules whenever component mounts or examiner ID changes
  useEffect(() => {
    const getAcceptedSchedules = async () => {
      if (examinerId) {
        try {
          setLoading(true);
          const data = await fetchAcceptedSchedules(examinerId);
          
          // Log the raw data to see what's coming from the API
          console.log("Raw schedule data:", data);
          
          // Group schedules by module code
          const grouped = data.reduce((acc, schedule) => {
            const key = schedule.module_code;
            if (!acc[key]) {
              acc[key] = {
                module_code: schedule.module_code,
                module_name: schedule.module_name || schedule.module_code,
                schedules: []
              };
            }
            acc[key].schedules.push(schedule);
            return acc;
          }, {});
          
          setGroupedSchedules(Object.values(grouped));
          setError(null);
        } catch (err) {
          console.error("Error fetching accepted schedules:", err);
          setError(err.message || "Failed to load accepted schedules");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Examiner ID is required to fetch schedules");
      }
    };

    getAcceptedSchedules();
  }, [examinerId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleModule = (moduleCode) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleCode]: !prev[moduleCode]
    }));
  };

  const handleViewSchedule = (schedule, moduleInfo) => {
    console.log("Selected schedule:", schedule); // Log for debugging
    
    // Ensure we're capturing all data
    setSelectedSchedule({
      ...schedule,
      module_code: moduleInfo.module_code,
      module_name: moduleInfo.module_name
    });
    setIsModalOpen(true);
  };

  // const handleRequestReschedule = (scheduleId) => {
  //   console.log('Reschedule requested:', scheduleId);
  //   setIsModalOpen(false);
  //   // Implement reschedule request logic here
  // };

  // Filter schedules based on search term
  const filteredModules = groupedSchedules.filter(module =>
    module.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.module_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading-container">Loading accepted schedules...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="accepted-schedules-container">
      <div className="header">
        <div className="header-content">
          <h2>Accepted Presentation Schedules</h2>
        </div>
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by module code or name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {filteredModules.length === 0 ? (
        <div className="no-schedules">No accepted schedules found</div>
      ) : (
        <div className="modules-list">
          {filteredModules.map(module => (
            <div key={module.module_code} className="module-card">
              <div 
                className="module-header"
                onClick={() => toggleModule(module.module_code)}
              >
                <div className="module-info">
                  <h3>{module.module_code}</h3>
                  <span className="module-name">{module.module_name}</span>
                </div>
                <div className="module-meta">
                  <span className="schedule-count">
                    {module.schedules.length} schedule(s)
                  </span>
                  {expandedModules[module.module_code] ? 
                    <ChevronUp size={20} /> : 
                    <ChevronDown size={20} />
                  }
                </div>
              </div>
              {expandedModules[module.module_code] && (
                <div className="schedules-list">
                  {module.schedules.map(schedule => (
                    <div 
                      key={schedule.schedule_id} 
                      className="schedule-card"
                    >
                      <div className="schedule-info" onClick={() => handleViewSchedule(schedule, module)}>
                        <div className="schedule-primary">
                          <div className="info-item">
                            <Calendar size={16} />
                            <span>{formatDate(schedule.date)}</span>
                          </div>
                          <div className="info-item">
                            <Clock size={16} />
                            <span>{schedule.start_time} - {schedule.end_time}</span>
                          </div>
                        </div>
                        <div className="schedule-secondary">
                          <div className="info-item">
                            <MapPin size={16} />
                            <span>{schedule.venue_name}</span>
                          </div>
                          <div className="info-item">
                            <Users size={16} />
                            <span>Type: {schedule.viva_type}</span>
                          </div>
                        </div>
                        <div className="status-indicator">
                          <CheckCircle size={16} className="accepted-icon" />
                          <span>Accepted</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedSchedule && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Details</h2>
              <div className="status-badge">
                <CheckCircle size={16} />
                <span>Accepted</span>
              </div>
            </div>
            
            <div className="modal-section">
              <h3>Module</h3>
              <div className="detail-row">
                <strong>{selectedSchedule.module_code}</strong>
                <span>{selectedSchedule.module_name}</span>
              </div>
            </div>
            
            <div className="modal-section">
              <h3>Date & Time</h3>
              <div className="detail-row">
                <Calendar size={20} />
                <span>{formatDate(selectedSchedule.date)}</span>
              </div>
              <div className="detail-row">
                <Clock size={20} />
                <span>{selectedSchedule.start_time} - {selectedSchedule.end_time}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Venue & Type</h3>
              <div className="detail-row">
                <MapPin size={20} />
                <span>{selectedSchedule.venue_name}</span>
              </div>
              <div className="detail-row">
                <strong>Type:</strong> {selectedSchedule.viva_type}
              </div>
            </div>

            <div className="modal-section">
              <h3>Batch Groups</h3>
              {selectedSchedule.batchGroups && selectedSchedule.batchGroups.length > 0 ? (
                selectedSchedule.batchGroups.map((group, index) => (
                  <div key={group.group_id || index} className="batch-group-card">
                    <h4>{group.batch_group || `Group ${index + 1}`}</h4>
                    {group.group_start_time && group.group_end_time && (
                      <div className="detail-row">
                        <Clock size={16} />
                        <span>{group.group_start_time} - {group.group_end_time}</span>
                      </div>
                    )}
                    
                    {group.SubGroups && group.SubGroups.length > 0 && (
                      <div className="sub-section">
                        <h5>Sub Groups</h5>
                        <ul>
                          {group.SubGroups.map((subGroup, idx) => (
                            <li key={subGroup.id || `sub-${idx}`}>{subGroup.sub_group || `Sub Group ${idx + 1}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {group.assigned_lecturers && group.assigned_lecturers.length > 0 && (
                      <div className="sub-section">
                        <h5>Assigned Lecturers</h5>
                        <ul>
                          {group.assigned_lecturers.map((lecturer, idx) => (
                            <li key={lecturer.lec_id || `lec-${idx}`}>{lecturer.lec_name || `Lecturer ${idx + 1}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {group.assigned_examiners && group.assigned_examiners.length > 0 && (
                      <div className="sub-section">
                        <h5>Assigned Examiners</h5>
                        <ul>
                          {group.assigned_examiners.map((examiner, idx) => (
                            <li key={examiner.examiner_id || `ex-${idx}`}>{examiner.examiner_name || `Examiner ${idx + 1}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="detail-row">
                  <span>No batch group details available</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {/* <button 
                className="reschedule-btn"
                onClick={() => handleRequestReschedule(selectedSchedule.schedule_id)}
              >
                <RefreshCw size={20} />
                Request Reschedule
              </button> */}
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExAcceptedSchedules;