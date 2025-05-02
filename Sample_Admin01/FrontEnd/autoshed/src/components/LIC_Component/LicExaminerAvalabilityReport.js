// LicExaminerAvalabilityReport.js
import React, { useState, useEffect } from 'react';
import { FileText, File, AlertCircle, CheckCircle, Activity, Calendar, Search, ChevronDown, Filter, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import '../../styles/LIC_Styles/LicExaminerAvalabilityReport.css';
import exAvailabilityService from '../../services/LIC_Services/ExAvailabilityService';

const LicExaminerAvalabilityReport = () => {
  const [examinerData, setExaminerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecturerId, setLecturerId] = useState('');
  const [exportSuccess, setExportSuccess] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    date: null,
    slot: '',
    maxSessions: ''
  });
  const [uniqueSlots] = useState(['morning_slot', 'mid_day_slot', 'afternoon_slot']);
  const [uniqueMaxSessions, setUniqueMaxSessions] = useState([]);
  
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setLecturerId(decodedToken.id);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Failed to authenticate. Please login again.");
        setLoading(false);
      }
    } else {
      setError("Not authenticated. Please login.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchExaminers = async () => {
      if (!lecturerId) return;
      
      try {
        const data = await exAvailabilityService.getExaminers(lecturerId);
        setExaminerData(data);
        
        // Initialize all modules as expanded
        const expanded = data.reduce((acc, module) => {
          acc[module.module_code] = true;
          return acc;
        }, {});
        setExpandedModules(expanded);
        
        // Extract unique max sessions values for filter
        const maxSessionsSet = new Set();
        data.forEach(module => {
          if (module.examiners) {
            module.examiners.forEach(examiner => {
              if (examiner.availability) {
                examiner.availability.forEach(form => {
                  form.slots.forEach(slot => {
                    maxSessionsSet.add(slot.max_sessions_per_day);
                  });
                });
              }
            });
          }
        });
        
        setUniqueMaxSessions(Array.from(maxSessionsSet).sort((a, b) => a - b));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching examiners:", err);
        setError("Failed to fetch examiner data. Please try again later.");
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchExaminers();
    }
  }, [lecturerId]);

  // Apply filters and search when dependencies change
  useEffect(() => {
    if (!examinerData.length) {
      setFilteredData([]);
      return;
    }
    
    // Deep clone to avoid modifying original data
    const clonedData = JSON.parse(JSON.stringify(examinerData));
    
    // Filter modules and examiners based on search term and filters
    const filtered = clonedData.map(module => {
      // Check if module code matches search term
      const moduleMatches = module.module_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter examiners
      const filteredExaminers = module.examiners ? module.examiners.filter(examiner => {
        // Check if examiner name or email matches search
        const examinerMatches = examiner.examiner_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               examiner.examiner_email.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter availability
        if (examiner.availability) {
          examiner.availability = examiner.availability.map(form => {
            // Apply filters to slots
            form.slots = form.slots.filter(slot => {
              const dateMatches = !filterOptions.date || new Date(slot.available_date).toISOString().split('T')[0] === filterOptions.date;
              let slotMatches = true;
              
              if (filterOptions.slot) {
                slotMatches = slot[filterOptions.slot] === true;
              }
              
              const maxSessionsMatches = !filterOptions.maxSessions || slot.max_sessions_per_day === parseInt(filterOptions.maxSessions);
              
              return dateMatches && slotMatches && maxSessionsMatches;
            });
            
            return form.slots.length > 0 ? form : null;
          }).filter(Boolean); // Remove forms with no matching slots
        }
        
        return (moduleMatches || examinerMatches) && 
               (!examiner.availability || examiner.availability.length > 0);
      }) : [];
      
      // Only keep module if it has matching examiners
      return {
        ...module,
        examiners: filteredExaminers
      };
    }).filter(module => module.examiners && module.examiners.length > 0);
    
    setFilteredData(filtered);
  }, [examinerData, searchTerm, filterOptions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSlotLabel = (slot) => {
    switch(slot) {
      case 'morning_slot': return '9:00 AM - 11:00 AM';
      case 'mid_day_slot': return '11:00 AM - 1:00 PM';
      case 'afternoon_slot': return '2:00 PM - 4:00 PM';
      default: return '';
    }
  };

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
      slot: '',
      maxSessions: ''
    });
  };

  

  const generatePDF = () => {
    if (!examinerData || examinerData.length === 0) {
      setExportSuccess({ success: false, message: "No data available to generate report" });
      setTimeout(() => setExportSuccess(null), 3000);
      return;
    }
  
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    // Add title and date
    doc.setFontSize(18);
    doc.text('Examiner Availability Report', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
    
    let yPosition = 30;
  
    // Process each module
    examinerData.forEach(module => {
      // Add module header
      doc.setFontSize(14);
      doc.text(`Module: ${module.module_code}`, 14, yPosition);
      yPosition += 8;
  
      // Check if we need to add a new page
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
  
      // Process examiners in this module
      if (module.examiners && module.examiners.length > 0) {
        module.examiners.forEach(examiner => {
          // Add examiner name
          doc.setFontSize(12);
          doc.text(`Examiner: ${examiner.examiner_name} (${examiner.examiner_email})`, 20, yPosition);
          yPosition += 6;
  
          // Check if we need to add a new page
          if (yPosition > 180) {
            doc.addPage();
            yPosition = 20;
          }
  
          // If the examiner has availability data
          if (examiner.availability && examiner.availability.length > 0) {
            // Prepare table data for availability
            const tableData = [];
            examiner.availability.forEach(form => {
              form.slots.forEach(slot => {
                const row = [
                  formatDate(slot.available_date),
                  slot.morning_slot ? `✓ (${getSlotLabel('morning_slot')})` : '-',
                  slot.mid_day_slot ? `✓ (${getSlotLabel('mid_day_slot')})` : '-',
                  slot.afternoon_slot ? `✓ (${getSlotLabel('afternoon_slot')})` : '-',
                  slot.max_sessions_per_day,
                  form.comments || 'No comments'
                ];
                tableData.push(row);
              });
            });
  
            // Add the table using autoTable function
            autoTable(doc, {
              startY: yPosition,
              head: [['Date', 'Morning', 'Mid-day', 'Afternoon', 'Max Sessions', 'Comments']],
              body: tableData,
              theme: 'grid',
              headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle'
              },
              styles: {
                overflow: 'linebreak',
                cellPadding: 3,
                fontSize: 8
              },
              columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 'auto' }
              },
              margin: { top: 25, right: 15, bottom: 25, left: 15 },
              tableWidth: 'auto',
              didParseCell: function(data) {
                if (data.section === 'body' && data.column.index > 0 && data.column.index < 4 && data.cell.text[0].includes('✓')) {
                  data.cell.styles.fillColor = [220, 242, 220];
                  data.cell.styles.textColor = [0, 100, 0];
                }
              }
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
          } else {
            doc.setFontSize(10);
            doc.text('No availability data found.', 25, yPosition);
            yPosition += 10;
          }
  
          // Check if we need to add a new page for the next examiner
          if (yPosition > 180) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        doc.setFontSize(10);
        doc.text('No examiners found for this module.', 20, yPosition);
        yPosition += 10;
      }
  
      // Add space between modules
      yPosition += 5;
  
      // Check if we need to add a new page for the next module
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
    });
  
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
  
    // Save the PDF
    doc.save('examiner_availability_report.pdf');
    
    // Show success message
    setExportSuccess({ success: true, message: "PDF report generated successfully!" });
    setTimeout(() => setExportSuccess(null), 3000);
  };
  

  const generateCSV = () => {
    if (!examinerData || examinerData.length === 0) {
      setExportSuccess({ success: false, message: "No data available to generate report" });
      setTimeout(() => setExportSuccess(null), 3000);
      return;
    }

    // Prepare CSV headers with report title and timestamp (header section)
    const csvRows = [
      [`Examiner Availability Report - Generated on ${new Date().toLocaleString()}`],
      ['AutoShed - University Scheduling System'],
      [''], // Empty row as separator
      ['Module Code', 'Examiner Name', 'Email', 'Available Date', 'Morning', 'Mid-day', 'Afternoon', 'Max Sessions', 'Comments']
    ];

    // Process data for CSV
    examinerData.forEach(module => {
      if (module.examiners && module.examiners.length > 0) {
        module.examiners.forEach(examiner => {
          if (examiner.availability && examiner.availability.length > 0) {
            examiner.availability.forEach(form => {
              form.slots.forEach(slot => {
                const row = [
                  module.module_code,
                  examiner.examiner_name,
                  examiner.examiner_email,
                  formatDate(slot.available_date),
                  slot.morning_slot ? `Available (${getSlotLabel('morning_slot')})` : 'Not Available',
                  slot.mid_day_slot ? `Available (${getSlotLabel('mid_day_slot')})` : 'Not Available',
                  slot.afternoon_slot ? `Available (${getSlotLabel('afternoon_slot')})` : 'Not Available',
                  slot.max_sessions_per_day,
                  form.comments || 'No comments'
                ];
                csvRows.push(row);
              });
            });
          } else {
            // Add a row indicating no availability data
            csvRows.push([
              module.module_code,
              examiner.examiner_name,
              examiner.examiner_email,
              'No availability data',
              '',
              '',
              '',
              '',
              ''
            ]);
          }
        });
      }
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
    link.setAttribute('download', 'examiner_availability_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    setExportSuccess({ success: true, message: "CSV report generated successfully!" });
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <div className="availability-report-container">
      {exportSuccess && (
        <div className={`notification ${exportSuccess.success ? 'success' : 'error'}`}>
          {exportSuccess.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p>{exportSuccess.message}</p>
        </div>
      )}

      <div className="report-header">
        
        <h2>Examiner Availability Report</h2>
        <div className="report-actions">
          <button className="export-btn pdf" onClick={generatePDF} disabled={loading || !examinerData.length}>
            <FileText size={16} /> Export as PDF
          </button>
          <button className="export-btn csv" onClick={generateCSV} disabled={loading || !examinerData.length}>
            <File size={16} /> Export as CSV
          </button>
        </div>
      </div>

      <div className="report-tools">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by module code, examiner name or email..." 
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
            <label>Time Slot:</label>
            <select 
              value={filterOptions.slot}
              onChange={(e) => setFilterOptions({...filterOptions, slot: e.target.value})}
            >
              <option value="">All Slots</option>
              {uniqueSlots.map(slot => (
                <option key={slot} value={slot}>{getSlotLabel(slot)}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Max Sessions:</label>
            <select 
              value={filterOptions.maxSessions}
              onChange={(e) => setFilterOptions({...filterOptions, maxSessions: e.target.value})}
            >
              <option value="">All</option>
              {uniqueMaxSessions.map(sessions => (
                <option key={sessions} value={sessions}>{sessions}</option>
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
          <span className="summary-value">{filteredData.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Examiners:</span>
          <span className="summary-value">
            {filteredData.reduce((total, module) => total + (module.examiners?.length || 0), 0)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Available Time Slots:</span>
          <div className="slot-badges">
            {uniqueSlots.map(slot => (
              <span key={slot} className="slot-badge">{getSlotLabel(slot)}</span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading examiner availability data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="no-data">
          <Calendar size={48} className="no-data-icon" />
          <p>No examiner availability data found matching your criteria.</p>
          <button onClick={resetFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="report-content">
          {filteredData.map(module => (
            <div className="module-section" key={module.module_code}>
              <div 
                className="module-header" 
                onClick={() => toggleModule(module.module_code)}
              >
                <h3>
                  <Activity size={20} className="module-icon" />
                  {module.module_code} ({module.examiners.length} Examiners)
                </h3>
                <ChevronDown 
                  size={20} 
                  className={expandedModules[module.module_code] ? 'rotated' : ''}
                />
              </div>
              
              {expandedModules[module.module_code] && (
                <div className="module-content">
                  {module.examiners.map(examiner => (
                    <div className="examiner-section" key={examiner.examiner_id}>
                      <div className="examiner-info">
                        <User size={16} className="examiner-icon" />
                        <h4>{examiner.examiner_name}</h4>
                        <span className="examiner-email">{examiner.examiner_email}</span>
                      </div>
                      
                      {examiner.availability && examiner.availability.length > 0 ? (
                        <div className="availability-data">
                          <table className="availability-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Morning Slot</th>
                                <th>Mid-day Slot</th>
                                <th>Afternoon Slot</th>
                                <th>Max Sessions</th>
                                <th>Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              {examiner.availability.flatMap(form => 
                                form.slots.map((slot, idx) => (
                                  <tr key={`${examiner.examiner_id}-${idx}`}>
                                    <td>{formatDate(slot.available_date)}</td>
                                    <td className={slot.morning_slot ? 'available' : 'unavailable'}>
                                      {slot.morning_slot ? '✓' : '✗'}
                                    </td>
                                    <td className={slot.mid_day_slot ? 'available' : 'unavailable'}>
                                      {slot.mid_day_slot ? '✓' : '✗'}
                                    </td>
                                    <td className={slot.afternoon_slot ? 'available' : 'unavailable'}>
                                      {slot.afternoon_slot ? '✓' : '✗'}
                                    </td>
                                    <td>{slot.max_sessions_per_day}</td>
                                    <td>{form.comments || 'No comments'}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="no-availability">
                          <p>No availability data submitted.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LicExaminerAvalabilityReport;
