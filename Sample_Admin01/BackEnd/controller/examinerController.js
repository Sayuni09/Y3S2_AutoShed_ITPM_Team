const db = require("../models/db");
const bcrypt = require("bcryptjs");

// Get all examiners
exports.getExaminers = (req, res) => {
    const query = "SELECT examiner_id, examiner_name, examiner_email, phone_number, module_codes, created_at FROM examiners";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
        
        res.json(results);
    });
};

// Add a new examiner
exports.addExaminer = async (req, res) => {
    const { examiner_id, examiner_name, examiner_email, password, phone_number, module_codes } = req.body;

    // Validate input
    if (!examiner_id || !examiner_name || !examiner_email || !password) {
        return res.status(400).json({ message: "Examiner ID, name, email, and password are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new examiner
        const query = "INSERT INTO examiners (examiner_id, examiner_name, examiner_email, password, phone_number, module_codes) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.query(query, [examiner_id, examiner_name, examiner_email, hashedPassword, phone_number, JSON.stringify(module_codes)], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to add examiner" });
            }

            res.status(201).json({ 
                message: "Examiner added successfully", 
                id: examiner_id 
            });
        });
    } catch (error) {
        console.error("Error adding examiner:", error);
        res.status(500).json({ message: "An error occurred while adding examiner" });
    }
};

// Update an examiner
// Update an examiner
exports.updateExaminer = async (req, res) => {
    const { id } = req.params; // This is the current examiner_id
    const { examiner_id, examiner_name, examiner_email, password, phone_number, module_codes } = req.body;

    // Validate input
    if (!examiner_name || !examiner_email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        let query, params;

        // If password is provided, update it too
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            query = "UPDATE examiners SET examiner_id = ?, examiner_name = ?, examiner_email = ?, password = ?, phone_number = ?, module_codes = ? WHERE examiner_id = ?";
            params = [examiner_id || id, examiner_name, examiner_email, hashedPassword, phone_number, JSON.stringify(module_codes), id];
        } else {
            query = "UPDATE examiners SET examiner_id = ?, examiner_name = ?, examiner_email = ?, phone_number = ?, module_codes = ? WHERE examiner_id = ?";
            params = [examiner_id || id, examiner_name, examiner_email, phone_number, JSON.stringify(module_codes), id];
        }

        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to update examiner" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Examiner not found" });
            }
            
            res.json({ message: "Examiner updated successfully" });
        });
    } catch (error) {
        console.error("Error updating examiner:", error);
        res.status(500).json({ message: "An error occurred while updating examiner" });
    }
};

// Delete an examiner
exports.deleteExaminer = (req, res) => {
    const { id } = req.params;
    
    const query = "DELETE FROM examiners WHERE examiner_id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to delete examiner" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Examiner not found" });
        }
        
        res.json({ message: "Examiner deleted successfully" });
    });
};