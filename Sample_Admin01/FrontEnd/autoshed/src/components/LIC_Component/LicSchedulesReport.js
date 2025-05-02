import React, { useState, useEffect } from 'react';

import { ChevronDown, Filter, Download, Search, BookOpen, User, Info, CheckCircle, AlertCircle } from 'lucide-react';
import LicViewScheduleService from '../../services/LIC_Services/LicViewScheduleService';
// import { CSVLink } from 'react-csv';

import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import 'jspdf-autotable';

import '../../styles/LIC_Styles/LicSchedulesReport.css';

const LicSchedulesReport = () => {
    const [, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedSchedules, setGroupedSchedules] = useState({});
    const [expandedModules, setExpandedModules] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOptions, setFilterOptions] = useState({
        date: null,
        venue: '',
        vivaType: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [uniqueVenues, setUniqueVenues] = useState([]);
    const [uniqueVivaTypes, setUniqueVivaTypes] = useState([]);
    const [selectedScheduleDetails, setSelectedScheduleDetails] = useState(null);
    const [detailedSchedules, setDetailedSchedules] = useState({});
    const [exportSuccess, setExportSuccess] = useState(null);
    
    

    // Get token and LIC ID
    const token = localStorage.getItem("token");
    const licId = token ? JSON.parse(atob(token.split('.')[1])).id : localStorage.getItem('userId') || '';

    // Fetch schedules data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                if (!licId) {
                    throw new Error("Not authenticated. Please login.");
                }
                
                // Fetch schedules
                const data = await LicViewScheduleService.getSchedulesByLic(licId);
                
                setSchedules(data);
                
                // Extract unique venues and viva types for filters
                const venues = [...new Set(data.map(schedule => schedule.venue_name))];
                const vivaTypes = [...new Set(data.map(schedule => schedule.viva_type))];
                
                setUniqueVenues(venues);
                setUniqueVivaTypes(vivaTypes);
                
                // Group schedules by module code
                const grouped = data.reduce((acc, schedule) => {
                    const moduleCode = schedule.module_code;
                    if (!acc[moduleCode]) {
                        acc[moduleCode] = [];
                    }
                    acc[moduleCode].push(schedule);
                    return acc;
                }, {});
                
                setGroupedSchedules(grouped);
                
                // Initialize all modules as expanded
                const expanded = Object.keys(grouped).reduce((acc, moduleCode) => {
                    acc[moduleCode] = true;
                    return acc;
                }, {});
                
                setExpandedModules(expanded);

                // Fetch detailed information for each schedule
                const detailedData = {};
                for (const schedule of data) {
                    try {
                        const details = await LicViewScheduleService.getScheduleDetails(schedule.schedule_id);
                        detailedData[schedule.schedule_id] = details;
                    } catch (err) {
                        console.error(`Error fetching details for schedule ${schedule.schedule_id}:`, err);
                    }
                }
                setDetailedSchedules(detailedData);
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching schedules:", err);
                setError("Failed to load schedules. Please try again.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, [licId]);

    // View details of a specific schedule
    const handleViewDetails = async (scheduleId) => {
        try {
            setLoading(true);
            const details = await LicViewScheduleService.getScheduleDetails(scheduleId);
            setSelectedScheduleDetails(details);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching schedule details:", err);
            setError("Failed to load schedule details. Please try again.");
            setLoading(false);
        }
    };

    // Filter schedules based on search term and filter options
    const filteredGroupedSchedules = Object.entries(groupedSchedules).reduce((acc, [moduleCode, moduleSchedules]) => {
        const filteredSchedules = moduleSchedules.filter(schedule => {
            // Check if schedule matches search term
            const matchesSearch = 
                schedule.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.viva_type.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Check if schedule matches filter options
            const matchesDate = filterOptions.date ? schedule.date === filterOptions.date : true;
            const matchesVenue = filterOptions.venue ? schedule.venue_name === filterOptions.venue : true;
            const matchesVivaType = filterOptions.vivaType ? schedule.viva_type === filterOptions.vivaType : true;
            
            return matchesSearch && matchesDate && matchesVenue && matchesVivaType;
        });
        
        if (filteredSchedules.length > 0) {
            acc[moduleCode] = filteredSchedules;
        }
        
        return acc;
    }, {});

    // Toggle module expansion
    const toggleModule = (moduleCode) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleCode]: !prev[moduleCode]
        }));
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilterOptions({
            date: null,
            venue: '',
            vivaType: ''
        });
    };

    // Modern PDF generation function
    const generatePDF = () => {
        if (!Object.keys(filteredGroupedSchedules).length) {
            setExportSuccess({ success: false, message: "No data available to generate report" });
            setTimeout(() => setExportSuccess(null), 3000);
            return;
        }

        // Create PDF document in landscape orientation
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set document properties for better metadata
        doc.setProperties({
            title: 'AutoShed - Viva Schedules Report',
            subject: 'Comprehensive schedule report for viva sessions',
            author: 'AutoShed System',
            keywords: 'schedules, viva, report',
            creator: 'AutoShed'
        });
        
        // Set default font
        doc.setFont("helvetica");
        
        // Add title and date
        doc.setFontSize(18);
        doc.text('Viva Schedules Report', 14, 15);
        
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
        
        let yPosition = 30;
        
        // Add report summary
        doc.setFontSize(14);
        doc.text("Report Summary", 14, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.text(`Total Modules: ${Object.keys(filteredGroupedSchedules).length}`, 14, yPosition);
        yPosition += 5;
        
        const totalSchedules = Object.values(filteredGroupedSchedules).reduce((sum, schedules) => sum + schedules.length, 0);
        doc.text(`Total Schedules: ${totalSchedules}`, 14, yPosition);
        yPosition += 5;
        
        doc.text(`Viva Types: ${uniqueVivaTypes.join(', ')}`, 14, yPosition);
        yPosition += 10;
        
        // Process each module
        Object.entries(filteredGroupedSchedules).forEach(([moduleCode, moduleSchedules]) => {
            // Check if we need to add a new page
            if (yPosition > 180) {
                doc.addPage();
                yPosition = 30;
            }
            
            // Add module header
            doc.setFontSize(14);
            doc.text(`Module: ${moduleCode}`, 14, yPosition);
            yPosition += 8;
            
            // Create table for module schedules
            const tableColumns = [
                "Date", 
                "Time", 
                "Venue", 
                "Viva Type", 
                "Batch", 
                "Duration", 
                "Sub Groups", 
                "Lecturers"
            ];
            
            const tableRows = [];
            
            // Add schedule details as rows
            moduleSchedules.forEach((schedule) => {
                const detailedInfo = detailedSchedules[schedule.schedule_id] || {};
                const formattedDate = formatDate(schedule.date);
                const formattedScheduleTime = `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;
                
                // If schedule has batch groups
                if (detailedInfo.batchGroups && detailedInfo.batchGroups.length > 0) {
                    // Add each batch group as a row
                    detailedInfo.batchGroups.forEach((group) => {
                        const subGroups = group.subGroups && group.subGroups.length > 0 
                            ? group.subGroups.join(', ')
                            : 'N/A';
                            
                        const lecturers = group.lecturers && group.lecturers.length > 0
                            ? group.lecturers.map(l => l.lec_name).join(', ')
                            : 'N/A';
                        
                        tableRows.push([
                            formattedDate,
                            formattedScheduleTime,
                            schedule.venue_name,
                            schedule.viva_type,
                            group.batch,
                            `${group.duration} min`,
                            subGroups,
                            lecturers
                        ]);
                    });
                } else {
                    // If no batch groups, add a single row
                    tableRows.push([
                        formattedDate,
                        formattedScheduleTime,
                        schedule.venue_name,
                        schedule.viva_type,
                        'N/A',
                        'N/A',
                        'N/A',
                        'N/A'
                    ]);
                }
            });
            
            // Add the table with styles
            autoTable(doc, {
                head: [tableColumns],
                body: tableRows,
                startY: yPosition,
                theme: 'grid',
                styles: { 
                    overflow: 'linebreak', 
                    cellPadding: 3,
                    fontSize: 8
                },
                headStyles: { 
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle'
                },
                alternateRowStyles: {
                    fillColor: [240, 250, 255]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },  // Date
                    1: { cellWidth: 'auto' },  // Time
                    2: { cellWidth: 'auto' },  // Venue
                    3: { cellWidth: 'auto' },  // Viva Type
                    4: { cellWidth: 'auto' },  // Batch
                    5: { cellWidth: 'auto' },  // Duration
                    6: { cellWidth: 'auto' },  // Sub Groups
                    7: { cellWidth: 'auto' }   // Lecturers
                },
                margin: { top: 25, right: 15, bottom: 25, left: 15 },
                didParseCell: function(data) {
                    // Add custom styling to cells if needed
                    if (data.section === 'body' && data.column.index === 3) { // Viva Type column
                        data.cell.styles.fillColor = [225, 240, 250];
                        data.cell.styles.textColor = [0, 100, 150];
                    }
                }
            });
            
            yPosition = doc.lastAutoTable.finalY + 15;
        });
        
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `viva_schedules_report_${timestamp}.pdf`;
        
        // Save the PDF
        doc.save(filename);
        
        // Show success message
        setExportSuccess({ success: true, message: "PDF report generated successfully!" });
        setTimeout(() => setExportSuccess(null), 3000);
    };

    // Detailed schedule PDF generation
    const generateDetailsPDF = () => {
        if (!selectedScheduleDetails) return;
        
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        });
        
        // Set document properties
        doc.setProperties({
            title: `Schedule Details - ${selectedScheduleDetails.module_code}`,
            subject: 'Detailed viva schedule report',
            author: 'AutoShed System',
            keywords: 'schedule, details, viva',
            creator: 'AutoShed'
        });
        
        // Add title
        doc.setFontSize(18);
        doc.text('Schedule Details Report', 14, 15);
        
        doc.setFontSize(12);
        doc.text(`Module: ${selectedScheduleDetails.module_code}`, 14, 25);
        
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
        
        let yPosition = 40;
        
        // Schedule basic info section
        doc.setFontSize(14);
        doc.text("Schedule Information", 14, yPosition);
        yPosition += 8;
        
        const formattedDate = formatDate(selectedScheduleDetails.date);
        const formattedTime = `${formatTime(selectedScheduleDetails.start_time)} - ${formatTime(selectedScheduleDetails.end_time)}`;
        
        // Schedule info table
        autoTable(doc, {
            head: [["Date", "Time", "Venue", "Viva Type"]],
            body: [[
                formattedDate,
                formattedTime,
                selectedScheduleDetails.venue_name,
                selectedScheduleDetails.viva_type
            ]],
            startY: yPosition,
            theme: 'grid',
            styles: { 
                overflow: 'linebreak', 
                cellPadding: 5,
                fontSize: 10
            },
            headStyles: { 
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
        
        // Batch Groups section
        if (selectedScheduleDetails.batchGroups && selectedScheduleDetails.batchGroups.length > 0) {
            doc.setFontSize(14);
            doc.text("Batch Groups", 14, yPosition);
            yPosition += 8;
            
            const batchTableColumn = ["Batch", "Time", "Duration", "Sub Groups", "Lecturers", "Examiners"];
            const batchTableRows = [];
            
            selectedScheduleDetails.batchGroups.forEach((group) => {
                const groupTime = `${formatTime(group.start_time)} - ${formatTime(group.end_time)}`;
                const subGroups = group.subGroups && group.subGroups.length > 0 
                    ? group.subGroups.join(', ')
                    : 'None';
                    
                const lecturers = group.lecturers && group.lecturers.length > 0
                    ? group.lecturers.map(l => l.lec_name).join(', ')
                    : 'None';
                    
                const examiners = group.examiners && group.examiners.length > 0
                    ? group.examiners.map(e => e.examiner_name).join(', ')
                    : 'None';
                    
                const batchRow = [
                    group.batch,
                    groupTime,
                    `${group.duration} minutes`,
                    subGroups,
                    lecturers,
                    examiners
                ];
                batchTableRows.push(batchRow);
            });
            
            // Add batch groups table
            autoTable(doc, {
                head: [batchTableColumn],
                body: batchTableRows,
                startY: yPosition,
                theme: 'grid',
                styles: { 
                    overflow: 'linebreak', 
                    cellPadding: 3,
                    fontSize: 9
                },
                headStyles: { 
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [240, 250, 255]
                }
            });
        }
        
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `schedule_details_${selectedScheduleDetails.module_code}_${timestamp}.pdf`;
        
        // Save the PDF
        doc.save(filename);
        
        // Show success message
        setExportSuccess({ success: true, message: "Details PDF generated successfully!" });
        setTimeout(() => setExportSuccess(null), 3000);
    };

    // Prepare CSV data for export
    const generateCSV = () => {
        if (!Object.keys(filteredGroupedSchedules).length) {
            setExportSuccess({ success: false, message: "No data available to generate report" });
            setTimeout(() => setExportSuccess(null), 3000);
            return;
        }

        // Prepare CSV headers with report title and timestamp (header section)
        const csvRows = [
            [`Viva Schedules Report - Generated on ${new Date().toLocaleString()}`],
            ['AutoShed - University Scheduling System'],
            [''], // Empty row as separator
            ['Module Code', 'Date', 'Start Time', 'End Time', 'Venue', 'Viva Type', 'Batch', 'Batch Time', 'Duration', 'Sub Groups', 'Lecturers', 'Examiners']
        ];
        
        // Add data rows
        Object.entries(filteredGroupedSchedules).forEach(([moduleCode, schedules]) => {
            schedules.forEach(schedule => {
                const detailedInfo = detailedSchedules[schedule.schedule_id];
                
                if (detailedInfo && detailedInfo.batchGroups && detailedInfo.batchGroups.length > 0) {
                    // Add each batch group as a row
                    detailedInfo.batchGroups.forEach(group => {
                        const subGroups = group.subGroups && group.subGroups.length > 0 
                            ? group.subGroups.join(', ')
                            : '';
                            
                        const lecturers = group.lecturers && group.lecturers.length > 0
                            ? group.lecturers.map(l => l.lec_name).join(', ')
                            : '';
                            
                        const examiners = group.examiners && group.examiners.length > 0
                            ? group.examiners.map(e => e.examiner_name).join(', ')
                            : '';
                            
                        csvRows.push([
                            schedule.module_code,
                            formatDate(schedule.date),
                            schedule.start_time,
                            schedule.end_time,
                            schedule.venue_name,
                            schedule.viva_type,
                            group.batch,
                            `${formatTime(group.start_time)} - ${formatTime(group.end_time)}`,
                            `${group.duration} minutes`,
                            subGroups,
                            lecturers,
                            examiners
                        ]);
                    });
                } else {
                    // Add schedule without batch groups
                    csvRows.push([
                        schedule.module_code,
                        formatDate(schedule.date),
                        schedule.start_time,
                        schedule.end_time,
                        schedule.venue_name,
                        schedule.viva_type,
                        'No batch',
                        '',
                        '',
                        '',
                        '',
                        ''
                    ]);
                }
            });
        });
        
        // Add footer to CSV
        csvRows.push(['']);
        csvRows.push([`Report generated by AutoShed © ${new Date().getFullYear()}`]);
        csvRows.push(['Confidential - For internal use only']);
        
        // Convert to CSV string
        const csvString = csvRows.map(row => 
            row.map(cell => 
                typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
                    ? `"${cell.replace(/"/g, '""')}"` 
                    : cell
            ).join(',')
        ).join('\n');

        // Create Blob and trigger download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'viva_schedules_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        setExportSuccess({ success: true, message: "CSV report generated successfully!" });
        setTimeout(() => setExportSuccess(null), 3000);
    };

   
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Close schedule details modal
    const closeDetails = () => {
        setSelectedScheduleDetails(null);
    };

    if (loading && !selectedScheduleDetails) {
        return (
            <div className="schedules-report-container">
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading schedules data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="schedules-report-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="schedules-report-container">
            {exportSuccess && (
                <div className={`notification ${exportSuccess.success ? 'success' : 'error'}`}>
                    {exportSuccess.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{exportSuccess.message}</p>
                </div>
            )}

            <div className="report-header">
                
                <h2>Viva Schedules Report</h2>
                <div className="report-actions">
                    <button className="print-button" onClick={generatePDF}>
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                    <button className="csv-button" onClick={generateCSV}>
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="report-tools">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by module, venue or viva type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>×</button>
                    )}
                </div>
                
                <button 
                    className={`filter-toggle ${showFilters ? 'active' : ''}`} 
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    <span>Filters</span>
                    <ChevronDown size={14} className={showFilters ? 'rotated' : ''} />
                </button>
            </div>

            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-item">
                        <label>Date:</label>
                        <input 
                            type="date" 
                            value={filterOptions.date || ''}
                            onChange={(e) => setFilterOptions({...filterOptions, date: e.target.value || null})}
                        />
                    </div>
                    
                    <div className="filter-item">
                        <label>Venue:</label>
                        <select 
                            value={filterOptions.venue}
                            onChange={(e) => setFilterOptions({...filterOptions, venue: e.target.value})}
                        >
                            <option value="">All Venues</option>
                            {uniqueVenues.map(venue => (
                                <option key={venue} value={venue}>{venue}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-item">
                        <label>Viva Type:</label>
                        <select 
                            value={filterOptions.vivaType}
                            onChange={(e) => setFilterOptions({...filterOptions, vivaType: e.target.value})}
                        >
                            <option value="">All Types</option>
                            {uniqueVivaTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button className="reset-filters" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            )}
            
            <div className="report-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Modules:</span>
                    <span className="summary-value">{Object.keys(filteredGroupedSchedules).length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total Schedules:</span>
                    <span className="summary-value">
                        {Object.values(filteredGroupedSchedules).reduce((sum, schedules) => sum + schedules.length, 0)}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Viva Types:</span>
                    <div className="viva-type-badges">
                        {uniqueVivaTypes.map(type => (
                            <span key={type} className="viva-badge">{type}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="report-content">
                {Object.keys(filteredGroupedSchedules).length === 0 ? (
                    <div className="no-schedules">
                        <p>No schedules found matching your criteria.</p>
                        <button onClick={resetFilters}>Clear Filters</button>
                    </div>
                ) : (
                    Object.entries(filteredGroupedSchedules).map(([moduleCode, moduleSchedules]) => (
                        <div className="module-section" key={moduleCode}>
                            <div 
                                className="module-header" 
                                onClick={() => toggleModule(moduleCode)}
                            >
                                <h3>
                                    <BookOpen size={20} className="module-icon" />
                                    {moduleCode} ({moduleSchedules.length})
                                </h3>
                                <ChevronDown 
                                    size={20} 
                                    className={expandedModules[moduleCode] ? 'rotated' : ''}
                                />
                            </div>
                            
                            {expandedModules[moduleCode] && (
                                <div className="module-schedules">
                                    <table className="schedules-table">
                                        <thead>
                                            <tr>
                                                <th>Module Code</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Venue</th>
                                                <th>Viva Type</th>
                                                <th>Batch/Group</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {moduleSchedules.map((schedule) => (
                                                <tr key={schedule.schedule_id} className="schedule-row">
                                                    <td>{schedule.module_code}</td>
                                                    <td>{formatDate(schedule.date)}</td>
                                                    <td>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</td>
                                                    <td>{schedule.venue_name}</td>
                                                    <td><span className="viva-type">{schedule.viva_type}</span></td>
                                                    <td>
                                                        {detailedSchedules[schedule.schedule_id]?.batchGroups 
                                                            ? `${detailedSchedules[schedule.schedule_id].batchGroups.length} Batch Group${detailedSchedules[schedule.schedule_id].batchGroups.length !== 1 ? 's' : ''}` 
                                                            : 'No Groups'}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="view-details-button"
                                                            onClick={() => handleViewDetails(schedule.schedule_id)}
                                                        >
                                                            <Info size={14} />
                                                            <span>View Details</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {selectedScheduleDetails && (
                <div className="schedule-details-overlay" onClick={closeDetails}>
                    <div className="schedule-details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <h3>{selectedScheduleDetails.module_code} - {selectedScheduleDetails.viva_type}</h3>
                            </div>
                            <button className="close-modal" onClick={closeDetails}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="detail-section">
                                <h4>Schedule Information</h4>
                                <table className="details-table">
                                    <tbody>
                                        <tr>
                                            <th>Date:</th>
                                            <td>{formatDate(selectedScheduleDetails.date)}</td>
                                            <th>Time:</th>
                                            <td>{formatTime(selectedScheduleDetails.start_time)} - {formatTime(selectedScheduleDetails.end_time)}</td>
                                        </tr>
                                        <tr>
                                            <th>Venue:</th>
                                            <td>{selectedScheduleDetails.venue_name}</td>
                                            <th>Viva Type:</th>
                                            <td>{selectedScheduleDetails.viva_type}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            {selectedScheduleDetails.batchGroups && selectedScheduleDetails.batchGroups.length > 0 && (
                                <div className="batch-groups-section">
                                    <h4>Batch Groups</h4>
                                    <table className="batch-groups-table">
                                        <thead>
                                            <tr>
                                                <th>Batch</th>
                                                <th>Time</th>
                                                <th>Duration</th>
                                                <th>Sub Groups</th>
                                                <th>Lecturers</th>
                                                <th>Examiners</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedScheduleDetails.batchGroups.map(group => (
                                                <tr key={group.group_id} className="batch-group-row">
                                                    <td>{group.batch}</td>
                                                    <td>{formatTime(group.start_time)} - {formatTime(group.end_time)}</td>
                                                    <td>{group.duration} minutes</td>
                                                    <td>
                                                        {group.subGroups && group.subGroups.length > 0 
                                                            ? group.subGroups.map(subGroup => (
                                                                <span key={subGroup} className="tag">{subGroup}</span>
                                                            ))
                                                            : 'None'
                                                        }
                                                    </td>
                                                    <td>
                                                        {group.lecturers && group.lecturers.length > 0 
                                                            ? group.lecturers.map(lecturer => (
                                                                <div key={lecturer.lec_id} className="staff-badge">
                                                                    <User size={14} />
                                                                    <span>{lecturer.lec_name}</span>
                                                                </div>
                                                            ))
                                                            : 'None'
                                                        }
                                                    </td>
                                                    <td>
                                                        {group.examiners && group.examiners.length > 0 
                                                            ? group.examiners.map(examiner => (
                                                                <div key={examiner.examiner_id} className="staff-badge">
                                                                    <User size={14} />
                                                                    <span>{examiner.examiner_name}</span>
                                                                </div>
                                                            ))
                                                            : 'None'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button className="close-button" onClick={closeDetails}>
                                Close
                            </button>
                            <button className="print-details-button" onClick={generateDetailsPDF}>
                                <Download size={14} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LicSchedulesReport;
