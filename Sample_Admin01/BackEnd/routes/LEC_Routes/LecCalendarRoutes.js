const express = require("express");
const router = express.Router();
const lecCalendarController = require("../../controller/LEC_Controller/LecCalendarController");

// Route to get all accepted schedules for a lecturer by ID
router.get("/calendar/:lec_id", lecCalendarController.getAcceptedSchedules);

module.exports = router;