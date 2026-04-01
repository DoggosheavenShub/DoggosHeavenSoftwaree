const express = require("express");
const {
  addPet,
  getPetList,
  getPetById,
  getPetDate,
  filterPetsByBreedAndSpecies,
  getFilteredPetsByNameAndPhone,
  getPetVisitHistory,
  getPetByBirthday,
  getBoardedPetList,
  editPetDetails,
  editOwnerDetails,
  toggleBlacklist,
  getBlacklistedPets,
} = require("../controllers/petController");
const router = express.Router();
const { protectedRoute } = require("../middlewares/protectedRoute");
const { upload } = require("../config/cloudinary");

router.post("/addpet", protectedRoute, upload.any(), addPet);
router.get("/getallpets",protectedRoute, getPetList);
router.get("/getpetdetails/:id",protectedRoute, getPetById);
router.get("/getpetsbyregistrationdate/:date",protectedRoute, getPetDate);
router.get("/getfilteredpetsbybreedandspecies",protectedRoute, filterPetsByBreedAndSpecies);
router.get("/getfilteredpetsbynameandphone",protectedRoute, getFilteredPetsByNameAndPhone);
router.get("/getpethistory/:petId",protectedRoute, getPetVisitHistory);
router.get("/getpetsbybirthday",protectedRoute,getPetByBirthday);
router.get("/getboardedpetslist",protectedRoute,getBoardedPetList);
router.get("/blacklisted",protectedRoute, getBlacklistedPets);
router.post("/editpetdetails",protectedRoute,editPetDetails);
router.post("/editownerdetails",protectedRoute,editOwnerDetails);
router.patch("/blacklist/:id",protectedRoute, toggleBlacklist);
module.exports = router;
