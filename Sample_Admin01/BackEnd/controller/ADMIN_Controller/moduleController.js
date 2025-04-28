const db = require("../../models/db");

// Get all modules
exports.getModules = (req, res) => {
    const query = "SELECT module_code, module_name FROM modules";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to fetch modules" });
        }
        res.json(results);
    });
};
