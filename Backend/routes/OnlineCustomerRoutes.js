
const express = require('express');
const router = express.Router();
const { getBookingRevenue, getAppointments, updateAppointmentStatus } = require('../controllers/Onlinecustomerappointment');
const {protectedRoute}=require("../middlewares/protectedRoute")

router.get('/bookingrevenuedata', protectedRoute, getBookingRevenue);
router.get('/onlineappointments', protectedRoute, getAppointments);
router.patch('/onlineappointments/:id/status', protectedRoute, updateAppointmentStatus);

module.exports = router;
