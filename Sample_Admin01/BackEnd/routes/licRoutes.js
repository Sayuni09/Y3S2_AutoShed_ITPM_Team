const express = require("express");
const { getLic, addLic, updateLic, deleteLic } = require("../controller/licController");

const router = express.Router();

router.get("/", getLic);
router.post("/add-lic", addLic);
router.put("/:id", updateLic); // Update lecturer in charge
router.delete("/:id", deleteLic); // Delete lecturer in charge

module.exports = router;