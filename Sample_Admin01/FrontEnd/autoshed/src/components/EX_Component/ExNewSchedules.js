import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Users, MapPin, CheckCircle, RefreshCw, ChevronDown, ChevronUp} from 'lucide-react';
import ExRequestComment from './ExRequestComment';
import ExNewScheduleService from '../../services/EX_Services/ExNewScheduleService';
import { acceptSchedule } from '../../services/EX_Services/ExAcceptedService';
import '../../styles/EX_Styles/ExNewSchedules.css';

const ExNewSchedules = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedScheduleForReschedule, setSelectedScheduleForReschedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examinerId, setExaminerId] = useState(null);

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
        setLoading(false);
      }
    } else {
      setError("Not authenticated. Please login.");
      setLoading(false);
    }
  }, []);

  // Fetch schedules when component mounts or examiner ID changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!examinerId) {
        // Don't fetch if we don't have an examinerId yet
        return;
      }

      try {
        const schedules = await ExNewScheduleService.getExaminerSchedules(examinerId);
        
        // Group schedules by module
        const groupedByModule = groupSchedulesByModule(schedules);
        setAllSchedules(groupedByModule);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setError("Failed to load schedules. Please try again later.");
        setLoading(false);
      }
    };

    if (examinerId) {
      fetchSchedules();
    }
  }, [examinerId]);

  // Function to group schedules by module
  const groupSchedulesByModule = (schedules) => {
    if (!schedules || schedules.length === 0) {
      return [];
    }
    
    const grouped = {};

    schedules.forEach(schedule => {
      const moduleKey = schedule.module_code;
      
      if (!grouped[moduleKey]) {
        grouped[moduleKey] = {
          moduleCode: schedule.module_code,
          moduleName: schedule.module_name,
          schedules: []
        };
      }

      // Format the schedule data for display
      const formattedSchedule = {
        id: schedule.schedule_id,
        date: schedule.date,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        venue: schedule.venue_name,
        examType: schedule.viva_type,
        moduleCode: schedule.module_code,
        moduleName: schedule.module_name,
        batchGroups: schedule.batch_groups?.map(group => ({
          id: group.group_id,
          name: group.batch_group_name,
          startTime: group.start_time,
          endTime: group.end_time,
          duration: group.duration,
          subGroups: group.sub_groups || [],
          lecturers: group.lecturers || [],
          examiners: group.examiners || []
        })) || []
      };

      grouped[moduleKey].schedules.push(formattedSchedule);
    });

    return Object.values(grouped);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleModule = (moduleCode) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleCode]: !prev[moduleCode]
    }));
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleAcceptSchedule = async (scheduleId) => {
    try {
      if (!examinerId) {
        alert("Authentication error. Please login again.");
        return;
      }
      
      setLoading(true);
      // Call the acceptSchedule function from ExAcceptedService
      await acceptSchedule(scheduleId, examinerId);
      
      // Update UI after successful acceptance
      // Remove the accepted schedule from the list
      setAllSchedules(prevModules => {
        const updatedModules = [...prevModules];
        
        // Find the module containing the accepted schedule
        for (let i = 0; i < updatedModules.length; i++) {
          const module = updatedModules[i];
          
          // Filter out the accepted schedule
          const filteredSchedules = module.schedules.filter(s => s.id !== scheduleId);
          
          // Update the module with filtered schedules
          module.schedules = filteredSchedules;
        }
        
        // Remove modules with no schedules
        return updatedModules.filter(module => module.schedules.length > 0);
      });
      
      setIsModalOpen(false);
      alert("Schedule accepted successfully");
    } catch (err) {
      console.error("Error accepting schedule:", err);
      alert("Failed to accept schedule. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReschedule = (schedule) => {
    setSelectedScheduleForReschedule(schedule);
    setShowRescheduleModal(true);
    setIsModalOpen(false);
  };

  const handleRescheduleSubmit = async (response) => {
    try {
      if (response.success) {
        // Remove the schedule from the New Schedules list since it's now a reschedule request
        setAllSchedules(prevModules => {
          const updatedModules = [...prevModules];
          
          // Find the module containing the rescheduled schedule
          for (let i = 0; i < updatedModules.length; i++) {
            const module = updatedModules[i];
            
            // Filter out the rescheduled schedule
            const filteredSchedules = module.schedules.filter(s => s.id !== selectedScheduleForReschedule.id);
            
            // Update the module with filtered schedules
            module.schedules = filteredSchedules;
          }
          
          // Remove modules with no schedules
          return updatedModules.filter(module => module.schedules.length > 0);
        });
        
        alert("Reschedule request submitted successfully");
      } else {
        alert("Failed to submit reschedule request. Please try again.");
      }
      setShowRescheduleModal(false);
    } catch (err) {
      console.error("Error handling reschedule submission:", err);
      alert("An error occurred while processing your request. Please try again later.");
      setShowRescheduleModal(false);
    }
  };

  const filteredModules = allSchedules.filter(module =>
    module.moduleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRange = (startTime, endTime) => {
    // Convert 24h format to 12h format for display
    const formatTime = (timeString) => {
      if (!timeString) return "N/A";
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${suffix}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  if (loading) {
    return <div className="loading-container">Loading schedules...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="new-schedules-container">
      <div className="header">
        <h2>New Presentation Schedules</h2>
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

      {allSchedules.length === 0 ? (
        <div className="no-schedules">
          <p>No schedules found. You have not been assigned to any new examination schedules yet.</p>
        </div>
      ) : (
        <div className="modules-list">
          {filteredModules.map(module => (
            <div key={module.moduleCode} className="module-card">
              <div 
                className="module-header"
                onClick={() => toggleModule(module.moduleCode)}
              >
                <div className="module-info">
                  <h3>{module.moduleCode}</h3>
                  <span className="module-name">{module.moduleName}</span>
                </div>
                <div className="module-meta">
                  <span className="schedule-count">
                    {module.schedules.length} schedule(s)
                  </span>
                  {expandedModules[module.moduleCode] ? 
                    <ChevronUp size={20} /> : 
                    <ChevronDown size={20} />
                  }
                </div>
              </div>

              {expandedModules[module.moduleCode] && (
                <div className="schedules-list">
                  {module.schedules.map(schedule => (
                    <div 
                      key={schedule.id} 
                      className="schedule-card"
                      onClick={() => handleViewSchedule(schedule)}
                    >
                      <div className="schedule-info">
                        <div className="schedule-primary">
                          <div className="info-item">
                            <Calendar size={16} />
                            <span>{formatDate(schedule.date)}</span>
                          </div>
                          <div className="info-item">
                            <Clock size={16} />
                            <span>{formatTimeRange(schedule.startTime, schedule.endTime)}</span>
                          </div>
                        </div>
                        <div className="schedule-secondary">
                          <div className="info-item">
                            <MapPin size={16} />
                            <span>{schedule.venue}</span>
                          </div>
                          <div className="info-item">
                            <Users size={16} />
                            <span>
                              {schedule.batchGroups.length > 0 
                                ? schedule.batchGroups[0].name 
                                : 'No batch assigned'}
                              {schedule.batchGroups.length > 1 && ` +${schedule.batchGroups.length - 1} more`}
                            </span>
                          </div>
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
            <h2>Schedule Details</h2>
            
            <div className="modal-section">
              <h3>Date & Time</h3>
              <div className="detail-row">
                <Calendar size={20} />
                <span>{formatDate(selectedSchedule.date)}</span>
              </div>
              <div className="detail-row">
                <Clock size={20} />
                <span>{formatTimeRange(selectedSchedule.startTime, selectedSchedule.endTime)}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Venue & Module</h3>
              <div className="detail-row">
                <MapPin size={20} />
                <span>{selectedSchedule.venue}</span>
              </div>
              <div className="detail-row">
                <strong>Module:</strong> {selectedSchedule.moduleCode} - {selectedSchedule.moduleName}
              </div>
              <div className="detail-row">
                <strong>Examination Type:</strong> {selectedSchedule.examType}
              </div>
            </div>

            <div className="modal-section">
              <h3>Batch Groups</h3>
              {selectedSchedule.batchGroups && selectedSchedule.batchGroups.length > 0 ? (
                selectedSchedule.batchGroups.map(group => (
                  <div key={group.id} className="batch-group-details">
                    <h4>{group.name}</h4>
                    {group.startTime && group.endTime && (
                      <div className="detail-row">
                        <Clock size={20} />
                        <span>Time: {formatTimeRange(group.startTime, group.endTime)}</span>
                      </div>
                    )}
                    {group.duration && (
                      <div className="detail-row">
                        <span>Duration: {group.duration} minutes</span>
                      </div>
                    )}
                    
                    {group.subGroups && group.subGroups.length > 0 && (
                      <div className="sub-groups">
                        <p><strong>Sub Groups:</strong></p>
                        <ul>
                          {group.subGroups.map(subGroup => (
                            <li key={subGroup.id || `subgroup-${Math.random()}`}>
                              {subGroup.name || subGroup.sub_group || 'Unnamed Sub-group'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="assigned-staff">
                      <p><strong>Assigned Lecturers:</strong></p>
                      {group.lecturers && group.lecturers.length > 0 ? (
                        <ul>
                          {group.lecturers.map(lecturer => (
                            <li key={lecturer.id || lecturer.lec_id || `lecturer-${Math.random()}`}>
                              {lecturer.name || lecturer.lec_name || 'Unnamed Lecturer'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-staff">No lecturers assigned</p>
                      )}
                    </div>
                    
                    <div className="assigned-staff">
                      <p><strong>Assigned Examiners:</strong></p>
                      {group.examiners && group.examiners.length > 0 ? (
                        <ul>
                          {group.examiners.map(examiner => (
                            <li key={examiner.id || examiner.examiner_id || `examiner-${Math.random()}`}>
                              {examiner.name || examiner.examiner_name || 'Unnamed Examiner'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-staff">No examiners assigned</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No batch groups assigned to this schedule</p>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="accept-btn"
                onClick={() => handleAcceptSchedule(selectedSchedule.id)}
              >
                <CheckCircle size={20} />
                Accept Schedule
              </button>
              <button 
                className="reschedule-btn"
                onClick={() => handleRequestReschedule(selectedSchedule)}
              >
                <RefreshCw size={20} />
                Request Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedScheduleForReschedule && (
        <ExRequestComment
          schedule={selectedScheduleForReschedule}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={handleRescheduleSubmit}
          examinerId={examinerId}
        />
      )}
    </div>
  );
};

export default ExNewSchedules;