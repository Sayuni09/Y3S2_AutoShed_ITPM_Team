// D:\React_Nodejs\Sample_Admin01\BackEnd\routes\ex_authRoutes.js

const express = require("express");
const { login } = require("../controller/ex_authController");

const router = express.Router();

router.post("/login", login);

module.exports = router;