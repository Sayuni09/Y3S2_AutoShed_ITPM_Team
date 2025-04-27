const db = require("../../models/db");

// Submit availability
exports.submitAvailability = (req, res) => {
    const { examiner_id, comments, slots } = req.body;

    // Insert into examiners_availability_forms
    const formQuery = "INSERT INTO examiners_availability_forms (examiner_id, comments) VALUES (?, ?)";
    
    db.query(formQuery, [examiner_id, comments], (err, formResult) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        const form_id = formResult.insertId; // Get the newly created form_id

        // Insert slots into examiners_availability_slots
        const slotQuery = "INSERT INTO examiners_availability_slots (form_id, available_date, morning_slot, mid_day_slot, afternoon_slot, max_sessions_per_day) VALUES ?";
        const slotValues = slots.map(slot => [form_id, slot.available_date, slot.morning_slot, slot.mid_day_slot, slot.afternoon_slot, slot.max_sessions_per_day]);

        db.query(slotQuery, [slotValues], (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error occurred" });
            }
            res.status(201).json({ message: "Availability submitted successfully", form_id });
        });
    });
};

// Get availability by examiner_id
exports.getAvailability = (req, res) => {
    const { examiner_id } = req.params;

    const query = `
        SELECT f.form_id, f.comments, f.examiner_id, f.created_at, s.slot_id, DATE_FORMAT(s.available_date, '%Y-%m-%d') AS available_date, s.morning_slot, s.mid_day_slot, s.afternoon_slot, s.max_sessions_per_day
        FROM examiners_availability_forms f
        JOIN examiners_availability_slots s ON f.form_id = s.form_id
        WHERE f.examiner_id = ?
    `;
    
    db.query(query, [examiner_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        // Transform results into the desired format
        const formattedResults = results.reduce((acc, row) => {
            const { form_id, comments, examiner_id, created_at, slot_id, available_date, morning_slot, mid_day_slot, afternoon_slot, max_sessions_per_day } = row;

            let form = acc.find(item => item.form_id === form_id);

            if (!form) {
                form = {
                    form_id,
                    comments,
                    examiner_id,
                    created_at,
                    slots: []
                };
                acc.push(form);
            }

            form.slots.push({
                slot_id,
                available_date,
                morning_slot,
                mid_day_slot,
                afternoon_slot,
                max_sessions_per_day
            });

            return acc;
        }, []);

        res.json(formattedResults);
    });
};

// Update availability by form_id
exports.updateAvailability = (req, res) => {
    const { form_id } = req.params;
    const { comments, slots, deleteSlotIds } = req.body;

    // Update the form comments
    const formQuery = "UPDATE examiners_availability_forms SET comments = ? WHERE form_id = ?";
    
    db.query(formQuery, [comments, form_id], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        const updateSlotPromises = [];
        const insertSlotPromises = [];

        slots.forEach(slot => {
            const formattedDate = new Date(slot.available_date).toISOString().slice(0, 10);
            if (slot.slot_id) {
                const updateSlotQuery = `
                    UPDATE examiners_availability_slots 
                    SET available_date = ?, morning_slot = ?, mid_day_slot = ?, afternoon_slot = ?, max_sessions_per_day = ? 
                    WHERE slot_id = ?
                `;
                updateSlotPromises.push(new Promise((resolve, reject) => {
                    db.query(updateSlotQuery, [formattedDate, slot.morning_slot, slot.mid_day_slot, slot.afternoon_slot, slot.max_sessions_per_day, slot.slot_id], (err) => {
                        if (err) {
                            console.error("Database error:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                }));
            } else {
                const insertSlotQuery = "INSERT INTO examiners_availability_slots (form_id, available_date, morning_slot, mid_day_slot, afternoon_slot, max_sessions_per_day) VALUES (?, ?, ?, ?, ?, ?)";
                insertSlotPromises.push(new Promise((resolve, reject) => {
                    db.query(insertSlotQuery, [form_id, formattedDate, slot.morning_slot, slot.mid_day_slot, slot.afternoon_slot, slot.max_sessions_per_day], (err) => {
                        if (err) {
                            console.error("Database error:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                }));
            }
        });

        const deleteSlotPromises = [];
        if (deleteSlotIds && deleteSlotIds.length > 0) {
            deleteSlotIds.forEach(slot_id => {
                const deleteSlotQuery = "DELETE FROM examiners_availability_slots WHERE slot_id = ?";
                deleteSlotPromises.push(new Promise((resolve, reject) => {
                    db.query(deleteSlotQuery, [slot_id], (err) => {
                        if (err) {
                            console.error("Database error:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                }));
            });
        }

        Promise.all([...updateSlotPromises, ...insertSlotPromises, ...deleteSlotPromises])
            .then(() => {
                res.json({ message: "Availability updated successfully" });
            })
            .catch(err => {
                console.error("Database error:", err);
                res.status(500).json({ message: "Database error occurred" });
            });
    });
};

// Delete availability by form_id
exports.deleteAvailability = (req, res) => {
    const { form_id } = req.params;

    const deleteSlotsQuery = "DELETE FROM examiners_availability_slots WHERE form_id = ?";
    
    db.query(deleteSlotsQuery, [form_id], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        const deleteFormQuery = "DELETE FROM examiners_availability_forms WHERE form_id = ?";
        
        db.query(deleteFormQuery, [form_id], (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error occurred" });
            }
            res.json({ message: "Availability deleted successfully" });
        });
    });
};