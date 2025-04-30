const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertType: {
    type: String,
    enum: ['inventoryStock', 'vaccinationDue'],
    required: true,
  },
  itemName: {
    type: String, // Relevant only for inventory alerts
  },
  stockUnit: {
    type: Number, // Relevant only for inventory alerts
  },
  threshold: {
    type: Number, // Relevant only for inventory alerts
    default: 100,
  },
  petInfo: {
    type: mongoose.Schema.Types.ObjectId, // Relevant only for vaccination alerts
    ref: 'Pet',
  },
  alertDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
