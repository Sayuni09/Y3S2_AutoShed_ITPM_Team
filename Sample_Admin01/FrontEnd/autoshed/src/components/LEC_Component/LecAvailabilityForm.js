import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Plus, Minus, Save, Clock } from 'lucide-react';
import lecAvailabilityService from '../../services/LEC_Services/LecAvailabilityService';
import '../../styles/LEC_Styles/Lec_Availability_Form.css';

const LecAvailabilityForm = () => {
    const [user, setUser ] = useState({ lec_id: '' });
    const [availabilityDates, setAvailabilityDates] = useState([{
        available_date: '',
        morning_slot: false,
        mid_day_slot: false,
        afternoon_slot: false,
        max_sessions_per_day: 2
    }]);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setUser ({ name: decodedToken.name, lec_id: decodedToken.id });
        }
    }, []);

    const addDateRow = () => {
        setAvailabilityDates([...availabilityDates, {
            available_date: '',
            morning_slot: false,
            mid_day_slot: false,
            afternoon_slot: false,
            max_sessions_per_day: 2
        }]);
    };

    const removeDateRow = (index) => {
        if (availabilityDates.length > 1) {
            const newDates = availabilityDates.filter((_, i) => i !== index);
            setAvailabilityDates(newDates);
        }
    };

    const handleDateChange = (index, value) => {
        const newDates = [...availabilityDates];
        newDates[index].available_date = value;
        setAvailabilityDates(newDates);
    };

    const handleSlotChange = (index, slot) => {
        const newDates = [...availabilityDates];
        newDates[index][slot] = !newDates[index][slot];
        setAvailabilityDates(newDates);
    };

    const handleMaxSessionsChange = (index, value) => {
        const newDates = [...availabilityDates];
        newDates[index].max_sessions_per_day = parseInt(value);
        setAvailabilityDates(newDates);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await lecAvailabilityService.submitAvailability(user.lec_id, comments, availabilityDates);
            setSuccess('Availability submitted successfully!');

            // Reset form
            setAvailabilityDates([{
                available_date: '',
                morning_slot: false,
                mid_day_slot: false,
                afternoon_slot: false,
                max_sessions_per_day: 2
            }]);
            setComments('');
        } catch (err) {
            setError(err.message || 'Error submitting availability');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="availability-form-container">
            <form onSubmit={handleSubmit} className="availability-form">
                <h2 className="form-title">Lecturer Availability Form</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-section">
                    <h3>
                        <span className="section-icon"><AlertCircle size={20} /></span>
                        Lecturer Information
                    </h3>
                    <div className="input-group">
                        <label htmlFor="lec_id">Lecturer ID</label>
                        <input
                            type="text"
                            id="lec_id"
                            value={user.lec_id}
                            readOnly
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>
                        <span className="section-icon"><Calendar size={20} /></span>
                        Availability Details
                    </h3>
                    <div className="availability-table">
                        <div className="table-header">
                            <span>Date</span>
                            <span>Available Time Slots</span>
                            <span>Max Sessions</span>
                            <span>Actions</span>
                        </div>
                        {availabilityDates.map((dateRow, index) => (
                            <div key={index} className="date-row">
                                <input
                                    type="date"
                                    value={dateRow.available_date}
                                    onChange={(e) => handleDateChange(index, e.target.value)}
                                    required
                                />
                                <div className="time-slots">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={dateRow.morning_slot}
                                            onChange={() => handleSlotChange(index, 'morning_slot')}
                                        />
                                        9:00 AM - 12:00 PM
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={dateRow.mid_day_slot}
                                            onChange={() => handleSlotChange(index, 'mid_day_slot')}
                                        />
                                        1:00 PM - 4:00 PM
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={dateRow.afternoon_slot}
                                            onChange={() => handleSlotChange(index, 'afternoon_slot')}
                                        />
                                        5:00 PM - 8:00 PM
                                    </label>
                                </div>
                                <select
                                    value={dateRow.max_sessions_per_day}
                                    onChange={(e) => handleMaxSessionsChange(index, e.target.value)}
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>
                                <button
                                    type="button"
                                    className="remove-date"
                                    onClick={() => removeDateRow(index)}
                                    disabled={ availabilityDates.length === 1}
                                >
                                    <Minus size={16} />
                                </button>
                            </div>
                        ))}
                        <button type="button" className="add-date" onClick={addDateRow}>
                            <Plus size={16} /> Add Date
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h3>
                        <span className="section-icon"><Clock size={20} /></span>
                        Additional Information
                    </h3>
                    <div className="input-group">
                        <label htmlFor="comments">Comments</label>
                        <textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    <Save size={20} />
                    {loading ? 'Submitting...' : 'Submit Availability'}
                </button>
            </form>
        </div>
    );
};

export default LecAvailabilityForm;