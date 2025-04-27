
const db = require('../../models/db'); // Adjust the path as necessary

// Fetch all batches
exports.getAllBatches = (req, res) => {
    const query = 'SELECT DISTINCT batch FROM batch_group';

    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};

// Fetch batch details based on the selected batch
exports.getBatchDetails = (req, res) => {
    const { batch } = req.params;

    const query = 'SELECT sub_group, leader_IT_number, leader_name, leader_email, leader_contact_no FROM batch_group WHERE batch = ?';
    
    db.query(query, [batch], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No details found for the selected batch' });
        }
        res.status(200).json(results);
    });
};