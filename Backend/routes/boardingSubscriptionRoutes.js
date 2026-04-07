const express = require("express");
const { customerProtectedRoute } = require("../middlewares/customerProtectedRoute");
const { protectedRoute } = require("../middlewares/protectedRoute");
const {
  createBookingOrder,
  verifyAndActivate,
  activateBoarding,
  deboardBoarding,
  getUserDashboard,
  adminListBookings,
  adminUpdateBooking,
  getPlanPreview,
  staffDeboardWallet,
  staffActivateBoarding,
  staffUpdatePets,
} = require("../controllers/boardingSubscriptionController");

const router = express.Router();

// User routes
router.post("/create-order", customerProtectedRoute, createBookingOrder);
router.post("/verify-activate", customerProtectedRoute, verifyAndActivate);
router.post("/activate", customerProtectedRoute, activateBoarding);
router.post("/deboard", customerProtectedRoute, deboardBoarding);
router.get("/dashboard", customerProtectedRoute, getUserDashboard);
router.get("/preview", customerProtectedRoute, getPlanPreview);

// Admin + Staff routes
router.get("/admin/list", protectedRoute, adminListBookings);
router.patch("/admin/:bookingId", protectedRoute, adminUpdateBooking);
// Staff: deboard wallet boarding
router.post("/staff/deboard", protectedRoute, staffDeboardWallet);
router.post("/staff/activate", protectedRoute, staffActivateBoarding);
router.post("/staff/update-pets", protectedRoute, staffUpdatePets);

module.exports = router;
