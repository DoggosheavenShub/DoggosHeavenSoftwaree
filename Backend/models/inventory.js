const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemId: {
    type: String,
    unique: true,
  },
  
  itemName: {
    type: String,
    required: true,
  },
  medicineName: { type: String, default: "" },
  brandName:    { type: String, default: "" },
  saltName:     { type: String, default: "" },
  stock: {
    type: Number,
  },
  stockUnit: {
    type: String,
    enum: ["ml", "item", "tablet", "mg"], 
    required: true,
  },
  itemType: {
    type: String,
    enum: ["disposable", "injection", "medicine", "vaccine"],
    required: true,
  },
  disposableSubType: {
    type: String,
    enum: ["", "Gloves", "Cotton", "Mask", "Bandage", "Butterfly Needle", "IV Set", "DNS", "NS", "RL", "Metrogyl", "Micropore Tape", "Hydrogen Peroxide", "Spirit", "Savlon", "Sanitizer", "Garbage Bag", "Pet Wipes", "Feeding Tube"],
    default: "",
  },
  injectionSubType: {
    type: String,
    enum: ["", "1 ml", "2 ml", "3 ml", "5 ml"],
    default: "",
  },
  unitCostPrice: {
    type: Number,
    required: true
  },
  unitMinRetailPriceNGO: {
    type: Number,
    required: true
  },
  unitMaxRetailPriceCustomer: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
  },
  supplier: {
    name:    { type: String, default: "" },
    contact: { type: String, default: "" },
    email:   { type: String, default: "" },
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model("Inventory", inventorySchema);