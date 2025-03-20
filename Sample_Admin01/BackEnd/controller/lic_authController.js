// D:\React_Nodejs\Sample_Admin01\BackEnd\controller\lic_authController.js

const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const query = "SELECT * FROM lic WHERE lec_email = ?";
    
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
            console.log("Input password:", password);
            console.log("DB password hash:", user.password);
            
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Password match result:", isMatch);
            
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign(
                { id: user.lec_id, email: user.lec_email }, 
                process.env.JWT_SECRET, 
                { expiresIn: "1h" }
            );

            res.json({ 
                message: "Login successful", 
                token,
                user: {
                    id: user.lec_id,
                    name: user.lec_name,
                    email: user.lec_email
                }
            });
        } catch (error) {
            console.error("Authentication error:", error);
            return res.status(500).json({ message: "Authentication error occurred" });
        }
    });
};