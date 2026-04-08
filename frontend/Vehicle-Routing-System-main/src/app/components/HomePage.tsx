import { Link } from 'react-router';
import { Truck, MapPin, Settings, BarChart3, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Documentation } from './Documentation';

export function HomePage() {
  return (
    <div className="size-full flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Truck className="size-12 text-blue-600" />
            <h1 className="text-4xl font-bold">Vehicle Routing Problem Solver</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Multi-Agent System for optimizing delivery routes using the Java backend Genetic Algorithm.
            The interface visualizes a Master Routing Agent coordinating with multiple Delivery Agents.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="size-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Route Optimization</h3>
            <p className="text-sm text-slate-600">
              Genetic Algorithm finds optimized routes considering capacity and maximum distance constraints
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="size-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Multi-Agent System</h3>
            <p className="text-sm text-slate-600">
              Master Routing Agent coordinates with Delivery Agents using defined JADE message protocols
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="size-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Route Visualization</h3>
            <p className="text-sm text-slate-600">
              Visualize optimized routes and review the agent communication flow
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4">
          <Link to="/setup">
            <Button size="lg" className="gap-2">
              <Settings className="size-5" />
              Setup Problem
            </Button>
          </Link>
        </div>

        {/* Info */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Settings className="size-5" />
            System Features
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>- <strong>Basic Requirement 1:</strong> Vehicle capacity constraints with prioritization on items delivered</li>
            <li>- <strong>Basic Requirement 2:</strong> Maximum distance constraints per vehicle</li>
            <li>- <strong>Optimization:</strong> Java backend Genetic Algorithm with configurable parameters</li>
            <li>- <strong>Input Options:</strong> Auto-generate delivery locations or load from file</li>
            <li>- <strong>Agent Protocol:</strong> DA registration, MRA route assignment, and DA acknowledgment</li>
            <li>- <strong>Distance Calculation:</strong> Euclidean straight-line distance</li>
          </ul>
        </Card>

        {/* Documentation */}
        <div className="flex justify-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen className="size-5" />
                View Documentation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <Documentation />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
