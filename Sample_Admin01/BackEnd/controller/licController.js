const db = require("../models/db");
const bcrypt = require("bcryptjs");

// Get all lecturers in charge
exports.getLic = (req, res) => {
    const query = "SELECT lec_id, lec_name, lec_email, phone_number, lic_modules, created_at FROM lic";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
        
        res.json(results);
    });
};

// Add a new lecturer in charge
exports.addLic = async (req, res) => {
    const { lec_id, lec_name, lec_email, password, phone_number, lic_modules } = req.body;

    // Validate input
    if (!lec_id || !lec_name || !lec_email || !password) {
        return res.status(400).json({ message: "Lecturer ID, name, email, and password are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new lecturer in charge
        const query = "INSERT INTO lic (lec_id, lec_name, lec_email, password, phone_number, lic_modules) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.query(query, [lec_id, lec_name, lec_email, hashedPassword, phone_number, JSON.stringify(lic_modules)], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to add lecturer in charge" });
            }

            res.status(201).json({ 
                message: "Lecturer in charge added successfully", 
                id: lec_id 
            });
        });
    } catch (error) {
        console.error("Error adding lecturer in charge:", error);
        res.status(500).json({ message: "An error occurred while adding lecturer in charge" });
    }
};

// Update a lecturer in charge
exports.updateLic = async (req, res) => {
    const { id } = req.params; // This is the current lec_id
    const { lec_name, lec_email, password, phone_number, lic_modules } = req.body;

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
            
            query = "UPDATE lic SET lec_name = ?, lec_email = ?, password = ?, phone_number = ?, lic_modules = ? WHERE lec_id = ?";
            params = [lec_name, lec_email, hashedPassword, phone_number, JSON.stringify(lic_modules), id];
        } else {
            query = "UPDATE lic SET lec_name = ?, lec _email = ?, phone_number = ?, lic_modules = ? WHERE lec_id = ?";
            params = [lec_name, lec_email, phone_number, JSON.stringify(lic_modules), id];
        }

        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to update lecturer in charge" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Lecturer in charge not found" });
            }
            
            res.json({ message: "Lecturer in charge updated successfully" });
        });
    } catch (error) {
        console.error("Error updating lecturer in charge:", error);
        res.status(500).json({ message: "An error occurred while updating lecturer in charge" });
    }
};

// Delete a lecturer in charge
exports.deleteLic = (req, res) => {
    const { id } = req.params;
    
    const query = "DELETE FROM lic WHERE lec_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to delete lecturer in charge" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Lecturer in charge not found" });
        }
        
        res.json({ message: "Lecturer in charge deleted successfully" });
    });
};