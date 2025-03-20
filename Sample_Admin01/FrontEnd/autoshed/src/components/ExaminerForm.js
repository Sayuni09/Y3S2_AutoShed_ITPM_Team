import React, { useState, useEffect } from "react";
import { addExaminer, updateExaminer } from "../services/examinerService";

const ExaminerForm = ({ onSuccess, examinerData, isEditing, onCancel }) => {
    const [formData, setFormData] = useState({
        examiner_id: "",
        examiner_name: "",
        examiner_email: "",
        password: "",
        phone_number: "",
        module_codes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (isEditing && examinerData) {
            const moduleCodesString = typeof examinerData.module_codes === 'string' 
                ? JSON.parse(examinerData.module_codes).join(", ") 
                : Array.isArray(examinerData.module_codes) 
                    ? examinerData.module_codes.join(", ") 
                    : "";
                    
            setFormData({
                examiner_id: examinerData.examiner_id,
                examiner_name: examinerData.examiner_name,
                examiner_email: examinerData.examiner_email,
                password: "", // Clear password for security
                phone_number: examinerData.phone_number || "",
                module_codes: moduleCodesString,
            });
        }
    }, [isEditing, examinerData]);

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
            const modulesArray = formData.module_codes
                ? formData.module_codes.split(",").map(module => module.trim())
                : [];
                
            if (isEditing) {
                await updateExaminer(examinerData.examiner_id, { 
                    examiner_id: formData.examiner_id,
                    examiner_name: formData.examiner_name, 
                    examiner_email: formData.examiner_email, 
                    password: formData.password, 
                    phone_number: formData.phone_number, 
                    module_codes: modulesArray 
                });
                setSuccess("Examiner updated successfully!");
            } else {
                await addExaminer({ 
                    examiner_id: formData.examiner_id, 
                    examiner_name: formData.examiner_name, 
                    examiner_email: formData.examiner_email, 
                    password: formData.password, 
                    phone_number: formData.phone_number, 
                    module_codes: modulesArray 
                });
                setSuccess("Examiner added successfully!");
            }
            onSuccess();
        } catch (err) {
            setError(err);
            console.error("Error adding/updating examiner:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="examiner-form-container">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="examiner_id">Examiner ID</label>
                    <input
                        id="examiner_id"
                        name="examiner_id"
                        type="text"
                        value={formData.examiner_id}
                        onChange={handleInputChange}
                        required={!isEditing}
                        disabled={isEditing} // Disable ID field when editing
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="examiner_name">Name</label>
                    <input
                        id="examiner_name"
                        name="examiner_name"
                        type="text"
                        value={formData.examiner_name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="examiner_email">Email</label>
                    <input
                        id="examiner_email"
                        name="examiner_email"
                        type="email"
                        value={formData.examiner_email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        Password {isEditing && "(leave blank to keep current)"}
                    </label>
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
                    <label htmlFor="module_codes">Module Codes (comma separated)</label>
                    <input
                        id="module_codes"
                        name="module_codes"
                        type="text"
                        value={formData.module_codes}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEditing ? "Update Examiner" : "Add Examiner"}
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

export default ExaminerForm;