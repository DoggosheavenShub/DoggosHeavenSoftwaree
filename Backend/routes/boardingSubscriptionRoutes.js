const express = require("express");
const { customerProtectedRoute } = require("../middlewares/customerProtectedRoute");
const { protectedRoute } = require("../middlewares/protectedRoute");
const {
  createBookingOrder,
  verifyAndActivate,
  getUserDashboard,
  adminListBookings,
  adminUpdateBooking,
  getPlanPreview,
} = require("../controllers/boardingSubscriptionController");

const router = express.Router();

// User routes
router.post("/create-order", customerProtectedRoute, createBookingOrder);
router.post("/verify-activate", customerProtectedRoute, verifyAndActivate);
router.get("/dashboard", customerProtectedRoute, getUserDashboard);
router.get("/preview", customerProtectedRoute, getPlanPreview);

// Admin routes
router.get("/admin/list", protectedRoute, adminListBookings);
router.patch("/admin/:bookingId", protectedRoute, adminUpdateBooking);

module.exports = router;
