# Vehicle Routing Problem (VRP) Solver

A comprehensive multi-agent system for solving the Vehicle Routing Problem using Genetic Algorithm optimization. This application demonstrates the coordination between a Master Routing Agent (MRA) and multiple Delivery Agents (DAs) to find optimal delivery routes.

## Overview

The Vehicle Routing Problem (VRP) is a well-known combinatorial optimization problem in operations research. This implementation focuses on:

- **Basic Requirement 1**: Vehicle capacity constraints with prioritization on maximizing items delivered
- **Basic Requirement 2**: Maximum distance constraints per vehicle
- **Multi-Agent System**: MRA coordinates with DAs using a defined communication protocol
- **Genetic Algorithm**: Custom implementation for route optimization

## Features

### Core Functionality

- **Master Routing Agent (MRA)**
  - Collects capacity constraints from delivery agents
  - Receives list of parcels to be delivered
  - Runs Genetic Algorithm to produce optimal routes
  - Distributes individual routes to delivery agents

- **Delivery Agents (DAs)**
  - Report capacity and maximum distance constraints
  - Receive individual delivery schedules
  - Acknowledge route assignments

### User Interface

- **Setup Page**: Configure warehouse location, delivery items, vehicles, and GA parameters
- **Visualization Page**: Real-time route visualization with agent communication tracking
- **Interactive Map**: Canvas-based visualization showing warehouse, items, and routes
- **Agent Communication Log**: Track all messages between MRA and DAs

### Input Options

- Auto-generate random delivery locations
- Load configuration from JSON file
- Export configuration to JSON file
- Quick-start example scenarios

## Algorithm Details

### Genetic Algorithm

**Chromosome Representation**: Array where genes[i] represents the vehicle index assigned to item i, or -1 if undelivered

**Fitness Function**: 
```
fitness = itemsDelivered × 10000 - totalDistance
```
This prioritizes maximizing items delivered first, then minimizes total distance.

**Genetic Operators**:
- Selection: Tournament selection (size 5)
- Crossover: Single-point crossover
- Mutation: Random vehicle reassignment or delivery toggle
- Elitism: Top chromosomes preserved across generations

**Constraints**:
- Vehicle capacity: stops.length ≤ vehicle.capacity
- Maximum distance: routeDistance ≤ vehicle.maxDistance

### Distance Calculation

Euclidean (straight-line) distance:
```
distance = √((x₂-x₁)² + (y₂-y₁)²)
```

## Agent Communication Protocol

### Message Flow (Sequence Diagram)

```
Phase 1: Capacity Request
MRA → DA-1: CAPACITY_REQUEST
MRA → DA-2: CAPACITY_REQUEST
MRA → DA-n: CAPACITY_REQUEST

Phase 2: Capacity Response
DA-1 → MRA: CAPACITY_RESPONSE (capacity, maxDistance)
DA-2 → MRA: CAPACITY_RESPONSE (capacity, maxDistance)
DA-n → MRA: CAPACITY_RESPONSE (capacity, maxDistance)

Phase 3: Optimization
MRA: Collect all constraints
MRA: Run Genetic Algorithm
MRA: Generate optimal routes

Phase 4: Route Assignment
MRA → DA-1: ROUTE_ASSIGNMENT (route, distance)
MRA → DA-2: ROUTE_ASSIGNMENT (route, distance)
MRA → DA-n: ROUTE_ASSIGNMENT (route, distance)

Phase 5: Acknowledgment
DA-1 → MRA: ACK (items received)
DA-2 → MRA: ACK (items received)
DA-n → MRA: ACK (items received)
```

### Message Types

- **CAPACITY_REQUEST**: MRA requests constraints from DA
- **CAPACITY_RESPONSE**: DA responds with capacity and maxDistance
- **ROUTE_ASSIGNMENT**: MRA assigns route to DA
- **ACK**: DA acknowledges route receipt

## System Architecture

### Components

- `/src/app/agents/MasterRoutingAgent.ts`: MRA implementation
- `/src/app/agents/DeliveryAgent.ts`: DA implementation
- `/src/app/algorithms/genetic-vrp.ts`: Genetic Algorithm solver
- `/src/app/utils/distance.ts`: Distance calculation utilities
- `/src/app/types.ts`: TypeScript type definitions

### Pages

- **HomePage**: Introduction and system overview
- **SetupPage**: Problem configuration interface
- **VisualizationPage**: Route visualization and results

## Usage

### Quick Start

1. Click "Setup Problem" on the home page
2. Choose a quick-start example scenario or configure manually
3. Click "Start Optimization"
4. Watch the GA optimize routes in real-time
5. View the final solution with statistics

### Manual Configuration

1. Set warehouse coordinates (0-100 range)
2. Generate or load delivery items
3. Configure vehicles (capacity and max distance)
4. Adjust GA parameters:
   - Population Size: 20-500
   - Generations: 50-1000
   - Mutation Rate: 0.01-0.50
   - Elite Size: 5-100

### Example Scenarios

- **Balanced**: 15 items, 3 vehicles with sufficient capacity
- **Over-Capacity**: 25 items, 3 vehicles with insufficient total capacity
- **Distance Constraints**: 12 items, 2 vehicles with tight distance limits

## Configuration File Format

```json
{
  "warehouse": {
    "x": 50,
    "y": 50,
    "id": "warehouse",
    "label": "Warehouse"
  },
  "deliveryItems": [
    {
      "id": "item-1",
      "location": { "x": 20, "y": 30, "id": "loc-1", "label": "Item 1" }
    }
  ],
  "vehicles": [
    {
      "id": "DA-1",
      "capacity": 8,
      "maxDistance": 150,
      "color": "#3b82f6"
    }
  ]
}
```

## Technology Stack

- **React**: UI framework
- **TypeScript**: Type-safe development
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Canvas API**: Map visualization
- **Lucide React**: Icons

## Performance Considerations

- GA parameters affect optimization quality and speed
- Larger populations and more generations = better solutions but slower
- Recommended settings for quick results: pop=100, gen=200
- Recommended settings for best quality: pop=300, gen=500+

## Future Extensions (Not Implemented)

- **Time Windows (VRPTW)**: Add time constraints for deliveries
- **Amazon-Uber Bidding**: DAs bid for delivery items
- **Multiple Warehouses**: Support multiple depot locations
- **Real-time Tracking**: Simulate actual delivery progress
- **Different Distance Metrics**: Manhattan, road network distances

## References

- [Google OR-Tools VRP](https://developers.google.com/optimization/routing/vrp)
- [Vehicle Routing Problem Overview](https://en.wikipedia.org/wiki/Vehicle_routing_problem)
- [Genetic Algorithms for VRP](https://link.springer.com/chapter/10.1007/978-3-540-73554-0_8)

## License

This is an educational project demonstrating VRP optimization and multi-agent systems.
