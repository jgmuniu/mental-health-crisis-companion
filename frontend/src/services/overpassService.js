const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export async function queryMentalHealthFacilities(lat, lon, radius = 10000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"]["healthcare:speciality"~"psychiatry|mental_health",i](around:${radius},${lat},${lon});
      node["amenity"="clinic"]["healthcare:speciality"~"psychiatry|mental_health",i](around:${radius},${lat},${lon});
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      way["healthcare"="hospital"](around:${radius},${lat},${lon});
    );
    out center 15;
  `;

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying Overpass API:', error);
    throw error;
  }
}

export function parseFacilityElements(elements, userLat, userLon) {
  return elements
    .map(element => {
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      
      if (!lat || !lon) return null;

      return {
        id: element.id,
        name: element.tags?.name || element.tags?.['name:en'] || 'Mental Health Facility',
        type: element.tags?.amenity || element.tags?.healthcare || 'healthcare',
        address: [
          element.tags?.['addr:housenumber'],
          element.tags?.['addr:street'],
          element.tags?.['addr:city'],
          element.tags?.['addr:state']
        ].filter(Boolean).join(', '),
        phone: element.tags?.phone || element.tags?.['contact:phone'],
        website: element.tags?.website || element.tags?.['contact:website'],
        lat,
        lon,
        emergency: element.tags?.emergency === 'yes',
        wheelchair: element.tags?.wheelchair === 'yes',
        openingHours: element.tags?.opening_hours
      };
    })
    .filter(f => f !== null);
}