import { useState, useEffect, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface LocationState {
  location: Position | null;
  loading: boolean;
  error: string | null;
  countdown: number | null;
}

export const useLocationTracker = (updateIntervalSeconds: number = 40, countdownSeconds: number = 5) => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
    countdown: null,
  });
  
  const intervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const clearIntervals = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
  };

  const getCurrentPosition = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      setState(prev => ({
        ...prev,
        loading: false,
        location: position
      }));
      
      return position;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Error getting location: ${error instanceof Error ? error.message : String(error)}`
      }));
    }
  };

  const startCountdown = () => {
    setState(prev => ({ ...prev, countdown: countdownSeconds }));
    
    countdownIntervalRef.current = window.setInterval(() => {
      setState(prev => {
        const newCountdown = prev.countdown !== null ? prev.countdown - 1 : null;
        
        if (newCountdown === 0) {
          if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
          return { ...prev, countdown: null };
        }
        
        return { ...prev, countdown: newCountdown };
      });
    }, 1000);
  };

  const startTracking = () => {
    // Get initial position
    getCurrentPosition();
    
    // Set up recurring interval for location updates
    intervalRef.current = window.setInterval(() => {
      // Start countdown 5 seconds before updating location
      startCountdown();
      
      // Schedule the actual location update after the countdown
      setTimeout(() => {
        getCurrentPosition();
      }, countdownSeconds * 1000);
    }, updateIntervalSeconds * 1000);
  };

  const stopTracking = () => {
    clearIntervals();
  };

  // Request permissions
  const requestPermissions = async () => {
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      return permissionStatus;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Error requesting permissions: ${error instanceof Error ? error.message : String(error)}`
      }));
      return null;
    }
  };

  useEffect(() => {
    // Clean up on unmount
    return () => {
      clearIntervals();
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    requestPermissions,
    getCurrentPosition,
  };
};