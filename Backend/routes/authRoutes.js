const express = require('express');
const { login, signUp, adminSignUp, changePassword, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post("/login", login);
router.post("/signup", signUp);
router.post("/admin-signup", adminSignUp);
router.put("/changepassword", changePassword);
router.put("/updateprofile", updateProfile);
router.get("/getallstaff", async (req, res) => {
  try {
    const User = require('../models/user');
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, staff });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/updatestaff/:id", async (req, res) => {
  try {
    const User = require('../models/user');
    const { fullName, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "Staff not found" });
    res.status(200).json({ success: true, staff: user, message: "Staff updated successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete("/deletestaff/:id", async (req, res) => {
  try {
    const User = require('../models/user');
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/staffdetails/:id", async (req, res) => {
  try {
    const User = require('../models/user');
    const Visit = require('../models/Visit');
    const Boarding = require('../models/boarding');
    const VisitType = require('../models/visitTypes');

    const staff = await User.findById(req.params.id).select('-password');
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const staffVisits = await Visit.find({ createdBy: staff._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: 'pet', select: 'name', populate: { path: 'owner', select: 'name' } })
      .populate({ path: 'visitType', select: 'purpose emoji' });

    const totalVisits = await Visit.countDocuments({ createdBy: staff._id });
    const visitIds = await Visit.find({ createdBy: staff._id }).distinct('_id');
    const totalBoardings = await Boarding.countDocuments({ visitId: { $in: visitIds } });

    // Services staff has provided (distinct visitTypes)
    const providedTypeIds = await Visit.find({ createdBy: staff._id }).distinct('visitType');

    // All services
    const allServices = await VisitType.find({});

    res.status(200).json({
      success: true,
      staff,
      stats: { totalVisits, totalBoardings },
      recentVisits: staffVisits,
      allServices,
      providedServiceIds: providedTypeIds.map(id => id.toString()),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/mystats", async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req?.headers["authorization"]?.trim();
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const User = require('../models/user');
    const Visit = require('../models/Visit');
    const Boarding = require('../models/boarding');
    const VisitType = require('../models/visitTypes');

    const staff = await User.findOne({ email: decoded.userEmail || decoded.email }).select('-password');
    if (!staff) return res.status(404).json({ success: false, message: "User not found" });

    const totalVisits = await Visit.countDocuments({ createdBy: staff._id });
    const visitIds = await Visit.find({ createdBy: staff._id }).distinct('_id');
    const totalBoardings = await Boarding.countDocuments({ visitId: { $in: visitIds } });
    const providedTypeIds = await Visit.find({ createdBy: staff._id }).distinct('visitType');
    const allServices = await VisitType.find({});
    const recentVisits = await Visit.find({ createdBy: staff._id })
      .sort({ createdAt: -1 }).limit(10)
      .populate({ path: 'pet', select: 'name', populate: { path: 'owner', select: 'name' } })
      .populate({ path: 'visitType', select: 'purpose emoji' });

    res.status(200).json({
      success: true,
      staff,
      stats: { totalVisits, totalBoardings },
      recentVisits,
      allServices,
      providedServiceIds: providedTypeIds.map(id => id.toString()),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Service action notifications for admin
router.get("/servicenotifications", async (req, res) => {
  try {
    const Alert = require('../models/alert');
    const alerts = await Alert.find({ alertType: 'serviceAction' })
      .sort({ alertDate: -1 })
      .limit(50);
    const unreadCount = await Alert.countDocuments({ alertType: 'serviceAction', isRead: false });
    res.status(200).json({ success: true, alerts, unreadCount });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch("/servicenotifications/markallread", async (req, res) => {
  try {
    const Alert = require('../models/alert');
    await Alert.updateMany({ alertType: 'serviceAction', isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;