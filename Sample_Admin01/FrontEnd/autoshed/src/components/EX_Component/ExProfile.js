import React, { useState, useEffect } from 'react';
import '../../styles/EX_Styles/ExProfile.css';
import { 
    User, 
    Mail, 
    Phone, 
    Book, 
    Calendar,
    Edit2,
    Save,
    X
} from 'lucide-react';

const ExProfile = () => {
    const [examiner, setExaminer] = useState({
        examiner_id: '',
        examiner_name: '',
        examiner_email: '',
        phone_number: '',
        module_codes: [],
        created_at: ''
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        // Fetch examiner data from token
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            // In a real app, you would fetch the complete profile using the ID/email
            setExaminer({
                examiner_id: decodedToken.id || 'EX001',
                examiner_name: decodedToken.name || 'John Doe',
                examiner_email: decodedToken.email || 'john@example.com',
                phone_number: '+1234567890',
                module_codes: ['MOD101', 'MOD102', 'MOD103'],
                created_at: new Date().toISOString()
            });
        }
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData(examiner);
    };

    const handleSave = async () => {
        try {
            // In a real app, make API call to update profile
            setExaminer(editedData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {examiner.examiner_name.charAt(0)}
                </div>
                <div className="profile-title">
                    <h1>Examiner Profile</h1>
                    {!isEditing ? (
                        <button className="edit-button" onClick={handleEdit}>
                            <Edit2 size={16} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="save-button" onClick={handleSave}>
                                <Save size={16} />
                                Save
                            </button>
                            <button className="cancel-button" onClick={handleCancel}>
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">
                                <User size={18} />
                                <span>Name</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="examiner_name"
                                    value={editedData.examiner_name}
                                    onChange={handleChange}
                                    className="edit-input"
                                />
                            ) : (
                                <div className="info-value">{examiner.examiner_name}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <div className="info-label">
                                <Mail size={18} />
                                <span>Email</span>
                            </div>
                            <div className="info-value">{examiner.examiner_email}</div>
                        </div>

                        <div className="info-item">
                            <div className="info-label">
                                <Phone size={18} />
                                <span>Phone</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={editedData.phone_number}
                                    onChange={handleChange}
                                    className="edit-input"
                                />
                            ) : (
                                <div className="info-value">{examiner.phone_number}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <div className="info-label">
                                <Book size={18} />
                                <span>Examiner ID</span>
                            </div>
                            <div className="info-value">{examiner.examiner_id}</div>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Module Information</h2>
                    <div className="module-grid">
                        {examiner.module_codes.map((module, index) => (
                            <div key={index} className="module-item">
                                <Book size={18} />
                                <span>{module}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Account Information</h2>
                    <div className="info-item">
                        <div className="info-label">
                            <Calendar size={18} />
                            <span>Member Since</span>
                        </div>
                        <div className="info-value">
                            {new Date(examiner.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExProfile;