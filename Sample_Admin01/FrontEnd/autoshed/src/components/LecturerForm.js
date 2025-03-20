import React, { useState, useEffect } from "react";
import { addLecturer, updateLecturer } from "../services/lecturerService";

const LecturerForm = ({ onSuccess, lecturerData, isEditing, onCancel }) => {
    const [formData, setFormData] = useState({
        lec_id: "", // lec_id can now be a string
        lec_name: "",
        lec_email: "",
        password: "",
        phone_number: "",
        lecture_modules: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (isEditing && lecturerData) {
            setFormData({
                lec_id: lecturerData.lec_id, // Allow editing of lec_id
                lec_name: lecturerData.lec_name,
                lec_email: lecturerData.lec_email,
                password: "", // Clear password for security
                phone_number: lecturerData.phone_number || "",
                lecture_modules: lecturerData.lecture_modules ? lecturerData.lecture_modules.join(", ") : "",
            });
        }
    }, [isEditing, lecturerData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const modulesArray = formData.lecture_modules.split(",").map(module => module.trim());
            if (isEditing) {
                await updateLecturer(formData.lec_id, { // Use the new lec_id
                    lec_id: formData.lec_id, // Include the new lec_id
                    lec_name: formData.lec_name, 
                    lec_email: formData.lec_email, 
                    password: formData.password, 
                    phone_number: formData.phone_number, 
                    lecture_modules: modulesArray 
                });
            } else {
                await addLecturer({ 
                    lec_id: formData.lec_id, 
                    lec_name: formData.lec_name, 
                    lec_email: formData.lec_email, 
                    password: formData.password, 
                    phone_number: formData.phone_number, 
                    lecture_modules: modulesArray 
                });
            }
            setSuccess("Lecturer added/updated successfully!");
            onSuccess();
        } catch (err) {
            setError(err);
            console.error("Error adding/updating lecturer:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lecturer-form-container">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="lec_id">Lecturer ID</label>
                    <input
                        id="lec_id"
                        name="lec_id"
                        type="text" // Allow any string input
                        value={formData.lec_id}
                        onChange={handleInputChange}
                        required={!isEditing}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lec_name">Name</label>
                    <input
                        id="lec_name"
                        name="lec_name"
                        type="text"
                        value={formData.lec_name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lec_email">Email</label>
                    <input
                        id="lec_email"
                        name="lec_email"
                        type="email"
                        value={formData.lec_email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!isEditing}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone_number">Phone</label>
                    <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lecture_modules">Lecture Modules (comma separated)</label>
                    <input
                        id="lecture_modules"
                        name="lecture_modules"
                        type="text"
                        value={formData.lecture_modules}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEditing ? "Update Lecturer" : "Add Lecturer"}
                </button>
                {isEditing && (
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Cancel
                    </button>
                )}
            </form>
        </div>
    );
};

export default LecturerForm;