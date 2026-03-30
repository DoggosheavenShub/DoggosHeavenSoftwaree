const express = require("express");
const router = express.Router();
const Alert = require("../models/alert");
const { protectedRoute } = require("../middlewares/protectedRoute");

// Get alerts filtered by role
router.get("/getall", protectedRoute, async (req, res) => {
  try {
    const role = req.user?.role || "admin";

    let filter;
    if (role === "staff") {
      filter = { forRole: "staff" };
    } else {
      // admin sees: forRole=admin, forRole=both, or forRole missing (old alerts)
      filter = { $or: [{ forRole: "admin" }, { forRole: "both" }, { forRole: { $exists: false } }, { forRole: null }] };
    }

    const alerts = await Alert.find(filter)
      .populate("appointmentId")
      .sort({ alertDate: -1 })
      .limit(100);

    const unreadCount = await Alert.countDocuments({ ...filter, isRead: false });

    res.json({ success: true, alerts, unreadCount });
  } catch (e) {
    console.log("alertRoutes getall error:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// Mark all as read (role-based)
router.put("/markallread", protectedRoute, async (req, res) => {
  try {
    const role = req.user?.role || "admin";

    let filter;
    if (role === "staff") {
      filter = { forRole: "staff", isRead: false };
    } else {
      filter = {
        $or: [{ forRole: "admin" }, { forRole: "both" }, { forRole: { $exists: false } }, { forRole: null }],
        isRead: false,
      };
    }

    await Alert.updateMany(filter, { isRead: true });
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
