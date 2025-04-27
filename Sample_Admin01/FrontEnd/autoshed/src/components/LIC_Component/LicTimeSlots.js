import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, ChevronDown } from 'lucide-react';

import LicTimeSlotsService from '../../services/LIC_Services/LicTimeSlotsService';
import '../../styles/LIC_Styles/LicTimeSlots.css';
import '../../components/LIC_Component/LicNewSchedules';


const LicTimeSlots = ({ onBookSlot }) => {
  
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState(null);
  const [lec_id, setLecturerId] = useState('');

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
    const fetchTimeSlots = async () => {
      try {
        const slots = await LicTimeSlotsService.getLicTimeSlots(lec_id);
        setTimeSlots(slots);
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
      }
    };

    if (lec_id) {
      fetchTimeSlots();
    }
  }, [lec_id]);

  const getStatusColor = (status) => {
    const statusColors = {
      available: 'status-available',
      booked: 'status-booked'
    };
    return statusColors[status] || '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTimeSlots = timeSlots.filter(slot => {
    const matchesSearch = 
      slot.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.venue_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || slot.status === filterStatus;
    const matchesModule = selectedModule === 'all' || slot.module_code === selectedModule;
    return matchesSearch && matchesStatus && matchesModule;
  });

  const modules = [...new Set(timeSlots.map(slot => slot.module_code))];

  const handleBookSlot = async (slot) => {
    if (slot.status === 'available' && onBookSlot) {
      const lecturers = await LicTimeSlotsService.getAvailableLecturersForTimeSlot(slot.id);
      const examiners = await LicTimeSlotsService.getAvailableExaminersForTimeSlot(slot.id);
      onBookSlot({ ...slot, lecturers, examiners });
    }
  };

  return (
    <div className="timeslots-container">
      {error && <div className="error-message">{error}</div>}
      <div className="timeslots-header">
        <h1>Available Time Slots</h1>
        <div className="filters-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by module or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              {/* <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option> */}
            </select>
            <ChevronDown size={16} />
          </div>

          <div className="module-dropdown">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="timeslots-grid">
        {filteredTimeSlots.length > 0 ? (
          filteredTimeSlots.map((slot, index) => (
            <div key={index} className="timeslot-card">
              <div className={`status-badge ${getStatusColor(slot.status)}`}>
                {slot.status}
              </div>
              
              <div className="card-header">
                <h2>{slot.module_code}</h2>
                <span>{slot.semester}</span>
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <Calendar size={18} />
                  <span>{formatDate(slot.date)}</span>
                </div>
                
                <div className="detail-item">
                  <Clock size={18} />
                  <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                </div>
                
                <div className="detail-item">
                  <MapPin size={18} />
                  <span>{slot.venue_name}</span>
                </div>
              </div>

              <button 
                className={`action-button ${slot.status !== 'available' ? 'disabled' : ''}`}
                disabled={slot.status !== 'available'}
                onClick={() => handleBookSlot(slot)}
              >
                Book Slot
              </button>
            </div>
          ))
        ) : (
          <div className="no-slots-message">No time slots available matching your criteria.</div>
        )}
      </div>
    </div>
  );
};

export default LicTimeSlots;
