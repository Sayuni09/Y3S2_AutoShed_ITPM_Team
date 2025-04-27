const express = require('express');
const router = express.Router();
const Lic_ExAvailabilityController = require('../../controller/LIC_Controller/Lic_ExAvailabilityController');

// Route to get examiners and their availability based on the logged-in lecturer's module codes
router.get('/examiners/:lec_id', Lic_ExAvailabilityController.getExaminers);

module.exports = router;