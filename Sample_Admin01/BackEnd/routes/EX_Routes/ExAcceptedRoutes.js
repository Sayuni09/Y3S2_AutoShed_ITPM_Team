const express = require("express");
const router = express.Router();
const ExAcceptedController = require("../../controller/EX_Controller/ExAcceptedController");

// Route to accept a schedule
router.post("/accept", ExAcceptedController.acceptSchedule);

// Route to get accepted schedules for an examiner
router.get("/accepted/:examiner_id", ExAcceptedController.getAcceptedSchedules);

module.exports = router;