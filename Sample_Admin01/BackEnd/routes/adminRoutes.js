const express = require("express");
const { getAdmins, addAdmin, updateAdmin, deleteAdmin } = require("../controller/adminController");
// const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all admin routes
//router.use(authenticateToken);

router.get("/", getAdmins);
router.post("/", addAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;