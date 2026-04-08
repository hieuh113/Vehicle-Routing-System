import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

export function Documentation() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">System Documentation</h2>

      <Tabs defaultValue="sequence" className="w-full">
        <TabsList>
          <TabsTrigger value="sequence">Sequence Diagram</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
        </TabsList>

        <TabsContent value="sequence" className="space-y-4">
          <h3 className="font-semibold">Backend Agent Communication Protocol</h3>
          <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
            <div className="border-b pb-2">
              <strong>Phase 1: Vehicle Registration</strong>
            </div>
            <div className="pl-4 space-y-1">
              <div>DA-1 -&gt; MRA: REGISTER_CAPACITY (capacity, maxDistance)</div>
              <div>DA-2 -&gt; MRA: REGISTER_CAPACITY (capacity, maxDistance)</div>
              <div>DA-n -&gt; MRA: REGISTER_CAPACITY (capacity, maxDistance)</div>
            </div>

            <div className="border-b pb-2 pt-2">
              <strong>Phase 2: Constraint Collection</strong>
            </div>
            <div className="pl-4 space-y-1">
              <div>MRA: Store each DA as VehicleInfo</div>
              <div>MRA: Wait until all expected DAs are registered</div>
              <div>MRA: Build RoutingRequest from items, vehicles, warehouse, and GA config</div>
            </div>

            <div className="border-b pb-2 pt-2">
              <strong>Phase 3: Optimization</strong>
            </div>
            <div className="pl-4 space-y-1">
              <div>MRA -&gt; RoutingService: solve(RoutingRequest)</div>
              <div>RoutingService -&gt; GASolver: run permutation-based GA</div>
              <div>GASolver -&gt; RoutingService: return best route result</div>
            </div>

            <div className="border-b pb-2 pt-2">
              <strong>Phase 4: Route Assignment</strong>
            </div>
            <div className="pl-4 space-y-1">
              <div>MRA -&gt; DA-1: ROUTE_ASSIGNMENT (itemIds, distance)</div>
              <div>MRA -&gt; DA-2: ROUTE_ASSIGNMENT (itemIds, distance)</div>
              <div>MRA -&gt; DA-n: ROUTE_ASSIGNMENT (itemIds, distance)</div>
            </div>

            <div className="border-b pb-2 pt-2">
              <strong>Phase 5: Acknowledgment</strong>
            </div>
            <div className="pl-4 space-y-1">
              <div>DA-1 -&gt; MRA: ROUTE_ACK (status=RECEIVED)</div>
              <div>DA-2 -&gt; MRA: ROUTE_ACK (status=RECEIVED)</div>
              <div>DA-n -&gt; MRA: ROUTE_ACK (status=RECEIVED)</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <h3 className="font-semibold">Multi-Agent System Architecture</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Master Routing Agent (MRA)</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
                <li>Coordinates the delivery routing process</li>
                <li>Collects capacity and maximum distance constraints from DAs</li>
                <li>Builds a RoutingRequest and calls RoutingService</li>
                <li>Distributes optimized route assignments to DAs</li>
                <li>Receives route acknowledgments from DAs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Delivery Agent (DA)</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
                <li>Represents an individual delivery vehicle</li>
                <li>Reports capacity and maximum distance constraints</li>
                <li>Receives and acknowledges route assignments</li>
                <li>Executes deliveries according to the assigned route</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Routing Service Layer</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
                <li>RoutingRequest contains warehouse, items, vehicles, and GA parameters</li>
                <li>RoutingService invokes the Java GASolver and returns a RoutingResponse</li>
                <li>The React frontend calls the Java backend API and renders the returned solution</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Communication Protocol</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
                <li>DA registration pattern for constraint collection</li>
                <li>MRA assignment pattern for route distribution</li>
                <li>DA acknowledgment pattern for confirmation</li>
                <li>JADE ACL messages use structured string content in the backend prototype</li>
                <li>JSON is used for the frontend-to-backend API contract</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="algorithm" className="space-y-4">
          <h3 className="font-semibold">Java Genetic Algorithm for VRP</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Chromosome Representation</h4>
              <p className="text-slate-600">
                Each chromosome is a permutation of delivery item indices. The permutation represents the
                order in which items are considered by the decoder for vehicle assignment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Decoding Strategy</h4>
              <p className="text-slate-600">
                The decoder tries to assign each item to a feasible vehicle while checking capacity and
                maximum travel distance. If no vehicle can accept an item, it is marked as undelivered.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Fitness Function and Solution Ranking</h4>
              <div className="bg-slate-50 p-3 rounded font-mono text-xs">
                fitness = deliveredCount * BIG_CONSTANT - totalDistance
              </div>
              <p className="text-slate-600 mt-2">
                A solution comparator also ranks solutions by deliveredCount first, then by smaller
                totalDistance. This matches the assignment priority: deliver more items before reducing distance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Genetic Operators</h4>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li><strong>Selection:</strong> Tournament selection</li>
                <li><strong>Crossover:</strong> Order-preserving crossover for permutation chromosomes</li>
                <li><strong>Mutation:</strong> Swap mutation between two item positions</li>
                <li><strong>Elitism:</strong> Top chromosomes preserved across generations</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Constraints Validation</h4>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>Vehicle capacity: assigned item count &lt;= vehicle.capacity</li>
                <li>Maximum distance: routeDistance &lt;= vehicle.maxDistance</li>
                <li>Undelivered items are tracked when no feasible vehicle can accept them</li>
                <li>Validation checks duplicates, delivered count, route distances, and total distance consistency</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Distance Calculation</h4>
              <div className="bg-slate-50 p-3 rounded font-mono text-xs">
                distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)
              </div>
              <p className="text-slate-600 mt-2">
                Euclidean straight-line distance is used between the warehouse and delivery points. A route
                starts at the warehouse, visits assigned items in order, and returns to the warehouse.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
