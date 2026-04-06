const express = require("express");
const { customerProtectedRoute } = require("../middlewares/customerProtectedRoute");
const { protectedRoute } = require("../middlewares/protectedRoute");
const {
  createBooking,
  getUserDashboard,
  adminListBookings,
  adminUpdateBooking,
  getPlanPreview,
} = require("../controllers/boardingSubscriptionController");

const router = express.Router();

// User routes
router.post("/book", customerProtectedRoute, createBooking);
router.get("/dashboard", customerProtectedRoute, getUserDashboard);
router.get("/preview", customerProtectedRoute, getPlanPreview);

// Admin routes
router.get("/admin/list", protectedRoute, adminListBookings);
router.patch("/admin/:bookingId", protectedRoute, adminUpdateBooking);

module.exports = router;
