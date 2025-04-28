const express = require("express");
const { getModules } = require("../../controller/ADMIN_Controller/moduleController");

const router = express.Router();

router.get("/", getModules);
 
module.exports = router;
