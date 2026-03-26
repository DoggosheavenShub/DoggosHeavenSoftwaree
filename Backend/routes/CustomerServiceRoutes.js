const express = require('express');
const router = express.Router();
const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/Customerservicescontroller');

router.get('/getallservices', getAllServices);
router.get('/getservicesbyid/:id', getServiceById);
router.post('/createservice', createService);
router.put('/updateservice/:id', updateService);
router.delete('/deleteservice/:id', deleteService);

module.exports = router;