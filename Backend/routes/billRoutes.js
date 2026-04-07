const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const { protectedRoute } = require("../middlewares/protectedRoute");

// Save bill
router.post("/save", protectedRoute, async (req, res) => {
  try {
    const { billNo, customerName, petName, phone, services, total, paymentMethod, notes, razorpayPaymentId } = req.body;
    if (!billNo || !customerName || !total || !paymentMethod)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const bill = await Bill.create({
      billNo, customerName, petName, phone, services, total,
      paymentMethod, notes, razorpayPaymentId: razorpayPaymentId || "",
      createdBy: req.userId || null,
    });
    return res.json({ success: true, bill });
  } catch (e) {
    console.log("save bill error", e);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Get all bills with optional filter
router.get("/list", protectedRoute, async (req, res) => {
  try {
    const { paymentMethod, search } = req.query;
    const query = {};
    if (paymentMethod && paymentMethod !== "All") query.paymentMethod = paymentMethod;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { petName:      { $regex: search, $options: "i" } },
        { phone:        { $regex: search, $options: "i" } },
        { billNo:       { $regex: search, $options: "i" } },
      ];
    }
    const bills = await Bill.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, bills });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Delete bill
router.delete("/:id", protectedRoute, async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Bill deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
