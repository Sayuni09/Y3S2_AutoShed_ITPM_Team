import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Send } from 'lucide-react';
import '../../styles/EX_Styles/ExRequestComment.css';
import ExRequestService from '../../services/EX_Services/ExRequestService';

const ExRequestComment = ({ schedule, onClose, onSubmit, examinerId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Call the API service to submit the reschedule request
      const response = await ExRequestService.submitRescheduleRequest(
        schedule.id, 
        examinerId, 
        comment
      );

      // Call the parent component's onSubmit handler with the response
      onSubmit(response);
      onClose();
    } catch (err) {
      console.error('Error submitting reschedule request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="request-comment-overlay">
      <div className="request-comment-modal">
        <div className="modal-header">
          <h2>Request Reschedule</h2>
          <button className="close-button" onClick={onClose} disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        <div className="schedule-details">
          <div className="module-info">
            <h3>{schedule.moduleCode}</h3>
            <span>{schedule.moduleName}</span>
          </div>
          <div className="detail-item">
            <Calendar size={20} />
            <span>{formatDate(schedule.date)}</span>
          </div>
          <div className="detail-item">
            <Clock size={20} />
            <span>{schedule.startTime} - {schedule.endTime}</span>
          </div>
          <div className="detail-item">
            <MapPin size={20} />
            <span>{schedule.venue}</span>
          </div>
          <div className="detail-item">
            <Users size={20} />
            <span>Type: {schedule.examType}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="comment-form">
          <div className="form-group">
            <label htmlFor="comment">Reason for Reschedule Request</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please provide a detailed reason for your reschedule request..."
              required
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            <Send size={20} />
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExRequestComment;