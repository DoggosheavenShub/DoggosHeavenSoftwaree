const express = require("express");
const router = express.Router();
const Alert = require("../models/alert");
const { protectedRoute } = require("../middlewares/protectedRoute");

// Get all alerts (admin)
router.get("/getall", protectedRoute, async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ alertDate: -1 }).limit(100);
    const unreadCount = await Alert.countDocuments({ isRead: false });
    res.json({ success: true, alerts, unreadCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mark all as read
router.put("/markallread", protectedRoute, async (req, res) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mark one as read
router.put("/markread/:id", protectedRoute, async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
