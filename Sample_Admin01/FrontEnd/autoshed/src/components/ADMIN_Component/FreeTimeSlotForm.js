import React, { useState, useEffect } from "react";
import { getModules, getLICs } from "../../services/ADMIN_Service/freeTimeSlotService";
import "../../styles/AD_Styles/Forms.css";

const FreeTimeSlotForm = ({ onSubmit, slotData, isEditing, onCancel }) => {
  const [formData, setFormData] = useState({
    module_code: "",
    academic_year: "",
    semester: "Semester 1",
    week_start_date: "",
    week_end_date: "",
    date: "",
    start_time: "",
    end_time: "",
    venue_name: "",
    allocated_to: "",
    status: "available"
  });
  
  const [modules, setModules] = useState([]);
  const [lics, setLICs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("Fetching form data...");
        const [moduleData, licData] = await Promise.all([
          getModules(),
          getLICs()
        ]);
        
        console.log("Modules fetched:", moduleData);
        console.log("LICs fetched:", licData);
        
        setModules(moduleData);
        setLICs(licData);
      } catch (err) {
        console.error("Data fetch error:", err);
        setError(err.message || "Failed to load data. Please try again.");
        
        // Only set fallback data for modules, not for LICs
        setModules([
          { module_code: "IT1040", module_name: "Database Systems" },
          { module_code: "IT4010", module_name: "Software Engineering" },
          { module_code: "IT4020", module_name: "Machine Learning" },
          { module_code: "IT3050", module_name: "Computer Networks" },
          { module_code: "IT2020", module_name: "Operating Systems" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Populate form when editing existing slot
    if (isEditing && slotData) {
      // Format dates for form inputs
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
      };
      
      // Format times for form inputs
      const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 5); // HH:MM format
      };
      
      setFormData({
        module_code: slotData.module_code || "",
        academic_year: slotData.academic_year || "",
        semester: slotData.semester || "Semester 1",
        week_start_date: formatDate(slotData.week_start_date),
        week_end_date: formatDate(slotData.week_end_date),
        date: formatDate(slotData.date),
        start_time: formatTime(slotData.start_time),
        end_time: formatTime(slotData.end_time),
        venue_name: slotData.venue_name || "",
        allocated_to: slotData.allocated_to || "",
        status: slotData.status || "available"
      });
    }
  }, [isEditing, slotData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.module_code || !formData.date || !formData.start_time || 
        !formData.end_time || !formData.venue_name) {
      setError("Please fill all required fields");
      return;
    }
    
    // Check if end time is after start time
    if (formData.start_time >= formData.end_time) {
      setError("End time must be after start time");
      return;
    }
    
    onSubmit(formData);
  };

  if (loading && !isEditing) {
    return <div className="loading">Loading form data...</div>;
  }

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="slot-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="module_code">Module*</label>
            <select
              id="module_code"
              name="module_code"
              value={formData.module_code}
              onChange={handleChange}
              required
            >
              <option value="">Select Module</option>
              {modules.map(module => (
                <option key={module.module_code} value={module.module_code}>
                  {module.module_name} ({module.module_code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="academic_year">Academic Year*</label>
            <input
              id="academic_year"
              name="academic_year"
              type="text"
              value={formData.academic_year}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="semester">Semester*</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="venue_name">Venue Name*</label>
            <input
              id="venue_name"
              name="venue_name"
              type="text"
              value={formData.venue_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="week_start_date">Week Start Date*</label>
            <input
              id="week_start_date"
              name="week_start_date"
              type="date"
              value={formData.week_start_date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="week_end_date">Week End Date*</label>
            <input
              id="week_end_date"
              name="week_end_date"
              type="date"
              value={formData.week_end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Session Date*</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="allocated_to">Allocate to LIC</label>
            <select
              id="allocated_to"
              name="allocated_to"
              value={formData.allocated_to}
              onChange={handleChange}
              className={lics.length === 0 ? 'no-lics' : ''}
            >
              <option value="">Select LIC</option>
              {lics && lics.length > 0 ? (
                lics.map(lic => {
                  // Parse lic_modules if it's a string
                  const modules = typeof lic.lic_modules === 'string' 
                    ? JSON.parse(lic.lic_modules) 
                    : lic.lic_modules;
                  
                  return (
                    <option key={lic.lec_id} value={lic.lec_id}>
                      {`${lic.lec_name} (${lic.lec_id}) - ${modules ? modules.join(', ') : 'No modules'}`}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>No LICs available</option>
              )}
            </select>
            {lics && lics.length === 0 && (
              <div className="help-text" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                No LICs found in the system. Please add LICs first.
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_time">Start Time*</label>
            <input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="end_time">End Time*</label>
            <input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="submit-button">
            {isEditing ? "Update Time Slot" : "Add Time Slot"}
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FreeTimeSlotForm;

