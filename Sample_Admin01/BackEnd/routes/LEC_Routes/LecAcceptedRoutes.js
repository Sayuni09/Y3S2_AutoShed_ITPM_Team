// D:\React_Nodejs\git repostry\Sayu_Git_Autoshed\AutoShed_Sayu_Thila\Sample_Admin01\BackEnd\routes\LEC_Routes\LecAcceptedRoutes.js

const express = require("express");
const router = express.Router();
const LecAcceptedController = require("../../controller/LEC_Controller/LecAcceptedController");

// Route to accept a schedule
router.post("/accept", LecAcceptedController.acceptSchedule);

// Route to get accepted schedules for a lecturer
router.get("/accepted/:lec_id", LecAcceptedController.getAcceptedSchedules);

module.exports = router;