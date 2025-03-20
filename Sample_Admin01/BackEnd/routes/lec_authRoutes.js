// D:\React_Nodejs\Sample_Admin01\BackEnd\routes\lec_authRoutes.js

const express = require("express");
const { login } = require("../controller/lec_authController");

const router = express.Router();

router.post("/login", login);

module.exports = router;