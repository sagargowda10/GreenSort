// backend/models/pickupModel.js
const mongoose = require('mongoose');

const pickupSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [String],
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending',
  },
  scheduledAt: Date,
  providerId: String, // ID of the partner handling the pickup
  address: String,
}, { timestamps: true });

const Pickup = mongoose.model('Pickup', pickupSchema);
module.exports = Pickup;