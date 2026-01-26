// backend/models/locationModel.js
const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['dropoff', 'buyback', 'repair', 'composting', 'e-waste'],
  },
  address: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  hours: { type: Map, of: String }, // e.g., { "Monday": "9am-5pm" }
  acceptedMaterials: [String],
  contact: {
    phone: String,
    website: String,
  },
}, { timestamps: true });

// Create the 2dsphere index for geospatial queries
locationSchema.index({ location: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;