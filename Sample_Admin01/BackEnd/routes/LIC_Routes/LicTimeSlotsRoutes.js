const express = require("express");
const router = express.Router();
const LicTimeSlotsController = require("../../controller/LIC_Controller/LicTimeSlotsController");
 
// Route to get all free time slots for the logged-in lic
router.get("/time-slots/:lec_id", LicTimeSlotsController.getLicTimeSlots);

// Route to get available lecturers for a specific time slot
router.get("/time-slots/:slot_id/available-lecturers", LicTimeSlotsController.getAvailableLecturersForTimeSlot);

// Route to get available examiners for a specific time slot
router.get("/time-slots/:slot_id/available-examiners", LicTimeSlotsController.getAvailableExaminersForTimeSlot);

module.exports = router;