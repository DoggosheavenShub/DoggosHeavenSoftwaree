const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  recommendedDoses: {
    type: Number,
  },
  stockUnit: {
    type: Number,
    required: true,
  },
  itemType: {
    type: String,
    enum: ["disposable", "syringe","medicine"],
    required: true,
  },
  volumeML: {
    type: Number,
  },
  totalVolume: {
    type: Number,
  },
  unitCostPrice: {
    type: Number,
    required:true
  },
  unitMinRetailPriceNGO: {
    type: Number,
    required:true
  },
  unitMaxRetailPriceCustomer: {
    type: Number,
    required:true
  },
});

module.exports = mongoose.model("Inventory", inventorySchema);
