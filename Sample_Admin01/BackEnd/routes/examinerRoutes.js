const express = require("express");
const { getExaminers, addExaminer, updateExaminer, deleteExaminer } = require("../controller/examinerController");

const router = express.Router();

router.get("/", getExaminers);
router.post("/add-examiner", addExaminer);
router.put("/:id", updateExaminer); 
router.delete("/:id", deleteExaminer);

module.exports = router;