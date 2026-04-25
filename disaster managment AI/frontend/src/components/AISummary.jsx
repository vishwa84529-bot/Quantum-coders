import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, RefreshCw } from 'lucide-react';

function buildLocalSummary(riskData, alerts = []) {
  if (!riskData) {
    return "Waiting for live flood telemetry before preparing an operational summary.";
  }

  const riskLevel = riskData.risk_level || "LOW";
  const rainfall = riskData.rainfall ?? riskData.factors?.rainfall ?? "--";
  const waterLevel = riskData.water_level ?? riskData.factors?.water_level ?? "--";
  const latestAlert = alerts[0]?.message;

  return `Current flood risk is ${riskLevel}, with rainfall at ${rainfall} mm and water level at ${waterLevel} m. ${
    latestAlert || "No urgent alerts are active, but responders should continue monitoring rainfall and low-lying routes."
  }`;
}

function AISummary({ riskData, alerts }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setSummary(buildLocalSummary(riskData, alerts));
      setError("AI provider unavailable. Showing local operational summary.");
      return;
    }
    
    if (!riskData) return;

    setLoading(true);
    setError("");
    
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `As an AI Disaster Management Assistant, provide a 2-3 sentence summary of the current flood risk situation based on this data:
      Risk Level: ${riskData.risk_level}
      Rainfall: ${riskData.rainfall}mm
      Water Level: ${riskData.water_level}m
      Recent Alerts: ${alerts.length > 0 ? alerts.slice(0, 2).map(a => a.message).join(', ') : 'None'}
      Keep it professional, concise, and focused on actionable insights for emergency responders. Do not use markdown, just plain text.`;
      
      const result = await model.generateContent(prompt);
      setSummary(result.response.text());
    } catch (err) {
      console.error("AI Summary Error:", err);
      setSummary(buildLocalSummary(riskData, alerts));
      setError("AI provider unavailable. Showing local operational summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-fetch when risk level changes significantly or on first load with data
    if (riskData && !summary && !loading) {
      fetchSummary();
    }
  }, [riskData?.risk_level]);

  return (
    <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">AI Situation Summary</h3>
        </div>
        <button 
          onClick={fetchSummary}
          disabled={loading || !riskData}
          className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
          aria-label="Refresh summary"
        >
          <RefreshCw size={16} className={`text-indigo-600 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : loading && !summary ? (
        <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
          Analyzing current telemetry...
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-indigo-950 dark:text-indigo-200">
          {summary || "Waiting for data to generate summary..."}
        </p>
      )}
    </div>
  );
}

export default AISummary;
