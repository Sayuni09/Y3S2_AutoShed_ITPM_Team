import React, { useState, useEffect } from "react";
import { addLic, updateLic } from "../services/licService";

const LicForm = ({ onSuccess, licData, isEditing, onCancel }) => {
    const [formData, setFormData] = useState({
        lec_id: "",
        lec_name: "",
        lec_email: "",
        password: "",
        phone_number: "",
        lic_modules: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
 if (isEditing && licData) {
            setFormData({
                lec_id: licData.lec_id,
                lec_name: licData.lec_name,
                lec_email: licData.lec_email,
                password: "", // Clear password for security
                phone_number: licData.phone_number || "",
                lic_modules: licData.lic_modules ? licData.lic_modules.join(", ") : "",
            });
        }
    }, [isEditing, licData]);

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
            const modulesArray = formData.lic_modules.split(",").map(module => module.trim());
            if (isEditing) {
                await updateLic(formData.lec_id, { 
                    lec_name: formData.lec_name, 
                    lec_email: formData.lec_email, 
                    password: formData.password, 
                    phone_number: formData.phone_number, 
                    lic_modules: modulesArray 
                });
            } else {
                await addLic({ 
                    lec_id: formData.lec_id, 
                    lec_name: formData.lec_name, 
                    lec_email: formData.lec_email, 
                    password: formData.password, 
                    phone_number: formData.phone_number, 
                    lic_modules: modulesArray 
                });
            }
            setSuccess("Lecturer in charge added/updated successfully!");
            onSuccess();
        } catch (err) {
            setError(err);
            console.error("Error adding/updating lecturer in charge:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lic-form-container">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="lec_id">Lecturer ID</label>
                    <input
                        id="lec_id"
                        name="lec_id"
                        type="text"
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
                    <label htmlFor="lic_modules">Lic Modules (comma separated)</label>
                    <input
                        id="lic_modules"
                        name="lic_modules"
                        type="text"
                        value={formData.lic_modules}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEditing ? "Update Lecturer in Charge" : "Add Lecturer in Charge"}
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

export default LicForm;