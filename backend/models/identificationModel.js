// backend/models/identificationModel.js
const mongoose = require('mongoose');

const identificationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null, 
  },
  imageUrl: { type: String, required: true }, 
  label: { type: String, required: true }, 
  category: { type: String, required: true }, 
  confidence: Number,
  disposalAction: String, 
  handlingTips: String,

  // 🟢 ADD THESE TWO NEW FIELDS
  estimatedValue: { type: String, default: "₹0" },
  estimatedWeight: { type: String, default: "Unknown" },

  feedback: {
    type: String,
    enum: ['correct', 'incorrect', 'pending'],
    default: 'pending',
  },
}, { timestamps: true });

const Identification = mongoose.model('Identification', identificationSchema);
module.exports = Identification;