const express = require("express");
const { login } = require("../controller/authController");

const router = express.Router();

router.post("/login", login);

module.exports = router;
