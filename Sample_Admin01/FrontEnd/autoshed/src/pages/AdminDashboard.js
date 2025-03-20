import React, { useState, useEffect } from "react";
import { logout } from "../services/authService";
import { getAdmins, addAdmin, updateAdmin, deleteAdmin } from "../services/adminService";
import { getLecturers, deleteLecturer } from "../services/lecturerService"; 
import { getLic, deleteLic } from "../services/licService"; 
import { getExaminers, deleteExaminer } from "../services/examinerService";
import LecturerForm from "../components/LecturerForm"; 
import LicForm from "../components/LicForm"; 
import ExaminerForm from "../components/ExaminerForm";
import Navbar from "../components/Navbar";
import "../styles/Navbar.css";

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [admins, setAdmins] = useState([]);
    const [lecturers, setLecturers] = useState([]); 
    const [lics, setLics] = useState([]); // State for lecturers in charge
    const [examiners, setExaminers] = useState([]); 
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "admin"
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedLecturer, setSelectedLecturer] = useState(null); 
    const [selectedLic, setSelectedLic] = useState(null); // State for selected lecturer in charge
    const [selectedExaminer, setSelectedExaminer] = useState(null); 

    useEffect(() => {
        fetchAdmins();
        fetchLecturers(); 
        fetchLics(); // Fetch lecturers in charge on component mount
        fetchExaminers();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getAdmins();
            setAdmins(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch admin users: " + err);
            console.error("Error fetching admins:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturers = async () => {
        try {
            setLoading(true);
            const data = await getLecturers(); 
            setLecturers(data); 
            setError("");
        } catch (err) {
            setError("Failed to fetch lecturers: " + err);
            console.error("Error fetching lecturers:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLics = async () => { // Fetch lecturers in charge
        try {
            setLoading(true);
            const data = await getLic(); 
            setLics(data); 
            setError("");
        } catch (err) {
            setError("Failed to fetch lecturers in charge: " + err);
            console.error("Error fetching lecturers in charge:", err);
        } finally {
            setLoading(false);
        }
    };


    const fetchExaminers = async () => { 
        try {
            setLoading(true);
            const data = await getExaminers(); 
            setExaminers(data); 
            setError("");
        } catch (err) {
            setError("Failed to fetch examiners: " + err);
            console.error("Error fetching examiners:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        onLogout();
    };

    const handleNavChange = (tab) => {
        setActiveTab(tab);
        
        if (tab === "admins-list" || tab === "admins-add" || tab === "admins-roles") {
            setActiveTab("admins");
        }
        
        if (tab === "lecturers" || tab === "lecturers-add") {
            setActiveTab("lecturers");
        }

        if (tab === "lic" || tab === "lic-add") {
            setActiveTab("lic");
        }

        if (tab === "examiner" || tab === "examiner-add") {
            setActiveTab("examiner");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (isEditing) {
                await updateAdmin(formData.id, formData);
                setSuccess("Admin updated successfully!");
            } else {
                await addAdmin(formData);
                setSuccess("Admin added successfully!");
            }
            
            resetForm();
            fetchAdmins();
        } catch (err) {
            setError(err);
            console.error("Error saving admin:", err);
        } finally {
            setLoading(false);
        }
    };

    const editAdmin = (admin) => {
        setFormData({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            password: "", 
            phone: admin.phone || "",
            role: admin.role || "admin"
        });
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this admin user?")) {
            try {
                setLoading(true);
                await deleteAdmin(id);
                setSuccess("Admin deleted successfully!");
                fetchAdmins();
            } catch (err) {
                setError(err);
                console.error("Error deleting admin:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            id: "",
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "admin"
        });
        setIsEditing(false);
    };

    const handleLecturerFormSuccess = () => {
        fetchLecturers(); 
        setSelectedLecturer(null); 
    };

    const handleLicFormSuccess = () => {
        fetchLics(); 
        setSelectedLic(null); 
    };

    const handleExaminerFormSuccess = () => {
        fetchExaminers(); 
        setSelectedExaminer(null); 
    };

    const handleEditLecturer = (lecturer) => {
        setSelectedLecturer(lecturer);
        window.scrollTo(0, 0);
    };

    const handleDeleteLecturer = async (id) => {
        if (window.confirm("Are you sure you want to delete this lecturer?")) {
            try {
                setLoading(true);
                await deleteLecturer(id);
                setSuccess("Lecturer deleted successfully!");
                fetchLecturers();
            } catch (err) {
                setError(err);
                console.error("Error deleting lecturer:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditLic = (lic) => {
        setSelectedLic(lic);
        window.scrollTo(0, 0);
    };

    const handleDeleteLic = async (id) => {
        if (window.confirm("Are you sure you want to delete this lecturer in charge?")) {
            try {
                setLoading(true);
                await deleteLic(id);
                setSuccess("Lecturer in charge deleted successfully!");
                fetchLics();
            } catch (err) {
                setError(err);
                console.error("Error deleting lecturer in charge:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditExaminer = (examiner) => {
        setSelectedExaminer(examiner);
        window.scrollTo(0, 0);
    };

    const handleDeleteExaminer = async (id) => {
        if (window.confirm("Are you sure you want to delete this examiner?")) {
            try {
                setLoading(true);
                await deleteExaminer(id);
                setSuccess("Examiner deleted successfully!");
                fetchExaminers();
            } catch (err) {
                setError(err);
                console.error("Error deleting examiner:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="dashboard-overview">
                        <h2>Dashboard Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Admins</h3>
                                <p className="stat-value">{admins.length}</p>
                            </div>
                            {/* <div className="stat-card">
                                <h3>Total Lectures</h3>
                                <p className="stat-value">0</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total LICs</h3>
                                <p className="stat-value">0</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Examiners</h3>
                                <p className="stat-value">0</p>
                            </div> */}
                        </div>
                    </div>
                );
            case "admins":
                return (
                    <>
                        <div className="admin-form-container">
                            <h2>{isEditing ? "Edit Admin" : "Add New Admin"}</h2>
                            
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
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
                                    <label htmlFor="phone">Phone</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="form-buttons">
                                    <button type="submit" disabled={loading}>
                                        {loading ? "Saving..." : isEditing ? "Update Admin" : "Add Admin"}
                                    </button>
                                    
                                    {isEditing && (
                                        <button 
                                            type="button" 
                                            onClick={resetForm} 
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="admins-table-container">
                            <h2>Admin Users</h2>
                            
                            {loading && <p>Loading...</p>}
                            
                            {admins.length > 0 ? (
                                <table className="admins-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Role</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin) => (
                                            <tr key={admin.id}>
                                                <td>{admin.id}</td>
                                                <td>{admin.name}</td>
                                                <td>{admin.email}</td>
                                                <td>{admin.phone || "N/A"}</td>
                                                <td>{admin.role}</td>
                                                <td>{new Date(admin.created_at).toLocaleString()}</td>
                                                <td>
                                                    <button 
                                                        className="edit-button" 
                                                        onClick={() => editAdmin(admin)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="delete-button" 
                                                        onClick={() => handleDelete(admin.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No admin users found.</p>
                            )}
                        </div>
                    </>
                );
            case "lecturers":
                return (
                    <>
                        <div className="lecturer-form-container">
                            <h2>{selectedLecturer ? "Edit Lecturer" : "Add New Lecturer"}</h2>
                            <LecturerForm 
                                onSuccess={handleLecturerFormSuccess} 
                                lecturerData={selectedLecturer} 
                                isEditing={!!selectedLecturer} 
                                onCancel={() => setSelectedLecturer(null)} 
                            />
                        </div>

                        <div className="lecturers-table-container">
                            <h2>Lecturers</h2>
                            
                            {loading && <p>Loading...</p>}
                            
                            {lecturers.length > 0 ? (
                                <table className="lecturers-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Modules</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lecturers.map((lecturer) => (
                                            <tr key={lecturer.lec_id}>
                                                <td>{lecturer.lec_id}</td>
                                                <td>{lecturer.lec_name}</td>
                                                <td>{lecturer.lec_email}</td>
                                                <td>{lecturer.phone_number || "N/A"}</td>
                                                <td>
                                                    {lecturer.lecture_modules ? 
                                                        (typeof lecturer.lecture_modules === 'string' ? 
                                                            JSON.parse(lecturer.lecture_modules).join(", ") : 
                                                            lecturer.lecture_modules.join(", ")) 
                                                        : "N/A"}
                                                </td>   
                                                <td>{new Date(lecturer.created_at).toLocaleString()}</td>
                                                <td>
                                                    <button 
                                                        className="edit-button" 
                                                        onClick={() => handleEditLecturer(lecturer)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="delete-button" 
                                                        onClick={() => handleDeleteLecturer(lecturer.lec_id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No lecturers found.</p>
                            )}
                        </div>
                    </>
                );
            case "lic":
                return (
                    <>
                        <div className="lic-form-container">
                            <h2>{selectedLic ? "Edit Lecturer in Charge" : "Add New Lecturer in Charge"}</h2>
                            <LicForm 
                                onSuccess={handleLicFormSuccess} 
                                licData={selectedLic} 
                                isEditing={!!selectedLic} 
                                onCancel={() => setSelectedLic(null)} 
                            />
                        </div>

                        <div className="lics-table-container">
                            <h2>Lecturers in Charge</h2>
                            
                            {loading && <p>Loading...</p>}
                            
                            {lics.length > 0 ? (
                                <table className="lics-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Modules</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lics.map((lic) => (
                                            <tr key={lic.lec_id}>
                                                <td>{lic.lec_id}</td>
                                                <td>{lic.lec_name}</td>
                                                <td>{lic.lec_email}</td>
                                                <td>{lic.phone_number || "N/A"}</td>
                                                <td>
                                                    {lic.lic_modules ? 
                                                        (typeof lic.lic_modules === 'string' ? 
                                                            JSON.parse(lic.lic_modules).join(", ") : 
                                                            lic.lic_modules.join(", ")) 
                                                        : "N/A"}
                                                </td>   
                                                <td>{new Date(lic.created_at).toLocaleString()}</td>
                                                <td>
                                                    <button 
                                                        className="edit-button" 
                                                        onClick={() => handleEditLic(lic)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="delete-button" 
                                                        onClick={() => handleDeleteLic(lic.lec_id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No lecturers in charge found.</p>
                            )}
                        </div>
                    </>
                );

                case "examiner":
            return (
                <>
                    <div className="examiner-form-container">
                        <h2>{selectedExaminer ? "Edit Examiner" : "Add New Examiner"}</h2>
                        <ExaminerForm 
                            onSuccess={handleExaminerFormSuccess} 
                            examinerData={selectedExaminer} 
                            isEditing={!!selectedExaminer} 
                            onCancel={() => setSelectedExaminer(null)} 
                        />
                    </div>
                    <div className="examiners-table-container">
                        <h2>Examiners</h2>
                        {loading && <p>Loading...</p>}
                        {examiners.length > 0 ? (
                            <table className="examiners-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Modules</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examiners.map((examiner) => (
                                        <tr key={examiner.examiner_id}>
                                            <td>{examiner.examiner_id}</td>
                                            <td>{examiner.examiner_name}</td>
                                            <td>{examiner.examiner_email}</td>
                                            <td>{examiner.phone_number || "N/A"}
                                            </td>                                           
                                            <td>
                                                {examiner.module_codes ? 
                                                    (typeof examiner.module_codes === 'string' ? 
                                                        JSON.parse(examiner.module_codes).join(", ") : 
                                                        examiner.module_codes.join(", ")) 
                                                    : "N/A"}
                                            </td>
                                            <td>{new Date(examiner.created_at).toLocaleString()}</td>
                                            <td>
                                                <button 
                                                    className="edit-button" 
                                                    onClick={() => handleEditExaminer(examiner)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="delete-button" 
                                                    onClick={() => handleDeleteExaminer(examiner.examiner_id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No examiners found.</p>
                        )}
                    </div>
                </>
            );



            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="dashboard-container">
            <Navbar 
                activeTab={activeTab} 
                onNavChange={handleNavChange} 
                onLogout={handleLogout} 
            />

            <main className="dashboard-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
