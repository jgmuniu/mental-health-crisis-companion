import { useState, useCallback } from 'react';
import { calculateDistance } from '../utils/distance';

export function useFacilitySearch() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchNearbyFacilities = useCallback(async (lat, lon, radius = 10000) => {
    setIsLoading(true);
    setError(null);

    try {
      // Overpass API query for mental health facilities
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"]["healthcare:speciality"~"psychiatry|mental_health",i](around:${radius},${lat},${lon});
          node["amenity"="clinic"]["healthcare:speciality"~"psychiatry|mental_health",i](around:${radius},${lat},${lon});
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          node["healthcare"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          way["healthcare"="hospital"](around:${radius},${lat},${lon});
        );
        out center 15;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      const data = await response.json();
      
      const parsedFacilities = (data.elements || [])
        .map(element => {
          const elementLat = element.lat || element.center?.lat;
          const elementLon = element.lon || element.center?.lon;
          
          if (!elementLat || !elementLon) return null;

          return {
            id: element.id,
            name: element.tags?.name || element.tags?.['name:en'] || 'Mental Health Facility',
            type: element.tags?.amenity || element.tags?.healthcare || 'healthcare',
            address: [
              element.tags?.['addr:housenumber'],
              element.tags?.['addr:street'],
              element.tags?.['addr:city'],
              element.tags?.['addr:state']
            ].filter(Boolean).join(', ') || 'Address not available',
            phone: element.tags?.phone || element.tags?.['contact:phone'] || null,
            website: element.tags?.website || element.tags?.['contact:website'] || null,
            lat: elementLat,
            lon: elementLon,
            distance: calculateDistance(lat, lon, elementLat, elementLon),
            emergency: element.tags?.emergency === 'yes',
            specialties: element.tags?.['healthcare:speciality'] || null
          };
        })
        .filter(f => f !== null)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // Limit to 10 closest facilities

      setFacilities(parsedFacilities);
      setIsLoading(false);
      return parsedFacilities;
    } catch (err) {
      setError(err.message || 'Failed to search for facilities');
      setIsLoading(false);
      return [];
    }
  }, []);

  return {
    facilities,
    isLoading,
    error,
    searchNearbyFacilities
  };
}