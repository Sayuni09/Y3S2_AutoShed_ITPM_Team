const express = require('express');
const router = express.Router();
const Lic_LecDetailsController = require('../../controller/LIC_Controller/Lic_LecDetailsController');

// Route to get lecturer details based on the logged-in LIC's module codes
router.get('/lecturers/:lec_id', Lic_LecDetailsController.getLecturerDetails);

module.exports = router;