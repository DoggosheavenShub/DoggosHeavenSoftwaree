const mongoose = require("mongoose");

const blacklistRequestSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
  customerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminNote: { type: String, default: "" },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("BlacklistRequest", blacklistRequestSchema);
