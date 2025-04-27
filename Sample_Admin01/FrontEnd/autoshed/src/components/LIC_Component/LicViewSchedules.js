import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen, User, Trash2, Edit, AlertCircle, Check, X, ChevronDown, Timer, Search, Filter, Plus } from 'lucide-react';
import LicViewScheduleService from '../../services/LIC_Services/LicViewScheduleService';
import '../../styles/LIC_Styles/LicViewSchedules.css';

const LicViewSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  // const [setAvailableLecturers] = useState([]);
  // const [setAvailableExaminers] = useState([]);

  const token = localStorage.getItem("token");
  const licId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      if (!licId) {
        throw new Error("Not authenticated. Please login.");
      }
      const data = await LicViewScheduleService.getSchedulesByLic(licId);
      setSchedules(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load schedules. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [licId]);

  // Fetch available lecturers and examiners
  // const fetchStaff = useCallback(async () => {
  //   try {
  //     const [lecturers, examiners] = await Promise.all([
  //       LicViewScheduleService.getAvailableLecturers(),
  //       LicViewScheduleService.getAvailableExaminers()
  //     ]);
  //     // setAvailableLecturers(lecturers || []);
  //     // setAvailableExaminers(examiners || []);
  //   } catch (err) {
  //     console.error("Failed to fetch staff:", err);
  //   }
  // }, []);

  useEffect(() => {
    fetchSchedules();
    
  }, [fetchSchedules]);


  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.viva_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && schedule.viva_type === filterType;
  });

  const handleScheduleClick = async (scheduleId) => {
    setLoading(true);
    try {
      const data = await LicViewScheduleService.getScheduleDetails(scheduleId);
      setSelectedSchedule(data);
      setExpandedGroups({});
      setError('');
    } catch (err) {
      setError('Failed to load schedule details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleEdit = () => {
    setEditData({
      schedule_id: selectedSchedule.schedule_id,
      viva_type: selectedSchedule.viva_type,
      batchGroups: selectedSchedule.batchGroups.map(group => ({
        ...group,
        startTime: group.start_time,
        endTime: group.end_time,
        // Make a deep copy of lecturers and examiners arrays
        lecturers: [...group.lecturers],
        examiners: [...group.examiners],
        // Make a deep copy of subGroups array
        subGroups: [...group.subGroups]
      }))
    });
    setShowEditModal(true);
  };


  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await LicViewScheduleService.updateSchedule(selectedSchedule.schedule_id, editData);
      const updatedDetails = await LicViewScheduleService.getScheduleDetails(selectedSchedule.schedule_id);
      setSelectedSchedule(updatedDetails);
      fetchSchedules();
      setSuccess('Schedule updated successfully');
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    setLoading(true);
    try {
      await LicViewScheduleService.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(schedule => schedule.schedule_id !== scheduleId));
      setSuccess('Schedule deleted successfully');
      setSelectedSchedule(null);
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

//----------------------
// const addBatchGroup = () => {
//   const newGroup = {
//     group_id: `temp-${Date.now()}`, // Temporary ID until saved
//     batch: `New Group ${editData.batchGroups.length + 1}`,
//     start_time: "09:00:00",
//     end_time: "10:00:00",
//     startTime: "09:00:00",
//     endTime: "10:00:00",
//     duration: 60,
//     subGroups: [],
//     lecturers: [],
//     examiners: []
//   };
  
//   setEditData({
//     ...editData,
//     batchGroups: [...editData.batchGroups, newGroup]
//   });
// };

const removeBatchGroup = (groupIndex) => {
  const updatedGroups = [...editData.batchGroups];
  updatedGroups.splice(groupIndex, 1);
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};

const addSubGroup = (groupIndex) => {
  const updatedGroups = [...editData.batchGroups];
  const newSubGroup = `SG${updatedGroups[groupIndex].subGroups.length + 1}`;
  updatedGroups[groupIndex].subGroups.push(newSubGroup);
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};

const removeSubGroup = (groupIndex, subGroupIndex) => {
  const updatedGroups = [...editData.batchGroups];
  updatedGroups[groupIndex].subGroups.splice(subGroupIndex, 1);
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};

const updateSubGroup = (groupIndex, subGroupIndex, value) => {
  const updatedGroups = [...editData.batchGroups];
  updatedGroups[groupIndex].subGroups[subGroupIndex] = value;
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};

const updateBatchName = (groupIndex, value) => {
  const updatedGroups = [...editData.batchGroups];
  updatedGroups[groupIndex].batch = value;
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};

// const addLecturer = (groupIndex, lecturer) => {
//   const updatedGroups = [...editData.batchGroups];
//   // Check if lecturer already exists in the group
//   if (!updatedGroups[groupIndex].lecturers.find(l => l.lec_id === lecturer.lec_id)) {
//     updatedGroups[groupIndex].lecturers.push(lecturer);
//     setEditData({
//       ...editData,
//       batchGroups: updatedGroups
//     });
//   }
// };

const removeLecturer = (groupIndex, lecId) => {
  const updatedGroups = [...editData.batchGroups];
  updatedGroups[groupIndex].lecturers = updatedGroups[groupIndex].lecturers.filter(
    lecturer => lecturer.lec_id !== lecId
  );
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};

// const addExaminer = (groupIndex, examiner) => {
//   const updatedGroups = [...editData.batchGroups];
//   // Check if examiner already exists in the group
//   if (!updatedGroups[groupIndex].examiners.find(e => e.examiner_id === examiner.examiner_id)) {
//     updatedGroups[groupIndex].examiners.push(examiner);
//     setEditData({
//       ...editData,
//       batchGroups: updatedGroups
//     });
//   }
// };

const removeExaminer = (groupIndex, examinerId) => {
  const updatedGroups = [...editData.batchGroups];
  updatedGroups[groupIndex].examiners = updatedGroups[groupIndex].examiners.filter(
    examiner => examiner.examiner_id !== examinerId
  );
  setEditData({
    ...editData,
    batchGroups: updatedGroups
  });
};


//---------------------


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && !selectedSchedule) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="view-schedules-container">
      <div className="schedules-header">
        <h2>Presentation Schedules</h2>
        <p>View and manage your scheduled presentations</p>
      </div>

      {error && (
        <div className="alert error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="close-alert" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert success-alert">
          <Check size={20} />
          <span>{success}</span>
          <button className="close-alert" onClick={() => setSuccess('')}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="search-filter-container">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by module code or viva type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Final Viva">Final Viva</option>
            <option value="Progress Viva">Progress Viva</option>
            <option value="Mock Viva">Mock Viva</option>
          </select>
        </div>
      </div>

      <div className="schedules-grid">
        {filteredSchedules.length === 0 && !loading ? (
          <div className="no-schedules-message">
            <AlertCircle size={24} />
            <p>No schedules found.</p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.schedule_id}
              className={`schedule-card ${selectedSchedule?.schedule_id === schedule.schedule_id ? 'selected' : ''}`}
              onClick={() => handleScheduleClick(schedule.schedule_id)}
            >
              <div className="schedule-card-header">
                <div className="module-info">
                  <div className="module-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="module-details">
                    <h3>{schedule.module_code}</h3>
                    <span className="viva-type">{schedule.viva_type}</span>
                  </div>
                </div>
              </div>

              <div className="schedule-card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <Calendar size={18} />
                    <div className="info-text">
                      <span className="info-label">Date</span>
                      <span className="info-value">{formatDate(schedule.date)}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Clock size={18} />
                    <div className="info-text">
                      <span className="info-label">Time</span>
                      <span className="info-value">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin size={18} />
                    <div className="info-text">
                      <span className="info-label">Venue</span>
                      <span className="info-value">{schedule.venue_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="schedule-card-footer">
                <button className="view-details-btn">
                  <span>View Details</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSchedule && (
        <div className="schedule-details-overlay" onClick={() => setSelectedSchedule(null)}>
          <div className="schedule-details-modal updated-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-improved">
              <div className="modal-title-wrapper">
                <div className="module-tag">
                  <span>{selectedSchedule.module_code}</span>
                </div>
                <h3 className="modal-heading">{selectedSchedule.viva_type}</h3>
              </div>
            </div>

            <div className="modal-content-improved">
              <div className="details-section-improved">
                <h4 className="section-title">Schedule Information</h4>
                <div className="details-cards">
                  <div className="detail-card-improved">
                    <div className="detail-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{formatDate(selectedSchedule.date)}</span>
                    </div>
                  </div>
                  <div className="detail-card-improved">
                    <div className="detail-icon">
                      <Clock size={20} />
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Time</span>
                      <span className="detail-value">
                        {formatTime(selectedSchedule.start_time)} - {formatTime(selectedSchedule.end_time)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-card-improved">
                    <div className="detail-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="detail-info">
                      <span className="detail-label">Venue</span>
                      <span className="detail-value">{selectedSchedule.venue_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="batch-groups-section-improved">
                <div className="section-header-improved">
                  <h4 className="section-title">Batch Groups</h4>
                  <span className="group-count-badge">{selectedSchedule.batchGroups.length} Groups</span>
                </div>
                <div className="batch-groups-container-improved">
                  {selectedSchedule.batchGroups.map((group) => (
                    <div 
                      key={group.group_id} 
                      className={`batch-group-card-improved ${expandedGroups[group.group_id] ? 'expanded' : ''}`}
                    >
                      <div 
                        className="group-header-improved"
                        onClick={() => toggleGroupExpansion(group.group_id)}
                      >
                        <div className="group-title-improved">
                          <Users size={18} />
                          <h5>{group.batch}</h5>
                        </div>
                        <div className="group-meta-improved">
                          <span className="time-badge-improved">
                            <Clock size={14} />
                            {formatTime(group.start_time)} - {formatTime(group.end_time)}
                          </span>
                          <ChevronDown 
                            size={18} 
                            className={`expand-icon ${expandedGroups[group.group_id] ? 'expanded' : ''}`}
                          />
                        </div>
                      </div>

                      <div className={`group-details-improved ${expandedGroups[group.group_id] ? 'expanded' : ''}`}>
                        <div className="detail-row-improved">
                          <Timer size={16} />
                          <div className="detail-content-improved">
                            <strong>Duration</strong>
                            <span>{group.duration} minutes</span>
                          </div>
                        </div>
                        
                        <div className="detail-row-improved">
                          <Users size={16} />
                          <div className="detail-content-improved">
                            <strong>Sub Groups</strong>
                            <div className="tags-improved">
                              {group.subGroups.map((subGroup, index) => (
                                <span key={index} className="tag-improved">{subGroup}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="detail-row-improved">
                          <User  size={16} />
                          <div className="detail-content-improved">
                            <strong>Lecturers</strong>
                            <div className="staff-list-improved">
                              {group.lecturers.map((lecturer) => (
                                <div key={lecturer.lec_id} className="staff-badge-improved">
                                  <span>{lecturer.lec_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="detail-row-improved">
                          <User  size={16} />
                          <div className="detail-content-improved">
                            <strong>Examiners</strong>
                            <div className="staff-list-improved">
                              {group.examiners.map((examiner) => (
                                <div key={examiner.examiner_id} className="staff-badge-improved">
                                  <span>{examiner.examiner_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions-improved">
              {deleteConfirm === selectedSchedule.schedule_id ? (
                <div className="delete-confirm-improved">
                  <p className="confirm-text">Are you sure you want to delete this schedule?</p>
                  <div className="confirm-buttons">
                    <button
                      className="confirm-no-improved"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      className="confirm-yes-improved"
                      onClick={() => handleDelete(selectedSchedule.schedule_id)}
                    >
                      <Check size={16} />
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="action-buttons">
                  <button className="edit-btn-improved" onClick={handleEdit}>
                    <Edit size={16} />
                    Edit Schedule
                  </button>
                  <button
                    className="delete-btn-improved"
                    onClick={() => setDeleteConfirm(selectedSchedule.schedule_id)}
                  >
                    <Trash2 size={16} />
                    Delete Schedule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && editData && (
        <div className="schedule-details-overlay" onClick={() => setShowEditModal(false)}>
          <div className="schedule-details-modal updated-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-improved">
              <div className="modal-title-wrapper">
                <div className="module-tag">
                  <Edit size={20} />
                </div>
                <h3 className="modal-heading">Edit Schedule</h3>
              </div>
            </div>
            
            <div className="modal-content-improved">
              <div className="details-section-improved">
                <h4 className="section-title">Schedule Settings</h4>
                <div className="form-group">
                  <label htmlFor="viva-type">Viva Type</label>
                  <select 
                    id="viva-type"
                    value={editData.viva_type} 
                    onChange={(e) => setEditData({...editData, viva_type: e.target.value})}
                    className="form-select"
                  >
                    <option value="Mock Viva">Mock Viva</option>
                    <option value="Progress Viva">Progress Viva</option>
                    <option value="Final Viva">Final Viva</option>
                  </select>
                </div>
              </div>
              
              <div className="batch-groups-section-improved">
                {/* <div className="section-header-improved">
                  <h4 className="section-title">Batch Groups</h4>
                  <span className="group-count-badge">{editData.batchGroups.length} Groups</span>
                  <button className="add-group-btn" onClick={addBatchGroup}>
                      <Plus size={16} />
                      Add Group
                    </button>
                </div> */}
                
                <div className="batch-groups-container-improved">
                  {editData.batchGroups.map((group, groupIndex) => (
                    <div 
                      key={group.group_id || groupIndex} 
                      className="batch-group-card-improved"
                    >
                      <div className="group-header-improved">
                        <div className="group-title-improved">
                          <Users size={18} />
                          <input
                            type="text"
                            value={group.batch}
                            onChange={(e) => updateBatchName(groupIndex, e.target.value)}
                            className="batch-name-input"
                          />
                        </div>
                        <button 
                          className="remove-group-btn" 
                          onClick={() => removeBatchGroup(groupIndex)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="group-details-improved expanded">
                        <div className="detail-row-improved">
                          <Clock size={16} />
                          <div className="detail-content-improved">
                            <strong>Start Time</strong>
                            <div className="time-input-wrapper">
                              <input 
                                type="time" 
                                value={group.startTime}
                                onChange={(e) => {
                                  const updatedGroups = [...editData.batchGroups];
                                  updatedGroups[groupIndex] = {...group, startTime: e.target.value};
                                  setEditData({...editData, batchGroups: updatedGroups});
                                }}
                                className="time-input"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row-improved">
                          <Clock size={16} />
                          <div className="detail-content-improved">
                            <strong>End Time</strong>
                            <div className="time-input-wrapper">
                              <input 
                                type="time" 
                                value={group.endTime}
                                onChange={(e) => {
                                  const updatedGroups = [...editData.batchGroups];
                                  updatedGroups[groupIndex] = {...group, endTime: e.target.value};
                                  setEditData({...editData, batchGroups: updatedGroups});
                                }}
                                className="time-input"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row-improved">
                          <Timer size={16} />
                          <div className="detail-content-improved">
                            <strong>Duration (minutes)</strong>
                            <div className="number-input-wrapper">
                              <input 
                                type="number" 
                                value={group.duration}
                                min="1"
                                onChange={(e) => {
                                  const updatedGroups = [...editData.batchGroups];
                                  updatedGroups[groupIndex] = {
                                    ...group, 
                                    duration: parseInt(e.target.value) || 0
                                  };
                                  setEditData({...editData, batchGroups: updatedGroups});
                                }}
                                className="number-input"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row-improved">
                          <Users size={16} />
                          <div className="detail-content-improved">
                            <strong>Sub Groups</strong>
                            <div className="sub-groups-editor">
                              <div className="tags-improved editable">
                                {group.subGroups.map((subGroup, sgIndex) => (
                                  <div key={sgIndex} className="editable-tag">
                                    <input
                                      type="text"
                                      value={subGroup}
                                      onChange={(e) => updateSubGroup(groupIndex, sgIndex, e.target.value)}
                                      className="tag-input"
                                    />
                                    <button 
                                      className="remove-tag-btn" 
                                      onClick={() => removeSubGroup(groupIndex, sgIndex)}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button 
                                className="add-tag-btn" 
                                onClick={() => addSubGroup(groupIndex)}
                              >
                                <Plus size={14} />
                                Add Sub Group
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row-improved">
                          <User size={16} />
                          <div className="detail-content-improved">
                            <strong>Lecturers</strong>
                            <div className="staff-editor">
                              <div className="staff-list-improved editable">
                                {group.lecturers.map((lecturer) => (
                                  <div key={lecturer.lec_id} className="staff-badge-improved editable">
                                    <span>{lecturer.lec_name}</span>
                                    <button 
                                      className="remove-staff-btn" 
                                      onClick={() => removeLecturer(groupIndex, lecturer.lec_id)}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="staff-selector">
                                {/* <select 
                                  className="staff-select"
                                  onChange={(e) => {
                                    const selectedLec = availableLecturers.find(
                                      lec => lec.lec_id === parseInt(e.target.value)
                                    );
                                    if (selectedLec) addLecturer(groupIndex, selectedLec);
                                    e.target.value = ""; // Reset select after adding
                                  }}
                                  value=""
                                >
                                  <option value="">Add Lecturer</option>
                                  {availableLecturers.map(lec => (
                                    <option key={lec.lec_id} value={lec.lec_id}>
                                      {lec.lec_name}
                                    </option>
                                  ))}
                                </select> */}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="detail-row-improved">
  <User size={16} />
  <div className="detail-content-improved">
    <strong>Examiners</strong>
    <div className="staff-editor">
      <div className="staff-list-improved editable">
        {group.examiners.map((examiner) => (
          <div key={examiner.examiner_id} className="staff-badge-improved editable">
            <span>{examiner.examiner_name}</span>
            <button 
              className="remove-staff-btn" 
              onClick={() => removeExaminer(groupIndex, examiner.examiner_id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="staff-selector">
        {/* <select 
          className="staff-select"
          onChange={(e) => {
            const selectedExaminer = availableExaminers.find(
              examiner => examiner.examiner_id === parseInt(e.target.value)
            );
            if (selectedExaminer) addExaminer(groupIndex, selectedExaminer);
            e.target.value = ""; // Reset select after adding
          }}
          value=""
        >
          <option value="">Add Examiner</option>
          {availableExaminers.map(examiner => (
            <option key={examiner.examiner_id} value={examiner.examiner_id}>
              {examiner.examiner_name}
            </option>
          ))}
        </select> */}
      </div>
    </div>
  </div>
</div>




                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-actions-improved">
              <div className="action-buttons">
                <button className="confirm-no-improved" onClick={() => setShowEditModal(false)}>
                  <X size={16} />
                  Cancel
                </button>
                <button className="edit-btn-improved" onClick={handleSaveEdit}>
                  <Check size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicViewSchedules;