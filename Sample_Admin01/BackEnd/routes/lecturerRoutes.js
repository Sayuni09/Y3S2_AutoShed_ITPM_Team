const express = require("express");
const { getLecturers, addLecturer, updateLecturer, deleteLecturer } = require("../controller/lecturerController");

const router = express.Router();

router.get("/", getLecturers);
router.post("/add-lecturer", addLecturer);
router.put("/:id", updateLecturer); // Update lecturer
router.delete("/:id", deleteLecturer); // Delete lecturer

module.exports = router;