import { useState, useEffect } from 'react';

export function useGeolocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const getLocation = () => {
    if (!isSupported) {
      setError('Geolocation is not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setIsLoading(false);
      },
      (err) => {
        setError({
          code: err.code,
          message: err.message
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    error,
    isLoading,
    isSupported,
    getLocation
  };
}