import axios from 'axios';
import { API_CONFIG } from './config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Detect emotion from audio
 * @param {Blob} audioBlob - Audio file blob
 * @returns {Promise} - { emotion, confidence }
 */
export async function detectEmotion(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');

  const response = await apiClient.post('/emotion', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Get chat response with text and emotion
 * @param {string} text - User text
 * @param {string} emotion - Detected emotion
 * @returns {Promise} - { reply_text, audio_url }
 */
export async function chatWithText(text, emotion) {
  const response = await apiClient.post('/chat-text', {
    text,
    emotion,
  });

  return response.data;
}

/**
 * Get chat response with audio
 * @param {Blob} audioBlob - Audio file blob
 * @returns {Promise} - { user_text, reply_text, audio_url, emotion }
 */
export async function chatWithAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');

  const response = await apiClient.post('/chat', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export default apiClient;
