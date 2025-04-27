// D:\React_Nodejs\git repostry\Sayu_Git_Autoshed\AutoShed_Sayu_Thila\Sample_Admin01\BackEnd\routes\LIC_Routes\MessageHistoryRoutes.js

const express = require('express');
const router = express.Router();
const messageHistoryController = require('../../controller/LIC_Controller/MessageHistoryController');

// Get email history for a LIC
router.get('/email-history/:lic_id', messageHistoryController.getLicEmailHistory);

// Get WhatsApp message history for a LIC
router.get('/whatsapp-history/:lic_id', messageHistoryController.getLicWhatsAppHistory);

module.exports = router;
