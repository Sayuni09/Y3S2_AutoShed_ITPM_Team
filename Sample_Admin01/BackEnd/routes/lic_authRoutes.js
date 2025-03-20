// D:\React_Nodejs\Sample_Admin01\BackEnd\routes\lic_authRoutes.js

const express = require("express");
const { login } = require("../controller/lic_authController");

const router = express.Router();

router.post("/login", login);

module.exports = router;