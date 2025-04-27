const db = require("../../models/db");

// Get lecturer details based on the logged-in LIC's module codes
exports.getLecturerDetails = (req, res) => {
    const { lec_id } = req.params; // Get the lecturer ID from the request parameters
    console.log("Received lec_id:", lec_id);
    // Query to get the LIC's modules
    const moduleQuery = "SELECT lic_modules FROM lic WHERE lec_id = ?";
    
    db.query(moduleQuery, [lec_id], (err, moduleResults) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }
  
        console.log("Module Query Result:", moduleResults);
        
        if (moduleResults.length === 0) {
            return res.status(404).json({ message: "LIC not found" });
        }

        // Parse the lic_modules JSON data
        let modules;
        try {
            modules = JSON.parse(moduleResults[0].lic_modules);
        } catch (e) {
            modules = moduleResults[0].lic_modules;
        }

        if (!Array.isArray(modules)) {
            return res.status(400).json({ message: "Invalid format for lic_modules" });
        }

        // Query to find relevant lecturers based on the modules
        const lecturersQuery = `
            SELECT l.lec_id, l.lec_name, l.lec_email, l.phone_number, l.lecture_modules
            FROM lecturers l
            WHERE 
                JSON_OVERLAPS(l.lecture_modules, ?)
        `;

        db.query(lecturersQuery, [JSON.stringify(modules)], (err, lecturersResults) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error occurred" });
            }

            if (lecturersResults.length === 0) {
                return res.json([]);
            }

            // Group results by module code
            const groupedResults = [];

            // Process for each module in the LIC's modules
            modules.forEach(moduleCode => {
                const moduleEntry = {
                    module_code: moduleCode,
                    lecturers: []
                };

                // Find lecturers who teach this module
                lecturersResults.forEach(lecturer => {
                    let lecturerModules;
                    try {
                        lecturerModules = JSON.parse(lecturer.lecture_modules);
                    } catch (e) {
                        lecturerModules = lecturer.lecture_modules;
                    }

                    if (Array.isArray(lecturerModules) && lecturerModules.includes(moduleCode)) {
                        // Add lecturer details to the module entry
                        moduleEntry.lecturers.push({
                            lec_id: lecturer.lec_id,
                            lec_name: lecturer.lec_name,
                            lec_email: lecturer.lec_email,
                            phone_number: lecturer.phone_number // Include phone number
                        });
                    }
                });

                groupedResults.push(moduleEntry);
            });

            // Send the grouped results as the response
            res.json(groupedResults);
        });
    });
};