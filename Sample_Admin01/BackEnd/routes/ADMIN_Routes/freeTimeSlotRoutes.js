const express = require("express");
const { getFreeTimeSlots, addFreeTimeSlot,updateFreeTimeSlot, deleteFreeTimeSlot } = require("../../controller/ADMIN_Controller/freeTimeSlotController");

const router = express.Router();

router.get("/", getFreeTimeSlots);
router.post("/", addFreeTimeSlot);
router.put("/:id", updateFreeTimeSlot);
router.delete("/:id", deleteFreeTimeSlot);

module.exports = router;