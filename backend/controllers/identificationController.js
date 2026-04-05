const fs = require('fs');
const axios = require('axios');
const Identification = require('../models/identificationModel');
const asyncHandler = require('../middleware/asyncHandler');

// --- CONFIGURATION ---
const API_KEY = process.env.GEMINI_API_KEY;

// Debug log
console.log("DEBUG: My API Key is:", API_KEY ? "Loaded Successfully" : "UNDEFINED (Missing)");

const MODEL_NAME = "gemini-flash-latest";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;


// @desc    Identify waste using AI
// @route   POST /api/identify
const identifyWaste = asyncHandler(async (req, res) => {

  // ✅ Check file
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }

  // ✅ Check API key
  if (!API_KEY) {
    res.status(500);
    throw new Error('GEMINI API KEY missing in environment variables');
  }

  console.log(`--- STARTING GEMINI IDENTIFICATION (${MODEL_NAME}) ---`);

  try {
    // 1. Convert image to Base64
    const base64Image = fs.readFileSync(req.file.path).toString('base64');
    const mimeType = req.file.mimetype;

    // 2. Payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this waste item image.
Return ONLY raw JSON:
{
  "label": "Short name",
  "category": "Recyclable | Compost | Trash | E-waste | Hazardous",
  "disposalAction": "Instruction",
  "handlingTips": "Tip",
  "confidence": 0.95,
  "description": "Short description",
  "estimatedWeight": "e.g., 0.05 kg",
  "estimatedValue": "₹0 or ₹5 - ₹10"
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

    // 3. API call
    const response = await axios.post(API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 4. Validate response
    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error("AI returned no result");
    }

    const aiText = response.data.candidates[0].content.parts[0].text;
    console.log("✅ AI RESPONSE:", aiText);

    const aiData = JSON.parse(aiText);

    // ✅ Check user
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // 5. Save to DB
    const imageUrl = `/uploads/${req.file.filename}`;

    const identification = await Identification.create({
      userId: req.user._id,
      imageUrl: imageUrl,
      label: aiData.label,
      category: aiData.category,
      confidence: aiData.confidence || 0.9,
      disposalAction: aiData.disposalAction,
      handlingTips: aiData.handlingTips,
      estimatedValue: aiData.estimatedValue || "₹0",
      estimatedWeight: aiData.estimatedWeight || "Unknown",
      feedback: 'pending'
    });

    // ✅ Delete uploaded file (VERY IMPORTANT)
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      ...identification.toObject(),
      description: aiData.description
    });

  } catch (error) {

    console.error("❌ GEMINI ERROR:", error.message);

    // Cleanup file on error too
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.response) {
      if (error.response.status === 429) {
        res.status(429);
        throw new Error('Too many requests. Try again later.');
      }

      if (error.response.status === 404) {
        res.status(404);
        throw new Error('Model not found.');
      }

      res.status(error.response.status);
      throw new Error(error.response.data?.error?.message || "API error");
    }

    res.status(500);
    throw new Error(error.message || "Server error");
  }
});


// @desc    Get history
// @route   GET /api/identify/history
const getHistory = asyncHandler(async (req, res) => {

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const history = await Identification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json(history);
});

module.exports = { identifyWaste, getHistory };