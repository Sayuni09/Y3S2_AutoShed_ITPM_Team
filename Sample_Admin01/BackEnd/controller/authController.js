const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Important: Make sure this matches your actual table name in the database
    // For MySQL on some systems, table names are case-sensitive
    const query = "SELECT * FROM admin WHERE email = ?";
    
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        
        try {
            // Log the password from the request and the hashed password from DB for debugging
            console.log("Input password:", password);
            console.log("DB password hash:", user.password);
            
            // Important: Make sure bcrypt.compare is working as expected
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Password match result:", isMatch);
            
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            if (user.role !== "admin") {
                return res.status(403).json({ message: "Access denied. Admin privileges required." });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: "1h" }
            );

            res.json({ 
                message: "Login successful", 
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error("Authentication error:", error);
            return res.status(500).json({ message: "Authentication error occurred" });
        }
    });
};