const db = require("./models/db");
const bcrypt = require("bcryptjs");

// Admin user details to insert
const adminUser = {
    name: "Admin",
    email: "admin@example.com",
    password: "",
    phone: "1234567890",
    role: "admin"
};

// Hash the password
bcrypt.hash(adminUser.password, 10, (err, hash) => {
    if (err) {
        console.error("Failed to hash password:", err);
        process.exit(1);
    }
    
    console.log("Password successfully hashed");
    
    // Check if admin already exists
    db.query("SELECT * FROM admin WHERE email = ?", [adminUser.email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            process.exit(1);
        }
        
        if (results.length > 0) {
            console.log(`Admin with email ${adminUser.email} already exists. Updating password...`);
            
            // Update existing admin's password
            db.query(
                "UPDATE admin SET password = ? WHERE email = ?",
                [hash, adminUser.email],
                (err, results) => {
                    if (err) {
                        console.error("Failed to update admin:", err);
                        process.exit(1);
                    }
                    
                    console.log("Admin password updated successfully");
                    console.log(`Email: ${adminUser.email}`);
                    console.log(`Password (unhashed): ${adminUser.password}`);
                    console.log(`Password hash: ${hash}`);
                    process.exit(0);
                }
            );
        } else {
            console.log("Creating new admin user...");
            
            // Insert new admin
            db.query(
                "INSERT INTO admin (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
                [adminUser.name, adminUser.email, hash, adminUser.phone, adminUser.role],
                (err, results) => {
                    if (err) {
                        console.error("Failed to insert admin:", err);
                        process.exit(1);
                    }
                    
                    console.log("Admin user created successfully");
                    console.log(`Email: ${adminUser.email}`);
                    console.log(`Password (unhashed): ${adminUser.password}`);
                    console.log(`Password hash: ${hash}`);
                    process.exit(0);
                }
            );
        }
    });
});