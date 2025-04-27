import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Eye, Search, Calendar, AlertCircle, Edit } from 'lucide-react';
import exAvailabilityService from '../../services/EX_Services/ExAvailabilityService';
import '../../styles/EX_Styles/Ex_Avalability_Sent.css';

const ExAvailabilitySent = () => {
    const [availabilityForms, setAvailabilityForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [examinerId, setExaminerId] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editSlots, setEditSlots] = useState([]);
    const [editComments, setEditComments] = useState('');
    const [slotsToDelete, setSlotsToDelete] = useState([]);

    // Extract examiner ID from JWT token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setExaminerId(decodedToken.id);
            } catch (err) {
                console.error("Error decoding token:", err);
                setError("Authentication error. Please login again.");
            }
        } else {
            setError("Not authenticated. Please login.");
        }
    }, []);

    // Fetch availability forms when examiner ID is available
    const fetchAvailabilityForms = useCallback(async () => {
        if (!examinerId) return;

        try {
            setLoading(true);
            const data = await exAvailabilityService.getAvailability(examinerId);
            setAvailabilityForms(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch availability forms. Please try again.');
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }, [examinerId]);

    useEffect(() => {
        if (examinerId) {
            fetchAvailabilityForms();
        }
    }, [examinerId, fetchAvailabilityForms]);

    // Handle search functionality
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter forms based on search term
    const filteredForms = availabilityForms.filter(form =>
        form.form_id.toString().includes(searchTerm) ||
        form.slots.some(slot => {
            const date = new Date(slot.available_date);
            const dateStr = date.toLocaleDateString();
            return dateStr.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    // Handle deleting a form
    const handleDelete = async (form_id) => {
        if (window.confirm('Are you sure you want to delete this availability form?')) {
            try {
                setLoading(true);
                await exAvailabilityService.deleteAvailability(form_id);
                setSuccess('Availability form deleted successfully');
                setTimeout(() => setSuccess(''), 3000);
                await fetchAvailabilityForms();
            } catch (err) {
                setError('Failed to delete form. Please try again.');
                console.error("Delete Error:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle viewing a form
    const handleView = (form) => {
        setSelectedForm(form);
        setIsEditMode(false); // Ensure it's not in edit mode when viewing
    };

    // Handle editing a slot
    const handleEdit = (form) => {
        const clonedSlots = JSON.parse(JSON.stringify(form.slots));
        setEditSlots(clonedSlots);
        setEditComments(form.comments || '');
        setSlotsToDelete([]);
        setIsEditMode(true);
        setSelectedForm(form);
    };

    // Handle saving edited slots
    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            await exAvailabilityService.updateAvailability(
                selectedForm.form_id, 
                editComments, 
                editSlots,
                slotsToDelete
            );
            setSuccess('Availability updated successfully');
            setTimeout(() => setSuccess(' '), 3000);
            await fetchAvailabilityForms();
            setIsEditMode(false);
            setSelectedForm(null); // Close the details view after saving
        } catch (err) {
            setError('Failed to update availability. Please try again.');
            console.error("Update Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle removing a slot
    const handleRemoveSlot = (slotIndex) => {
        const slot = editSlots[slotIndex];
        if (slot.slot_id) {
            setSlotsToDelete(prev => [...prev, slot.slot_id]);
        }
        setEditSlots(prev => prev.filter((_, index) => index !== slotIndex));
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (err) {
            console.error("Date formatting error:", err);
            return 'Error formatting date';
        }
    };

    // Close modal
    const closeModal = () => {
        setIsEditMode(false);
        setSelectedForm(null);
    };

    // Render loading state
    if (loading && !availabilityForms.length) {
        return (
            <div className="availability-sent-container">
                <div className="loading">Loading availability data...</div>
            </div>
        );
    }

    // Render error state
    if (error && !availabilityForms.length) {
        return (
            <div className="availability-sent-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="availability-sent-container">
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <div className="header">
                <h2>My Submitted Availability Forms</h2>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by date or form ID..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {loading && <div className="loading-overlay">Updating...</div>}

            <div className="forms-grid">
                {filteredForms.length > 0 ? (
                    filteredForms.map(form => (
                        <div key={form.form_id} className="form-card">
                            <div className="form-card-header">
                                <div className="form-info">
                                    <AlertCircle size={20} />
                                    <h3>Form #{form.form_id}</h3>
                                </div>
                                <span className="submission-date">
                                    Submitted: {formatDate(form.created_at)}
                                </span>
                            </div>
                            
                            <div className="form-card-content">
                                {form.slots.slice(0, 3).map((slot, index) => (
                                    <div key={index} className="info-row">
                                        <Calendar size={16} />
                                        <span>Date: {formatDate(slot.available_date)}</span>
                                        <div className="slot-info">
                                            <span className={slot.morning_slot ? "active-slot" : "inactive-slot"}>Morning</span>
                                            <span className={slot.mid_day_slot ? "active-slot" : "inactive-slot"}>Mid-day</span>
                                            <span className={slot.afternoon_slot ? "active-slot" : "inactive-slot"}>Afternoon</span>
                                        </div>
                                        <span className="sessions-info">Max: {slot.max_sessions_per_day} sessions</span>
                                    </div>
                                ))}
                                {form.slots.length > 3 && (
                                    <div className="more-indicator">
                                        +{form.slots.length - 3} more dates...
                                    </div>
                                )}
                                {form.comments && (
                                    <div className="comments-preview">
                                        <strong>Comments:</strong> {form.comments.slice(0, 50)}
                                        {form.comments.length > 50 ? '...' : ''}
                                    </div>
                                )}
                            </div>

                            <div className="form-card-actions">
                                <button onClick={() => handleView(form)} className="view-btn">
                                    <Eye size={16} />
                                    View
                                </button>
                                <button onClick={() => handleEdit(form)} className="edit-btn">
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(form.form_id)} className="delete-btn">
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-forms">
                        {searchTerm ? 'No forms match your search' : 'No availability forms found'}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {selectedForm && !isEditMode && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Availability Form Details</h2>
                        <div className="modal-section">
                            <h3>Form ID: {selectedForm.form_id}</h3>
                            <p><strong>Submitted:</strong> {formatDate(selectedForm.created_at)}</p>
                            {selectedForm.comments && (
                                <div className="comments-section">
                                    <h4>Comments:</h4>
                                    <p>{selectedForm.comments}</p>
                                </div>
                            )}
                            <h4>Available Dates and Slots:</h4>
                            {selectedForm.slots.map((slot, index) => (
                                <div key={index} className="slot-detail">
                                    <h5>Date: {formatDate(slot.available_date)}</h5>
                                    <div className="slot-status">
                                        <span className={slot.morning_slot ? "active-slot" : "inactive-slot"}>
                                            Morning: {slot.morning_slot ? 'Available' : 'Unavailable'}
                                        </span>
                                        <span className={slot.mid_day_slot ? "active-slot" : "inactive-slot"}>
                                            Mid-day: {slot.mid_day_slot ? 'Available' : 'Unavailable'}
                                        </span>
                                        <span className={slot.afternoon_slot ? "active-slot" : "inactive-slot"}>
                                            Afternoon: {slot.afternoon_slot ? 'Available' : 'Unavailable'}
                                        </span>
                                        <span className="max-sessions">
                                            Max Sessions Per Day: {slot.max_sessions_per_day}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModal} className="close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditMode && selectedForm && (
                <div className="modal-overlay" onClick={() => setIsEditMode(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Edit Availability Form</h2>
                        <div className="modal-section">
                            <h3>Form ID: {selectedForm.form_id}</h3>
                            
                            <div className="form-comments">
                                <h4>Comments:</h4>
                                <textarea
                                    value={editComments}
                                    onChange={(e) => setEditComments(e.target.value)}
                                    rows={3}
                                    placeholder="Add your comments here..."
                                />
                            </div>
                            
                            <h4>Edit Available Dates and Slots:</h4>
                            {editSlots.map((slot, index) => (
                                <div key={index} className="slot-edit">
                                    <div className="slot-edit-header">
                                        <h5>Date:</h5>
                                        <input
                                            type="date"
                                            value={slot.available_date}
                                            onChange={(e) => {
                                                const updatedSlots = [...editSlots];
                                                updatedSlots[index].available_date = e.target.value;
                                                setEditSlots(updatedSlots);
                                            }}
                                        />
                                        <button 
                                            onClick={() => handleRemoveSlot(index)} 
                                            className="remove-slot-btn"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="slot-edit-options">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={slot.morning_slot}
                                                onChange={() => {
                                                    const updatedSlots = [...editSlots];
                                                    updatedSlots[index].morning_slot = !updatedSlots[index].morning_slot;
                                                    setEditSlots(updatedSlots);
                                                }}
                                            />
                                            Morning
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={slot.mid_day_slot}
                                                onChange={() => {
                                                    const updatedSlots = [...editSlots];
                                                    updatedSlots[index].mid_day_slot = !updatedSlots[index].mid_day_slot;
                                                    setEditSlots(updatedSlots);
                                                }}
                                            />
                                            Mid Day
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={slot.afternoon_slot}
                                                onChange={() => {
                                                    const updatedSlots = [...editSlots];
                                                    updatedSlots[index].afternoon_slot = !updatedSlots[index].afternoon_slot;
                                                    setEditSlots(updatedSlots);
                                                }}
                                            />
                                            Afternoon
                                        </label>
                                        <label>
                                            Max Sessions:
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={slot.max_sessions_per_day}
                                                onChange={(e) => {
                                                    const updatedSlots = [...editSlots];
                                                    updatedSlots[index].max_sessions_per_day = parseInt(e.target.value, 10) || 1;
                                                    setEditSlots(updatedSlots);
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleSaveEdit} className="save-btn">
                                Save Changes
                            </button>
                            <button onClick={() => setIsEditMode(false)} className="cancel-btn">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExAvailabilitySent;