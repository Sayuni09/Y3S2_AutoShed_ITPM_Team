const express = require("express");
const {
    submitAvailability,
    getAvailability,
    updateAvailability,
    deleteAvailability
} = require("../../controller/LEC_Controller/LecAvailabilityController");

const router = express.Router();

router.post("/", submitAvailability); // Submit availability
router.get("/:lec_id", getAvailability); // Get availability by lec_id
router.put("/:form_id", updateAvailability); // Update availability by form_id
router.delete("/:form_id", deleteAvailability); // Delete availability by form_id

module.exports = router;