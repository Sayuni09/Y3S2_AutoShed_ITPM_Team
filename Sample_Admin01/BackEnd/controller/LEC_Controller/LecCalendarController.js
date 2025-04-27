const db = require("../../models/db");

exports.getAcceptedSchedules = (req, res) => {
    const { lec_id } = req.params;
    
    if (!lec_id) {
        return res.status(400).json({
            success: false,
            message: "Lecturer ID is required"
        });
    }

    const query = `
        SELECT DISTINCT 
            vs.schedule_id,
            vs.module_code, 
            vs.date, 
            vs.venue_name,
            vs.start_time as schedule_start,
            vs.end_time as schedule_end,
            vs.viva_type,
            sbg.batch,
            sbg.start_time, 
            sbg.end_time,
            sbg.duration
        FROM viva_schedules vs
        JOIN schedule_batch_groups sbg ON vs.schedule_id = sbg.schedule_id
        JOIN schedule_acceptance sa ON vs.schedule_id = sa.schedule_id
        WHERE sa.lec_id = ? 
        AND sa.status = 'accepted'
        ORDER BY vs.date, sbg.start_time
    `;

    db.query(query, [lec_id], (err, results) => {
        if (err) {
            console.error("Error fetching accepted schedules:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error fetching schedule data", 
                error: err.message 
            });
        }

        // Format dates to ISO string for better frontend handling
        const formattedResults = results.map(schedule => ({
            ...schedule,
            date: schedule.date.toISOString().split('T')[0]
        }));

        return res.status(200).json({
            success: true,
            message: "Successfully retrieved accepted schedules",
            schedules: formattedResults
        });
    });
};