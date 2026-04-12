// Core types for VRP system

export interface Location {
  x: number;
  y: number;
  id: string;
  label?: string;
}

export interface DeliveryItem {
  id: string;
  location: Location;
  earliestTime?: number;
  latestTime?: number;
  serviceTime?: number;
  delivered?: boolean;
}

export interface Vehicle {
  id: string;
  capacity: number;
  maxDistance: number;
  color: string;
}

export interface Route {
  vehicleId: string;
  stops: DeliveryItem[];
  totalDistance: number;
  itemsDelivered: number;
}

export interface VRPSolution {
  routes: Route[];
  totalItemsDelivered: number;
  totalDistance: number;
  undeliveredItems: DeliveryItem[];
}

export interface VRPConfig {
  warehouse: Location;
  deliveryItems: DeliveryItem[];
  vehicles: Vehicle[];
  populationSize: number;
  generations: number;
  mutationRate: number;
  eliteSize: number;
}

// Agent communication messages
export interface AgentMessage {
  type: 'REGISTER_CAPACITY' | 'ROUTE_ASSIGNMENT' | 'ROUTE_ACK';
  from: string;
  to: string;
  timestamp: number;
  payload: any;
}

export interface CapacityConstraint {
  vehicleId: string;
  capacity: number;
  maxDistance: number;
}

export interface RouteAssignment {
  vehicleId: string;
  route: DeliveryItem[];
  totalDistance: number;
}
