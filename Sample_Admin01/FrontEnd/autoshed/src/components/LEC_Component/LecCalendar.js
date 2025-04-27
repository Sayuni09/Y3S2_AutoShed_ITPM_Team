import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/LEC_Styles/Lec_Calendar.css';
import LecCalendarService from '../../services/LEC_Services/LecCalendarService';

const LecCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecId, setLecId] = useState(null);

  // Extract lecturer ID from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setLecId(decodedToken.id);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Authentication error. Please login again.");
      }
    } else {
      setError("Not authenticated. Please login.");
    }
  }, []);

  // Fetch schedules once we have the lecturer ID
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!lecId) return; // Don't fetch if we don't have a lecturer ID yet
      
      try {
        setLoading(true);
        
        const response = await LecCalendarService.getAcceptedSchedules(lecId);
        
        if (response.success) {
          // Transform the data to match our events format
          const formattedEvents = response.schedules.map((schedule, index) => {
            // Format times for display
            const startTime = new Date(`2000-01-01T${schedule.start_time}`);
            const endTime = new Date(`2000-01-01T${schedule.end_time}`);
            
            const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return {
              id: index + 1,
              date: schedule.date,
              moduleCode: schedule.module_code,
              time: `${formattedStartTime} - ${formattedEndTime}`,
              venue: schedule.venue_name,
              batchGroup: schedule.batch,
              type: schedule.viva_type
            };
          });
          
          setEvents(formattedEvents);
        } else {
          throw new Error('Failed to fetch schedules');
        }
      } catch (err) {
        console.error('Error fetching lecturer schedules:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [lecId]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateString);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <span className="day-number">{day}</span>
          {dayEvents.length > 0 && (
            <div className="event-indicator">
              <span className="event-count">{dayEvents.length}</span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    const dateString = selectedDate.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  if (error) {
    return (
      <div className="exam-calendar-container error-container">
        <div className="error-message">
          <h3>Error Loading Calendar</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="reload-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-calendar-container">
      <div className="calendar-header">
        <h2>Presentation Calendar</h2>
        <div className="calendar-navigation">
          <button onClick={() => navigateMonth(-1)} className="nav-button">
            <ChevronLeft size={20} />
          </button>
          <span className="current-month">{formatDate(currentDate)}</span>
          <button onClick={() => navigateMonth(1)} className="nav-button">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading presentation schedule...</p>
        </div>
      ) : (
        <>
          <div className="calendar-grid">
            <div className="weekday-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {generateCalendarDays()}
            </div>
          </div>

          {selectedDate && (
            <div className="selected-date-events">
              <h3>Schedules for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              <div className="events-list">
                {getSelectedDateEvents().length > 0 ? (
                  getSelectedDateEvents().map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <CalendarIcon size={16} />
                        <span className="module-code">{event.moduleCode}</span>
                        <span className="event-type">{event.type}</span>
                      </div>
                      <div className="event-details">
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{event.venue}</span>
                        </div>
                        <div className="detail-item">
                          <Users size={16} />
                          <span>{event.batchGroup}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-events">No schedules for this date</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LecCalendar;