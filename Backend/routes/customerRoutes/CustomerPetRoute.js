const express =require('express');
const {protectedRoute}=require("../../middlewares/protectedRoute")
const { getAllPetByCustomerId, getAllVisitByPetId } = require('../../controllers/customerControllers/customerPetController');
const router=express.Router();

router.post("/getallpets",protectedRoute,getAllPetByCustomerId);
router.get("/getallvisit/:petId",protectedRoute,getAllVisitByPetId);

module.exports=router