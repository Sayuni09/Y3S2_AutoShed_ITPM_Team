const express = require('express');
const router = express.Router();
const licRescheduleController = require('../../controller/LIC_Controller/LicRescheduleController');

// Get all reschedule requests (both pending and responded)
router.get('/:licId/reschedule-requests/all', licRescheduleController.getAllRescheduleRequests);

// Get only pending reschedule requests
router.get('/:licId/reschedule-requests/pending', licRescheduleController.getPendingRescheduleRequests);

// Get details of a specific reschedule request
router.get('/:licId/reschedule-requests/:requestType/:requestId', licRescheduleController.getRequestDetails);

// Respond to a lecturer's reschedule request
router.put('/:licId/reschedule-requests/lecturer/:requestId', licRescheduleController.respondToLecturerRequest);

// Respond to an examiner's reschedule request
router.put('/:licId/reschedule-requests/examiner/:requestId', licRescheduleController.respondToExaminerRequest);

module.exports = router;