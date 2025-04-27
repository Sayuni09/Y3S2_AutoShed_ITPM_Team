import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, UserCheck, CheckCircle, Search } from 'lucide-react';
import '../../styles/LEC_Styles/LecConfirmedSchedules.css';

const LecConfirmedSchedules = () => {
  // Mock data with confirmed schedules
  const [modules] = useState([
    {
      moduleCode: 'IT1010',
      moduleName: 'Fundamentals of Programming',
      schedules: [
        {
          id: 1,
          date: '2024-04-01',
          time: '10:00 AM - 01:00 PM',
          venue: 'Room A101',
          batchGroup: 'LEC.IT.01.01',
          examType: 'Midterm Exam',
          assignedLecturers: ['Dr. John Doe'],
          assignedExaminers: ['Prof. Jane Smith'],
          duration: '3 hours',
          status: 'Confirmed'
        },
        {
          id: 2,
          date: '2024-04-02',
          time: '02:00 PM - 05:00 PM',
          venue: 'Room A102',
          batchGroup: 'LEC.IT.01.02',
          examType: 'Final Exam',
          assignedLecturers: ['Dr. John Doe'],
          assignedExaminers: ['Prof. Jane Smith'],
          duration: '3 hours',
          status: 'Confirmed'
        }
      ]
    },
    {
      moduleCode: 'IT2020',
      moduleName: 'Data Structures',
      schedules: [
        {
          id: 3,
          date: '2024-04-03',
          time: '09:00 AM - 12:00 PM',
          venue: 'Room A103',
          batchGroup: 'LEC.IT.02.01',
          examType: 'Practical Exam',
          assignedLecturers: ['Dr. Alice Brown'],
          assignedExaminers: ['Prof. Bob White'],
          duration: '3 hours',
          status: 'Confirmed'
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const filteredModules = modules.filter(module =>
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

  return (
    <div className="confirmed-schedules-container">
      <div className="header">
        <div className="header-content">
          <h2>Confirmed Lecture Schedules</h2>
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

      <div className="modules-grid">
        {filteredModules.map(module => (
          <div key={module.moduleCode} className="module-section">
            <div className="module-header">
              <h3>{module.moduleCode}</h3>
              <span className="module-name">{module.moduleName}</span>
              <div className="schedule-count">
                {module.schedules.length} schedule(s)
              </div>
            </div>
            <div className="schedules-grid">
              {module.schedules.map(schedule => (
                <div
                  key={schedule.id}
                  className="schedule-card"
                  onClick={() => handleViewSchedule(schedule)}
                >
                  <div className="schedule-status">
                    <CheckCircle size={16} />
                    <span>{schedule.status}</span>
                  </div>
                  <div className="schedule-details">
                    <div className="detail-row">
                      <Calendar size={16} />
                      <span>{formatDate(schedule.date)}</span>
                    </div>
                    <div className="detail-row">
                      <Clock size={16} />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span>{schedule.venue}</span>
                    </div>
                    <div className="detail-row">
                      <Users size={16} />
                      <span>{schedule.batchGroup}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedSchedule && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Details</h2>
              <div className="status-badge">
                <CheckCircle size={16} />
                <span>Confirmed</span>
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
                <span>{selectedSchedule.time}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Venue & Batch</h3>
              <div className="detail-row">
                <MapPin size={20} />
                <span>{selectedSchedule.venue}</span>
              </div>
              <div className="detail-row">
                <Users size={20} />
                <span>Batch Group: {selectedSchedule.batchGroup}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>Examination Details</h3>
              <div className="detail-row">
                <strong>Type:</strong> {selectedSchedule.examType}
              </div>
              <div className="detail-row">
                <UserCheck Check size={20} />
                <div className="assigned-staff">
                  <p><strong>Assigned Lecturers:</strong></p>
                  <ul>
                    {selectedSchedule.assignedLecturers.map((lecturer, index) => (
                      <li key={index}>{lecturer}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="detail-row">
                <UserCheck Check size={20} />
                <div className="assigned-staff">
                  <p><strong>Assigned Examiners:</strong></p>
                  <ul>
                    {selectedSchedule.assignedExaminers.map((examiner, index) => (
                      <li key={index}>{examiner}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="detail-row">
                <Clock size={20} />
                <span><strong>Duration:</strong> {selectedSchedule.duration}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecConfirmedSchedules;