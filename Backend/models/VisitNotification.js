const mongoose = require("mongoose");

const visitNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    petName: { type: String, default: "" },
    purpose: { type: String, default: "" },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitNotification", visitNotificationSchema);
