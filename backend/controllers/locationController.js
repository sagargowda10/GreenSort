const axios = require('axios');
const Location = require('../models/locationModel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get locations (Live + Fallback)
// @route   GET /api/locations
const getLocations = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  // ✅ Validate input
  if (!lat || !lng) {
    return res.status(400).json({ message: "Location required" });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  console.log(`🌍 Searching locations at: ${userLat}, ${userLng}`);

  try {
    const radius = 15000;

    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"="recycling"](around:${radius}, ${userLat}, ${userLng});
        node["amenity"="waste_disposal"](around:${radius}, ${userLat}, ${userLng});
        node["amenity"="waste_basket"](around:${radius}, ${userLat}, ${userLng});
        node["amenity"="waste_transfer_station"](around:${radius}, ${userLat}, ${userLng});
        node["recycling_type"](around:${radius}, ${userLat}, ${userLng});
      );
      out body 20;
      >;
      out skel qt;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    const response = await axios.get(url, {
      timeout: 10000 // ✅ prevent hanging
    });

    const osmData = response.data?.elements || [];

    // ✅ If data found
    if (osmData.length > 0) {
      console.log(`✅ Found ${osmData.length} locations`);
      const mapped = osmData.map(mapOsmItem);
      return res.status(200).json(mapped);
    }

    // ✅ Fallback
    console.warn("⚠️ No data found → using demo");
    return res.status(200).json(generateDemoLocations(userLat, userLng));

  } catch (error) {
    console.error("❌ OSM API Error:", error.message);

    // ✅ Always return fallback instead of crash
    return res.status(200).json(generateDemoLocations(userLat, userLng));
  }
});


// --- Helper: Map OSM data ---
function mapOsmItem(item) {
  const tags = item.tags || {};
  let name = tags.name || "Public Point";

  if (tags.amenity === 'waste_disposal' || tags.amenity === 'waste_transfer_station') {
    name = tags.name || "Municipal Waste Station";
  } else if (tags.amenity === 'waste_basket') {
    name = "Public Waste Bin";
  } else if (!tags.name) {
    name = "Recycling Point";
  }

  const materials = [];

  if (tags.amenity === 'waste_disposal' || tags.amenity === 'waste_basket') {
    materials.push('General Waste', 'Mixed Garbage');
  }

  if (tags.recycling_paper === 'yes') materials.push('Paper');

  if (materials.length === 0) materials.push('Recyclables');

  return {
    _id: `osm_${item.id}`,
    name,
    type: 'dropoff',
    address: tags['addr:street'] || "Near your location",
    location: {
      type: 'Point',
      coordinates: [item.lon, item.lat]
    },
    hours: {
      Open: tags.opening_hours || "24/7"
    },
    acceptedMaterials: materials,
    contact: {
      phone: tags.phone || ""
    }
  };
}


// --- Demo fallback ---
function generateDemoLocations(lat, lng) {
  return [
    {
      _id: "demo_1",
      name: "City Recycling Center",
      type: "dropoff",
      address: "Main Market Road",
      location: { type: 'Point', coordinates: [lng + 0.01, lat + 0.01] },
      hours: { Daily: "9am - 6pm" },
      acceptedMaterials: ["Plastic", "Paper", "Glass"],
      contact: { phone: "1800-RECYCLE" }
    },
    {
      _id: "demo_2",
      name: "Municipal Waste Station",
      type: "dropoff",
      address: "Sector 4",
      location: { type: 'Point', coordinates: [lng - 0.008, lat + 0.008] },
      hours: { Daily: "24 Hours" },
      acceptedMaterials: ["General Waste", "Mixed Garbage"],
      contact: { phone: "City-Help" }
    },
    {
      _id: "demo_3",
      name: "E-Waste Hub",
      type: "e-waste",
      address: "Tech Park",
      location: { type: 'Point', coordinates: [lng - 0.01, lat - 0.005] },
      hours: { "Mon-Sat": "10am - 7pm" },
      acceptedMaterials: ["Electronics", "Batteries"],
      contact: { phone: "98765-43210" }
    },
    {
      _id: "demo_4",
      name: "Public Waste Bin",
      type: "dropoff",
      address: "Bus Stand",
      location: { type: 'Point', coordinates: [lng + 0.002, lat - 0.002] },
      hours: { Open: "24/7" },
      acceptedMaterials: ["Trash"],
      contact: { phone: "" }
    }
  ];
}


// --- Create location ---
const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json(location);
});

module.exports = { getLocations, createLocation };