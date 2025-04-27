const db = require('../../models/db');

// Get all reschedule requests for schedules created by the logged-in LIC
exports.getAllRescheduleRequests = (req, res) => {
    const licId = req.params.licId; // Get LIC ID from the route parameter

    // Get lecturer reschedule requests
    const lecturerRequestsQuery = `
        SELECT 
            rr.request_id, 
            rr.schedule_id, 
            rr.lec_id, 
            l.lec_name,
            rr.comment, 
            rr.status, 
            rr.admin_response,
            rr.requested_at, 
            rr.responded_at,
            vs.module_code,
            m.module_name,
            vs.date,
            vs.start_time,
            vs.end_time,
            vs.venue_name,
            vs.viva_type,
            'lecturer' AS request_type
        FROM 
            reschedule_requests rr
        JOIN 
            viva_schedules vs ON rr.schedule_id = vs.schedule_id
        JOIN 
            lecturers l ON rr.lec_id = l.lec_id
        LEFT JOIN
            modules m ON vs.module_code = m.module_code
        WHERE 
            vs.lic_id = ?
        ORDER BY
            rr.requested_at DESC
    `;

    // Get examiner reschedule requests
    const examinerRequestsQuery = `
        SELECT 
            err.request_id, 
            err.schedule_id, 
            err.examiner_id AS lec_id, 
            e.examiner_name AS lec_name,
            err.comment, 
            err.status, 
            err.admin_response,
            err.requested_at, 
            err.responded_at,
            vs.module_code,
            m.module_name,
            vs.date,
            vs.start_time,
            vs.end_time,
            vs.venue_name,
            vs.viva_type,
            'examiner' AS request_type
        FROM 
            examiner_rescheduling_requests err
        JOIN 
            viva_schedules vs ON err.schedule_id = vs.schedule_id
        JOIN 
            examiners e ON err.examiner_id = e.examiner_id
        LEFT JOIN
            modules m ON vs.module_code = m.module_code
        WHERE 
            vs.lic_id = ?
        ORDER BY
            err.requested_at DESC
    `;

    // Execute both queries in parallel
    db.query(lecturerRequestsQuery, [licId], (err, lecturerRequests) => {
        if (err) {
            console.error('Error fetching lecturer reschedule requests:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch lecturer reschedule requests',
                error: err.message
            });
        }

        db.query(examinerRequestsQuery, [licId], (err, examinerRequests) => {
            if (err) {
                console.error('Error fetching examiner reschedule requests:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch examiner reschedule requests',
                    error: err.message
                });
            }

            // Get batch information for each request
            const allRequests = [...lecturerRequests, ...examinerRequests];
            
            if (allRequests.length === 0) {
                return res.status(200).json({
                    success: true,
                    lecturerRequests,
                    examinerRequests
                });
            }

            let processed = 0;
            
            allRequests.forEach(request => {
                const batchQuery = `
                    SELECT 
                        sbg.group_id,
                        sbg.batch,
                        sbg.start_time,
                        sbg.end_time
                    FROM 
                        schedule_batch_groups sbg
                    WHERE 
                        sbg.schedule_id = ?
                `;
                
                db.query(batchQuery, [request.schedule_id], (err, batchGroups) => {
                    if (err) {
                        console.error('Error fetching batch groups:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch batch groups',
                            error: err.message
                        });
                    }
                    
                    request.batchGroups = batchGroups;
                    processed++;
                    
                    if (processed === allRequests.length) {
                        return res.status(200).json({
                            success: true,
                            lecturerRequests,
                            examinerRequests
                        });
                    }
                });
            });
        });
    });
};

