const express = require('express');
const { login, signUp, adminSignUp, changePassword, updateProfile } = require('../controllers/authController');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const router = express.Router();

// In-memory OTP store { email: { otp, expiresAt } }
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_ACCOUNT, pass: process.env.GMAIL_APP_PASSWORD },
});

const buildOtpEmail = (otp, name) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f7f0;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f0;padding:32px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(11,61,46,0.10)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0B3D2E 0%,#1A5C3A 100%);padding:32px 32px 24px;text-align:center">
            <div style="width:64px;height:64px;background:rgba(168,217,108,0.15);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
              <span style="font-size:36px">🐾</span>
            </div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.5px">Doggos Heaven</h1>
            <p style="margin:6px 0 0;color:#A8D96C;font-size:13px">Premium Pet Care Services</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 8px;color:#0B3D2E;font-size:20px;font-weight:700">Password Reset Request</h2>
            <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6">Hi <strong>${name || 'there'}</strong>, we received a request to reset your password. Use the OTP below to continue.</p>

            <!-- OTP Box -->
            <div style="background:linear-gradient(135deg,#0B3D2E,#1A5C3A);border-radius:16px;padding:28px;text-align:center;margin:0 0 24px">
              <p style="margin:0 0 8px;color:#A8D96C;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Your OTP Code</p>
              <div style="letter-spacing:12px;font-size:38px;font-weight:700;color:#fff;font-family:monospace">${otp}</div>
              <p style="margin:12px 0 0;color:rgba(168,217,108,0.8);font-size:12px">⏱ Valid for 10 minutes only</p>
            </div>

            <!-- Info boxes -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f0f7f0;border-radius:12px;padding:14px 16px;border-left:4px solid #A8D96C">
                  <p style="margin:0;color:#0B3D2E;font-size:13px">🔒 <strong>Never share this OTP</strong> with anyone, including our staff.</p>
                </td>
              </tr>
              <tr><td style="height:10px"></td></tr>
              <tr>
                <td style="background:#fff9e6;border-radius:12px;padding:14px 16px;border-left:4px solid #F59E0B">
                  <p style="margin:0;color:#B45309;font-size:13px">⚠️ If you didn't request this, please ignore this email. Your account is safe.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fff8;border-top:1px solid #D4EDD4;padding:20px 32px;text-align:center">
            <p style="margin:0 0 4px;color:#0B3D2E;font-size:13px;font-weight:600">🐶 Doggos Heaven</p>
            <p style="margin:0;color:#999;font-size:11px">Premium Pet Care • care@doggosheaven.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// Send OTP
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const User = require('../models/user');
    const Owner = require('../models/Owner');

    let user = null;
    let userName = '';

    if (role === 'customer') {
      user = await User.findOne({ email: email.toLowerCase().trim(), role: 'customer' });
    } else {
      user = await User.findOne({ email: email.toLowerCase().trim(), role: { $in: ['staff', 'admin'] } });
    }

    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });
    userName = user.fullName || user.name || '';

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = { otp, expiresAt: Date.now() + 10 * 60 * 1000, role };

    await transporter.sendMail({
      from: `"Doggos Heaven" <${process.env.GMAIL_ACCOUNT}>`,
      to: email,
      subject: '🔐 Your Password Reset OTP — Doggos Heaven',
      html: buildOtpEmail(otp, userName),
    });

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (e) {
    console.error('send-otp error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
  }
});

// Verify OTP
router.post("/forgot-password/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email?.toLowerCase()];
  if (!record) return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
  }
  if (record.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
  // Mark as verified
  otpStore[email.toLowerCase()].verified = true;
  res.status(200).json({ success: true, message: 'OTP verified.' });
});

// Reset Password
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const record = otpStore[email?.toLowerCase()];
    if (!record || !record.verified) return res.status(400).json({ success: false, message: 'Please verify OTP first.' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const User = require('../models/user');
    const hashed = await bcrypt.hash(newPassword, 12);
    const updated = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashed },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });

    delete otpStore[email.toLowerCase()];
    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

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

    const Appointment = require('../models/Customerapointment');

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

    // Today's appointments
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayAppointments = await Appointment.find({
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'cancelled' },
    }).populate('customerId', 'name fullName email phone').sort({ appointmentTime: 1 });

    // All appointments (for date filter on frontend)
    const allAppointments = await Appointment.find({ status: { $ne: 'cancelled' } })
      .populate('customerId', 'name fullName email phone')
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      staff,
      stats: { totalVisits, totalBoardings },
      recentVisits,
      allServices,
      providedServiceIds: providedTypeIds.map(id => id.toString()),
      todayAppointments,
      allAppointments,
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