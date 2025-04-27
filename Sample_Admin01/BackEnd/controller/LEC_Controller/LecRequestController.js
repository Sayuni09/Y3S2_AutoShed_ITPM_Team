const db = require('../../models/db');

// Submit a reschedule request
exports.submitRescheduleRequest = async (req, res) => {
    const { schedule_id, lec_id, comment } = req.body;
    
    if (!schedule_id || !lec_id || !comment) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: schedule_id, lec_id, and comment are required'
        });
    }

    try {
        // Insert the reschedule request into the database
        const query = `
            INSERT INTO reschedule_requests (schedule_id, lec_id, comment)
            VALUES (?, ?, ?)
        `;
        
        const [result] = await db.promise().execute(query, [schedule_id, lec_id, comment]);
        
        if (result.affectedRows > 0) {
            return res.status(201).json({
                success: true,
                message: 'Reschedule request submitted successfully',
                request_id: result.insertId
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to submit reschedule request'
            });
        }
    } catch (error) {
        console.error('Error submitting reschedule request:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while submitting reschedule request',
            error: error.message
        });
    }
};

// Get all reschedule requests for a specific lecturer
exports.getLecturerRescheduleRequests = async (req, res) => {
    const { lec_id } = req.params;
    
    if (!lec_id) {
        return res.status(400).json({ 
            success: false, 
            message: 'Lecturer ID is required'
        });
    }

    try {
        // Query to get all reschedule requests with schedule details for a lecturer
        const query = `
            SELECT rr.request_id, rr.schedule_id, rr.comment, rr.status, 
                   rr.admin_response, rr.requested_at, rr.responded_at,
                   vs.module_code, DATE_FORMAT(vs.date, '%Y-%m-%d') AS date, 
                   vs.start_time, vs.end_time, 
                   vs.venue_name, vs.viva_type,
                   m.module_name
            FROM reschedule_requests rr
            JOIN viva_schedules vs ON rr.schedule_id = vs.schedule_id
            LEFT JOIN modules m ON vs.module_code = m.module_code
            WHERE rr.lec_id = ?
            ORDER BY rr.requested_at DESC
        `;
        
        const [requests] = await db.promise().execute(query, [lec_id]);
        
        // For each request, get batch group details
        for (let request of requests) {
            const batchGroupQuery = `
                SELECT sbg.group_id, sbg.batch, sbg.start_time, sbg.end_time, sbg.duration
                FROM schedule_batch_groups sbg
                WHERE sbg.schedule_id = ?
            `;
            
            const [batchGroups] = await db.promise().execute(batchGroupQuery, [request.schedule_id]);
            
            // For each batch group, get the sub groups, lecturers, and examiners
            for (let group of batchGroups) {
                // Get sub groups
                const subGroupsQuery = `
                    SELECT ssg.id, bg.sub_group AS name
                    FROM schedule_sub_groups ssg
                    JOIN batch_group bg ON ssg.sub_group = bg.sub_group
                    WHERE ssg.group_id = ?
                `;
                
                const [subGroups] = await db.promise().execute(subGroupsQuery, [group.group_id]);
                group.sub_groups = subGroups;
                
                // Get lecturers
                const lecturersQuery = `
                    SELECT sl.id, l.lec_name AS name
                    FROM schedule_lecturers sl
                    JOIN lecturers l ON sl.lec_id = l.lec_id
                    WHERE sl.group_id = ?
                `;
                
                const [lecturers] = await db.promise().execute(lecturersQuery, [group.group_id]);
                group.lecturers = lecturers;
                
                // Get examiners
                const examinersQuery = `
                    SELECT se.id, e.examiner_name AS name
                    FROM schedule_examiners se
                    JOIN examiners e ON se.examiner_id = e.examiner_id
                    WHERE se.group_id = ?
                `;
                
                const [examiners] = await db.promise().execute(examinersQuery, [group.group_id]);
                group.examiners = examiners;
            }
            
            request.batch_groups = batchGroups;
        }
        
        return res.status(200).json({
            success: true,
            requests: requests
        });
    } catch (error) {
        console.error('Error fetching reschedule requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching reschedule requests',
            error: error.message
        });
    }
};

// Get a specific reschedule request by ID
exports.getRescheduleRequestById = async (req, res) => {
    const { request_id } = req.params;
    
    if (!request_id) {
        return res.status(400).json({ 
            success: false, 
            message: 'Request ID is required'
        });
    }

    try {
        // Query to get the specific reschedule request with schedule details
        const query = `
            SELECT rr.request_id, rr.schedule_id, rr.lec_id, rr.comment, 
                   rr.status, rr.admin_response, rr.requested_at, rr.responded_at,
                   vs.module_code, DATE_FORMAT(vs.date, '%Y-%m-%d') AS date, 
                   vs.start_time, vs.end_time, 
                   vs.venue_name, vs.viva_type,
                   m.module_name,
                   l.lec_name
            FROM reschedule_requests rr
            JOIN viva_schedules vs ON rr.schedule_id = vs.schedule_id
            LEFT JOIN modules m ON vs.module_code = m.module_code
            LEFT JOIN lecturers l ON rr.lec_id = l.lec_id
            WHERE rr.request_id = ?
        `;
        
        const [requests] = await db.promise().execute(query, [request_id]);
        
        if (requests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reschedule request not found'
            });
        }
        
        const request = requests[0];
        
        // Get batch group details
        const batchGroupQuery = `
            SELECT sbg.group_id, sbg.batch, sbg.start_time, sbg.end_time, sbg.duration
            FROM schedule_batch_groups sbg
            WHERE sbg.schedule_id = ?
        `;
        
        const [batchGroups] = await db.promise().execute(batchGroupQuery, [request.schedule_id]);
        
        // For each batch group, get the sub groups, lecturers, and examiners
        for (let group of batchGroups) {
            // Get sub groups
            const subGroupsQuery = `
                SELECT ssg.id, bg.sub_group AS name
                FROM schedule_sub_groups ssg
                JOIN batch_group bg ON ssg.sub_group = bg.sub_group
                WHERE ssg.group_id = ?
            `;
            
            const [subGroups] = await db.promise().execute(subGroupsQuery, [group.group_id]);
            group.sub_groups = subGroups;
            
            // Get lecturers
            const lecturersQuery = `
                SELECT sl.id, l.lec_name AS name
                FROM schedule_lecturers sl
                JOIN lecturers l ON sl.lec_id = l.lec_id
                WHERE sl.group_id = ?
            `;
            
            const [lecturers] = await db.promise().execute(lecturersQuery, [group.group_id]);
            group.lecturers = lecturers;
            
            // Get examiners
            const examinersQuery = `
                SELECT se.id, e.examiner_name AS name
                FROM schedule_examiners se
                JOIN examiners e ON se.examiner_id = e.examiner_id
                WHERE se.group_id = ?
            `;
            
            const [examiners] = await db.promise().execute(examinersQuery, [group.group_id]);
            group.examiners = examiners;
        }
        
        request.batch_groups = batchGroups;
        
        return res.status(200).json({
            success: true,
            request: request
        });
    } catch (error) {
        console.error('Error fetching reschedule request by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching reschedule request',
            error: error.message
        });
    }
};