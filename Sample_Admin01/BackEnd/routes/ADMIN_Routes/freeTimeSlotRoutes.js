const express = require("express");
const { getFreeTimeSlots, addFreeTimeSlot, updateFreeTimeSlot, deleteFreeTimeSlot, getLICs } = require("../../controller/ADMIN_Controller/freeTimeSlotController");

const router = express.Router();

router.get("/", getFreeTimeSlots);
router.post("/", addFreeTimeSlot);
router.get("/lics", getLICs);
router.put("/:id", updateFreeTimeSlot);
router.delete("/:id", deleteFreeTimeSlot);

module.exports = router;