const express = require('express');
const router = express.Router();
const licNewSchedulesController = require('../../controller/LIC_Controller/LicNewSchedulesController');


// Create a new schedule
router.post('/schedules', licNewSchedulesController.createSchedule);

// Get all schedules for a LIC
router.get('/schedules/:lic_id', licNewSchedulesController.getSchedulesByLic);

// Get schedule details by ID
router.get('/schedule/:schedule_id', licNewSchedulesController.getScheduleDetails);

// Update a schedule
router.put('/schedule/:schedule_id', licNewSchedulesController.updateSchedule);

// Delete a schedule
router.delete('/schedule/:schedule_id', licNewSchedulesController.deleteSchedule);

module.exports = router;