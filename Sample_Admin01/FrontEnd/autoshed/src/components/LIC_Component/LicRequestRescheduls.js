import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, FileText, BookOpen } from 'lucide-react';
import LicRequestService from '../../services/LIC_Services/LicRequestService';
import '../../styles/LIC_Styles/LicRequestRescheduls.css';


const LicRequestRescheduls = () => {
  // State for reschedule requests
  const [lecturerRequests, setLecturerRequests] = useState([]);
  const [examinerRequests, setExaminerRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRequests, setExpandedRequests] = useState({});
  const [activeTab, setActiveTab] = useState('lecturers');
  const [showViewModal, setShowViewModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  
  // State for user authentication
  const [licId, setLicId] = useState(null);

  // Get the LIC ID from JWT token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setLicId(decodedToken.id);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Authentication failed. Please login again.");
      }
    } else {
      setError("Not authenticated. Please login.");
    }
  }, []);

  const fetchRescheduleRequests = useCallback(async () => {
    if (!licId) return;
    
    setIsLoading(true);
    try {
      const response = await LicRequestService.getAllRescheduleRequests(licId);
      if (response.data.success) {
        setLecturerRequests(response.data.lecturerRequests || []);
        setExaminerRequests(response.data.examinerRequests || []);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching reschedule requests:', err);
      setError('Error fetching data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [licId]);

  useEffect(() => {
    if (licId) {
      fetchRescheduleRequests();
    }
  }, [licId, fetchRescheduleRequests]); 


  // Toggle expand/collapse for a request
  const toggleRequest = (requestId) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  // Handle view request details
  const handleViewDetails = async (request, type) => {
    try {
      setIsLoading(true);
      const requestId = request.request_id;
      const response = await LicRequestService.getRequestDetails(licId, type, requestId);
      
      if (response.data.success) {
        setRequestDetails(response.data.data);
        setShowViewModal(true);
      } else {
        console.error('Failed to get request details');
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change (accept/reject)
  const handleStatusChange = async (request, newStatus, requestType) => {
    setSelectedRequest({ request, newStatus, requestType });
    setAdminResponse('');
    setIsModalOpen(true);
  };

  // Submit response to reschedule request
  const submitResponse = async () => {
    if (!selectedRequest) return;
    
    const { request, newStatus, requestType } = selectedRequest;
    const requestId = request.request_id;
    
    try {
      setIsLoading(true);
      let response;
      
      if (requestType === 'lecturer') {
        response = await LicRequestService.respondToLecturerRequest(
          licId, 
          requestId, 
          newStatus, 
          adminResponse
        );
      } else {
        response = await LicRequestService.respondToExaminerRequest(
          licId, 
          requestId, 
          newStatus, 
          adminResponse
        );
      }
      
      if (response.data.success) {
        setResponseMessage(`Request ${newStatus} successfully`);
        setIsModalOpen(false);
        // Refresh the data
        fetchRescheduleRequests();
      } else {
        setResponseMessage('Failed to update request status');
      }
    } catch (err) {
      console.error(`Error updating ${requestType} request:`, err);
      setResponseMessage('Error updating request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear response message after a delay
  useEffect(() => {
    if (responseMessage) {
      const timeout = setTimeout(() => {
        setResponseMessage('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [responseMessage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle size={20} className="status-icon pending" />;
      case 'accepted':
        return <CheckCircle size={20} className="status-icon accepted" />;
      case 'rejected':
        return <XCircle size={20} className="status-icon rejected" />;
      default:
        return null;
    }
  };

  // Filter requests based on search term and status filter
  const filterRequests = (requests) => {
    return requests.filter(request => {
      const matchesSearch = 
        (request.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (request.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Render each request card with improved interactive design
  const renderRequestCard = (request, type) => {
    const isExpanded = expandedRequests[request.request_id] || false;
    
    return (
      <div key={request.request_id} className={`request-card ${isExpanded ? 'expanded' : ''}`}>
        <div 
          className="request-header"
          onClick={() => toggleRequest(request.request_id)}
        >
          <div className="request-main-info">
            <div className="module-info">
              <div className="module-header">
                <h3>{request.module_code}</h3>
                <span className="id-badge">
                  {type === 'lecturer' ? `Lecturer ID: ${request.lec_id}` : `Examiner ID: ${request.lec_id}`}
                </span>
                <span className="timestamp-badge">
                  Requested: {formatTimestamp(request.requested_at)}
                </span>
              </div>
              <span className="module-name">{request.module_name}</span>
            </div>
            <div className="request-meta">
              <span className={`status-badge ${request.status}`}>
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="expand-icon">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <div className={`request-details-wrapper ${isExpanded ? 'expanded' : ''}`}>
          <div className="request-details">
            <div className="schedule-info">
              <div className="info-card">
                <div className="info-card-header">
                  <Calendar size={20} />
                  <h4>Schedule Date</h4>
                </div>
                <div className="info-card-content">
                  {formatDate(request.date)}
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-header">
                  <Clock size={20} />
                  <h4>Time Slot</h4>
                </div>
                <div className="info-card-content">
                  {request.start_time} - {request.end_time}
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-header">
                  <MapPin size={20} />
                  <h4>Venue</h4>
                </div>
                <div className="info-card-content">
                  {request.venue_name}
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-header">
                  <BookOpen size={20} />
                  <h4>Viva Type</h4>
                </div>
                <div className="info-card-content">
                  {request.viva_type}
                </div>
              </div>
            </div>

            {request.batchGroups && request.batchGroups.length > 0 && (
              <div className="batch-groups">
                <h4 className="section-title">
                  <Users size={20} />
                  Batch Groups
                </h4>
                <div className="batch-groups-list">
                  {request.batchGroups.map((bg, index) => (
                    <div key={index} className="batch-group-item">
                      <span className="batch-name">{bg.batch}</span>
                      <span className="batch-time">{bg.start_time}-{bg.end_time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="request-reason">
              <h4 className="section-title">
                <AlertCircle size={20} />
                Reason for Request
              </h4>
              <div className="reason-text">
                {request.comment}
              </div>
            </div>

            {request.status === 'pending' && (
              <div className="action-buttons">
                <button 
                  className="accept-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(request, 'accepted', type);
                  }}
                >
                  <CheckCircle size={18} />
                  Accept
                </button>
                <button 
                  className="reject-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(request, 'rejected', type);
                  }}
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            )}
            
            <button 
              className="view-details-button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(request, type);
              }}
            >
              <FileText size={16} />
              View Complete Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading indicator
  if (isLoading && (!lecturerRequests.length && !examinerRequests.length)) {
    return <div className="loading-indicator">Loading reschedule requests...</div>;
  }

  // Error message
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="reschedule-requests-container">
      {responseMessage && (
        <div className={`response-message ${responseMessage.includes('successfully') ? 'success' : 'error'}`}>
          {responseMessage}
        </div>
      )}

      <div className="requests-header">
        <h2>Reschedule Requests</h2>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'lecturers' ? 'active' : ''}`}
            onClick={() => setActiveTab('lecturers')}
          >
            Lecturer Requests ({lecturerRequests.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'examiners' ? 'active' : ''}`}
            onClick={() => setActiveTab('examiners')}
          >
            Examiner Requests ({examinerRequests.length})
          </button>
        </div>
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
        {activeTab === 'lecturers' ? (
          filterRequests(lecturerRequests).length > 0 ? (
            filterRequests(lecturerRequests).map(request => renderRequestCard(request, 'lecturer'))
          ) : (
            <div className="no-requests-message">No lecturer reschedule requests found.</div>
          )
        ) : (
          filterRequests(examinerRequests).length > 0 ? (
            filterRequests(examinerRequests).map(request => renderRequestCard(request, 'examiner'))
          ) : (
            <div className="no-requests-message">No examiner reschedule requests found.</div>
          )
        )}
      </div>

      {/* Modal for accepting/rejecting requests */}
      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {selectedRequest.newStatus === 'accepted' ? 'Accept' : 'Reject'} 
              {' '}{selectedRequest.requestType === 'lecturer' ? 'Lecturer' : 'Examiner'} Request
            </h3>
            <p>
              You are about to <strong>{selectedRequest.newStatus}</strong> the reschedule request for 
              module <strong>{selectedRequest.request.module_code}</strong>.
            </p>
            <div className="response-input">
              <label>Response Message (Optional):</label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter a response message..."
                rows={4}
              />
            </div>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button 
                className={selectedRequest.newStatus === 'accepted' ? 'accept-button' : 'reject-button'}
                onClick={submitResponse}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Confirm ${selectedRequest.newStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing detailed information */}
      {showViewModal && requestDetails && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <h3>Request Details</h3>
            <div className="detail-section">
              <h4>Module Information</h4>
              <div className="detail-row">
                <span className="detail-label">Module Code:</span>
                <span className="detail-value">{requestDetails.module_code}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Module Name:</span>
                <span className="detail-value">{requestDetails.module_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{requestDetails.viva_type}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>{requestDetails.request_type === 'lecturer' ? 'Lecturer' : 'Examiner'} Information</h4>
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{requestDetails.lec_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{requestDetails.lec_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{requestDetails.lec_email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{requestDetails.phone_number || 'Not provided'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Schedule Information</h4>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(requestDetails.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{requestDetails.start_time} - {requestDetails.end_time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Venue:</span>
                <span className="detail-value">{requestDetails.venue_name}</span>
              </div>
            </div>

            {requestDetails.batchGroups && requestDetails.batchGroups.length > 0 && (
              <div className="detail-section">
                <h4>Batch Groups</h4>
                {requestDetails.batchGroups.map((group, index) => (
                  <div key={index} className="batch-group-item">
                    <div className="detail-row">
                      <span className="detail-label">Batch:</span>
                      <span className="detail-value">{group.batch}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{group.start_time} - {group.end_time} ({group.duration} min)</span>
                    </div>
                    {group.subGroups && group.subGroups.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Sub-groups:</span>
                        <span className="detail-value">{group.subGroups.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="detail-section">
              <h4>Request Information</h4>
              <div className="detail-row">
                <span className="detail-label">Requested At:</span>
                <span className="detail-value">{formatTimestamp(requestDetails.requested_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${requestDetails.status}`}>
                  {requestDetails.status.charAt(0).toUpperCase() + requestDetails.status.slice(1)}
                </span>
              </div>
              {requestDetails.responded_at && (
                <div className="detail-row">
                  <span className="detail-label">Responded At:</span>
                  <span className="detail-value">{formatTimestamp(requestDetails.responded_at)}</span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4>Request Comment</h4>
              <div className="comment-box">{requestDetails.comment || 'No comment provided'}</div>
            </div>

            {requestDetails.admin_response && (
              <div className="detail-section">
                <h4>Your Response</h4>
                <div className="comment-box">{requestDetails.admin_response}</div>
              </div>
            )}

            {requestDetails.status === 'pending' && (
              <div className="modal-action-buttons">
                <button 
                  className="accept-button"
                  onClick={() => {
                    setShowViewModal(false);
                    handleStatusChange(requestDetails, 'accepted', requestDetails.request_type);
                  }}
                >
                  Accept Request
                </button>
                <button 
                  className="reject-button"
                  onClick={() => {
                    setShowViewModal(false);
                    handleStatusChange(requestDetails, 'rejected', requestDetails.request_type);
                  }}
                >
                  Reject Request
                </button>
              </div>
            )}
            
            <button className="close-modal-button" onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicRequestRescheduls;
