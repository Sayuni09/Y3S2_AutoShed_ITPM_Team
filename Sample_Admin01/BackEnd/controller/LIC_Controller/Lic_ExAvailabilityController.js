const db = require("../../models/db");

// Get examiners and their availability based on the logged-in lecturer's module codes
exports.getExaminers = (req, res) => {
    const { lec_id } = req.params; // Get the lecturer ID from the request parameters

    // Query to get the lecturer's modules
    const moduleQuery = "SELECT lic_modules FROM lic WHERE lec_id = ?";
    
    db.query(moduleQuery, [lec_id], (err, moduleResults) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        if (moduleResults.length === 0) {
            return res.status(404).json({ message: "Lecturer not found" });
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

        // Query to get all examiners who teach any of the modules taught by the LIC
        const examinersQuery = `
            SELECT e.examiner_id, e.examiner_name, e.examiner_email, e.module_codes
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

            // Get all the form IDs for these examiners
            const examinerIds = examinersResults.map(examiner => examiner.examiner_id);
            
            // Query to get the availability forms for the relevant examiners
            const availabilityQuery = `
                SELECT f.form_id, f.comments, f.examiner_id, f.created_at, 
                       s.slot_id, DATE_FORMAT(s.available_date, '%Y-%m-%d') AS available_date, 
                       s.morning_slot, s.mid_day_slot, s.afternoon_slot, s.max_sessions_per_day,
                       e.examiner_name, e.examiner_email, e.module_codes
                FROM examiners_availability_forms f
                JOIN examiners_availability_slots s ON f.form_id = s.form_id
                JOIN examiners e ON f.examiner_id = e.examiner_id
                WHERE f.examiner_id IN (?)
            `;

            db.query(availabilityQuery, [examinerIds], (err, availabilityResults) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Database error occurred" });
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
                            // Get availability data for this examiner
                            const examinerAvailability = availabilityResults.filter(
                                availability => availability.examiner_id === examiner.examiner_id
                            );

                            if (examinerAvailability.length > 0) {
                                // Group slots by form_id
                                const formGroups = {};
                                
                                examinerAvailability.forEach(slot => {
                                    if (!formGroups[slot.form_id]) {
                                        formGroups[slot.form_id] = {
                                            form_id: slot.form_id,
                                            comments: slot.comments,
                                            created_at: slot.created_at,
                                            slots: []
                                        };
                                    }
                                    
                                    formGroups[slot.form_id].slots.push({
                                        slot_id: slot.slot_id,
                                        available_date: slot.available_date,
                                        morning_slot: Boolean(slot.morning_slot),
                                        mid_day_slot: Boolean(slot.mid_day_slot),
                                        afternoon_slot: Boolean(slot.afternoon_slot),
                                        max_sessions_per_day: slot.max_sessions_per_day
                                    });
                                });

                                // Add examiner with availability to the module
                                moduleEntry.examiners.push({
                                    examiner_id: examiner.examiner_id,
                                    examiner_name: examiner.examiner_name,
                                    examiner_email: examiner.examiner_email,
                                    availability: Object.values(formGroups)
                                });
                            } else {
                                // Add examiner without availability
                                moduleEntry.examiners.push({
                                    examiner_id: examiner.examiner_id,
                                    examiner_name: examiner.examiner_name,
                                    examiner_email: examiner.examiner_email,
                                    availability: []
                                });
                            }
                        }
                    });

                    groupedResults.push(moduleEntry);
                });

                // Send the grouped results as the response
                res.json(groupedResults);
            });
        });
    });
};