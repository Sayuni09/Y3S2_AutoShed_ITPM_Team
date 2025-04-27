const express = require("express");
const router = express.Router();
const { getLecturerSchedules } = require("../../controller/LEC_Controller/LecNewSchedulesController");

// Route to get schedules for a specific lecturer
router.get("/lecturer-schedules/:lec_id", getLecturerSchedules);

module.exports = router;
