const express = require("express");
const {
    submitAvailability,
    getAvailability,
    updateAvailability,
    deleteAvailability
} = require("../../controller/EX_Controller/ExAvailabilityController");

const router = express.Router();

router.post("/", submitAvailability); // Submit availability
router.get("/:examiner_id", getAvailability); // Get availability by examiner_id
router.put("/:form_id", updateAvailability); // Update availability by form_id
router.delete("/:form_id", deleteAvailability); // Delete availability by form_id

module.exports = router;