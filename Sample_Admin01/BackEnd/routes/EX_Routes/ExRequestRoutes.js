const express = require('express');
const router = express.Router();
const exRequestController = require('../../controller/EX_Controller/ExRequestController');

// Submit a reschedule request
router.post('/reschedule', exRequestController.submitRescheduleRequest);

// Get all reschedule requests for a specific examiner
router.get('/reschedule/:examiner_id', exRequestController.getExaminerRescheduleRequests);

// Get a specific reschedule request by ID
router.get('/reschedule/detail/:request_id', exRequestController.getRescheduleRequestById);

module.exports = router;