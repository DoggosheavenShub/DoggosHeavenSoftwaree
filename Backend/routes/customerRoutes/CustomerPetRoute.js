const express = require('express');
const { protectedRoute } = require("../../middlewares/protectedRoute");
const { getAllPetByCustomerId, getAllVisitByPetId, registerPet, updatePet } = require('../../controllers/customerControllers/customerPetController');
const { upload } = require('../../config/cloudinary');
const router = express.Router();

router.post("/register", upload.single("image"), registerPet);
router.put("/update/:petId", upload.single("image"), updatePet);
router.post("/getallpets", protectedRoute, getAllPetByCustomerId);
router.get("/getallvisit/:petId", protectedRoute, getAllVisitByPetId);

module.exports = router;