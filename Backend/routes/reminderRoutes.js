const express =require('express');
const { sendReminders, sendBirthdayReminders, sendOverdueReminders, getRemindersList } = require('../controllers/remindersController');
const {protectedRoute}=require("../middlewares/protectedRoute")
const router=express.Router();

router.post("/sendreminders",protectedRoute,sendReminders);
router.post("/sendbirthdayreminders",protectedRoute,sendBirthdayReminders);
router.post('/sendoverduereminders',protectedRoute,sendOverdueReminders);
router.get("/getreminderslist/:date",protectedRoute,getRemindersList);
module.exports=router