const mongoose = require("mongoose");

const PRICE_PER_DAY = parseFloat((11500 / 15).toFixed(2)); // 766.67

const boardingSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true,
      },
    ],
    planName: { type: String, default: "15 Days Boarding Plan" },
    totalPrice: { type: Number, default: 11500 },
    durationDays: { type: Number, default: 15 },
    pricePerDay: { type: Number, default: PRICE_PER_DAY },
    numberOfPets: { type: Number, required: true, min: 1 },
    dailyCharge: { type: Number, required: true }, // pricePerDay * numberOfPets
    status: {
      type: String,
      enum: ["pending", "approved", "active", "inactive", "rejected"],
      default: "pending",
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    daysRemaining: { type: Number, default: 15 },
    adminNote: { type: String, default: "" },
    lastDeductionDate: { type: Date, default: null },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

boardingSubscriptionSchema.statics.PRICE_PER_DAY = PRICE_PER_DAY;

module.exports = mongoose.model("BoardingSubscription", boardingSubscriptionSchema);
