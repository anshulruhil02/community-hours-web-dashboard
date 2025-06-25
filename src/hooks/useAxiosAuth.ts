// src/hooks/useAxiosAuth.ts
import { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 
import { useAuth } from '@clerk/clerk-react'; 

const useAxiosAuth = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth(); 

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(async (config) => {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config; 
    });

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken, isLoaded, isSignedIn]);

  return axiosInstance; 
};

export default useAxiosAuth;