import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/LEC_Styles/LecRequestRescheduls.css';
import LecRequestService from "../../services/LEC_Services/LecRequestService";

const LecRequestRescheduls = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRequests, setExpandedRequests] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lecturerId, setLecturerId] = useState('');

  // Extract lecturer ID from JWT token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setLecturerId(decodedToken.id);
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Authentication error. Please login again.');
      }
    } else {
      setError('Not authenticated. Please login.');
    }
  }, []);

  // Fetch reschedule requests when lecturer ID is available
  useEffect(() => {
    const fetchRequests = async () => {
      if (!lecturerId) return;
      
      setLoading(true);
      try {
        const rescheduleRequests = await LecRequestService.getLecturerRescheduleRequests(lecturerId);
        setRequests(rescheduleRequests);
      } catch (err) {
        console.error('Error fetching reschedule requests:', err);
        setError('Failed to load reschedule requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [lecturerId]);

  const toggleRequest = (requestId) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle size={20} className="status-icon pending" />;
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'accepted') {
      return <CheckCircle size={20} className="status-icon accepted" />;
    }
    
    if (normalizedStatus === 'rejected') {
      return <XCircle size={20} className="status-icon rejected" />;
    }
    
    return <AlertCircle size={20} className="status-icon pending" />;
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-badge pending';
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'accepted') {
      return 'status-badge accepted';
    }
    
    if (normalizedStatus === 'rejected') {
      return 'status-badge rejected';
    }
    
    return 'status-badge pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    const moduleCode = request.module_code || '';
    const moduleName = request.module_name || '';
    
    const matchesSearch = 
      moduleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moduleName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (loading) {
    return <div className="loading-message">Loading reschedule requests...</div>;
  }

  return (
    <div className="reschedule-requests-container">
      <div className="requests-header">
        <h2>Reschedule Requests</h2>
        <div className="filter-section">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">No reschedule requests found</div>
        ) : (
          filteredRequests.map(request => (
            <div key={request.request_id} className="request-card">
              <div 
                className="request-header"
                onClick={() => toggleRequest(request.request_id)}
              >
                <div className="request-main-info">
                  <div className="module-info">
                    <h3>{request.module_code}</h3>
                    <span className="module-name">{request.module_name}</span>
                  </div>
                  <div className="request-meta">
                    <span className={getStatusClass(request.status)}>
                      {getStatusIcon(request.status)}
                      {request.status && request.status.toLowerCase() === 'accepted' ? 'Accepted' : 
                       request.status && request.status.toLowerCase() === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedRequests[request.request_id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedRequests[request.request_id] && (
                <div className="request-details">
                  <div className="schedule-info">
                    <div className="info-row">
                      <Calendar size={20} />
                      <span>{formatDate(request.date)}</span>
                    </div>
                    <div className="info-row">
                      <Clock size={20} />
                      <span>{request.start_time} - {request.end_time}</span>
                    </div>
                    <div className="info-row">
                      <MapPin size={20} />
                      <span>{request.venue_name}</span>
                    </div>
                    <div className="info-row">
                      <Users size={20} />
                      <span>Type: {request.viva_type}</span>
                    </div>
                  </div>

                  <div className="request-reason">
                    <h4>Reason for Request</h4>
                    <p>{request.comment}</p>
                  </div>

                  {request.admin_response && (
                    <div className="admin-response">
                      <h4>Admin Response</h4>
                      <p>{request.admin_response}</p>
                    </div>
                  )}

                  <div className="request-timestamp">
                    <div>Requested on: {formatTimestamp(request.requested_at)}</div>
                    {request.responded_at && (
                      <div>Responded on: {formatTimestamp(request.responded_at)}</div>
                    )}
                  </div>
                  
                  {/* UPDATED BATCH GROUPS SECTION */}
                  {request.batch_groups && request.batch_groups.length > 0 && (
                    <div className="batch-groups-section">
                      <h4>Batch Groups</h4>
                      <div className="batch-groups-container">
                        {request.batch_groups.map(group => (
                          <div key={group.group_id} className="batch-group-card">
                            <div className="batch-group-header">
                              <span className="batch-id">{group.batch}</span>: {group.start_time} - {group.end_time} ({group.duration})
                            </div>
                            
                            <div className="batch-group-details">
                              {group.sub_groups && group.sub_groups.length > 0 && (
                                <div className="detail-row">
                                  <div className="detail-label">Sub Groups:</div>
                                  <div className="detail-content">
                                    {group.sub_groups.map(subGroup => (
                                      <span key={subGroup.id} className="detail-tag">{subGroup.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {group.lecturers && group.lecturers.length > 0 && (
                                <div className="detail-row">
                                  <div className="detail-label">Lecturers:</div>
                                  <div className="detail-content">
                                    {group.lecturers.map(lecturer => (
                                      <span key={lecturer.id} className="detail-tag">{lecturer.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {group.examiners && group.examiners.length > 0 && (
                                <div className="detail-row">
                                  <div className="detail-label">Examiners:</div>
                                  <div className="detail-content">
                                    {group.examiners.map(examiner => (
                                      <span key={examiner.id} className="detail-tag">{examiner.name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* END OF UPDATED BATCH GROUPS SECTION */}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LecRequestRescheduls;
