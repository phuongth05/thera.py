import axios from "axios";
import { API_CONFIG } from "./config";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function chatWithText(text, audioBlob) {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("file", audioBlob, "audio.wav");

  const response = await apiClient.post("/chat", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export default apiClient;
