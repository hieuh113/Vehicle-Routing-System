import { Card } from './ui/card';
import { VRPSolution } from '../types';
import { Package, TrendingUp, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface SolutionStatsProps {
  solution: VRPSolution;
  totalItems: number;
  totalCapacity: number;
}

export function SolutionStats({ solution, totalItems, totalCapacity }: SolutionStatsProps) {
  const deliveryRate = (solution.totalItemsDelivered / totalItems) * 100;
  const capacityUtilization = (solution.totalItemsDelivered / totalCapacity) * 100;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Solution Statistics</h2>

      {/* Main Metrics */}
      <div className="space-y-4">
        {/* Items Delivered */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-blue-500" />
              <span className="text-sm font-medium">Items Delivered</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {solution.totalItemsDelivered} / {totalItems}
            </span>
          </div>
          <Progress value={deliveryRate} />
          <p className="text-xs text-slate-600">
            {deliveryRate.toFixed(1)}% delivery rate
          </p>
        </div>

        {/* Total Distance */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-purple-500" />
            <span className="text-sm font-medium">Total Distance</span>
          </div>
          <span className="text-lg font-bold text-purple-600">
            {solution.totalDistance.toFixed(2)}
          </span>
        </div>

        {/* Capacity Utilization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-green-500" />
              <span className="text-sm font-medium">Capacity Utilization</span>
            </div>
            <span className="text-sm font-bold text-green-600">
              {capacityUtilization.toFixed(1)}%
            </span>
          </div>
          <Progress value={capacityUtilization} className="bg-green-200" />
        </div>
      </div>

      {/* Route Breakdown */}
      <div className="pt-4 border-t space-y-3">
        <h3 className="font-semibold text-sm">Route Breakdown</h3>
        <div className="space-y-2">
          {solution.routes.map(route => (
            <div
              key={route.vehicleId}
              className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
            >
              <span className="font-medium">{route.vehicleId}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-600">
                  {route.itemsDelivered} items
                </span>
                <span className="text-slate-600">
                  {route.totalDistance.toFixed(1)} dist
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="pt-4 border-t">
        {solution.undeliveredItems.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="size-5" />
            <span className="text-sm font-medium">All items delivered!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="size-5" />
            <span className="text-sm font-medium">
              {solution.undeliveredItems.length} items undelivered
            </span>
          </div>
        )}
      </div>

      {/* Optimization Info */}
      <div className="pt-4 border-t space-y-1 text-xs text-slate-600">
        <p>
          <strong>Optimization Priority:</strong> Maximize items delivered, then minimize distance
        </p>
        <p>
          <strong>Algorithm:</strong> Java backend Genetic Algorithm with tournament selection and elitism
        </p>
      </div>
    </Card>
  );
}
