import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Timer, User, AlertCircle, Plus, Minus, Save, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import '../../styles/LIC_Styles/LicNewSchedules.css';
import LicTimeSlotsService from '../../services/LIC_Services/LicTimeSlotsService';
import LicBatchDetailsService from '../../services/LIC_Services/LicBatchDetailsService';
import LicNewScheduleService from '../../services/LIC_Services/LicNewScheduleService'; 

const VIVA_TYPES = [
  'Final Viva',
  'Progress Viva',
  'Mock Viva'
];

const LicNewSchedules = ({ timeSlotData = {}, onBackClick }) => {
  // Format the date for display if it exists
  const formattedDate = timeSlotData.date ? new Date(timeSlotData.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';
  
  // Calculate first group start time based on the time slot
  const calculateInitialStartTime = () => {
    if (timeSlotData.start_time) {
      return timeSlotData.start_time.slice(0, 5); // Format as HH:MM
    }
    return '';
  };
  
  // Calculate first group end time (15 min default)
  const calculateInitialEndTime = () => {
    if (timeSlotData.start_time) {
      const startTime = new Date(`2000-01-01T${timeSlotData.start_time}`);
      const endTime = new Date(startTime.getTime() + 15 * 60000); // Add 15 mins
      const hours = endTime.getHours().toString().padStart(2, '0');
      const minutes = endTime.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '';
  };

  const [formData, setFormData] = useState({
    lic_id: '',
    slot_id: timeSlotData.slot_id || '',
    module_code: timeSlotData.module_code || '',
    date: timeSlotData.date || '',
    start_time: timeSlotData.start_time ? timeSlotData.start_time.slice(0, 5) : '',
    end_time: timeSlotData.end_time ? timeSlotData.end_time.slice(0, 5) : '',
    venue_name: timeSlotData.venue_name || '',
    viva_type: '',
  });

  const [batchGroups, setBatchGroups] = useState([
    {
      id: 1,
      batch: '',
      subGroups: [],
      lecturers: [],
      examiners: [],
      duration: 15,
      startTime: calculateInitialStartTime(),
      endTime: calculateInitialEndTime()
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Fixed: Correctly define success state
  const [isTimeSlotFull, setIsTimeSlotFull] = useState(false);

  const [availableLecturers, setAvailableLecturers] = useState([]);
  const [availableExaminers, setAvailableExaminers] = useState([]);
  
  // State for batch and subgroup data
  const [allBatches, setAllBatches] = useState([]);
  const [subGroupsByBatch, setSubGroupsByBatch] = useState({});

  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Check if we have the required time slot data
    if (!timeSlotData.module_code || !timeSlotData.date) {
      setError("Missing time slot information. Please select a time slot first.");
      setTimeout(() => {
        if (onBackClick) onBackClick();
      }, 3000);
      return;
    }
    
    // Get user token for authentication
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setFormData(prev => ({ ...prev, lic_id: decodedToken.id }));
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Failed to authenticate. Please login again.");
      }
    } else {
      setError("Not authenticated. Please login.");
    }

    // Fetch all batches when component mounts
    const fetchBatches = async () => {
      try {
        const batchesData = await LicBatchDetailsService.getAllBatches();
        // Extract just the batch values from the response
        const batches = batchesData.map(item => item.batch);
        setAllBatches(batches);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        setError("Failed to load batches. Please try again.");
      }
    };

    fetchBatches();
  }, [timeSlotData, onBackClick]);

  useEffect(() => {
    if (timeSlotData.slot_id) {
      const fetchAvailableStaff = async () => {
        try {
          const lecturers = await LicTimeSlotsService.getAvailableLecturersForTimeSlot(timeSlotData.slot_id);
          const examiners = await LicTimeSlotsService.getAvailableExaminersForTimeSlot(timeSlotData.slot_id);
          setAvailableLecturers(lecturers);
          setAvailableExaminers(examiners);
        } catch (error) {
          console.error("Error fetching available staff:", error);
        }
      };
      fetchAvailableStaff();
    }
  }, [timeSlotData]);

  // Check if adding another batch group would exceed the time slot
  useEffect(() => {
    if (batchGroups.length > 0 && formData.start_time && formData.end_time) {
      // Get the last group's end time
      const lastGroup = batchGroups[batchGroups.length - 1];
      
      if (lastGroup.endTime) {
        // Calculate main slot end time
        const mainEndTime = new Date(`2000-01-01T${formData.end_time}`);
        
        // Calculate the last group's end time
        const lastGroupEndTime = new Date(`2000-01-01T${lastGroup.endTime}`);
        
        // Calculate time for a potential new group (default 15 min)
        const potentialNewGroupEndTime = new Date(lastGroupEndTime.getTime() + 15 * 60000);
        
        // Check if adding another group would exceed the main time slot
        setIsTimeSlotFull(potentialNewGroupEndTime > mainEndTime);
      }
    }
  }, [batchGroups, formData.start_time, formData.end_time]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBatchGroupChange = async (index, field, value) => {
    const updatedGroups = [...batchGroups];
    updatedGroups[index] = {
      ...updatedGroups[index],
      [field]: value
    };
    
    // If changing batch, fetch sub_groups for that batch
    if (field === 'batch' && value) {
      try {
        // Clear any previously selected subGroups for this batch
        updatedGroups[index].subGroups = [];
        
        // Check if we already have the subgroups for this batch in state
        if (!subGroupsByBatch[value]) {
          const batchDetails = await LicBatchDetailsService.getBatchDetails(value);
          
          // Store the subgroups for this batch
          setSubGroupsByBatch(prev => ({
            ...prev,
            [value]: batchDetails.map(detail => detail.sub_group)
          }));
        }
      } catch (error) {
        console.error("Error fetching sub-groups for batch:", error);
      }
    }
    
    // If changing duration, auto-calculate end time based on start time
    if (field === 'duration' || field === 'startTime') {
      if (updatedGroups[index].startTime) {
        const startTime = new Date(`2000-01-01T${updatedGroups[index].startTime}`);
        const durationMinutes = parseInt(updatedGroups[index].duration) || 15;
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
        
        const hours = endTime.getHours().toString().padStart(2, '0');
        const minutes = endTime.getMinutes().toString().padStart(2, '0');
        updatedGroups[index].endTime = `${hours}:${minutes}`;
      }
    }
    
    setBatchGroups(updatedGroups);
  };

  const addBatchGroup = () => {
    // Calculate start time for new group based on end time of last group
    const lastGroup = batchGroups[batchGroups.length - 1];
    let newStartTime = '';
    let newEndTime = '';
    
    if (lastGroup.endTime) {
      newStartTime = lastGroup.endTime;
      
      // Calculate new end time (15 min default)
      const startTime = new Date(`2000-01-01T${newStartTime}`);
      const endTime = new Date(startTime.getTime() + 15 * 60000);
      const hours = endTime.getHours().toString().padStart(2, '0');
      const minutes = endTime.getMinutes().toString().padStart(2, '0');
      newEndTime = `${hours}:${minutes}`;
      
      // Check if adding would exceed main time slot
      const mainEndTime = new Date(`2000-01-01T${formData.end_time}`);
      if (endTime > mainEndTime) {
        return; // Don't add if it would exceed
      }
    }
    
    setBatchGroups(prev => [...prev, {
      id: prev.length + 1,
      batch: '',
      subGroups: [],
      lecturers: [],
      examiners: [],
      duration: 15,
      startTime: newStartTime,
      endTime: newEndTime
    }]);
  };

  const removeBatchGroup = (index) => {
    setBatchGroups(prev => prev.filter((_, i) => i !== index));
  };


  // New function to add items to multi-select fields
  const handleAddItem = (index, field, item) => {
    if (!item) return;
    
    const updatedGroups = [...batchGroups];
    const currentItems = updatedGroups[index][field];
    
    // Only add if not already in the array
    if (!currentItems.includes(item)) {
      updatedGroups[index] = {
        ...updatedGroups[index],
        [field]: [...currentItems, item]
      };
      setBatchGroups(updatedGroups);
    }
  };


  // New function to remove items from multi-select fields
  const handleRemoveItem = (index, field, item) => {
    const updatedGroups = [...batchGroups];
    updatedGroups[index] = {
      ...updatedGroups[index],
      [field]: updatedGroups[index][field].filter(i => i !== item)
    };
    setBatchGroups(updatedGroups);
  };

  const validateTimeSlots = () => {
    // Check if all groups are within the main time slot
    const mainStart = new Date(`2000-01-01T${formData.start_time}`);
    const mainEnd = new Date(`2000-01-01T${formData.end_time}`);
    
    for (const group of batchGroups) {
      if (!group.startTime || !group.endTime) continue;
      
      const groupStart = new Date(`2000-01-01T${group.startTime}`);
      const groupEnd = new Date(`2000-01-01T${group.endTime}`);
      
      if (groupStart < mainStart || groupEnd > mainEnd) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(''); // Now using the correctly defined setSuccess function

    try {
      if (!formData.viva_type) {
        throw new Error('Please select a viva type');
      }

      if (batchGroups.some(group => !group.batch || group.subGroups.length === 0)) {
        throw new Error('Please fill in all batch group details');
      }
      
      if (!validateTimeSlots()) {
        throw new Error('One or more group time slots are outside the main time slot range');
      }

      setShowConfirmation(true);

    } catch (err) {
      setError(err.message || 'Failed to create schedule');
    }
  };


   // Add new function to handle actual submission
   const handleConfirmedSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setShowConfirmation(false);

    try {
      // Prepare the data for submission
      const scheduleData = {
        ...formData,
        batchGroups: batchGroups.map(group => ({
          batch: group.batch,
          subGroups: group.subGroups,
          lecturers: group.lecturers,
          examiners: group.examiners,
          duration: group.duration,
          startTime: group.startTime,
          endTime: group.endTime
        }))
      };
      
      const response = await LicNewScheduleService.createSchedule(scheduleData);
      setSuccess(response.message);
      
      setTimeout(() => {
        if (onBackClick) onBackClick();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining time in the slot
  const getRemainingTime = () => {
    if (!formData.end_time || batchGroups.length === 0) return null;
    
    const lastGroup = batchGroups[batchGroups.length - 1];
    if (!lastGroup.endTime) return null;
    
    const mainEndTime = new Date(`2000-01-01T${formData.end_time}`);
    const lastGroupEndTime = new Date(`2000-01-01T${lastGroup.endTime}`);
    
    // Calculate difference in minutes
    const diffMs = mainEndTime - lastGroupEndTime;
    const diffMinutes = Math.floor(diffMs / 60000);
    
    return diffMinutes;
  };

  return (
    <div className="new-schedule-container">
      <div className="form-header">
        <h2>Create New Schedule</h2>
        <p>Schedule details for presentation</p>
      </div>

      {error && (
        <div className="alert error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert success-alert">
          <span>{success}</span>
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-icon">
              <AlertTriangle size={48} className="warning-icon" />
            </div>
            <h3>Confirm Schedule Creation</h3>
            <p>Are you sure you want to create this schedule? This action cannot be undone.</p>
            <div className="confirmation-details">
              <div className="detail-item">
                <span className="detail-label">Module:</span>
                <span className="detail-value">{formData.module_code}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formattedDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Venue:</span>
                <span className="detail-value">{formData.venue_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Groups:</span>
                <span className="detail-value">{batchGroups.length}</span>
              </div>
            </div>
            <div className="confirmation-actions">
              <button 
                className="confirm-btn"
                onClick={handleConfirmedSubmit}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Confirm'}
              </button>
              <button 
                className="cancel-confirm-btn"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <User size={20} />
                LIC ID
              </label>
              <input
                type="text"
                value={formData.lic_id}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>
                <BookOpen size={20} />
                Module Code
              </label>
              <input
                type="text"
                value={formData.module_code}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Calendar size={20} />
                Date
              </label>
              <input
                type="text"
                value={formattedDate}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={20} />
                Venue
              </label>
              <input
                type="text"
                value={formData.venue_name}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Clock size={20} />
                Start Time
              </label>
              <input
                type="text"
                value={formData.start_time}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>
                <Clock size={20} />
                End Time
              </label>
              <input
                type="text"
                value={formData.end_time}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <BookOpen size={20} />
              Viva Type
            </label>
            <select
              name="viva_type"
              value={formData.viva_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Viva Type</option>
              {VIVA_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Staff Assignment & Groups</h3>
          
          <div className="batch-groups-container">
            {batchGroups.map((group, index) => (
              <div key={group.id} className="batch-group-card">
                <div className="batch-group-header">
                  <h4>Batch Group {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-group-btn"
                      onClick={() => removeBatchGroup(index)}
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Batch/Group</label>
                    <select
                      value={group.batch}
                      onChange={(e) => handleBatchGroupChange(index, 'batch', e.target.value)}
                      required
                    >
                      <option value="">Select Batch</option>
                      {allBatches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sub Groups</label>
                    <div className="multi-select-container">
                      <div className="multi-select-input">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddItem(index, 'subGroups', e.target.value);
                              e.target.value = ""; // Reset after selection
                            }
                          }}
                        >
                          <option value="">Select Sub Group</option>
                          {group.batch && subGroupsByBatch[group.batch] ? 
                            subGroupsByBatch[group.batch]
                              .filter(subGroup => !group.subGroups.includes(subGroup))
                              .map(subGroup => (
                                <option key={subGroup} value={subGroup}>{subGroup}</option>
                              )) : 
                            <option value="" disabled>Select a batch first</option>
                          }
                        </select>
                      </div>
                      <div className="selected-items">
                        {group.subGroups.map(item => (
                          <div key={item} className="selected-item">
                            <span>{item}</span>
                            <button 
                              type="button" 
                              className="remove-item-btn"
                              onClick={() => handleRemoveItem(index, 'subGroups', item)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {group.subGroups.length === 0 && (
                      <div className="validation-message">Please select at least one sub group</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Assigned Lecturers</label>
                    <div className="multi-select-container">
                      <div className="multi-select-input">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddItem(index, 'lecturers', e.target.value);
                              e.target.value = ""; // Reset after selection
                            }
                          }}
                        >
                          <option value="">Select Lecturer</option>
                          {availableLecturers
                            .filter(lecturer => !group.lecturers.includes(lecturer.lec_id))
                            .map(lecturer => (
                              <option key={lecturer.lec_id} value={lecturer.lec_id}>
                                {lecturer.lec_name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      <div className="selected-items">
                        {group.lecturers.map(id => (
                          <div key={id} className="selected-item">
                            <span>{availableLecturers.find(l => l.lec_id === id)?.lec_name}</span>
                            <button 
                              type="button" 
                              className="remove-item-btn"
                              onClick={() => handleRemoveItem(index, 'lecturers', id)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {group.lecturers.length === 0 && (
                      <div className="validation-message">Please select at least one lecturer</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Assigned Examiners</label>
                    <div className="multi-select-container">
                      <div className="multi-select-input">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddItem(index, 'examiners', e.target.value);
                              e.target.value = ""; // Reset after selection
                            }
                          }}
                        >
                          <option value="">Select Examiner</option>
                          {availableExaminers
                            .filter(examiner => !group.examiners.includes(examiner.examiner_id))
                            .map(examiner => (
                              <option key={examiner.examiner_id} value={examiner.examiner_id}>
                                {examiner.examiner_name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      <div className="selected-items">
                        {group.examiners.map(id => (
                          <div key={id} className="selected-item">
                            <span>{availableExaminers.find(e => e.examiner_id === id)?.examiner_name}</span>
                            <button 
                              type="button" 
                              className="remove-item-btn"
                              onClick={() => handleRemoveItem(index, 'examiners', id)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {group.examiners.length === 0 && (
                      <div className="validation-message">Please select at least one examiner</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Timer size={20} />
                      Duration per Sub Group (minutes)
                    </label>
                    <input
                      type="number"
                      value={group.duration}
                      onChange={(e) => handleBatchGroupChange(index, 'duration', e.target.value)}
                      min="15"
                      max="60"
                      step="15"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={group.startTime}
                      onChange={(e) => handleBatchGroupChange(index, 'startTime', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={group.endTime}
                      onChange={(e) => handleBatchGroupChange(index, 'endTime', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="add-group-container">
            <button
              type="button"
              className={`add-group-btn ${isTimeSlotFull ? 'disabled' : ''}`}
              onClick={addBatchGroup}
              disabled={isTimeSlotFull}
            >
              <Plus size={20} /> Add Batch Group
            </button>
            
            {isTimeSlotFull && (
              <div className="time-slot-warning">
                <AlertCircle size={16} />
                <span>Maximum time slot capacity reached. Cannot add more batch groups.</span>
              </div>
            )}
            
            {!isTimeSlotFull && getRemainingTime() !== null && (
              <div className="time-remaining-info">
                <Clock size={16} />
                <span>Remaining time: {getRemainingTime()} minutes</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onBackClick} 
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default LicNewSchedules;

