const db = require("../../models/db");


const { notifyOnNewSchedule , notifyOnScheduleUpdate } = require('../LIC_Controller/LicScheduleEmailIntegration');

const { notifyOnNewScheduleViaWhatsApp, notifyOnScheduleUpdateViaWhatsApp } = require('../LIC_Controller/LicScheduleWhatsAppIntegration');

// Create a new schedule with batch groups, sub-groups, lecturers, and examiners
exports.createSchedule = (req, res) => {
    const { lic_id, slot_id, module_code, date, start_time, end_time, venue_name, viva_type, batchGroups } = req.body;

    // Start a transaction
    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ message: "Database transaction error occurred" });
        }

        // 1. Insert into viva_schedules table
        const scheduleQuery = `
            INSERT INTO viva_schedules (lic_id, slot_id, module_code, date, start_time, end_time, venue_name, viva_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(
            scheduleQuery, 
            [lic_id, slot_id, module_code, date, start_time, end_time, venue_name, viva_type], 
            (err, scheduleResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Database error:", err);
                        res.status(500).json({ message: "Database error occurred" });
                    });
                }

                const schedule_id = scheduleResult.insertId;
                const batchGroupPromises = [];

                // 2. Process each batch group
                batchGroups.forEach(group => {
                    batchGroupPromises.push(
                        new Promise((resolve, reject) => {
                            // Insert batch group
                            const batchGroupQuery = `
                                INSERT INTO schedule_batch_groups (schedule_id, batch, start_time, end_time, duration)
                                VALUES (?, ?, ?, ?, ?)
                            `;
                            
                            db.query(
                                batchGroupQuery, 
                                [schedule_id, group.batch, group.startTime, group.endTime, group.duration], 
                                (err, batchGroupResult) => {
                                    if (err) {
                                        return reject(err);
                                    }

                                    const group_id = batchGroupResult.insertId;
                                    const subPromises = [];

                                    // 3. Insert sub groups
                                    group.subGroups.forEach(subGroup => {
                                        subPromises.push(
                                            new Promise((resolve, reject) => {
                                                const subGroupQuery = `
                                                    INSERT INTO schedule_sub_groups (group_id, sub_group)
                                                    VALUES (?, ?)
                                                `;
                                                
                                                db.query(subGroupQuery, [group_id, subGroup], (err) => {
                                                    if (err) {
                                                        return reject(err);
                                                    }
                                                    resolve();
                                                });
                                            })
                                        );
                                    });

                                    // 4. Insert lecturers
                                    group.lecturers.forEach(lec_id => {
                                        subPromises.push(
                                            new Promise((resolve, reject) => {
                                                const lecturerQuery = `
                                                    INSERT INTO schedule_lecturers (group_id, lec_id)
                                                    VALUES (?, ?)
                                                `;
                                                
                                                db.query(lecturerQuery, [group_id, lec_id], (err) => {
                                                    if (err) {
                                                        return reject(err);
                                                    }
                                                    resolve();
                                                });
                                            })
                                        );
                                    });

                                    // 5. Insert examiners
                                    group.examiners.forEach(examiner_id => {
                                        subPromises.push(
                                            new Promise((resolve, reject) => {
                                                const examinerQuery = `
                                                    INSERT INTO schedule_examiners (group_id, examiner_id)
                                                    VALUES (?, ?)
                                                `;
                                                
                                                db.query(examinerQuery, [group_id, examiner_id], (err) => {
                                                    if (err) {
                                                        return reject(err);
                                                    }
                                                    resolve();
                                                });
                                            })
                                        );
                                    });

                                    // Wait for all sub-inserts to complete
                                    Promise.all(subPromises)
                                        .then(() => resolve())
                                        .catch(err => reject(err));
                                }
                            );
                        })
                    );
                });

                // Wait for all batch group inserts to complete
                Promise.all(batchGroupPromises)
                    .then(() => {
                        // 6. Update the time slot status to booked
                        const updateSlotQuery = `
                            UPDATE free_time_slots 
                            SET status = 'booked' 
                            WHERE id = ?
                        `;
                        
                        db.query(updateSlotQuery, [slot_id], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Database error:", err);
                                    res.status(500).json({ message: "Database error occurred" });
                                });
                            }
// Update the commit callback in createSchedule function
db.commit(err => {
    if (err) {
        return db.rollback(() => {
            console.error("Commit error:", err);
            res.status(500).json({ message: "Database commit error occurred" });
        });
    }
    
    // Send email notifications
    notifyOnNewSchedule(schedule_id)
        .then(emailResult => {
            console.log("Email notifications sent:", emailResult);
        })
        .catch(emailError => {
            console.error("Failed to send email notifications:", emailError);
        });
    
    // Send WhatsApp notifications
    notifyOnNewScheduleViaWhatsApp(schedule_id)
        .then(whatsappResult => {
            console.log("WhatsApp notifications sent:", whatsappResult);
        })
        .catch(whatsappError => {
            console.error("Failed to send WhatsApp notifications:", whatsappError);
        });
    
    res.status(201).json({
        message: "Schedule created successfully",
        schedule_id: schedule_id
    });
});



                            // In the commit callback, right before the final response
// db.commit(err => {
//     if (err) {
//         return db.rollback(() => {
//             console.error("Commit error:", err);
//             res.status(500).json({ message: "Database commit error occurred" });
//         });
//     }
    
//     // Send email notifications
//     notifyOnNewSchedule(schedule_id)
//         .then(emailResult => {
//             console.log("Email notifications sent:", emailResult);
//         })
//         .catch(emailError => {
//             console.error("Failed to send email notifications:", emailError);
//         });
    
//     res.status(201).json({
//         message: "Schedule created successfully",
//         schedule_id: schedule_id
//     });
// });


                            // // Commit the transaction
                            // db.commit(err => {
                            //     if (err) {
                            //         return db.rollback(() => {
                            //             console.error("Commit error:", err);
                            //             res.status(500).json({ message: "Database commit error occurred" });
                            //         });
                            //     }
                                
                            //     res.status(201).json({
                            //         message: "Schedule created successfully",
                            //         schedule_id: schedule_id
                            //     });
                            // });
                        });
                    })


                    
                    .catch(err => {
                        db.rollback(() => {
                            console.error("Database error:", err);
                            res.status(500).json({ message: "Database error occurred" });
                        });
                    });
            }
        );
    });
};

// Get all schedules created by a specific LIC
exports.getSchedulesByLic = (req, res) => {
    const { lic_id } = req.params;

    const query = `
        SELECT 
            vs.schedule_id, vs.module_code, DATE_FORMAT(vs.date, '%Y-%m-%d') as date, 
            vs.start_time, vs.end_time, vs.venue_name, vs.viva_type, 
            DATE_FORMAT(vs.created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM viva_schedules vs
        WHERE vs.lic_id = ?
        ORDER BY vs.date DESC, vs.start_time ASC
    `;

    db.query(query, [lic_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        res.json(results);
    });
};

// Get schedule details by schedule_id with all related data
exports.getScheduleDetails = (req, res) => {
    const { schedule_id } = req.params;

    // Get main schedule info
    const scheduleQuery = `
        SELECT 
            schedule_id, lic_id, slot_id, module_code, 
            DATE_FORMAT(date, '%Y-%m-%d') as date, 
            start_time, end_time, venue_name, viva_type,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM viva_schedules 
        WHERE schedule_id = ?
    `;

    db.query(scheduleQuery, [schedule_id], (err, scheduleResults) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        if (scheduleResults.length === 0) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        const schedule = scheduleResults[0];

        // Get batch groups with all related data
        const batchGroupsQuery = `
            SELECT group_id, batch, start_time, end_time, duration
            FROM schedule_batch_groups
            WHERE schedule_id = ?
        `;

        db.query(batchGroupsQuery, [schedule_id], (err, batchGroupResults) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error occurred" });
            }

            const batchGroupPromises = batchGroupResults.map(group => {
                return new Promise((resolve, reject) => {
                    const group_id = group.group_id;
                    const batchGroupData = {
                        ...group,
                        subGroups: [],
                        lecturers: [],
                        examiners: []
                    };

                    // Get sub groups
                    const subGroupsQuery = `
                        SELECT sg.sub_group
                        FROM schedule_sub_groups sg
                        WHERE sg.group_id = ?
                    `;

                    db.query(subGroupsQuery, [group_id], (err, subGroupResults) => {
                        if (err) return reject(err);
                        
                        batchGroupData.subGroups = subGroupResults.map(sg => sg.sub_group);

                        // Get lecturers
                        const lecturersQuery = `
                            SELECT sl.lec_id, l.lec_name
                            FROM schedule_lecturers sl
                            JOIN lecturers l ON sl.lec_id = l.lec_id
                            WHERE sl.group_id = ?
                        `;

                        db.query(lecturersQuery, [group_id], (err, lecturerResults) => {
                            if (err) return reject(err);
                            
                            batchGroupData.lecturers = lecturerResults;

                            // Get examiners
                            const examinersQuery = `
                                SELECT se.examiner_id, e.examiner_name
                                FROM schedule_examiners se
                                JOIN examiners e ON se.examiner_id = e.examiner_id
                                WHERE se.group_id = ?
                            `;

                            db.query(examinersQuery, [group_id], (err, examinerResults) => {
                                if (err) return reject(err);
                                
                                batchGroupData.examiners = examinerResults;
                                resolve(batchGroupData);
                            });
                        });
                    });
                });
            });

            Promise.all(batchGroupPromises)
                .then(batchGroups => {
                    res.json({
                        ...schedule,
                        batchGroups
                    });
                })
                .catch(err => {
                    console.error("Database error:", err);
                    res.status(500).json({ message: "Database error occurred" });
                });
        });
    });
};

// Update an existing schedule
exports.updateSchedule = (req, res) => {
    const { schedule_id } = req.params;
    const { viva_type, batchGroups } = req.body;

    // Get original viva_type to detect changes
let originalVivaType = '';
const getOriginalData = `SELECT viva_type FROM viva_schedules WHERE schedule_id = ?`;
db.query(getOriginalData, [schedule_id], (err, results) => {
    if (!err && results.length > 0) {
        originalVivaType = results[0].viva_type;
    }

    // Start a transaction
    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ message: "Database transaction error occurred" });
        }

        // 1. Update the main schedule record
        const updateScheduleQuery = `
            UPDATE viva_schedules 
            SET viva_type = ?
            WHERE schedule_id = ?
        `;
        
        db.query(updateScheduleQuery, [viva_type, schedule_id], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Database error:", err);
                    res.status(500).json({ message: "Database error occurred" });
                });
            }

            // 2. Get all existing batch groups for this schedule
            const getBatchGroupsQuery = `
                SELECT group_id FROM schedule_batch_groups WHERE schedule_id = ?
            `;
            
            db.query(getBatchGroupsQuery, [schedule_id], (err, groupResults) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Database error:", err);
                        res.status(500).json({ message: "Database error occurred" });
                    });
                }

                const existingGroupIds = groupResults.map(g => g.group_id);
                const updatedGroupIds = batchGroups.filter(g => g.group_id).map(g => g.group_id);
                
                // Identify groups to delete (existing but not in update)
                const groupsToDelete = existingGroupIds.filter(id => !updatedGroupIds.includes(parseInt(id)));
                
                // Delete removed groups and their related records
                const deletePromises = groupsToDelete.map(group_id => {
                    return new Promise((resolve, reject) => {
                        const deleteQuery = `DELETE FROM schedule_batch_groups WHERE group_id = ?`;
                        db.query(deleteQuery, [group_id], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });

                // Process batch groups (update existing, add new)
                const batchGroupPromises = batchGroups.map(group => {
                    return new Promise((resolve, reject) => {
                        // Extract start_time and end_time correctly from group object
                        // Handle both camelCase and snake_case formats
                        const startTime = group.startTime || group.start_time;
                        const endTime = group.endTime || group.end_time;
                        
                        if (group.group_id) {
                            // Update existing batch group
                            const updateGroupQuery = `
                                UPDATE schedule_batch_groups 
                                SET batch = ?, start_time = ?, end_time = ?, duration = ?
                                WHERE group_id = ?
                            `;
                            
                            db.query(
                                updateGroupQuery, 
                                [group.batch, startTime, endTime, group.duration, group.group_id], 
                                (err) => {
                                    if (err) return reject(err);
                                    
                                    // Delete existing sub-relationships to recreate them
                                    const deleteSubGroupsQuery = `DELETE FROM schedule_sub_groups WHERE group_id = ?`;
                                    const deleteLecturersQuery = `DELETE FROM schedule_lecturers WHERE group_id = ?`;
                                    const deleteExaminersQuery = `DELETE FROM schedule_examiners WHERE group_id = ?`;
                                    
                                    db.query(deleteSubGroupsQuery, [group.group_id], (err) => {
                                        if (err) return reject(err);
                                        
                                        db.query(deleteLecturersQuery, [group.group_id], (err) => {
                                            if (err) return reject(err);
                                            
                                            db.query(deleteExaminersQuery, [group.group_id], (err) => {
                                                if (err) return reject(err);
                                                
                                                // Re-insert relationships
                                                processRelationships(group.group_id, group)
                                                    .then(resolve)
                                                    .catch(reject);
                                            });
                                        });
                                    });
                                }
                            );
                        } else {
                            // Insert new batch group
                            const insertGroupQuery = `
                                INSERT INTO schedule_batch_groups (schedule_id, batch, start_time, end_time, duration)
                                VALUES (?, ?, ?, ?, ?)
                            `;
                            
                            db.query(
                                insertGroupQuery, 
                                [schedule_id, group.batch, startTime, endTime, group.duration], 
                                (err, result) => {
                                    if (err) return reject(err);
                                    
                                    const new_group_id = result.insertId;
                                    
                                    // Insert relationships
                                    processRelationships(new_group_id, group)
                                        .then(resolve)
                                        .catch(reject);
                                }
                            );
                        }
                    });
                });

                // Helper function to process relationships for a group
                function processRelationships(group_id, group) {
                    const promises = [];
                    
                    // Insert sub groups
                    group.subGroups.forEach(subGroup => {
                        promises.push(new Promise((resolve, reject) => {
                            const query = `INSERT INTO schedule_sub_groups (group_id, sub_group) VALUES (?, ?)`;
                            db.query(query, [group_id, subGroup], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        }));
                    });
                    
                    // Handle lecturers - check if they are objects or just IDs
                    const lecturers = group.lecturers.map(lec => 
                        typeof lec === 'object' && lec.lec_id ? lec.lec_id : lec
                    );
                    
                    lecturers.forEach(lec_id => {
                        promises.push(new Promise((resolve, reject) => {
                            const query = `INSERT INTO schedule_lecturers (group_id, lec_id) VALUES (?, ?)`;
                            db.query(query, [group_id, lec_id], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        }));
                    });
                    
                    // Handle examiners - check if they are objects or just IDs
                    const examiners = group.examiners.map(ex => 
                        typeof ex === 'object' && ex.examiner_id ? ex.examiner_id : ex
                    );
                    
                    examiners.forEach(examiner_id => {
                        promises.push(new Promise((resolve, reject) => {
                            const query = `INSERT INTO schedule_examiners (group_id, examiner_id) VALUES (?, ?)`;
                            db.query(query, [group_id, examiner_id], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        }));
                    });
                    
                    return Promise.all(promises);
                }

                // Execute all operations
                Promise.all([...deletePromises, ...batchGroupPromises])
                    .then(() => {



                                    // // In the commit callback, right before the final response
                                    // db.commit(err => {
                                    // if (err) {
                                    //     return db.rollback(() => {
                                    //         console.error("Commit error:", err);
                                    //         res.status(500).json({ message: "Database commit error occurred" });
                                    //     });
                                    // }

                                    // // Identify changes for the email notifications
                                    // const changes = ["Schedule details have been updated"];
                                    // if (req.body.viva_type !== originalVivaType) {
                                    //     changes.push(`Viva type changed to ${req.body.viva_type}`);
                                    // }

                                    // // More specific changes can be identified here

                                    // // Send email notifications about the update
                                    // notifyOnScheduleUpdate(schedule_id, changes)
                                    //     .then(emailResult => {
                                    //         console.log("Update email notifications sent:", emailResult);
                                    //     })
                                    //     .catch(emailError => {
                                    //         console.error("Failed to send update email notifications:", emailError);
                                    //     });

                                    // res.json({ message: "Schedule updated successfully" });
                                    // });

                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error("Commit error:", err);
                                                res.status(500).json({ message: "Database commit error occurred" });
                                            });
                                        }
                                    
                                        // Identify changes for notifications
                                        const changes = ["Schedule details have been updated"];
                                        if (req.body.viva_type !== originalVivaType) {
                                            changes.push(`Viva type changed to ${req.body.viva_type}`);
                                        }
                                    
                                        // Send email notifications about the update
                                        notifyOnScheduleUpdate(schedule_id, changes)
                                            .then(emailResult => {
                                                console.log("Update email notifications sent:", emailResult);
                                            })
                                            .catch(emailError => {
                                                console.error("Failed to send update email notifications:", emailError);
                                            });
                                        
                                        // Send WhatsApp notifications about the update
                                        notifyOnScheduleUpdateViaWhatsApp(schedule_id, changes)
                                            .then(whatsappResult => {
                                                console.log("Update WhatsApp notifications sent:", whatsappResult);
                                            })
                                            .catch(whatsappError => {
                                                console.error("Failed to send update WhatsApp notifications:", whatsappError);
                                            });
                                    
                                        res.json({ message: "Schedule updated successfully" });
                                    });






                                            // db.commit(err => {
                                            //     if (err) {
                                            //         return db.rollback(() => {
                                            //             console.error("Commit error:", err);
                                            //             res.status(500).json({ message: "Database commit error occurred" });
                                            //         });
                                            //     }
                                                
                                            //     res.json({ message: "Schedule updated successfully" });
                                            // });
                                        })
                                        .catch(err => {
                                            db.rollback(() => {
                                                console.error("Database error:", err);
                                                res.status(500).json({ message: "Database error occurred" });
                                            });
                                        });
            });
        });
    });
});
};

// Delete a schedule by ID
exports.deleteSchedule = (req, res) => {
    const { schedule_id } = req.params;

    // Start transaction
    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ message: "Database transaction error occurred" });
        }

        // Get the slot_id before deleting
        const getSlotQuery = `SELECT slot_id FROM viva_schedules WHERE schedule_id = ?`;
        
        db.query(getSlotQuery, [schedule_id], (err, results) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Database error:", err);
                    res.status(500).json({ message: "Database error occurred" });
                });
            }

            if (results.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ message: "Schedule not found" });
                });
            }

            const slot_id = results[0].slot_id;

            // Delete the schedule (cascade will handle related tables)
            const deleteQuery = `DELETE FROM viva_schedules WHERE schedule_id = ?`;
            
            db.query(deleteQuery, [schedule_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Database error:", err);
                        res.status(500).json({ message: "Database error occurred" });
                    });
                }

                // Update the time slot back to available
                const updateSlotQuery = `UPDATE free_time_slots SET status = 'available' WHERE id = ?`;
                
                db.query(updateSlotQuery, [slot_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Database error:", err);
                            res.status(500).json({ message: "Database error occurred" });
                        });
                    }

                    // Commit transaction
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Commit error:", err);
                                res.status(500).json({ message: "Database commit error occurred" });
                            });
                        }
                        
                        res.json({ message: "Schedule deleted successfully" });
                    });
                });
            });
        });
    });
};