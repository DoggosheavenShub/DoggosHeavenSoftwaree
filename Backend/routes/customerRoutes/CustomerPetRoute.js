const express = require('express');
const { customerProtectedRoute } = require("../../middlewares/customerProtectedRoute");
const { getAllPetByCustomerId, getAllVisitByPetId, registerPet, updatePet, deletePet } = require('../../controllers/customerControllers/customerPetController');
const { upload } = require('../../config/cloudinary');
const router = express.Router();

router.post("/register", upload.single("image"), registerPet);
router.put("/update/:petId", upload.single("image"), updatePet);
router.delete("/delete/:petId", customerProtectedRoute, deletePet);
router.post("/getallpets", customerProtectedRoute, getAllPetByCustomerId);
router.get("/getallvisit/:petId", customerProtectedRoute, getAllVisitByPetId);

module.exports = router;