// Get only pending reschedule requests
exports.getPendingRescheduleRequests = (req, res) => {
    const licId = req.params.licId;

    // Get pending lecturer reschedule requests
    const lecturerRequestsQuery = `
        SELECT 
            rr.request_id, 
            rr.schedule_id, 
            rr.lec_id, 
            l.lec_name,
            rr.comment, 
            rr.status, 
            rr.requested_at, 
            vs.module_code,
            m.module_name,
            vs.date,
            vs.start_time,
            vs.end_time,
            vs.venue_name,
            vs.viva_type,
            'lecturer' AS request_type
        FROM 
            reschedule_requests rr
        JOIN 
            viva_schedules vs ON rr.schedule_id = vs.schedule_id
        JOIN 
            lecturers l ON rr.lec_id = l.lec_id
        LEFT JOIN
            modules m ON vs.module_code = m.module_code
        WHERE 
            vs.lic_id = ? AND rr.status = 'pending'
        ORDER BY
            rr.requested_at DESC
    `;

    // Get pending examiner reschedule requests
    const examinerRequestsQuery = `
        SELECT 
            err.request_id, 
            err.schedule_id, 
            err.examiner_id AS lec_id, 
            e.examiner_name AS lec_name,
            err.comment, 
            err.status, 
            err.requested_at, 
            vs.module_code,
            m.module_name,
            vs.date,
            vs.start_time,
            vs.end_time,
            vs.venue_name,
            vs.viva_type,
            'examiner' AS request_type
        FROM 
            examiner_rescheduling_requests err
        JOIN 
            viva_schedules vs ON err.schedule_id = vs.schedule_id
        JOIN 
            examiners e ON err.examiner_id = e.examiner_id
        LEFT JOIN
            modules m ON vs.module_code = m.module_code
        WHERE 
            vs.lic_id = ? AND err.status = 'pending'
        ORDER BY
            err.requested_at DESC
    `;

    // Execute both queries in parallel
    db.query(lecturerRequestsQuery, [licId], (err, lecturerRequests) => {
        if (err) {
            console.error('Error fetching pending lecturer reschedule requests:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch pending lecturer reschedule requests',
                error: err.message
            });
        }

        db.query(examinerRequestsQuery, [licId], (err, examinerRequests) => {
            if (err) {
                console.error('Error fetching pending examiner reschedule requests:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch pending examiner reschedule requests',
                    error: err.message
                });
            }

            // Get batch information for each request
            const allRequests = [...lecturerRequests, ...examinerRequests];
            
            if (allRequests.length === 0) {
                return res.status(200).json({
                    success: true,
                    lecturerRequests,
                    examinerRequests
                });
            }

            let processed = 0;
            
            allRequests.forEach(request => {
                const batchQuery = `
                    SELECT 
                        sbg.group_id,
                        sbg.batch,
                        sbg.start_time,
                        sbg.end_time
                    FROM 
                        schedule_batch_groups sbg
                    WHERE 
                        sbg.schedule_id = ?
                `;
                
                db.query(batchQuery, [request.schedule_id], (err, batchGroups) => {
                    if (err) {
                        console.error('Error fetching batch groups:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch batch groups',
                            error: err.message
                        });
                    }
                    
                    request.batchGroups = batchGroups;
                    processed++;
                    
                    if (processed === allRequests.length) {
                        return res.status(200).json({
                            success: true,
                            lecturerRequests,
                            examinerRequests
                        });
                    }
                });
            });
        });
    });
};

// Respond to a lecturer's reschedule request
exports.respondToLecturerRequest = (req, res) => {
    const { requestId } = req.params;
    const { status, admin_response } = req.body;
    const licId = req.params.licId;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be either "accepted" or "rejected"'
        });
    }

    // Verify this request belongs to a schedule created by this LIC
    const checkRequestQuery = `
        SELECT rr.request_id, rr.schedule_id
        FROM reschedule_requests rr
        JOIN viva_schedules vs ON rr.schedule_id = vs.schedule_id
        WHERE rr.request_id = ? AND vs.lic_id = ?
    `;

    db.query(checkRequestQuery, [requestId, licId], (err, checkResult) => {
        if (err) {
            console.error('Error checking request authorization:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to check request authorization',
                error: err.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to respond to this request'
            });
        }

        // Update the request status
        const updateRequestQuery = `
            UPDATE reschedule_requests
            SET status = ?, admin_response = ?, responded_at = CURRENT_TIMESTAMP
            WHERE request_id = ?
        `;

        db.query(updateRequestQuery, [status, admin_response || null, requestId], (err, updateResult) => {
            if (err) {
                console.error('Error updating reschedule request:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to respond to reschedule request',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: `Reschedule request ${status}`,
                requestId: requestId,
                scheduleId: checkResult[0].schedule_id
            });
        });
    });
};

