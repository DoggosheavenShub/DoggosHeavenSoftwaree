const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertType: {
    type: String,
    enum: ['inventoryStock', 'vaccinationDue', 'serviceAction', 'newBooking', 'newPet'],
    required: true,
  },
  itemName: {
    type: String,
  },
  stockUnit: {
    type: Number,
  },
  threshold: {
    type: Number,
    default: 100,
  },
  petInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
  },
  // service action fields
  action: {
    type: String,
    enum: ['added', 'updated', 'deleted'],
  },
  serviceName: {
    type: String,
  },
  performedBy: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  alertDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
