import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useVRP } from '../context/VRPContext';
import { MapVisualization } from './MapVisualization';
import { AgentCommunication } from './AgentCommunication';
import { SolutionStats } from './SolutionStats';
import { AgentMessage, Route, VRPSolution } from '../types';

export function VisualizationPage() {
  const navigate = useNavigate();
  const { config, solution, setSolution, messages, setMessages, isOptimizing, setIsOptimizing } = useVRP();
  const [progress, setProgress] = useState(0);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!config) {
      navigate('/setup');
      return;
    }
  }, [config, navigate]);

  const runOptimization = async () => {
    if (!config) return;

    setIsOptimizing(true);
    setProgress(0);
    setCurrentGeneration(0);

    const registrationMessages = buildCapacityRegistrationMessages();
    setMessages([...registrationMessages]);
    await delay(500);

    const totalGenerations = config.generations;
    const updateInterval = Math.max(1, Math.floor(totalGenerations / 20));

    try {
      for (let gen = 0; gen <= totalGenerations; gen += updateInterval) {
        setCurrentGeneration(gen);
        setProgress(Math.min((gen / totalGenerations) * 80, 80));
        await delay(50);
      }

      const backendResponse = await fetch('http://localhost:8080/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend returned HTTP ${backendResponse.status}`);
      }

      const data: { solution: VRPSolution; bestFitness: number; bestGeneration: number } = await backendResponse.json();
      const finalSolution = data.solution;

      setSolution(finalSolution);
      setProgress(100);
      setCurrentGeneration(totalGenerations);

      const assignmentMessages = buildRouteAssignmentMessages(finalSolution.routes);
      const ackMessages = buildAckMessages(finalSolution.routes);
      setMessages([...registrationMessages, ...assignmentMessages, ...ackMessages]);
    } catch (error) {
      console.error(error);
      alert('Could not connect to Java backend. Please start BackendApiServer on port 8080 and try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const buildCapacityRegistrationMessages = (): AgentMessage[] => {
    if (!config) return [];

    return config.vehicles.map(vehicle => ({
      type: 'REGISTER_CAPACITY',
      from: vehicle.id,
      to: 'MRA',
      timestamp: Date.now(),
      payload: {
        vehicleId: vehicle.id,
        capacity: vehicle.capacity,
        maxDistance: vehicle.maxDistance,
      },
    }));
  };

  const buildRouteAssignmentMessages = (routes: Route[]): AgentMessage[] =>
    routes.map(route => ({
      type: 'ROUTE_ASSIGNMENT',
      from: 'MRA',
      to: route.vehicleId,
      timestamp: Date.now(),
      payload: {
        vehicleId: route.vehicleId,
        route: route.stops,
        totalDistance: route.totalDistance,
      },
    }));

  const buildAckMessages = (routes: Route[]): AgentMessage[] =>
    routes.map(route => ({
      type: 'ROUTE_ACK',
      from: route.vehicleId,
      to: 'MRA',
      timestamp: Date.now(),
      payload: {
        vehicleId: route.vehicleId,
        acknowledged: true,
        itemsReceived: route.stops.length,
      },
    }));

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleReset = () => {
    setSolution(null);
    setMessages([]);
    setProgress(0);
    setCurrentGeneration(0);
  };

  if (!config) {
    return null;
  }

  return (
    <div className="size-full overflow-auto bg-slate-50">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/setup')}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Route Optimization</h1>
              <p className="text-slate-600">
                {config.deliveryItems.length} items, {config.vehicles.length} vehicles
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isOptimizing && !solution && (
              <Button onClick={runOptimization} size="lg" className="gap-2">
                <Play className="size-4" />
                Start Optimization
              </Button>
            )}
            {isOptimizing && (
              <Button disabled size="lg" className="gap-2">
                <Pause className="size-4" />
                Optimizing...
              </Button>
            )}
            {solution && (
              <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="size-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        {isOptimizing && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generation {currentGeneration} / {config.generations}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Visualization - Takes 2 columns */}
          <div className="xl:col-span-2">
            <MapVisualization
              warehouse={config.warehouse}
              items={config.deliveryItems}
              vehicles={config.vehicles}
              solution={solution}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Solution Stats */}
            {solution && (
              <SolutionStats
                solution={solution}
                totalItems={config.deliveryItems.length}
                totalCapacity={config.vehicles.reduce((sum, v) => sum + v.capacity, 0)}
              />
            )}

            {/* Agent Communication */}
            <AgentCommunication messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
}
