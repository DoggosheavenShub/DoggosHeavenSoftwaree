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

module.exports = router;