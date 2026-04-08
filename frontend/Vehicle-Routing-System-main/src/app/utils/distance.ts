import { Location } from '../types';

/**
 * Calculate Euclidean distance between two points (straight-line distance)
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate total distance for a route including return to warehouse
 */
export function calculateRouteDistance(
  warehouse: Location,
  stops: Location[]
): number {
  if (stops.length === 0) return 0;

  let total = 0;
  
  // Distance from warehouse to first stop
  total += calculateDistance(warehouse, stops[0]);
  
  // Distance between consecutive stops
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateDistance(stops[i], stops[i + 1]);
  }
  
  // Distance from last stop back to warehouse
  total += calculateDistance(stops[stops.length - 1], warehouse);
  
  return total;
}
