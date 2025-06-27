// src/hooks/useAxiosAuth.ts
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setupGlobalAuthInterceptor, cleanupGlobalAuthInterceptor } from '../api/axiosInstance';

export const useGlobalAuth = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isInterceptorReady, setIsInterceptorReady] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoaded && isSignedIn) {
      // Wait a bit to ensure Clerk is fully initialized
      timeoutId = setTimeout(() => {
        try {
          console.log("Setting up global auth with Clerk at", new Date().toISOString());
          setupGlobalAuthInterceptor(getToken);
          setIsInterceptorReady(true);
        } catch (error) {
          console.error("Error setting up global auth:", error);
        }
      }, 300); // Small delay to ensure Clerk is fully ready
    } else if (isLoaded && !isSignedIn) {
      // Clean up interceptor when user is not signed in
      console.log("User not signed in, cleaning up interceptor");
      cleanupGlobalAuthInterceptor();
      setIsInterceptorReady(false);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (!isSignedIn) {
        cleanupGlobalAuthInterceptor();
        setIsInterceptorReady(false);
      }
    };
  }, [getToken, isLoaded, isSignedIn]);

  // Return auth state - only consider loaded when both Clerk and interceptor are ready
  return { 
    isLoaded: isLoaded && (!isSignedIn || isInterceptorReady), 
    isSignedIn 
  };
};