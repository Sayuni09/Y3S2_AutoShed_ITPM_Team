const db = require("../../models/db");

// Get all free time slots
exports.getFreeTimeSlots = (req, res) => {
    const query = `SELECT f.*, m.module_name 
                   FROM free_time_slots f
                   JOIN modules m ON f.module_code = m.module_code`;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
        res.json(results);
    });
};

// Get all LICs
exports.getLICs = (req, res) => {
    console.log("Fetching LICs...");
    const query = `
        SELECT 
            lec_id,
            lec_name,
            lec_email,
            phone_number
        FROM lic 
        ORDER BY lec_name
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error when fetching LICs:", err);
            return res.status(500).json({ message: "Database error occurred", error: err.message });
        }
        
        console.log("LICs fetched:", results);
        
        if (!results || results.length === 0) {
            console.log("No LICs found in database");
            return res.status(404).json({ message: "No LICs found" });
        }
        
        res.json(results);
    });
};

// Add a new free time slot
exports.addFreeTimeSlot = (req, res) => {
    const { 
        module_code, academic_year, semester, week_start_date, 
        week_end_date, date, start_time, end_time, venue_name, 
        allocated_to, status 
    } = req.body;

    // Validation
    if (!module_code || !date || !start_time || !end_time || !venue_name) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    const query = `INSERT INTO free_time_slots (
        module_code, academic_year, semester, week_start_date, 
        week_end_date, date, start_time, end_time, venue_name, 
        allocated_to, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        module_code, academic_year, semester, week_start_date, 
        week_end_date, date, start_time, end_time, venue_name, 
        allocated_to, status || 'available'
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to add time slot" });
        }
        res.status(201).json({ 
            message: "Time slot added successfully", 
            id: result.insertId
        });
    });
};

// Update a free time slot
exports.updateFreeTimeSlot = (req, res) => {
    const { id } = req.params;
    const { 
        module_code, academic_year, semester, week_start_date, 
        week_end_date, date, start_time, end_time, venue_name, 
        allocated_to, status 
    } = req.body;

    const query = `UPDATE free_time_slots SET 
        module_code = ?, academic_year = ?, semester = ?, 
        week_start_date = ?, week_end_date = ?, date = ?,
        start_time = ?, end_time = ?, venue_name = ?,
        allocated_to = ?, status = ?
        WHERE id = ?`;
    
    const values = [
        module_code, academic_year, semester, week_start_date, 
        week_end_date, date, start_time, end_time, venue_name, 
        allocated_to, status, id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to update time slot" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Time slot not found" });
        }
        res.json({ message: "Time slot updated successfully" });
    });
};

// Delete a free time slot
exports.deleteFreeTimeSlot = (req, res) => {
    const { id } = req.params;
    
    const query = "DELETE FROM free_time_slots WHERE id = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to delete time slot" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Time slot not found" });
        }
        res.json({ message: "Time slot deleted successfully" });
    });
};
