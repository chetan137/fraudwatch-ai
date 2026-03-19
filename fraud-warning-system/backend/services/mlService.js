const axios = require("axios");

// Flask ML service exposes POST /analyze (not /predict). Trim trailing slashes
// so we don't build URLs like https://host.onrender.com//analyze.
const ML_BASE_URL = (process.env.ML_SERVICE_URL || "http://localhost:5001").replace(
  /\/+$/,
  "",
);

const analyzeActivity = async (activity) => {
  try {
    const response = await axios.post(`${ML_BASE_URL}/analyze`, activity, {
      // Render free tier can cold-start; allow time for the ML service to wake up
      timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS || 15000),
    });
    const data = response.data || {};
    if (
      typeof data.riskScore !== "number" ||
      typeof data.isAnomaly !== "boolean" ||
      !Array.isArray(data.reasons) ||
      typeof data.anomalyScore !== "number"
    ) {
      throw new Error("ML service returned invalid response payload");
    }
    return data;
  } catch (error) {
    throw new Error(`ML analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeActivity };
