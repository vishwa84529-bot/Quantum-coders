import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

export async function getPrediction(lat, lon) {
  const response = await api.get("/predict", {
    params: { lat, lon },
  });
  console.log("[api] /predict response", response.data);
  return response.data;
}

export async function saveAlert(alert) {
  const response = await api.post("/alerts/", alert);
  return response.data;
}

export async function getAlerts() {
  const response = await api.get("/alerts");
  return response.data;
}

export async function getInsights() {
  const response = await api.get("/insights");
  return response.data;
}

export async function getMultiPredictions() {
  const response = await api.get("/predict/multi");
  return response.data;
}

export async function runSimulation(payload) {
  const response = await api.post("/simulate", payload);
  return response.data;
}
