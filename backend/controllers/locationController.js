const axios = require('axios');
const Location = require('../models/locationModel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get locations (Live OSM + Waste Stations + Demo Fallback)
// @route   GET /api/locations?lat=...&lng=...
// @access  Public
const getLocations = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  if (!lat || !lng) {
    return res.status(400).json({ message: "Location required" });
  }

  console.log(`🌍 Scanning for Recycling & Waste Stations at: ${userLat}, ${userLng}...`);

  try {
    // 1. Live Query: Searching for ALL waste amenities (including collection)
    const radius = 15000; // 15km radius
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"="recycling"](around:${radius}, ${userLat}, ${userLng});
        node["amenity"="waste_disposal"](around:${radius}, ${userLat}, ${userLng}); // General Collection Sites
        node["amenity"="waste_basket"](around:${radius}, ${userLat}, ${userLng});    // Public Bins
        node["amenity"="waste_transfer_station"](around:${radius}, ${userLat}, ${userLng}); // Municipal Hubs
        node["recycling_type"](around:${radius}, ${userLat}, ${userLng});
      );
      out body 20;
      >;
      out skel qt;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    
    const response = await axios.get(url);
    const osmData = response.data.elements;

    if (osmData.length > 0) {
      console.log(`✅ Live API found ${osmData.length} locations.`);
      const mappedLocations = osmData.map(mapOsmItem);
      return res.status(200).json(mappedLocations);
    }

    // 2. FALLBACK: Generate DEMO data (which also includes a Municipal Waste Station pin)
    console.warn("⚠️ No live data found. Generating DEMO locations...");
    const demoData = generateDemoLocations(userLat, userLng);
    res.status(200).json(demoData);

  } catch (error) {
    console.error("❌ API Error:", error.message);
    const demoData = generateDemoLocations(userLat, userLng);
    res.status(200).json(demoData);
  }
});

// --- Helper Functions (Ensuring proper mapping of waste disposal) ---

function mapOsmItem(item) {
  const tags = item.tags || {};
  let name = tags.name || "Public Point";
  
  // Naming logic for General Waste
  if (tags.amenity === 'waste_disposal' || tags.amenity === 'waste_transfer_station') {
     name = tags.name || "Municipal Waste Station";
  } else if (tags.amenity === 'waste_basket') {
     name = "Public Waste Bin";
  } else if (!tags.name) {
     name = "Recycling Point";
  }

  // Material logic for General Waste
  const materials = [];
  if (tags.amenity === 'waste_disposal' || tags.amenity === 'waste_basket') {
    materials.push('General Waste');
    materials.push('Mixed Garbage');
  }
  if (tags.recycling_paper === 'yes') materials.push('Paper');
  // ... more materials
  if (materials.length === 0 && !materials.includes('General Waste')) materials.push('Recyclables');

  return {
    _id: `osm_${item.id}`,
    name: name,
    type: 'dropoff', // General category for all pins
    address: tags['addr:street'] || "Near your location",
    location: { type: 'Point', coordinates: [item.lon, item.lat] },
    hours: { "Open": tags.opening_hours || "24/7" },
    acceptedMaterials: materials,
    contact: { phone: tags.phone || "" }
  };
}

// --- Helper: Generate Mock Data (Includes Waste Station) ---
function generateDemoLocations(lat, lng) {
  // This helper is kept the same to provide a clean fallback set of data.
  // It includes both recycling, e-waste, and general waste station pins.
  return [
    {
      _id: "demo_1",
      name: "City Recycling Center (Demo)",
      type: "dropoff",
      address: "Main Market Road",
      location: { type: 'Point', coordinates: [lng + 0.01, lat + 0.01] },
      hours: { "Daily": "9am - 6pm" },
      acceptedMaterials: ["Plastic", "Paper", "Glass"],
      contact: { phone: "1800-RECYCLE" }
    },
    {
      _id: "demo_2",
      name: "Municipal Waste Station (Demo)", // <--- General Waste Pin
      type: "dropoff",
      address: "City Collection Point, Sector 4",
      location: { type: 'Point', coordinates: [lng - 0.008, lat + 0.008] }, 
      hours: { "Daily": "24 Hours" },
      acceptedMaterials: ["General Waste", "Mixed Garbage", "Household Trash"],
      contact: { phone: "City-Help" }
    },
    {
      _id: "demo_3",
      name: "Eco-Smart E-Waste Hub",
      type: "e-waste",
      address: "Tech Park Zone",
      location: { type: 'Point', coordinates: [lng - 0.01, lat - 0.005] },
      hours: { "Mon-Sat": "10am - 7pm" },
      acceptedMaterials: ["Electronics", "Batteries"],
      contact: { phone: "98765-43210" }
    },
    {
      _id: "demo_4",
      name: "Public Waste Bin", // <--- Simple Bin Pin
      type: "dropoff",
      address: "Bus Stand Corner",
      location: { type: 'Point', coordinates: [lng + 0.002, lat - 0.002] },
      hours: { "Open": "24/7" },
      acceptedMaterials: ["Small Trash", "Wrappers"],
      contact: { phone: "" }
    }
  ];
}


const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json(location);
});

module.exports = { getLocations, createLocation };