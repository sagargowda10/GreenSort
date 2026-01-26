// backend/models/municipalRuleModel.js
const mongoose = require('mongoose');

const municipalRuleSchema = mongoose.Schema({
  city: { type: String, required: true },
  state: { type: String, required: true },
  rules: {
    accepts: [String],
    exceptions: [String],
    notes: String,
  },
  sourceUrl: String,
}, { timestamps: true });

// Create a compound index for faster searching by city/state
municipalRuleSchema.index({ city: 1, state: 1 });

const MunicipalRule = mongoose.model('MunicipalRule', municipalRuleSchema);
module.exports = MunicipalRule;