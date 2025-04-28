import React, { useState } from "react";
import "../styles/AD_Styles/Tables.css";

const FreeTimeSlotsList = ({ slots, onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState("all"); // "all", "available", or "booked"
  
  if (!slots || slots.length === 0) {
    return <div className="no-data">No time slots available</div>;
  }

  const availableSlots = slots.filter(slot => slot.status === "available");
  const bookedSlots = slots.filter(slot => slot.status === "booked");

  // Filter slots based on current view mode
  const slotsToDisplay = viewMode === "all" ? slots : 
                         viewMode === "available" ? availableSlots : 
                         bookedSlots;

  return (
    <div className="timeslots-management">
      
      <div className="view-controls">
        <div className="tabs">
          <button 
            className={`tab ${viewMode === "all" ? "active" : ""}`}
            onClick={() => setViewMode("all")}
          >
            ALL SLOTS ({slots.length})
          </button>
          <button 
            className={`tab ${viewMode === "available" ? "active" : ""}`}
            onClick={() => setViewMode("available")}
          >
            AVAILABLE ({availableSlots.length})
          </button>
          <button 
            className={`tab ${viewMode === "booked" ? "active" : ""}`}
            onClick={() => setViewMode("booked")}
          >
            BOOKED ({bookedSlots.length})
          </button>
        </div>
        <div className="summary">
          <div className="summary-box available">
            <span className="count">{availableSlots.length}</span>
            <span className="label">Available</span>
          </div>
          <div className="summary-box booked">
            <span className="count">{bookedSlots.length}</span>
            <span className="label">Booked</span>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Date</th>
              <th>Time & Venue</th>
              <th>Academic Year</th>
              <th>Semester</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slotsToDisplay.map((slot) => (
              <tr key={slot.id} className={`slot-row ${slot.status}`}>
                <td>
                  <div className="cell-content">
                    <span className="module-code">{slot.module_code}</span>
                    <span className="module-name">{slot.module_name}</span>
                  </div>
                </td>
                <td>{new Date(slot.date).toLocaleDateString()}</td>
                <td>
                  <div className="time-venue-container">
                    <div className="time-row">
                      <span className="time-label">Time:</span>
                      <span className="time-value">
                        {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                      </span>
                    </div>
                    <div className="venue-row">
                      <span className="venue-label">Venue:</span>
                      <span className="venue-value">{slot.venue_name}</span>
                    </div>
                  </div>
                </td>
                <td>{slot.academic_year}</td>
                <td>{slot.semester}</td>
                <td>
                  <span className={`status-badge ${slot.status}`}>
                    {slot.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="edit-button" 
                    onClick={() => onEdit(slot)}
                    aria-label="Edit"
                  >
                    <i className="fa fa-pencil"></i>
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => onDelete(slot.id)}
                    aria-label="Delete"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FreeTimeSlotsList;
