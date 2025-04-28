import React, { useState, useEffect, useCallback  } from "react";
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
//import FreeTimeSlotList from "../components/FreeTimeSlotsList";
import FreeTimeSlotForm from "../components/ADMIN_Component/FreeTimeSlotForm";
import { getFreeTimeSlots, addFreeTimeSlot, updateFreeTimeSlot, deleteFreeTimeSlot } from "../services/ADMIN_Service/freeTimeSlotService";
import "../styles/AD_Styles/AdminDashboard.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid, Box, Paper, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { People, Schedule, School, Assignment, Download, Add} from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';




const AdminDashboard = ({ onLogout }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [activeTab, setActiveTab] = useState("dashboard");
    const [admins, setAdmins] = useState([]);
    const [lecturers, setLecturers] = useState([]); 
    const [lics, setLics] = useState([]); 
    const [examiners, setExaminers] = useState([]);
    //const [timeslots, setTimeslots] = useState([]);
    const [freeTimeSlots, setFreeTimeSlots] = useState([]);
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
    const [selectedLic, setSelectedLic] = useState(null); 
    const [selectedExaminer, setSelectedExaminer] = useState(null);  
    const [selectedFreeSlot, setSelectedFreeSlot] = useState(null);
    
    

    
    const fetchFreeTimeSlots = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getFreeTimeSlots();
            setFreeTimeSlots(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch free timeslots: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdmins();
            setAdmins(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch admin users: " + err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLecturers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getLecturers();
            setLecturers(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch lecturers: " + err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLics = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getLic();
            setLics(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch lecturers in charge: " + err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchExaminers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getExaminers();
            setExaminers(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch examiners: " + err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchAdmins(),
                    fetchLecturers(),
                    fetchLics(),
                    fetchExaminers(),
                    fetchFreeTimeSlots()
                ]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAllData();
    }, [fetchAdmins, fetchLecturers, fetchLics, fetchExaminers, fetchFreeTimeSlots]);

    const handleExportAllUsersPDF = () => {
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();
            
            // Title and Header
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
            
            doc.setTextColor(255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('All Users Report', 14, 25);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${date}`, 14, 35);

            let yPos = 50;

            // Admins Section
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Administrators', 14, yPos);
            
            doc.autoTable({
                head: [['ID', 'Name', 'Email', 'Phone', 'Role', 'Created At']],
                body: admins.map(admin => [
                    admin.id,
                    admin.name,
                    admin.email,
                    admin.phone || 'N/A',
                    admin.role,
                    new Date(admin.created_at).toLocaleDateString()
                ]),
                startY: yPos + 10,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 250, 254] }
            });

            yPos = doc.lastAutoTable.finalY + 20;

            // Lecturers Section
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.text('Lecturers', 14, yPos);

            doc.autoTable({
                head: [['ID', 'Name', 'Email', 'Phone', 'Modules', 'Created At']],
                body: lecturers.map(lecturer => [
                    lecturer.lec_id,
                    lecturer.lec_name,
                    lecturer.lec_email,
                    lecturer.phone_number || 'N/A',
                    lecturer.lecture_modules ? (typeof lecturer.lecture_modules === 'string' ? 
                        JSON.parse(lecturer.lecture_modules).join(", ") : 
                        lecturer.lecture_modules.join(", ")) : 'N/A',
                    new Date(lecturer.created_at).toLocaleDateString()
                ]),
                startY: yPos + 10,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 250, 254] }
            });

            yPos = doc.lastAutoTable.finalY + 20;

            // Add new page if needed
            if (yPos > doc.internal.pageSize.height - 100) {
                doc.addPage();
                yPos = 20;
            }

            // LICs Section
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.text('Lecturers in Charge', 14, yPos);

            doc.autoTable({
                head: [['ID', 'Name', 'Email', 'Phone', 'Modules', 'Created At']],
                body: lics.map(lic => [
                    lic.lec_id,
                    lic.lec_name,
                    lic.lec_email,
                    lic.phone_number || 'N/A',
                    lic.lic_modules ? (typeof lic.lic_modules === 'string' ? 
                        JSON.parse(lic.lic_modules).join(", ") : 
                        lic.lic_modules.join(", ")) : 'N/A',
                    new Date(lic.created_at).toLocaleDateString()
                ]),
                startY: yPos + 10,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 250, 254] }
            });

            yPos = doc.lastAutoTable.finalY + 20;

            // Add new page if needed
            if (yPos > doc.internal.pageSize.height - 100) {
                doc.addPage();
                yPos = 20;
            }

            // Examiners Section
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.text('Examiners', 14, yPos);

            doc.autoTable({
                head: [['ID', 'Name', 'Email', 'Phone', 'Modules', 'Created At']],
                body: examiners.map(examiner => [
                    examiner.examiner_id,
                    examiner.examiner_name,
                    examiner.examiner_email,
                    examiner.phone_number || 'N/A',
                    examiner.module_codes ? (typeof examiner.module_codes === 'string' ? 
                        JSON.parse(examiner.module_codes).join(", ") : 
                        examiner.module_codes.join(", ")) : 'N/A',
                    new Date(examiner.created_at).toLocaleDateString()
                ]),
                startY: yPos + 10,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 250, 254] }
            });

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            doc.save(`all-users-report-${date}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleExportTimeslotsPDF = () => {
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();
            
            // Header
            doc.setFillColor(46, 125, 50);
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
            
            doc.setTextColor(255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Time Slots Report', 14, 25);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${date}`, 14, 35);

            // Summary statistics
            const availableCount = freeTimeSlots.filter(s => s.status === 'available').length;
            const bookedCount = freeTimeSlots.filter(s => s.status === 'booked').length;
            
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(14, 50, 180, 30, 3, 3, 'F');
            
            doc.setTextColor(0);
            doc.setFontSize(12);
            doc.text('Summary:', 20, 60);
            
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(11);
            doc.text(`Total Time Slots: ${freeTimeSlots.length}`, 20, 70);
            
            doc.setTextColor(46, 125, 50);
            doc.text(`Available: ${availableCount}`, 90, 70);
            
            doc.setTextColor(211, 47, 47);
            doc.text(`Booked: ${bookedCount}`, 150, 70);

            // Time Slots Table
            doc.autoTable({
                head: [['Module Code', 'Module Name', 'Date', 'Time', 'Venue', 'Academic Year', 'Semester', 'Status']],
                body: freeTimeSlots.map(slot => [
                    slot.module_code,
                    slot.module_name || '',
                    new Date(slot.date).toLocaleDateString(),
                    `${slot.start_time?.substring(0, 5)} - ${slot.end_time?.substring(0, 5)}`,
                    slot.venue_name,
                    slot.academic_year,
                    slot.semester,
                    slot.status
                ]),
                startY: 90,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 5 },
                headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 250, 245] },
                columnStyles: {
                    7: {
                        cellCallback: function(cell, data) {
                            if (data.section === 'body') {
                                const status = cell.raw;
                                if (status === 'available') {
                                    cell.styles.textColor = [46, 125, 50];
                                    cell.styles.fontStyle = 'bold';
                                } else {
                                    cell.styles.textColor = [211, 47, 47];
                                    cell.styles.fontStyle = 'bold';
                                }
                            }
                        }
                    }
                }
            });

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            doc.save(`timeslots-report-${date}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleExportFreeTimeslotsPDF = () => {
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();
            
            // Filter to include only available time slots
            const availableSlots = freeTimeSlots.filter(slot => slot.status === 'available');
            
            // Header
            doc.setFillColor(46, 125, 50);
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
            
            doc.setTextColor(255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Available Time Slots Report', 14, 25);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${date}`, 14, 35);

            // Summary
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(14, 50, 180, 25, 3, 3, 'F');
            
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(12);
            doc.text(`Total Available Slots: ${availableSlots.length}`, 20, 65);

            // Available Time Slots Table
            doc.autoTable({
                head: [['Module Code', 'Module Name', 'Date', 'Time', 'Venue', 'Academic Year', 'Semester']],
                body: availableSlots.map(slot => [
                    slot.module_code,
                    slot.module_name || '',
                    new Date(slot.date).toLocaleDateString(),
                    `${slot.start_time?.substring(0, 5)} - ${slot.end_time?.substring(0, 5)}`,
                    slot.venue_name,
                    slot.academic_year,
                    slot.semester
                ]),
                startY: 85,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 5 },
                headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 250, 245] }
            });

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            doc.save(`available-timeslots-report-${date}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();
            
            // Title
            doc.setFontSize(18);
            doc.text('Admins Report', 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${date}`, 14, 28);

            // Create the table
            doc.autoTable({
                head: [['ID', 'Name', 'Email', 'Phone', 'Role', 'Created At']],
                body: admins.map(admin => [
                    admin.id,
                    admin.name,
                    admin.email,
                    admin.phone || 'N/A',
                    admin.role,
                    new Date(admin.created_at).toLocaleDateString()
                ]),
                startY: 35,
                theme: 'grid',
                styles: { fontSize: 9 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 }
            });

            doc.save(`admins-report-${date}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleAddFreeTimeSlot = async (slotData) => {
        try {
            setLoading(true);
            await addFreeTimeSlot(slotData);
            setSuccess("Time slot added successfully!");
            fetchFreeTimeSlots();
            setActiveTab("timeslot-list");
        } catch (err) {
            setError(err.message || "Failed to add time slot");
        } finally {
            setLoading(false);
        }
    };

    // Handler for updating a free time slot
    const handleUpdateFreeTimeSlot = async (id, slotData) => {
        try {
            setLoading(true);
            await updateFreeTimeSlot(id, slotData);
            setSuccess("Time slot updated successfully!");
            fetchFreeTimeSlots();
            setSelectedFreeSlot(null);
            setActiveTab("timeslot-list");
        } catch (err) {
            setError(err.message || "Failed to update time slot");
        } finally {
            setLoading(false);
        }
    };

    // Handler for editing a free time slot
    const handleEditFreeTimeSlot = (slot) => {
        setSelectedFreeSlot(slot);
        setActiveTab("timeslot-add");
    };

    // Handler for deleting a free time slot
    const handleDeleteFreeTimeSlot = async (id) => {
        if (window.confirm("Are you sure you want to delete this time slot?")) {
            try {
                setLoading(true);
                await deleteFreeTimeSlot(id);
                setSuccess("Time slot deleted successfully!");
                fetchFreeTimeSlots();
            } catch (err) {
                setError(err.message || "Failed to delete time slot");
            } finally {
                setLoading(false);
            }
        }
    };

    // Handler for form submission
    const handleFreeTimeSlotFormSubmit = (formData) => {
        if (selectedFreeSlot) {
            handleUpdateFreeTimeSlot(selectedFreeSlot.id, formData);
        } else {
            handleAddFreeTimeSlot(formData);
        }
    };

    
    const handleLogout = () => {
        logout();
        onLogout();
    };

    const handleNavChange = (tab) => {
        setActiveTab(tab);
        
        if (tab === "lecturers" || tab === "lecturers-add") {
            setActiveTab("lecturers");
        }

        if (tab === "lic" || tab === "lic-add") {
            setActiveTab("lic");
        }

        if (tab === "examiner" || tab === "examiner-add") {
            setActiveTab("examiner");
        }
          
          if (tab === "available-slots" || tab === "timeslot-list" || tab === "timeslot-add") {
            setActiveTab(tab);
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

    // Add these constant definitions before the renderDashboardContent function
    const stats = [
        { title: 'Total Admins', value: admins.length, icon: <People />, color: '#1976d2' },
        { title: 'Total Lecturers', value: lecturers.length, icon: <School />, color: '#2e7d32' },
        { title: 'Total LICs', value: lics.length, icon: <Assignment />, color: '#ed6c02' },
        { title: 'Total Examiners', value: examiners.length, icon: <People />, color: '#9c27b0' },
        { title: 'Total Time Slots', value: freeTimeSlots.length, icon: <Schedule />, color: '#0288d1' },
        { title: 'Available Slots', value: freeTimeSlots.filter(s => s.status === 'available').length, icon: <Schedule />, color: '#2e7d32' }
    ];

    const timeSlotData = [
        { name: 'Available', value: freeTimeSlots.filter(s => s.status === 'available').length },
        { name: 'Booked', value: freeTimeSlots.filter(s => s.status === 'booked').length }
    ];

    const COLORS = ['#2e7d32', '#d32f2f'];

    const renderDashboardContent = () => {
        switch (activeTab) {

            case "dashboard":
    return (
                    <div className="dashboard-container">
                        <Typography variant="h4" gutterBottom className="dashboard-title">
                            Dashboard Overview
                        </Typography>

            {/* Report Generation Section */}
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Generate Reports
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item>
                    <button 
                                        className="export-button"
                        onClick={handleExportAllUsersPDF} 
                                        style={{
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download /> Export All Users Report
                    </button>
                                </Grid>
                                <Grid item>
                    <button 
                                        className="export-button"
                        onClick={handleExportTimeslotsPDF} 
                                        style={{
                                            backgroundColor: '#2e7d32',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download /> Export All Time Slots Report
                    </button>
                                </Grid>
                                <Grid item>
                    <button 
                                        className="export-button"
                        onClick={handleExportFreeTimeslotsPDF} 
                                        style={{
                                            backgroundColor: '#ed6c02',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Download /> Export Available Time Slots Report
                    </button>
                                </Grid>
                            </Grid>
                        </Paper>
                        
                        <Grid container spacing={3} className="stats-grid">
                            {stats.map((stat, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card className="stat-card" style={{ backgroundColor: stat.color }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box>
                                                    <Typography variant="h6" color="white">
                                                        {stat.title}
                                                    </Typography>
                                                    <Typography variant="h4" color="white">
                                                        {stat.value}
                                                    </Typography>
                                                </Box>
                                                <IconButton color="inherit">
                                                    {stat.icon}
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container spacing={3} className="charts-grid">
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} className="chart-paper">
                                    <Typography variant="h6" gutterBottom>
                                        Time Slot Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={timeSlotData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {timeSlotData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} className="chart-paper">
                                    <Typography variant="h6" gutterBottom>
                                        User Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                { name: 'Admins', value: admins.length },
                                                { name: 'Lecturers', value: lecturers.length },
                                                { name: 'LICs', value: lics.length },
                                                { name: 'Examiners', value: examiners.length }
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#1976d2" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                        </Grid>
        </div>
    );

            case "admins-add":
                return (
                        <div className="admin-form-container">
                            <h2>{isEditing ? "Edit Admin" : "Add New Admin"}</h2>
                            
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                            
                            <form onSubmit={handleSubmit}>
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Name</Typography>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Email</Typography>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">
                                        Password {isEditing && "(leave blank to keep current)"}
                                        </Typography>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!isEditing}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Phone</Typography>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">Role</Typography>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                marginTop: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                    >
                                        <option value="admin">Admin</option>
                                    </select>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                    <button
                                        type="submit"
                                        style={{
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : isEditing ? "Update Admin" : "Add Admin"}
                                    </button>
                                    {isEditing && (
                                        <button 
                                            type="button" 
                                            onClick={resetForm} 
                                            style={{
                                                backgroundColor: '#d32f2f',
                                                color: 'white',
                                                padding: '10px 20px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </Box>
                            </Paper>
                            </form>

                        <TableContainer component={Paper} elevation={3} sx={{ mt: 4 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Created At</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                        {admins.map((admin) => (
                                        <TableRow key={admin.id} hover>
                                            <TableCell>{admin.id}</TableCell>
                                            <TableCell>{admin.name}</TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>{admin.phone || "N/A"}</TableCell>
                                            <TableCell>
                                                <span className="role-badge">{admin.role}</span>
                                            </TableCell>
                                            <TableCell>{new Date(admin.created_at).toLocaleString()}</TableCell>
                                            <TableCell align="center">
                                                <MuiTooltip title="Edit" arrow>
                                                    <IconButton color="primary" onClick={() => editAdmin(admin)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </MuiTooltip>
                                                <MuiTooltip title="Delete" arrow>
                                                    <IconButton color="error" onClick={() => handleDelete(admin.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </MuiTooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        </div>
                );

                case "admins-list":
                    const filteredAdmins = admins.filter(admin => 
                        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    const indexOfLastAdmin = currentPage * rowsPerPage;
                    const indexOfFirstAdmin = indexOfLastAdmin - rowsPerPage;
                    const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
                
                    return (
                        <div className="admins-table-container">
                            <div className="table-controls">
                                <div className="search-container">
                                    <input
                                        type="text"
                                        placeholder="Search admins..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="search-input"
                                    />
                                    <span className="search-icon">🔍</span>
                                </div>
                                <div className="export-buttons">
                                    <button onClick={handleExportPDF} className="export-pdf">
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                                <Table sx={{ minWidth: 650 }} aria-label="admins table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Created At</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentAdmins.map((admin) => (
                                            <TableRow key={admin.id} hover>
                                                <TableCell>{admin.id}</TableCell>
                                                <TableCell>
                                                    <span className="user-badge admin-badge">ADMIN</span> {admin.name}
                                                </TableCell>
                                                <TableCell>{admin.email}</TableCell>
                                                <TableCell>{admin.phone || <span className="na-badge">N/A</span>}</TableCell>
                                                <TableCell>
                                                    <span className="role-badge">{admin.role}</span>
                                                </TableCell>
                                                <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell align="center">
                                                    <MuiTooltip title="Edit" arrow>
                                                        <IconButton color="primary" onClick={() => editAdmin(admin)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                    <MuiTooltip title="Delete" arrow>
                                                        <IconButton color="error" onClick={() => handleDelete(admin.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/* Pagination */}
                            <div className="pagination-controls">
                                <div className="rows-per-page">
                                    <span>Rows per page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {[10, 25, 50].map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="page-navigation">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ◀ Previous
                                    </button>
                                    <span>Page {currentPage} of {Math.ceil(filteredAdmins.length / rowsPerPage)}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => 
                                            Math.min(p + 1, Math.ceil(filteredAdmins.length / rowsPerPage))
                                        )}
                                        disabled={currentPage === Math.ceil(filteredAdmins.length / rowsPerPage)}
                                    >
                                        Next ▶
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                                    <Table sx={{ minWidth: 650 }} aria-label="lecturers table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Phone</TableCell>
                                                <TableCell>Modules</TableCell>
                                                <TableCell>Created At</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {lecturers.map((lecturer) => (
                                                <TableRow key={lecturer.lec_id} hover>
                                                    <TableCell>{lecturer.lec_id}</TableCell>
                                                    <TableCell>{lecturer.lec_name}</TableCell>
                                                    <TableCell>{lecturer.lec_email}</TableCell>
                                                    <TableCell>{lecturer.phone_number || "N/A"}</TableCell>
                                                    <TableCell>{lecturer.lecture_modules ? (typeof lecturer.lecture_modules === 'string' ? JSON.parse(lecturer.lecture_modules).join(", ") : lecturer.lecture_modules.join(", ")) : "N/A"}</TableCell>
                                                    <TableCell>{new Date(lecturer.created_at).toLocaleString()}</TableCell>
                                                    <TableCell align="center">
                                                        <MuiTooltip title="Edit" arrow>
                                                            <IconButton color="primary" onClick={() => handleEditLecturer(lecturer)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </MuiTooltip>
                                                        <MuiTooltip title="Delete" arrow>
                                                            <IconButton color="error" onClick={() => handleDeleteLecturer(lecturer.lec_id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </MuiTooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
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
                                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                                    <Table sx={{ minWidth: 650 }} aria-label="lics table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Phone</TableCell>
                                                <TableCell>Modules</TableCell>
                                                <TableCell>Created At</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {lics.map((lic) => (
                                                <TableRow key={lic.lec_id} hover>
                                                    <TableCell>{lic.lec_id}</TableCell>
                                                    <TableCell>{lic.lec_name}</TableCell>
                                                    <TableCell>{lic.lec_email}</TableCell>
                                                    <TableCell>{lic.phone_number || "N/A"}</TableCell>
                                                    <TableCell>{lic.lic_modules ? (typeof lic.lic_modules === 'string' ? JSON.parse(lic.lic_modules).join(", ") : lic.lic_modules.join(", ")) : "N/A"}</TableCell>
                                                    <TableCell>{new Date(lic.created_at).toLocaleString()}</TableCell>
                                                    <TableCell align="center">
                                                        <MuiTooltip title="Edit" arrow>
                                                            <IconButton color="primary" onClick={() => handleEditLic(lic)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </MuiTooltip>
                                                        <MuiTooltip title="Delete" arrow>
                                                            <IconButton color="error" onClick={() => handleDeleteLic(lic.lec_id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </MuiTooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
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
                            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                                <Table sx={{ minWidth: 650 }} aria-label="examiners table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Modules</TableCell>
                                            <TableCell>Created At</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {examiners.map((examiner) => (
                                            <TableRow key={examiner.examiner_id} hover>
                                                <TableCell>{examiner.examiner_id}</TableCell>
                                                <TableCell>{examiner.examiner_name}</TableCell>
                                                <TableCell>{examiner.examiner_email}</TableCell>
                                                <TableCell>{examiner.phone_number || "N/A"}</TableCell>
                                                <TableCell>{examiner.module_codes ? (typeof examiner.module_codes === 'string' ? JSON.parse(examiner.module_codes).join(", ") : examiner.module_codes.join(", ")) : "N/A"}</TableCell>
                                                <TableCell>{new Date(examiner.created_at).toLocaleString()}</TableCell>
                                                <TableCell align="center">
                                                    <MuiTooltip title="Edit" arrow>
                                                        <IconButton color="primary" onClick={() => handleEditExaminer(examiner)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                    <MuiTooltip title="Delete" arrow>
                                                        <IconButton color="error" onClick={() => handleDeleteExaminer(examiner.examiner_id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <p>No examiners found.</p>
                        )}
                    </div>
                </>
            );
            
            

            case "timeslot-list":
                const filteredTimeSlots = freeTimeSlots.filter(slot => 
                    statusFilter === 'all' ? true : slot.status === statusFilter
                );

                return (
                    <div className="timeslots-container">
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <Typography variant="h5">Time Slots Management</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd'
                                    }}
                                >
                                    <option value="all">All Slots</option>
                                    <option value="available">Available</option>
                                    <option value="booked">Booked</option>
                                </select>
                            <button 
                                className="add-button"
                                onClick={() => {
                                        setSelectedFreeSlot(null);
                                    setActiveTab("timeslot-add");
                                }}
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Add /> Add New Time Slot
                            </button>
                            </Box>
                        </div>
                        
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1">
                                Showing {filteredTimeSlots.length} {statusFilter !== 'all' ? `${statusFilter} ` : ''}time slots
                            </Typography>
                        </Box>
                        
                        <TableContainer component={Paper} elevation={2}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Module</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time & Venue</TableCell>
                                        <TableCell>Academic Year</TableCell>
                                        <TableCell>Semester</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTimeSlots.map((slot) => (
                                        <TableRow key={slot.id} hover>
                                            <TableCell>
                                                <strong>{slot.module_code}</strong><br />
                                                <span style={{ color: '#666' }}>{slot.module_name}</span>
                                            </TableCell>
                                            <TableCell>{new Date(slot.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div>{slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}</div>
                                                <div style={{ color: '#666' }}>{slot.venue_name}</div>
                                            </TableCell>
                                            <TableCell>{slot.academic_year}</TableCell>
                                            <TableCell>{slot.semester}</TableCell>
                                            <TableCell>
                                                <span 
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: slot.status === 'available' ? '#e8f5e9' : '#ffebee',
                                                        color: slot.status === 'available' ? '#2e7d32' : '#d32f2f'
                                                    }}
                                                >
                                                    {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <MuiTooltip title="Edit" arrow>
                                                    <IconButton color="primary" onClick={() => handleEditFreeTimeSlot(slot)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </MuiTooltip>
                                                <MuiTooltip title="Delete" arrow>
                                                    <IconButton color="error" onClick={() => handleDeleteFreeTimeSlot(slot.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </MuiTooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                );
            
            // Updated case for time slot add/edit
            case "timeslot-add":
                return (
                    <div className="timeslot-form-container">
                        <h2>{selectedFreeSlot ? "Edit Time Slot" : "Add New Time Slot"}</h2>
                        
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <FreeTimeSlotForm
                            onSubmit={handleFreeTimeSlotFormSubmit}
                            slotData={selectedFreeSlot}
                            isEditing={!!selectedFreeSlot}
                            onCancel={() => {
                                setSelectedFreeSlot(null);
                                setActiveTab("timeslot-list");
                            }}
                        />
                    </div>
                );

                    
                    



            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="admin-dashboard">
            <Navbar 
                activeTab={activeTab} 
                onNavChange={handleNavChange} 
                onLogout={handleLogout} 
            />
            <div className="dashboard-content">
                {renderDashboardContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
