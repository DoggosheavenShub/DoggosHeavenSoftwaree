const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema({
  inventoryId:   { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
  itemName:      { type: String, required: true },
  actionType:    { type: String, enum: ["Added", "Used", "Adjusted"], required: true },
  quantity:      { type: Number, required: true },
  previousStock: { type: Number, required: true },
  currentStock:  { type: Number, required: true },
  staff:         { type: String, required: true },
  notes:         { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("StockHistory", stockHistorySchema);
