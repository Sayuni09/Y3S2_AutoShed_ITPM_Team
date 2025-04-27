const db = require("../../models/db"); // Adjust the path as necessary

// Fetch all free time slots for the logged-in lic
exports.getLicTimeSlots = (req, res) => {
    const { lec_id } = req.params;  // Assuming the lec_id is stored in req.user after authentication

    const query = `
        SELECT 
            id, 
            module_code, 
            academic_year, 
            semester, 
            DATE_FORMAT(week_start_date, '%Y-%m-%d') AS week_start_date,
            DATE_FORMAT(week_end_date, '%Y-%m-%d') AS week_end_date,
            DATE_FORMAT(date, '%Y-%m-%d') AS date,
            start_time, 
            end_time, 
            venue_name, 
            allocated_to, 
            status, 
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,  -- Format created_at
            DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at   -- Format updated_at
        FROM free_time_slots 
        WHERE allocated_to = ? 
        ORDER BY date, start_time
    `;

    db.query(query, [lec_id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Database query error", error });
        }
        return res.status(200).json(results);
    });
};

// Fetch available lecturers for a specific time slot
exports.getAvailableLecturersForTimeSlot = (req, res) => {
    const { slot_id } = req.params;

    // First, get the time slot details
    const timeSlotQuery = `
        SELECT 
            id, 
            module_code, 
            date,
            start_time, 
            end_time
        FROM free_time_slots 
        WHERE id = ?
    `;

    db.query(timeSlotQuery, [slot_id], (error, timeSlotResults) => {
        if (error) {
            return res.status(500).json({ message: "Database query error", error });
        }

        if (timeSlotResults.length === 0) {
            return res.status(404).json({ message: "Time slot not found" });
        }

        const timeSlot = timeSlotResults[0];
        const { module_code, date, start_time, end_time } = timeSlot;

        // Determine which time slot the session falls into
        const slotConditions = [];
        
        // Morning slot: 9:00 AM - 12:00 PM (09:00:00 - 12:00:00)
        if ((start_time >= '09:00:00' && start_time < '12:00:00') || 
            (end_time > '09:00:00' && end_time <= '12:00:00') ||
            (start_time < '09:00:00' && end_time > '12:00:00')) {
            slotConditions.push('las.morning_slot = TRUE');
        }
        
        // Mid-day slot: 1:00 PM - 4:00 PM (13:00:00 - 16:00:00)
        if ((start_time >= '13:00:00' && start_time < '16:00:00') ||
            (end_time > '13:00:00' && end_time <= '16:00:00') ||
            (start_time < '13:00:00' && end_time > '16:00:00')) {
            slotConditions.push('las.mid_day_slot = TRUE');
        }
        
        // Afternoon slot: 5:00 PM - 8:00 PM (17:00:00 - 20:00:00)
        if ((start_time >= '17:00:00' && start_time < '20:00:00') ||
            (end_time > '17:00:00' && end_time <= '20:00:00') ||
            (start_time < '17:00:00' && end_time > '20:00:00')) {
            slotConditions.push('las.afternoon_slot = TRUE');
        }

        if (slotConditions.length === 0) {
            return res.status(400).json({ message: "Time slot does not fall within any defined availability periods" });
        }

        const slotConditionsSQL = slotConditions.join(' OR ');

        // Query to find available lecturers
        const availableLecturersQuery = `
            SELECT DISTINCT 
                l.lec_id,
                l.lec_name,
                l.lec_email,
                l.phone_number
            FROM 
                lecturers l
            JOIN 
                lecturer_availability_forms laf ON l.lec_id = laf.lec_id
            JOIN 
                lecturer_availability_slots las ON laf.form_id = las.form_id
            WHERE 
                las.available_date = ? 
                AND (${slotConditionsSQL})
                AND JSON_CONTAINS(l.lecture_modules, JSON_QUOTE(?))
            ORDER BY 
                l.lec_name
        `;

        db.query(availableLecturersQuery, [date, module_code], (error, results) => {
            if (error) {
                return res.status(500).json({ message: "Database query error", error });
            }
            return res.status(200).json(results);
        });
    });
};

// Fetch available examiners for a specific time slot
exports.getAvailableExaminersForTimeSlot = (req, res) => {
    const { slot_id } = req.params;

    // First, get the time slot details
    const timeSlotQuery = `
        SELECT 
            id, 
            module_code, 
            date,
            start_time, 
            end_time
        FROM free_time_slots 
        WHERE id = ?
    `;

    db.query(timeSlotQuery, [slot_id], (error, timeSlotResults) => {
        if (error) {
            return res.status(500).json({ message: "Database query error", error });
        }

        if (timeSlotResults.length === 0) {
            return res.status(404).json({ message: "Time slot not found" });
        }

        const timeSlot = timeSlotResults[0];
        const { module_code, date, start_time, end_time } = timeSlot;

        // Determine which time slot the session falls into
        const slotConditions = [];
        
        // Morning slot: 9:00 AM - 12:00 PM (09:00:00 - 12:00:00)
        if ((start_time >= '09:00:00' && start_time < '12:00:00') || 
            (end_time > '09:00:00' && end_time <= '12:00:00') ||
            (start_time < '09:00:00' && end_time > '12:00:00')) {
            slotConditions.push('eas.morning_slot = TRUE');
        }
        
        // Mid-day slot: 1:00 PM - 4:00 PM (13:00:00 - 16:00:00)
        if ((start_time >= '13:00:00' && start_time < '16:00:00') ||
            (end_time > '13:00:00' && end_time <= '16:00:00') ||
            (start_time < '13:00:00' && end_time > '16:00:00')) {
            slotConditions.push('eas.mid_day_slot = TRUE');
        }
        
        // Afternoon slot: 5:00 PM - 8:00 PM (17:00:00 - 20:00:00)
        if ((start_time >= '17:00:00' && start_time < '20:00:00') ||
            (end_time > '17:00:00' && end_time <= '20:00:00') ||
            (start_time < '17:00:00' && end_time > '20:00:00')) {
            slotConditions.push('eas.afternoon_slot = TRUE');
        }

        if (slotConditions.length === 0) {
            return res.status(400).json({ message: "Time slot does not fall within any defined availability periods" });
        }

        const slotConditionsSQL = slotConditions.join(' OR ');

        // Query to find available examiners
        const availableExaminersQuery = `
            SELECT DISTINCT 
                e.examiner_id,
                e.examiner_name,
                e.examiner_email,
                e.phone_number
            FROM 
                examiners e
            JOIN 
                examiners_availability_forms eaf ON e.examiner_id = eaf.examiner_id
            JOIN 
                examiners_availability_slots eas ON eaf.form_id = eas.form_id
            WHERE 
                eas.available_date = ? 
                AND (${slotConditionsSQL})
                AND JSON_CONTAINS(e.module_codes, JSON_QUOTE(?))
            ORDER BY 
                e.examiner_name
        `;

        db.query(availableExaminersQuery, [date, module_code], (error, results) => {
            if (error) {
                return res.status(500).json({ message: "Database query error", error });
            }
            return res.status(200).json(results);
        });
    });
};