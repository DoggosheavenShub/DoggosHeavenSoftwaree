const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema({
  inventoryId:  { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
  medicineName: { type: String, required: true },
  quantityUsed: { type: Number, required: true },
  petName:      { type: String, required: true },
  bookingId:    { type: String, required: true },
  usedBy:       { type: String, required: true },
  caseType:     { type: String, required: true, enum: ["Customer", "NGO"] },
  costPrice:    { type: Number, required: true },
  sellPrice:    { type: Number, required: true },
  totalAmount:  { type: Number, required: true },
  profit:       { type: Number, required: true },
  paymentStatus:{ type: String, enum: ["Pending", "Paid"], default: "Pending" },
  notes:        { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("UsageLog", usageLogSchema);
