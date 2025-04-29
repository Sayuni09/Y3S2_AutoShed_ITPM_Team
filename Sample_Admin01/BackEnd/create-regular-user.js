const db = require("./models/db");
const bcrypt = require("bcryptjs");

// User details to insert (change details as needed)
const newUser = {
    name: "Regular User",  // Change name
    email: "user1@example.com",  // Change email
    password: "",  // Will be hashed before insertion
    phone: "9876543210",  // Change phone number
    role: "user" // Change role to "admin" if needed
};

// Hash the password
bcrypt.hash(newUser.password, 10, (err, hash) => {
    if (err) {
        console.error("Failed to hash password:", err);
        process.exit(1);
    }
    
    console.log("Password successfully hashed");
    
    // Check if user already exists
    db.query("SELECT * FROM admin WHERE email = ?", [newUser.email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            process.exit(1);
        }
        
        if (results.length > 0) {
            console.log(`User with email ${newUser.email} already exists. Updating password...`);
            
            // Update existing user's password and role
            db.query(
                "UPDATE admin SET password = ?, role = ? WHERE email = ?",
                [hash, newUser.role, newUser.email],
                (err, results) => {
                    if (err) {
                        console.error("Failed to update user:", err);
                        process.exit(1);
                    }
                    
                    console.log("User password and role updated successfully");
                    console.log(`Email: ${newUser.email}`);
                    console.log(`Password (unhashed): ${newUser.password}`);
                    console.log(`Password hash: ${hash}`);
                    process.exit(0);
                }
            );
        } else {
            console.log("Creating new user...");
            
            // Insert new user
            db.query(
                "INSERT INTO admin (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
                [newUser.name, newUser.email, hash, newUser.phone, newUser.role],
                (err, results) => {
                    if (err) {
                        console.error("Failed to insert user:", err);
                        process.exit(1);
                    }
                    
                    console.log("User created successfully");
                    console.log(`Email: ${newUser.email}`);
                    console.log(`Password (unhashed): ${newUser.password}`);
                    console.log(`Password hash: ${hash}`);
                    process.exit(0);
                }
            );
        }
    });
});