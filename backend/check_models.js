const axios = require('axios');

// Your API Key
const API_KEY = "AIzaSyDLOTnR1kSvSQ8mk3E0G8kOSCUt7D8M03s"; 

async function listModels() {
  try {
    console.log("🔍 Checking available Gemini models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    const response = await axios.get(url);
    
    console.log("\n✅ SUCCESS! Here are the models you can use:\n");
    const models = response.data.models;
    
    // Filter for models that support 'generateContent'
    const validModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    validModels.forEach(model => {
      console.log(`Model Name: ${model.name.replace('models/', '')}`);
    });
    
  } catch (error) {
    console.error("\n❌ Error listing models:");
    if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(JSON.stringify(error.response.data, null, 2));
    } else {
        console.error(error.message);
    }
  }
}

listModels();