const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  billNo:         { type: String, required: true, unique: true },
  customerName:   { type: String, required: true },
  petName:        { type: String, default: "" },
  phone:          { type: String, default: "" },
  services:       [{ name: String, amount: Number }],
  total:          { type: Number, required: true },
  paymentMethod:  { type: String, enum: ["Cash", "Card", "UPI", "Online"], required: true },
  notes:          { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
  paymentStatus:  { type: String, enum: ["paid", "pending"], default: "paid" },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);
