const express=require("express");
const { addPrescription, getPetPrescriptions, getMyPrescriptions, deletePrescription, getAllPrescriptions } = require("./../controllers/PrescriptionController");
const { protectedRoute } = require("../middlewares/protectedRoute");
const router = express.Router();

router.post('/addprescription', protectedRoute, addPrescription);
router.get('/myprescriptions', protectedRoute, getMyPrescriptions);
router.get('/getprescription/:petId', protectedRoute, getPetPrescriptions);
router.delete('/delete/:id', protectedRoute, deletePrescription);
router.get('/getall', protectedRoute, getAllPrescriptions);

module.exports=router

