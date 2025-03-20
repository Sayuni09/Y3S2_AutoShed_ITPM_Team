const db = require("../models/db");
const bcrypt = require("bcryptjs");

// Get all lecturers
exports.getLecturers = (req, res) => {
    const query = "SELECT lec_id, lec_name, lec_email, phone_number, lecture_modules, created_at FROM lecturers";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
        
        res.json(results);
    });
};

// Add a new lecturer
exports.addLecturer = async (req, res) => {
    const { lec_id, lec_name, lec_email, password, phone_number, lecture_modules } = req.body;

    // Validate input
    if (!lec_id || !lec_name || !lec_email || !password) {
        return res.status(400).json({ message: "Lecturer ID, name, email, and password are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new lecturer
        const query = "INSERT INTO lecturers (lec_id, lec_name, lec_email, password, phone_number, lecture_modules) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.query(query, [lec_id, lec_name, lec_email, hashedPassword, phone_number, JSON.stringify(lecture_modules)], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to add lecturer" });
            }

            res.status(201).json({ 
                message: "Lecturer added successfully", 
                id: lec_id 
            });
        });
    } catch (error) {
        console.error("Error adding lecturer:", error);
        res.status(500).json({ message: "An error occurred while adding lecturer" });
    }
};

// Update a lecturer
exports.updateLecturer = async (req, res) => {
    const { id } = req.params; // This is the current lec_id
    const { lec_id, lec_name, lec_email, password, phone_number, lecture_modules } = req.body;

    // Validate input
    if (!lec_name || !lec_email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        let query, params;

        // If password is provided, update it too
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            query = "UPDATE lecturers SET lec_id = ?, lec_name = ?, lec_email = ?, password = ?, phone_number = ?, lecture_modules = ? WHERE lec_id = ?";
            params = [lec_id, lec_name, lec_email, hashedPassword, phone_number, JSON.stringify(lecture_modules), id];
        } else {
            // Don't update password
            query = "UPDATE lecturers SET lec_id = ?, lec_name = ?, lec_email = ?, phone_number = ?, lecture_modules = ? WHERE lec_id = ?";
            params = [lec_id, lec_name, lec_email, phone_number, JSON.stringify(lecture_modules), id];
        }

        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to update lecturer" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Lecturer not found" });
            }
            
            res.json({ message: "Lecturer updated successfully" });
        });
    } catch (error) {
        console.error("Error updating lecturer:", error);
        res.status(500).json({ message: "An error occurred while updating lecturer" });
    }
};
// Delete a lecturer
exports.deleteLecturer = (req, res) => {
    const { id } = req.params;
    
    const query = "DELETE FROM lecturers WHERE lec_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to delete lecturer" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Lecturer not found" });
        }
        
        res.json({ message: "Lecturer deleted successfully" });
    });
};