// src/api/axiosInstance.ts
import axios from 'axios';

// Ensure this matches your backend API's base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;