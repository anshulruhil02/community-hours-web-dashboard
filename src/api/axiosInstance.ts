import axios from 'axios';

// Ensure this matches your backend API's base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor state
let authInterceptorId: number | null = null;
let currentGetToken: (() => Promise<string | null>) | null = null;
let isClerkReady = false;

export const setupGlobalAuthInterceptor = (getToken: () => Promise<string | null>) => {
  currentGetToken = getToken;
  isClerkReady = true; // Mark Clerk as ready when this is called
  
  if (authInterceptorId === null) {
    console.log("Setting up GLOBAL Axios interceptor at", new Date().toISOString());
    
    authInterceptorId = axiosInstance.interceptors.request.use(
      async (config) => {
        console.log("Global interceptor triggered for URL:", config.url, "at", new Date().toISOString());
        
        if (!isClerkReady || !currentGetToken) {
          console.warn("Clerk not ready yet, proceeding without token for:", config.url);
          return config;
        }
        
        try {
          // Wait for token with timeout
          const tokenPromise = currentGetToken();
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Token fetch timeout')), 3000)
          );
          
          const token = await Promise.race([tokenPromise, timeoutPromise]);
          
          console.log("Global interceptor extracted token for", config.url, ":", token ? "TOKEN_PRESENT" : "NO_TOKEN", "at", new Date().toISOString());
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Global Authorization header set for", config.url, "at", new Date().toISOString());
          } else {
            console.warn("Global interceptor: No token returned for", config.url, "at", new Date().toISOString());
          }
        } catch (error) {
          console.error("Global interceptor: Error getting token for", config.url, ":", error, "at", new Date().toISOString());
          // Don't fail the request, just proceed without token
        }
        
        return config;
      },
      (error) => {
        console.error("Global interceptor error for", error.config?.url, ":", error, "at", new Date().toISOString());
        return Promise.reject(error);
      }
    );
    
    console.log("Global interceptor ID:", authInterceptorId, "registered at", new Date().toISOString());
  } else {
    console.log("Global interceptor already exists, updating getToken function at", new Date().toISOString());
  }
};

// Cleanup function
export const cleanupGlobalAuthInterceptor = () => {
  if (authInterceptorId !== null) {
    console.log("Cleaning up global interceptor ID:", authInterceptorId, "at", new Date().toISOString());
    axiosInstance.interceptors.request.eject(authInterceptorId);
    authInterceptorId = null;
    currentGetToken = null;
    isClerkReady = false;
  }
};

export default axiosInstance;