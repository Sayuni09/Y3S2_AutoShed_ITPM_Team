const db = require("../../models/db");

// Fetch schedules for an examiner with detailed information
exports.getExaminerSchedules = (req, res) => {
    const { examiner_id } = req.params;

    const query = `
        SELECT 
            vs.schedule_id,
            DATE_FORMAT(vs.date, '%Y-%m-%d') AS date,
            TIME_FORMAT(vs.start_time, '%H:%i:%s') AS start_time,
            TIME_FORMAT(vs.end_time, '%H:%i:%s') AS end_time,
            vs.venue_name,
            vs.viva_type,
            m.module_code,
            m.module_name,

            -- Batch group details
            sbg.group_id AS batch_group_id,
            sbg.batch AS batch_group_name,
            TIME_FORMAT(sbg.start_time, '%H:%i:%s') AS batch_start_time,
            TIME_FORMAT(sbg.end_time, '%H:%i:%s') AS batch_end_time,
            sbg.duration AS batch_duration,

            -- Subgroup details
            ss.id AS sub_group_id,
            ss.sub_group AS sub_group_name,

            -- Assigned lecturers
            sl.lec_id AS assigned_lecturer_id,
            l.lec_name AS assigned_lecturer_name,

            -- Assigned examiners
            se.examiner_id AS assigned_examiner_id,
            e.examiner_name AS assigned_examiner_name

        FROM 
            viva_schedules vs
        INNER JOIN modules m 
            ON vs.module_code = m.module_code
        INNER JOIN schedule_batch_groups sbg 
            ON vs.schedule_id = sbg.schedule_id
        LEFT JOIN schedule_sub_groups ss 
            ON sbg.group_id = ss.group_id
        LEFT JOIN schedule_lecturers sl 
            ON sbg.group_id = sl.group_id
        LEFT JOIN lecturers l 
            ON sl.lec_id = l.lec_id
        LEFT JOIN schedule_examiners se 
            ON sbg.group_id = se.group_id
        LEFT JOIN examiners e 
            ON se.examiner_id = e.examiner_id
        LEFT JOIN examiner_schedule_confirmation esa 
            ON vs.schedule_id = esa.schedule_id AND esa.examiner_id = ?
        LEFT JOIN examiner_rescheduling_requests err 
            ON vs.schedule_id = err.schedule_id AND err.examiner_id = ?

        WHERE se.examiner_id = ?
        AND esa.schedule_id IS NULL
        AND err.schedule_id IS NULL
        ORDER BY vs.date, vs.start_time, sbg.start_time`;

    db.query(query, [examiner_id, examiner_id, examiner_id], (err, results) => {
        if (err) {
            console.error("Error fetching examiner schedules:", err);
            return res.status(500).json({ error: "Failed to fetch schedules" });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                message: "No new schedules found for your review. Schedules you've already accepted or requested to reschedule won't appear here." 
            });
        }

        // Transform the results into a structured response
        const schedules = {};

        results.forEach(row => {
            const scheduleId = row.schedule_id;

            // Initialize schedule if not already present
            if (!schedules[scheduleId]) {
                schedules[scheduleId] = {
                    schedule_id: row.schedule_id,
                    date: row.date,
                    start_time: row.start_time,
                    end_time: row.end_time,
                    venue_name: row.venue_name,
                    viva_type: row.viva_type,
                    module_code: row.module_code,
                    module_name: row.module_name,
                    batch_groups: {}
                };
            }

            const batchGroupId = row.batch_group_id;

            // Initialize batch group if not already present
            if (!schedules[scheduleId].batch_groups[batchGroupId]) {
                schedules[scheduleId].batch_groups[batchGroupId] = {
                    group_id: row.batch_group_id,
                    batch_group_name: row.batch_group_name,
                    start_time: row.batch_start_time,
                    end_time: row.batch_end_time,
                    duration: row.batch_duration,
                    sub_groups: [],
                    lecturers: [],
                    examiners: []
                };
            }

            const batchGroup = schedules[scheduleId].batch_groups[batchGroupId];

            // Add subgroup if not already present
            if (row.sub_group_id && !batchGroup.sub_groups.find(sg => sg.id === row.sub_group_id)) {
                batchGroup.sub_groups.push({
                    id: row.sub_group_id,
                    name: row.sub_group_name
                });
            }

            // Add lecturer if not already present
            if (row.assigned_lecturer_id && !batchGroup.lecturers.find(l => l.id === row.assigned_lecturer_id)) {
                batchGroup.lecturers.push({
                    id: row.assigned_lecturer_id,
                    name: row.assigned_lecturer_name
                });
            }

            // Add examiner if not already present
            if (row.assigned_examiner_id && !batchGroup.examiners.find(e => e.id === row.assigned_examiner_id)) {
                batchGroup.examiners.push({
                    id: row.assigned_examiner_id,
                    name: row.assigned_examiner_name
                });
            }
        });

        // Convert schedules object to array for easier consumption by clients
        const formattedSchedules = Object.values(schedules).map(schedule => ({
            ...schedule,
            batch_groups: Object.values(schedule.batch_groups)
        }));

        res.status(200).json({ schedules: formattedSchedules });
    });
};