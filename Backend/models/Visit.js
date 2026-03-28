const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    visitType: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"VisitType",
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
