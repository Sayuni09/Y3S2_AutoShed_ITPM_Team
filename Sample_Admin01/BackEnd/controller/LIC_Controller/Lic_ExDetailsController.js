const db = require("../../models/db");

// Get examiner details based on the logged-in LIC's module codes
exports.getExaminerDetails = (req, res) => {
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

        // Query to find relevant examiners based on the modules
        const examinersQuery = `
            SELECT e.examiner_id, e.examiner_name, e.examiner_email, e.phone_number, e.module_codes
            FROM examiners e
            WHERE 
                JSON_OVERLAPS(e.module_codes, ?)
        `;

        db.query(examinersQuery, [JSON.stringify(modules)], (err, examinersResults) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error occurred" });
            }

            if (examinersResults.length === 0) {
                return res.json([]);
            }

            // Group results by module code
            const groupedResults = [];

            // Process for each module in the LIC's modules
            modules.forEach(moduleCode => {
                const moduleEntry = {
                    module_code: moduleCode,
                    examiners: []
                };

                // Find examiners who teach this module
                examinersResults.forEach(examiner => {
                    let examinerModules;
                    try {
                        examinerModules = JSON.parse(examiner.module_codes);
                    } catch (e) {
                        examinerModules = examiner.module_codes;
                    }

                    if (Array.isArray(examinerModules) && examinerModules.includes(moduleCode)) {
                        // Add examiner details to the module entry
                        moduleEntry.examiners.push({
                            examiner_id: examiner.examiner_id,
                            examiner_name: examiner.examiner_name,
                            examiner_email: examiner.examiner_email,
                            phone_number: examiner.phone_number // Include phone number
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