const express = require("express");
const router = express.Router();
const exCalendarController = require("../../controller/EX_Controller/ExCalenderController");

// Route to get all accepted schedules for an examiner by ID
router.get("/calendar/:examiner_id", exCalendarController.getAcceptedSchedules);

module.exports = router;