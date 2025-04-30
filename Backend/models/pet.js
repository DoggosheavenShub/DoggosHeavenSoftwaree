const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: String,
    breed: String,
    sex: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    color: String,
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    vaccinations: [
      {
        name: {
          type: String,
          required: true,
        },
        numberOfDose: {
          type: Number,
          required: true,
        },
      },
    ],
    registrationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    subscriptions: [
      {
        type: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subscription",
          required: true,
        },
        daysLeft: {
          type: Number,
          min:0,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["active", "expired", "cancelled"],
          default: "active",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
