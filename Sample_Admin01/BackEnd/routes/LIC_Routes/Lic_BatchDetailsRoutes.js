
const express = require('express');
const router = express.Router();
const LicBatchDetailsController = require('../../controller/LIC_Controller/Lic_BatchDetailsController');

// Route to get all batches
router.get('/', LicBatchDetailsController.getAllBatches);

// Route to get batch details
router.get('/:batch', LicBatchDetailsController.getBatchDetails);

module.exports = router;