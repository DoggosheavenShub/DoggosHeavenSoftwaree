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
    neutered: {
      type: Boolean,
      default: false,
    },
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
        name: { type: String, required: true },
        date: { type: Date, default: null },
        serialNumber: { type: String, default: "" },
        nextDueDate: { type: Date, default: null },
      },
    ],
    registrationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    image: {
      type: String,
      default: null,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
    blacklistReason: {
      type: String,
      default: "",
    },
    blacklistedAt: {
      type: Date,
      default: null,
    },
    blacklistedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
