// backend/test-models.js
require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
  try {
    console.log("🔍 Checking available models for your API Key...");
    const response = await axios.get(URL);
    
    console.log("\n✅ AVAILABLE MODELS:");
    const models = response.data.models;
    
    // Filter for models that support 'generateContent'
    const visionModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    visionModels.forEach(m => {
      console.log(`--------------------------------`);
      console.log(`Name: ${m.name}`); // This is exactly what you need to copy!
      console.log(`Display Name: ${m.displayName}`);
    });

  } catch (error) {
    console.error("❌ Error fetching models:", error.response ? error.response.data : error.message);
  }
}

listModels();