// Respond to an examiner's reschedule request
exports.respondToExaminerRequest = (req, res) => {
    const { requestId } = req.params;
    const { status, admin_response } = req.body;
    const licId = req.params.licId;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be either "accepted" or "rejected"'
        });
    }

    // Verify this request belongs to a schedule created by this LIC
    const checkRequestQuery = `
        SELECT err.request_id, err.schedule_id
        FROM examiner_rescheduling_requests err
        JOIN viva_schedules vs ON err.schedule_id = vs.schedule_id
        WHERE err.request_id = ? AND vs.lic_id = ?
    `;

    db.query(checkRequestQuery, [requestId, licId], (err, checkResult) => {
        if (err) {
            console.error('Error checking examiner request authorization:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to check examiner request authorization',
                error: err.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to respond to this request'
            });
        }

        // Update the request status
        const updateRequestQuery = `
            UPDATE examiner_rescheduling_requests
            SET status = ?, admin_response = ?, responded_at = CURRENT_TIMESTAMP
            WHERE request_id = ?
        `;

        db.query(updateRequestQuery, [status, admin_response || null, requestId], (err, updateResult) => {
            if (err) {
                console.error('Error updating examiner reschedule request:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to respond to examiner reschedule request',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: `Examiner reschedule request ${status}`,
                requestId: requestId,
                scheduleId: checkResult[0].schedule_id
            });
        });
    });
};

// Get details of a specific reschedule request
exports.getRequestDetails = (req, res) => {
    const { requestId, requestType } = req.params;
    const licId = req.params.licId;

    let detailsQuery;
    
    if (requestType === 'lecturer') {
        detailsQuery = `
            SELECT 
                rr.request_id, 
                rr.schedule_id, 
                rr.lec_id, 
                l.lec_name,
                l.lec_email,
                l.phone_number,
                rr.comment, 
                rr.status, 
                rr.admin_response,
                rr.requested_at, 
                rr.responded_at,
                vs.module_code,
                m.module_name,
                vs.date,
                vs.start_time,
                vs.end_time,
                vs.venue_name,
                vs.viva_type,
                'lecturer' AS request_type
            FROM 
                reschedule_requests rr
            JOIN 
                viva_schedules vs ON rr.schedule_id = vs.schedule_id
            JOIN 
                lecturers l ON rr.lec_id = l.lec_id
            LEFT JOIN
                modules m ON vs.module_code = m.module_code
            WHERE 
                rr.request_id = ? AND vs.lic_id = ?
        `;
    } else if (requestType === 'examiner') {
        detailsQuery = `
            SELECT 
                err.request_id, 
                err.schedule_id, 
                err.examiner_id AS lec_id, 
                e.examiner_name AS lec_name,
                e.examiner_email AS lec_email,
                e.phone_number,
                err.comment, 
                err.status, 
                err.admin_response,
                err.requested_at, 
                err.responded_at,
                vs.module_code,
                m.module_name,
                vs.date,
                vs.start_time,
                vs.end_time,
                vs.venue_name,
                vs.viva_type,
                'examiner' AS request_type
            FROM 
                examiner_rescheduling_requests err
            JOIN 
                viva_schedules vs ON err.schedule_id = vs.schedule_id
            JOIN 
                examiners e ON err.examiner_id = e.examiner_id
            LEFT JOIN
                modules m ON vs.module_code = m.module_code
            WHERE 
                err.request_id = ? AND vs.lic_id = ?
        `;
    } else {
        return res.status(400).json({
            success: false,
            message: 'Invalid request type. Must be either "lecturer" or "examiner"'
        });
    }

    db.query(detailsQuery, [requestId, licId], (err, details) => {
        if (err) {
            console.error('Error fetching request details:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch request details',
                error: err.message
            });
        }

        if (details.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or not authorized'
            });
        }

        const request = details[0];
        
        // Get batch groups for this schedule
        const batchQuery = `
            SELECT 
                sbg.group_id,
                sbg.batch,
                sbg.start_time,
                sbg.end_time,
                sbg.duration
            FROM 
                schedule_batch_groups sbg
            WHERE 
                sbg.schedule_id = ?
        `;
        
        db.query(batchQuery, [request.schedule_id], (err, batchGroups) => {
            if (err) {
                console.error('Error fetching batch groups:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch groups',
                    error: err.message
                });
            }
            
            request.batchGroups = batchGroups;
            
            if (batchGroups.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: request
                });
            }
            
            let processedGroups = 0;
            
            batchGroups.forEach(group => {
                // Get sub-groups for each batch group
                const subGroupQuery = `
                    SELECT 
                        ssg.sub_group
                    FROM 
                        schedule_sub_groups ssg
                    WHERE 
                        ssg.group_id = ?
                `;
                
                db.query(subGroupQuery, [group.group_id], (err, subGroups) => {
                    if (err) {
                        console.error('Error fetching sub groups:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to fetch sub groups',
                            error: err.message
                        });
                    }
                    
                    group.subGroups = subGroups.map(sg => sg.sub_group);
                    
                    processedGroups++;
                    if (processedGroups === batchGroups.length) {
                        return res.status(200).json({
                            success: true,
                            data: request
                        });
                    }
                });
            });
        });
    });
};