const db = require("../../models/db");

// Get lecturers and their availability based on the logged-in lecturer's module codes
exports.getLecturers = (req, res) => {
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
            // Try to parse if stored as JSON string
            modules = JSON.parse(moduleResults[0].lic_modules);
        } catch (e) {
            // If already a JS object or array
            modules = moduleResults[0].lic_modules;
        }

        // If modules is not an array, handle the error
        if (!Array.isArray(modules)) {
            return res.status(400).json({ message: "Invalid format for lic_modules" });
        }

        // Query to get all lecturers who teach any of the modules taught by the LIC
        const lecturersQuery = `
            SELECT l.lec_id, l.lec_name, l.lec_email, l.lecture_modules
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

            // Get all the form IDs for these lecturers
            const lecturerIds = lecturersResults.map(lecturer => lecturer.lec_id);
            
            // Query to get the availability forms for the relevant lecturers
            const availabilityQuery = `
                SELECT f.form_id, f.comments, f.lec_id, f.created_at, 
                       s.slot_id, DATE_FORMAT(s.available_date, '%Y-%m-%d') AS available_date, 
                       s.morning_slot, s.mid_day_slot, s.afternoon_slot, s.max_sessions_per_day,
                       l.lec_name, l.lec_email, l.lecture_modules
                FROM lecturer_availability_forms f
                JOIN lecturer_availability_slots s ON f.form_id = s.form_id
                JOIN lecturers l ON f.lec_id = l.lec_id
                WHERE f.lec_id IN (?)
            `;

            db.query(availabilityQuery, [lecturerIds], (err, availabilityResults) => {
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
                            // Get availability data for this lecturer
                            const lecturerAvailability = availabilityResults.filter(
                                availability => availability.lec_id === lecturer.lec_id
                            );

                            if (lecturerAvailability.length > 0) {
                                // Group slots by form_id
                                const formGroups = {};
                                
                                lecturerAvailability.forEach(slot => {
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

                                // Add lecturer with availability to the module
                                moduleEntry.lecturers.push({
                                    lec_id: lecturer.lec_id,
                                    lec_name: lecturer.lec_name,
                                    lec_email: lecturer.lec_email,
                                    availability: Object.values(formGroups)
                                });
                            } else {
                                // Add lecturer without availability
                                moduleEntry.lecturers.push({
                                    lec_id: lecturer.lec_id,
                                    lec_name: lecturer.lec_name,
                                    lec_email: lecturer.lec_email,
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