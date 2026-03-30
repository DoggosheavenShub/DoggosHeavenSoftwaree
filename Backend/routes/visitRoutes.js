const express =require('express');
const { addVisit, getVisit, addHostelVisit, addInquiryVisit, addDogParkVisit, getAllVisitPrices, addVeterinaryVisit, addDayCareVisit,getVisitList, addGroomingVisit, getAllVisitType, getBoardingCategoryList, addDaySchoolVisit, getVisitDetails, addShoppingVisit, addPlaySchoolVisit, buyy, getParticularPetVisit } = require('../controllers/VisitController');
const {protectedRoute}=require("../middlewares/protectedRoute");
const { updateHostelVisit } = require('../controllers/boardingController');
const router=express.Router();

router.post("/addvisit",protectedRoute,addVisit);
router.get("/getvisits",protectedRoute,getVisit)
router.post("/addhostelvisit",protectedRoute,addHostelVisit);
router.post("/addinquiryvisit",protectedRoute,addInquiryVisit);
router.post("/adddogparkvisit",protectedRoute,addDogParkVisit);
router.get("/getallvisitprices",protectedRoute,getAllVisitPrices);
router.post("/addveterinaryvisit",protectedRoute,addVeterinaryVisit);
router.post("/addhostelvisit",protectedRoute,addHostelVisit);
router.post("/adddayschoolvisit",protectedRoute,addDaySchoolVisit);
router.post("/addplayschoolvisit",protectedRoute,addPlaySchoolVisit);
router.post("/adddaycarevisit",protectedRoute,addDayCareVisit);
router.post("/addgroomingvisit",protectedRoute,addGroomingVisit);
router.post("/addshoppingvisit",protectedRoute,addShoppingVisit);
router.post("/getvisitlist",protectedRoute,getVisitList);
router.get("/getallvisittypes", getAllVisitType);
router.post("/addvisittype", protectedRoute, async (req, res) => {
  try {
    const VisitType = require('../models/visitTypes');
    const Alert = require('../models/alert');
    const { purpose, price, halfdayprice, emoji, description, isSubscriptionAvailable, subscriptionPrice, consultationPricePvt, customFields, priceTiers } = req.body;
    if (!purpose) return res.status(400).json({ success: false, message: "Purpose is required" });
    const vt = await VisitType.create({ purpose, price, halfdayprice, emoji: emoji || "🐾", description: description || "", isSubscriptionAvailable: isSubscriptionAvailable || false, subscriptionPrice: subscriptionPrice || null, consultationPricePvt: consultationPricePvt || null, customFields: customFields || [], priceTiers: priceTiers || [] });
    await Alert.create({ alertType: 'serviceAction', action: 'added', serviceName: purpose, performedBy: req.user?.fullName || 'Staff' });
    res.status(201).json({ success: true, data: vt, message: "Service created successfully" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.put("/updatevisittype/:id", protectedRoute, async (req, res) => {
  try {
    const VisitType = require('../models/visitTypes');
    const Alert = require('../models/alert');
    const { purpose, price, halfdayprice, emoji, description, isSubscriptionAvailable, subscriptionPrice, consultationPricePvt, customFields, priceTiers } = req.body;
    const vt = await VisitType.findByIdAndUpdate(req.params.id, { purpose, price, halfdayprice, emoji, description, isSubscriptionAvailable, subscriptionPrice, consultationPricePvt, customFields, priceTiers }, { new: true });
    if (!vt) return res.status(404).json({ success: false, message: "Service not found" });
    await Alert.create({ alertType: 'serviceAction', action: 'updated', serviceName: purpose || vt.purpose, performedBy: req.user?.fullName || 'Staff' });
    res.json({ success: true, data: vt, message: "Service updated successfully" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.delete("/deletevisittype/:id", protectedRoute, async (req, res) => {
  try {
    const VisitType = require('../models/visitTypes');
    const Alert = require('../models/alert');
    const vt = await VisitType.findById(req.params.id);
    if (!vt) return res.status(404).json({ success: false, message: "Service not found" });
    await VisitType.findByIdAndDelete(req.params.id);
    await Alert.create({ alertType: 'serviceAction', action: 'deleted', serviceName: vt.purpose, performedBy: req.user?.fullName || 'Staff' });
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.get("/getboardingcategories",protectedRoute,getBoardingCategoryList);
router.post("/updatehostelvisit",protectedRoute,updateHostelVisit);
router.get("/getvisitdetails/:id",protectedRoute,getVisitDetails);
router.get("/buyy/:id",protectedRoute,buyy);
router.get("/getparticularpetvisit",protectedRoute,getParticularPetVisit);

module.exports=router
