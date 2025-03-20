const db = require("./models/db");
const bcrypt = require("bcryptjs");

// Test database connection
console.log("Testing database connection...");
db.query("SELECT 2", (err, results) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
    console.log("Database connection successful!");
    
    // Test admin table query
    console.log("\nTesting admin table query...");
    db.query("SELECT * FROM admin", (err, results) => {
        if (err) {
            console.error("Failed to query admin table:", err);
            process.exit(1);
        }
        console.log(`Found ${results.length} admin records in the database.`);
        
        if (results.length > 0) {
            console.log("\nAdmin records:");
            results.forEach((admin, index) => {
                console.log(`\nAdmin #${index + 1}:`);
                console.log(`- ID: ${admin.id}`);
                console.log(`- Name: ${admin.name}`);
                console.log(`- Email: ${admin.email}`);
                console.log(`- Role: ${admin.role}`);
                console.log(`- Password Hash Length: ${admin.password.length}`);
            });
            
            // Let's create a test password to check bcrypt
            console.log("\nTesting password hashing...");
            const testPassword = "password123";
            bcrypt.hash(testPassword, 10, (err, hash) => {
                if (err) {
                    console.error("Failed to hash password:", err);
                    process.exit(1);
                }
                
                console.log(`Test password: ${testPassword}`);
                console.log(`Generated hash: ${hash}`);
                
                // Now let's verify the hash works
                bcrypt.compare(testPassword, hash, (err, isMatch) => {
                    if (err) {
                        console.error("Failed to compare password:", err);
                        process.exit(1);
                    }
                    
                    console.log(`Password verification result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
                    
                    // Test the stored hash for the first admin
                    const storedHash = results[0].password;
                    console.log("\nTesting stored password hash...");
                    console.log(`Admin email: ${results[0].email}`);
                    console.log(`Stored hash: ${storedHash}`);
                    
                    // Try comparison with 'password123'
                    bcrypt.compare('password123', storedHash, (err, isMatch) => {
                        if (err) {
                            console.error("Failed to compare with stored hash:", err);
                        } else {
                            console.log(`Test with 'password123': ${isMatch ? 'MATCH' : 'NO MATCH'}`);
                        }
                        
                        // Let's check if hash is valid for bcrypt
                        if (!storedHash.startsWith('$2')) {
                            console.warn("WARNING: The stored password hash doesn't appear to be a valid bcrypt hash");
                            console.warn("It should start with '$2a$', '$2b$', or '$2y$'");
                        }
                        
                        process.exit(0);
                    });
                });
            });
        } else {
            console.log("No admin records found. You may need to insert some test data.");
            process.exit(0);
        }
    });
});