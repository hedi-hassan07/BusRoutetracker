import { INITIAL_OPTIMIZED_ROAD_ROUTE, INITIAL_UNOPTIMIZED_ROAD_ROUTE } from '../data/roadGeometryData';

export interface RouteResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

// In-memory cache for road network polylines
const routeCache = new Map<string, RouteResult>();

/**
 * Calculates compass heading bearing in degrees [0..360] between two points
 */
export function calculateHeading(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Build serialized coordinate string for caching
 */
function getRouteKey(waypoints: Array<{ lat: number; lng: number }>): string {
  return waypoints.map((w) => `${w.lat.toFixed(4)},${w.lng.toFixed(4)}`).join(';');
}

/**
 * Generates an urban street-grid approximation if offline (turns along street axes instead of laser straight line)
 */
export function generateRealisticRoadFallback(
  waypoints: Array<{ lat: number; lng: number }>
): [number, number][] {
  if (waypoints.length === 0) return [];
  if (waypoints.length === 1) return [[waypoints[0].lat, waypoints[0].lng]];

  const polyline: [number, number][] = [[waypoints[0].lat, waypoints[0].lng]];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];

    // Create 2 intermediate corner points to mimic city street turns
    const midLat = from.lat + (to.lat - from.lat) * 0.55;
    const midLng = from.lng + (to.lng - from.lng) * 0.45;

    // First leg to corner
    const steps1 = 6;
    for (let s = 1; s <= steps1; s++) {
      const t = s / steps1;
      polyline.push([from.lat + (midLat - from.lat) * t, from.lng + (midLng - from.lng) * t]);
    }

    // Second leg from corner to destination
    const steps2 = 6;
    for (let s = 1; s <= steps2; s++) {
      const t = s / steps2;
      polyline.push([midLat + (to.lat - midLat) * t, midLng + (to.lng - midLng) * t]);
    }
  }

  return polyline;
}

/**
 * Fetch turn-by-turn actual road geometry using the OpenStreetMap driving router (OSRM)
 */
export async function fetchRoadRoute(
  waypoints: Array<{ lat: number; lng: number }>
): Promise<RouteResult | null> {
  if (waypoints.length < 2) {
    return null;
  }

  const cacheKey = getRouteKey(waypoints);
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  // OSRM coordinates query format: {lng},{lat};{lng},{lat}...
  const coordsParam = waypoints.map((w) => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
      const coordinates: [number, number][] = primaryRoute.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      const result: RouteResult = {
        coordinates,
        distanceMeters: primaryRoute.distance,
        durationSeconds: primaryRoute.duration,
      };

      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('Real road routing request failed, falling back to cached street geometry:', error);
  }

  return null;
}

export { INITIAL_OPTIMIZED_ROAD_ROUTE, INITIAL_UNOPTIMIZED_ROAD_ROUTE };
