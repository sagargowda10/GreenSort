const fs = require('fs');
const axios = require('axios');
const Identification = require('../models/identificationModel');
const asyncHandler = require('../middleware/asyncHandler');

// --- CONFIGURATION ---
// 🔴 SECURITY FIX: Load from .env (Do not hardcode keys!)
const API_KEY = process.env.GEMINI_API_KEY; 

// 👇 ADD THIS LINE TO DEBUG
console.log("DEBUG: My API Key is:", API_KEY ? "Loaded Successfully" : "UNDEFINED (Missing)");

// ✅ FIX: Use 'gemini-flash-latest' as verified in your list
const MODEL_NAME = "gemini-flash-latest";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const identifyWaste = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }

  console.log(`--- STARTING GEMINI IDENTIFICATION (${MODEL_NAME}) ---`);

  try {
    // 1. Convert image to Base64
    const base64Image = fs.readFileSync(req.file.path).toString('base64');
    const mimeType = req.file.mimetype;

    // 2. Construct the Payload
    const payload = {
      contents: [
        {
          parts: [
            {
              // 🟢 UPDATED PROMPT: Added requests for Weight and Value (₹)
              text: `Analyze this waste item image.
                     Return a raw JSON object (no markdown) with this structure:
                     {
                       "label": "Short name (e.g., Plastic Bottle)",
                       "category": "One of: Recyclable, Compost, Trash, E-waste, Hazardous",
                       "disposalAction": "Specific instruction",
                       "handlingTips": "Safety tip",
                       "confidence": 0.95,
                       "description": "Short description of the item",
                       "estimatedWeight": "Estimate weight in kg (e.g., '0.05 kg')",
                       "estimatedValue": "Estimate scrap value in Indian Rupees (₹). If trash, put '₹0'. If recyclable/metal, estimate range (e.g., '₹5 - ₹10')"
                     }`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: "application/json"
      }
    };

    // 3. Send Request via Axios
    console.log("Sending request to Google via Axios...");
    const response = await axios.post(API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 4. Parse Response
    // Safety check: Ensure candidates exist
    if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error("AI returned no results. The image might be unclear/unsafe.");
    }

    const aiText = response.data.candidates[0].content.parts[0].text;
    console.log("✅ RAW SUCCESS:", aiText);

    const aiData = JSON.parse(aiText);

    // 5. Save to Database
    // Normalize path slashes for Windows/Mac compatibility
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const identification = await Identification.create({
      userId: req.user._id,
      imageUrl: imageUrl,
      label: aiData.label,
      category: aiData.category,
      confidence: aiData.confidence || 0.9,
      disposalAction: aiData.disposalAction,
      handlingTips: aiData.handlingTips,
      
      // 🟢 SAVE NEW ESTIMATES
      // (Ensure your identificationModel.js has these fields added!)
      estimatedValue: aiData.estimatedValue || "₹0",
      estimatedWeight: aiData.estimatedWeight || "Unknown",
      
      feedback: 'pending'
    });

    res.status(201).json({
        ...identification.toObject(),
        description: aiData.description
    });

  } catch (error) {
    console.error("❌ GEMINI API ERROR:");
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      
      // ✅ Handle Rate Limits (429) specifically
      if (error.response.status === 429) {
         res.status(429);
         throw new Error('Too many requests! The AI is busy. Please wait 1 minute.');
      }

      // Handle Model Not Found (404)
      if (error.response.status === 404) {
         res.status(404);
         throw new Error(`Model '${MODEL_NAME}' not found or not available in your region.`);
      }

      res.status(error.response.status);
      throw new Error(`Google API Error: ${error.response.data.error.message}`);
    } else {
      console.error("Message:", error.message);
      res.status(500);
      throw new Error('Network Error: Could not reach Google servers.');
    }
  }
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await Identification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(history);
});

module.exports = { identifyWaste, getHistory };