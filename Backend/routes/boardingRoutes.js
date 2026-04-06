const express =require('express');
const { protectedRoute } = require('../middlewares/protectedRoute');
const { getBoardingDetails, HostelDeboarding, dayCareDeboarding, daySchoolDeboarding, playSchoolDeboarding, dogParkDeboarding, checkBoardingDetails } = require('../controllers/boardingController');


const router=express.Router();

router.post("/getboardingdetails",protectedRoute,getBoardingDetails);
router.post("/hosteldeboarding",protectedRoute,HostelDeboarding);
router.post("/daycaredeboarding",protectedRoute,dayCareDeboarding);
router.post("/dayschooldeboarding",protectedRoute,daySchoolDeboarding);
router.post("/playschooldeboarding",protectedRoute,playSchoolDeboarding);
router.post("/dogparkdeboarding",protectedRoute,dogParkDeboarding);
router.post("/checkboarding",protectedRoute,checkBoardingDetails);

module.exports=router