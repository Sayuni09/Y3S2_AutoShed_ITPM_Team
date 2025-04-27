const express = require('express');
const router = express.Router();
const lecRequestController = require('../../controller/LEC_Controller/LecRequestController');

// Submit a reschedule request
router.post('/reschedule', lecRequestController.submitRescheduleRequest);

// Get all reschedule requests for a specific lecturer
router.get('/reschedule/:lec_id', lecRequestController.getLecturerRescheduleRequests);

// Get a specific reschedule request by ID
router.get('/reschedule/detail/:request_id', lecRequestController.getRescheduleRequestById);

module.exports = router;