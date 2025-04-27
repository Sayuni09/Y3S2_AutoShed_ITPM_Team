const db = require("../../models/db");

// Submit availability
exports.submitAvailability = (req, res) => {
    const { lec_id, comments, slots } = req.body;

    // Insert into lecturer_availability_forms
    const formQuery = "INSERT INTO lecturer_availability_forms (lec_id, comments) VALUES (?, ?)";
    
    db.query(formQuery, [lec_id, comments], (err, formResult) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        const form_id = formResult.insertId; // Get the newly created form_id

        // Insert slots into lecturer_availability_slots
        const slotQuery = "INSERT INTO lecturer_availability_slots (form_id, available_date, morning_slot, mid_day_slot, afternoon_slot, max_sessions_per_day) VALUES ?";
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

// Get availability by lec_id
exports.getAvailability = (req, res) => {
    const { lec_id } = req.params;

    const query = `
        SELECT f.form_id, f.comments, f.lec_id, f.created_at, s.slot_id, DATE_FORMAT(s.available_date, '%Y-%m-%d') AS available_date, s.morning_slot, s.mid_day_slot, s.afternoon_slot, s.max_sessions_per_day
        FROM lecturer_availability_forms f
        JOIN lecturer_availability_slots s ON f.form_id = s.form_id
        WHERE f.lec_id = ?
    `;
    
    db.query(query, [lec_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        // Transform results into the desired format
        const formattedResults = results.reduce((acc, row) => {
            const { form_id, comments, lec_id, created_at, slot_id, available_date, morning_slot, mid_day_slot, afternoon_slot, max_sessions_per_day } = row;

            // Check if the form_id already exists in the accumulator
            let form = acc.find(item => item.form_id === form_id);

            if (!form) {
                // If not, create a new form entry
                form = {
                    form_id,
                    comments,
                    lec_id,
                    created_at,
                    slots: []
                };
                acc.push(form);
            }

            // Push the slot details into the slots array
            form.slots.push({
                slot_id, // Include slot_id for updates
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
    const formQuery = "UPDATE lecturer_availability_forms SET comments = ? WHERE form_id = ?";
    
    db.query(formQuery, [comments, form_id], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        // Prepare to update or insert slots
        const updateSlotPromises = [];
        const insertSlotPromises = [];

        slots.forEach(slot => {
            const formattedDate = new Date(slot.available_date).toISOString().slice(0, 10); // Format date to YYYY-MM-DD
            if (slot.slot_id) {
                // If slot_id exists, update the existing slot
                const updateSlotQuery = `
                    UPDATE lecturer_availability_slots 
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
                // If no slot_id, insert a new slot
                const insertSlotQuery = "INSERT INTO lecturer_availability_slots (form_id, available_date, morning_slot, mid_day_slot, afternoon_slot, max_sessions_per_day) VALUES (?, ?, ?, ?, ?, ?)";
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

        // Handle deletion of slots
        const deleteSlotPromises = [];
        if (deleteSlotIds && deleteSlotIds.length > 0) {
            deleteSlotIds.forEach(slot_id => {
                const deleteSlotQuery = "DELETE FROM lecturer_availability_slots WHERE slot_id = ?";
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

        // Execute all updates, inserts, and deletions
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

    // Delete slots associated with the form_id
    const deleteSlotsQuery = "DELETE FROM lecturer_availability_slots WHERE form_id = ?";
    
    db.query(deleteSlotsQuery, [form_id], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error occurred" });
        }

        // Delete the form
        const deleteFormQuery = "DELETE FROM lecturer_availability_forms WHERE form_id = ?";
        
        db.query(deleteFormQuery, [form_id], (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error occurred" });
            }
            res.json({ message: "Availability deleted successfully" });
        });
    });
};