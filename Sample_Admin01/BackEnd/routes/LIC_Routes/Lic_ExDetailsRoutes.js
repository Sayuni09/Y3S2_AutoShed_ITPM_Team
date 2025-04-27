const express = require('express');
const router = express.Router();
const Lic_ExDetailsController = require('../../controller/LIC_Controller/Lic_ExDetailsController');

// Route to get examiner details based on the logged-in LIC's module codes
router.get('/examiners/:lec_id', Lic_ExDetailsController.getExaminerDetails);

module.exports = router;