const db = require("../../models/db");

// Accept a schedule
exports.acceptSchedule = (req, res) => {
    const { schedule_id, lec_id } = req.body;

    // Insert into schedule_acceptance table
    const query = `INSERT INTO schedule_acceptance (schedule_id, lec_id, status, accepted_at) 
                   VALUES (?, ?, 'accepted', NOW())
                   ON DUPLICATE KEY UPDATE status = 'accepted', accepted_at = NOW()`;

    db.query(query, [schedule_id, lec_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: "Schedule accepted successfully." });
    });
};

// Fetch accepted schedules for a lecturer
exports.getAcceptedSchedules = (req, res) => {
    const lec_id = req.params.lec_id;

    const query = `
        SELECT 
            vs.schedule_id, 
            vs.lic_id, 
            vs.slot_id, 
            vs.module_code, 
             m.module_name,
            DATE_FORMAT(vs.date, '%Y-%m-%d') AS date, 
            DATE_FORMAT(vs.start_time, '%H:%i:%s') AS start_time, 
            DATE_FORMAT(vs.end_time, '%H:%i:%s') AS end_time, 
            vs.venue_name, 
            vs.viva_type, 
            vs.created_at, 
            sbg.group_id, 
            sbg.batch AS batch_group, 
            DATE_FORMAT(sbg.start_time, '%H:%i:%s') AS group_start_time, 
            DATE_FORMAT(sbg.end_time, '%H:%i:%s') AS group_end_time,
            ssg.id AS sub_group_id, 
            ssg.sub_group, 
            sl.lec_id AS assigned_lecturer,
            l.lec_name AS assigned_lecturer_name,
            se.examiner_id AS assigned_examiner,
            e.examiner_name AS assigned_examiner_name
        FROM viva_schedules vs
        JOIN schedule_acceptance sa ON vs.schedule_id = sa.schedule_id
        INNER JOIN modules m 
            ON vs.module_code = m.module_code
        LEFT JOIN schedule_batch_groups sbg ON vs.schedule_id = sbg.schedule_id
        LEFT JOIN schedule_sub_groups ssg ON sbg.group_id = ssg.group_id
        LEFT JOIN schedule_lecturers sl ON sbg.group_id = sl.group_id
        LEFT JOIN lecturers l ON sl.lec_id = l.lec_id
        LEFT JOIN schedule_examiners se ON sbg.group_id = se.group_id
        LEFT JOIN examiners e ON se.examiner_id = e.examiner_id
        WHERE sa.lec_id = ? AND sa.status = 'accepted'
        ORDER BY vs.date, vs.start_time, sbg.start_time
    `;

    db.query(query, [lec_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Format the results
        const formattedResults = results.reduce((acc, row) => {
            const { schedule_id, lic_id, slot_id, module_code, module_name, date, start_time, end_time, venue_name, viva_type, created_at,
                    group_id, batch_group, group_start_time, group_end_time, sub_group_id, sub_group, assigned_lecturer, assigned_lecturer_name, assigned_examiner, assigned_examiner_name } = row;

            // Find or create the schedule entry
            let scheduleEntry = acc.find(entry => entry.schedule_id === schedule_id);
            if (!scheduleEntry) {
                scheduleEntry = {
                    schedule_id,
                    lic_id,
                    slot_id,
                    module_code,
                    module_name,
                    date,
                    start_time,
                    end_time,
                    venue_name,
                    viva_type,
                    created_at,
                    batchGroups: []
                };
                acc.push(scheduleEntry);
            }

            // Find or create the batch group entry
            let batchGroupEntry = scheduleEntry.batchGroups.find(bg => bg.group_id === group_id);
            if (!batchGroupEntry && group_id) {
                batchGroupEntry = {
                    group_id,
                    batch_group,
                    group_start_time,
                    group_end_time,
                    SubGroups: [],
                    assigned_lecturers: [],
                    assigned_examiners: []
                };
                scheduleEntry.batchGroups.push(batchGroupEntry);
            }

            // Add the sub-group entry if it doesn't already exist
            if (sub_group_id && batchGroupEntry) {
                const existingSubGroup = batchGroupEntry.SubGroups.find(sg => sg.id === sub_group_id);
                if (!existingSubGroup) {
                    batchGroupEntry.SubGroups.push({
                        id: sub_group_id,
                        sub_group
                    });
                }
            }

            // Add assigned lecturer if it doesn't already exist
            if (assigned_lecturer && batchGroupEntry) {
                const existingLecturer = batchGroupEntry.assigned_lecturers.find(l => l.lec_id === assigned_lecturer);
                if (!existingLecturer) {
                    batchGroupEntry.assigned_lecturers.push({
                        lec_id: assigned_lecturer,
                        lec_name: assigned_lecturer_name
                    });
                }
            }

            // Add assigned examiner if it doesn't already exist
            if (assigned_examiner && batchGroupEntry) {
                const existingExaminer = batchGroupEntry.assigned_examiners.find(e => e.examiner_id === assigned_examiner);
                if (!existingExaminer) {
                    batchGroupEntry.assigned_examiners.push({
                        examiner_id: assigned_examiner,
                        examiner_name: assigned_examiner_name
                    });
                }
            }

            return acc;
        }, []);

        return res.status(200).json(formattedResults);
    });
};