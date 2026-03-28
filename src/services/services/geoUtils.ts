/**
 * Calculates the great-circle distance between two coordinates using the Haversine formula.
 * @param coord1 - First coordinate with lat and lng in decimal degrees
 * @param coord2 - Second coordinate with lat and lng in decimal degrees
 * @returns Distance in kilometers
 */
export function haversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates speed between two coordinate points over a given time interval.
 * @param coord1 - First coordinate with lat and lng
 * @param coord2 - Second coordinate with lat and lng
 * @param timeDeltaSeconds - Time elapsed between coordinates in seconds
 * @returns Speed in kilometers per hour (km/h)
 */
export function calculateSpeed(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
  timeDeltaSeconds: number
): number {
  if (timeDeltaSeconds === 0) return 0;

  const distance = haversineDistance(coord1, coord2);
  const hours = timeDeltaSeconds / 3600;

  return distance / hours;
}

/**
 * Calculates total elevation gain from an array of elevation values.
 * Only counts positive elevation changes (ascents).
 * @param elevations - Array of elevation values in meters
 * @returns Total elevation gain in meters
 */
export function calculateElevationDelta(elevations: number[]): number {
  if (elevations.length < 2) return 0;

  let totalGain = 0;

  for (let i = 1; i < elevations.length; i++) {
    const delta = elevations[i] - elevations[i - 1];
    if (delta > 0) {
      totalGain += delta;
    }
  }

  return totalGain;
}

/**
 * Converts degrees to radians.
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
