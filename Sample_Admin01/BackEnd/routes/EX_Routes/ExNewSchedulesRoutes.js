const express = require("express");
const router = express.Router();
const { getExaminerSchedules } = require("../../controller/EX_Controller/ExNewSchedulesController");

// Route to get schedules for a specific examiner
router.get("/examiner-schedules/:examiner_id", getExaminerSchedules);

module.exports = router;
