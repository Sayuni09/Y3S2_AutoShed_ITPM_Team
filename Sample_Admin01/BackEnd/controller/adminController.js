const db = require("../models/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Get all admins
exports.getAdmins = (req, res) => {
    const query = "SELECT id, name, email, phone, role, created_at FROM admin";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
        
        res.json(results);
    });
};

// Add a new admin
exports.addAdmin = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new admin
        const query = "INSERT INTO admin (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
        
        db.query(query, [name, email, hashedPassword, phone, role], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to add admin" });
            }
            
            res.status(201).json({ 
                message: "Admin added successfully", 
                id: result.insertId
            });
        });
    } catch (error) {
        console.error("Error adding admin:", error);
        res.status(500).json({ message: "An error occurred while adding admin" });
    }
};

// Update an admin
exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, phone, role } = req.body;

    // Validate input
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        let query, params;
        
        // If password is provided, update it too
        if (password) {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            query = "UPDATE admin SET name = ?, email = ?, password = ?, phone = ?, role = ? WHERE id = ?";
            params = [name, email, hashedPassword, phone, role, id];
        } else {
            // Don't update password
            query = "UPDATE admin SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?";
            params = [name, email, phone, role, id];
        }
        
        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                
                // Check for duplicate email
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email already exists" });
                }
                
                return res.status(500).json({ message: "Failed to update admin" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Admin not found" });
            }
            
            res.json({ message: "Admin updated successfully" });
        });
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({ message: "An error occurred while updating admin" });
    }
};

// Delete an admin
exports.deleteAdmin = (req, res) => {
    const { id } = req.params;
    
    const query = "DELETE FROM admin WHERE id = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to delete admin" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.json({ message: "Admin deleted successfully" });
    });
};