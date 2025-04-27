const express = require('express');
const router = express.Router();
const Lic_LecAvailabilityController = require('../../controller/LIC_Controller/Lic_LecAvailabilityController');

// Route to get lecturers and their availability based on the logged-in lecturer's module codes
router.get('/lecturers/:lec_id', Lic_LecAvailabilityController.getLecturers);

module.exports = router;