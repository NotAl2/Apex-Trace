import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useRideStore } from '../store/rideStore';

interface UseGPSTrackingReturn {
  start: () => void;
  stop: () => void;
  isTracking: boolean;
}

export const useGPSTracking = (): UseGPSTrackingReturn => {
  const [isTracking, setIsTracking] = useState(false);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const updateLocation = useRideStore((state) => state.updateLocation);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Foreground location permission denied');
      }
    };
    requestPermission();
  }, []);

  const start = () => {
    if (isTracking) return;

    setIsTracking(true);

    const startWatcher = async () => {
      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
          },
          (location) => {
            const { latitude, longitude, timestamp } = location.coords;
            updateLocation({
              lat: latitude,
              lng: longitude,
              timestamp: timestamp || Date.now(),
            });
          }
        );
        watcherRef.current = subscription;
      } catch (error) {
        console.warn('Error starting GPS tracking:', error);
        setIsTracking(false);
      }
    };

    startWatcher();
  };

  const stop = () => {
    if (watcherRef.current) {
      watcherRef.current.remove();
      watcherRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
    };
  }, []);

  return {
    start,
    stop,
    isTracking,
  };
};
