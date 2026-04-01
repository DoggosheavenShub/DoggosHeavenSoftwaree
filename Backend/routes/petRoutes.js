const express = require("express");
const {
  addPet, getPetList, getPetById, getPetDate,
  filterPetsByBreedAndSpecies, getFilteredPetsByNameAndPhone,
  getPetVisitHistory, getPetByBirthday, getBoardedPetList,
  editPetDetails, editOwnerDetails,
  toggleBlacklist, getBlacklistedPets,
  submitUnblockRequest, getUnblockRequests, resolveUnblockRequest,
} = require("../controllers/petController");
const router = express.Router();
const { protectedRoute } = require("../middlewares/protectedRoute");
const { customerProtectedRoute } = require("../middlewares/customerProtectedRoute");
const { upload } = require("../config/cloudinary");

router.post("/addpet", protectedRoute, upload.any(), addPet);
router.get("/getallpets", protectedRoute, getPetList);
router.get("/getpetdetails/:id", protectedRoute, getPetById);
router.get("/getpetsbyregistrationdate/:date", protectedRoute, getPetDate);
router.get("/getfilteredpetsbybreedandspecies", protectedRoute, filterPetsByBreedAndSpecies);
router.get("/getfilteredpetsbynameandphone", protectedRoute, getFilteredPetsByNameAndPhone);
router.get("/getpethistory/:petId", protectedRoute, getPetVisitHistory);
router.get("/getpetsbybirthday", protectedRoute, getPetByBirthday);
router.get("/getboardedpetslist", protectedRoute, getBoardedPetList);
router.get("/blacklisted", protectedRoute, getBlacklistedPets);
router.get("/unblock-requests", protectedRoute, getUnblockRequests);
router.post("/editpetdetails", protectedRoute, editPetDetails);
router.post("/editownerdetails", protectedRoute, editOwnerDetails);
router.patch("/blacklist/:id", protectedRoute, toggleBlacklist);
router.patch("/unblock-requests/:id/resolve", protectedRoute, resolveUnblockRequest);
router.post("/unblock-request", customerProtectedRoute, submitUnblockRequest);
module.exports = router;
