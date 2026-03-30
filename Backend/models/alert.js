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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  forRole: {
    type: String,
    enum: ['admin', 'staff', 'both'],
    default: 'admin',
  },
  alertDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
