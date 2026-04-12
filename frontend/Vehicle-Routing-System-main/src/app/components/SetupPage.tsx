import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Upload, Shuffle, Truck, Package, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Slider } from './ui/slider';
import { useVRP } from '../context/VRPContext';
import { DeliveryItem, Vehicle, Location } from '../types';

export function SetupPage() {
  const navigate = useNavigate();
  const { setConfig } = useVRP();

  // Warehouse
  const [warehouse, setWarehouse] = useState<Location>({ x: 50, y: 50, id: 'warehouse', label: 'Warehouse' });

  // Delivery Items
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [numItems, setNumItems] = useState(20);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'DA-1', capacity: 8, maxDistance: 150, color: '#3b82f6' },
    { id: 'DA-2', capacity: 8, maxDistance: 150, color: '#ef4444' },
    { id: 'DA-3', capacity: 8, maxDistance: 150, color: '#10b981' },
  ]);

  // GA Parameters
  const [populationSize, setPopulationSize] = useState(100);
  const [generations, setGenerations] = useState(200);
  const [mutationRate, setMutationRate] = useState(0.15);
  const [eliteSize, setEliteSize] = useState(20);

  const loadExampleScenario = (scenario: 'balanced' | 'overcapacity' | 'limited') => {
    setWarehouse({ x: 50, y: 50, id: 'warehouse', label: 'Warehouse' });

    switch (scenario) {
      case 'balanced':
        // Balanced scenario: capacity and distance are sufficient, so all items should be deliverable.
        setDeliveryItems(generateClusteredItems(15, 50, 50));
        setVehicles([
          { id: 'DA-1', capacity: 5, maxDistance: 120, color: '#3b82f6' },
          { id: 'DA-2', capacity: 5, maxDistance: 120, color: '#ef4444' },
          { id: 'DA-3', capacity: 5, maxDistance: 120, color: '#10b981' },
        ]);
        break;
      case 'overcapacity':
        // Basic Requirement 1: total capacity is smaller than the number of delivery items.
        setDeliveryItems(generateClusteredItems(25, 50, 50));
        setVehicles([
          { id: 'DA-1', capacity: 6, maxDistance: 150, color: '#3b82f6' },
          { id: 'DA-2', capacity: 6, maxDistance: 150, color: '#ef4444' },
          { id: 'DA-3', capacity: 5, maxDistance: 150, color: '#10b981' },
        ]);
        break;
      case 'limited':
        // Basic Requirement 2: capacity is enough, but far items exceed maximum travel distance.
        setDeliveryItems(generateDistanceLimitedItems());
        setVehicles([
          { id: 'DA-1', capacity: 6, maxDistance: 70, color: '#3b82f6' },
          { id: 'DA-2', capacity: 6, maxDistance: 70, color: '#ef4444' },
        ]);
        break;
    }
  };

  const generateItemsArray = (count: number): DeliveryItem[] => {
    const items: DeliveryItem[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: `item-${i + 1}`,
        location: {
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          id: `loc-${i + 1}`,
          label: `Item ${i + 1}`
        }
      });
    }
    return items;
  };

  const generateClusteredItems = (count: number, centerX: number, centerY: number): DeliveryItem[] => {
    const offsets = [
      [-10, -8], [-6, -10], [-2, -7], [3, -9], [8, -6],
      [-9, -2], [-4, 0], [0, -1], [5, 2], [10, 1],
      [-8, 6], [-3, 8], [2, 7], [7, 9], [11, 6],
      [-12, 10], [12, -11], [-14, -4], [14, 4], [0, 13],
      [-16, 0], [16, 0], [-5, 14], [5, -14], [13, 12],
    ];

    return Array.from({ length: count }, (_, index) => {
      const [dx, dy] = offsets[index % offsets.length];
      return {
        id: `item-${index + 1}`,
        location: {
          x: centerX + dx,
          y: centerY + dy,
          id: `loc-${index + 1}`,
          label: `Item ${index + 1}`
        }
      };
    });
  };

  const generateDistanceLimitedItems = (): DeliveryItem[] => {
    const coordinates = [
      [54, 52], [48, 55], [58, 47], [45, 48],
      [92, 92], [96, 86], [88, 95], [10, 12],
      [6, 18], [14, 8], [95, 10], [10, 95],
    ];

    return coordinates.map(([x, y], index) => ({
      id: `item-${index + 1}`,
      location: {
        x,
        y,
        id: `loc-${index + 1}`,
        label: `Item ${index + 1}`
      }
    }));
  };

  const generateRandomItems = () => {
    const items: DeliveryItem[] = [];
    for (let i = 0; i < numItems; i++) {
      items.push({
        id: `item-${i + 1}`,
        location: {
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          id: `loc-${i + 1}`,
          label: `Item ${i + 1}`
        }
      });
    }
    setDeliveryItems(items);
  };

  const addVehicle = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const newId = `DA-${vehicles.length + 1}`;
    setVehicles([
      ...vehicles,
      {
        id: newId,
        capacity: 8,
        maxDistance: 150,
        color: colors[vehicles.length % colors.length]
      }
    ]);
  };

  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const updateVehicle = (id: string, field: 'capacity' | 'maxDistance', value: number) => {
    setVehicles(vehicles.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const handleLoadFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const fileText = event.target?.result as string;
            if (file.name.toLowerCase().endsWith('.json')) {
              const data = JSON.parse(fileText);
              if (data.warehouse) setWarehouse(data.warehouse);
              if (data.deliveryItems) setDeliveryItems(data.deliveryItems);
              if (data.vehicles) setVehicles(data.vehicles);
            } else {
              setDeliveryItems(parseTextItems(fileText));
            }
          } catch (error) {
            alert('Invalid file format. Use JSON config or text lines in itemId,x,y format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const parseTextItems = (content: string): DeliveryItem[] => {
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .map((line, index) => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length !== 3 && parts.length !== 6) {
          throw new Error(`Invalid item line: expected 3 or 6 comma-separated values, got ${parts.length}`);
        }

        const idNumber = parseInt(parts[0], 10);
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);

        if (!Number.isFinite(idNumber) || !Number.isFinite(x) || !Number.isFinite(y)) {
          throw new Error(`Invalid item values: ${line}`);
        }

        let earliestTime: number | undefined;
        let latestTime: number | undefined;
        let serviceTime: number | undefined;

        if (parts.length === 6) {
          earliestTime = parseFloat(parts[3]);
          latestTime = parseFloat(parts[4]);
          serviceTime = parseFloat(parts[5]);

          if (!Number.isFinite(earliestTime) || !Number.isFinite(latestTime) || !Number.isFinite(serviceTime)) {
            throw new Error(`Invalid VRPTW values: ${line}`);
          }

          if (latestTime < earliestTime) {
            throw new Error(`Invalid time window: latestTime must be >= earliestTime in line ${line}`);
          }

          if (serviceTime < 0) {
            throw new Error(`Invalid serviceTime: must be non-negative in line ${line}`);
          }
        }

        return {
          id: `item-${idNumber}`,
          earliestTime,
          latestTime,
          serviceTime,
          location: {
            x,
            y,
            id: `loc-${idNumber}`,
            label: `Item ${idNumber || index + 1}`
          }
        };
      });
  };

  const handleDownloadConfig = () => {
    const config = {
      warehouse,
      deliveryItems,
      vehicles
    };
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'vrp-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleStartOptimization = () => {
    if (deliveryItems.length === 0) {
      alert('Please generate or add delivery items first');
      return;
    }
    if (vehicles.length === 0) {
      alert('Please add at least one vehicle');
      return;
    }

    const config = {
      warehouse,
      deliveryItems,
      vehicles,
      populationSize,
      generations,
      mutationRate,
      eliteSize
    };

    setConfig(config);
    navigate('/visualization');
  };

  return (
    <div className="size-full overflow-auto bg-slate-50">
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Problem Setup</h1>
              <p className="text-slate-600">Configure the Vehicle Routing Problem parameters</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLoadFromFile}>
              <Upload className="size-4 mr-2" />
              Load Config / Items
            </Button>
            <Button variant="outline" onClick={handleDownloadConfig} disabled={deliveryItems.length === 0}>
              <Download className="size-4 mr-2" />
              Export Config
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Warehouse */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Warehouse Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>X Coordinate</Label>
                  <Input
                    type="number"
                    value={warehouse.x}
                    onChange={(e) => setWarehouse({ ...warehouse, x: parseFloat(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y Coordinate</Label>
                  <Input
                    type="number"
                    value={warehouse.y}
                    onChange={(e) => setWarehouse({ ...warehouse, y: parseFloat(e.target.value) })}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </Card>

            {/* Delivery Items */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="size-5" />
                  Delivery Items ({deliveryItems.length})
                </h2>
                <Button variant="outline" size="sm" onClick={handleLoadFromFile}>
                  <Upload className="size-4 mr-2" />
                  Load Items
                </Button>
              </div>

              <Tabs defaultValue="auto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="auto">Auto Generate</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                </TabsList>

                <TabsContent value="auto" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Number of Items</Label>
                    <Input
                      type="number"
                      value={numItems}
                      onChange={(e) => setNumItems(parseInt(e.target.value) || 0)}
                      min={1}
                      max={100}
                    />
                  </div>
                  <Button onClick={generateRandomItems} className="w-full gap-2">
                    <Shuffle className="size-4" />
                    Generate Random Items
                  </Button>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Load a JSON config or a text file using either itemId,x,y or itemId,x,y,earliestTime,latestTime,serviceTime lines.
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {deliveryItems.map(item => (
                      <div key={item.id} className="text-sm bg-slate-100 p-2 rounded">
                        {item.location.label} - ({item.location.x.toFixed(1)}, {item.location.y.toFixed(1)})
                        {typeof item.earliestTime === 'number' && typeof item.latestTime === 'number' && (
                          <span className="block text-slate-600">
                            Window: {item.earliestTime} - {item.latestTime}
                            {typeof item.serviceTime === 'number' ? ` | Service: ${item.serviceTime}` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Vehicles */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Truck className="size-5" />
                  Delivery Vehicles ({vehicles.length})
                </h2>
                <Button variant="outline" size="sm" onClick={addVehicle}>
                  <Plus className="size-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded"
                          style={{ backgroundColor: vehicle.color }}
                        />
                        <span className="font-medium">{vehicle.id}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVehicle(vehicle.id)}
                        disabled={vehicles.length === 1}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Capacity</Label>
                        <Input
                          type="number"
                          value={vehicle.capacity}
                          onChange={(e) => updateVehicle(vehicle.id, 'capacity', parseInt(e.target.value) || 0)}
                          min={1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max Distance</Label>
                        <Input
                          type="number"
                          value={vehicle.maxDistance}
                          onChange={(e) => updateVehicle(vehicle.id, 'maxDistance', parseFloat(e.target.value) || 0)}
                          min={1}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Example Scenarios */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Quick Start Examples</h2>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadExampleScenario('balanced')}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Balanced Scenario</div>
                    <div className="text-xs text-slate-600">15 nearby items, 3 vehicles, all items should be deliverable</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExampleScenario('overcapacity')}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Capacity-Limited Scenario</div>
                    <div className="text-xs text-slate-600">25 items, total capacity 17, undelivered items expected</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExampleScenario('limited')}
                  className="justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Distance-Limited Scenario</div>
                    <div className="text-xs text-slate-600">12 items, capacity enough, max distance blocks far items</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* GA Parameters */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">Advanced Genetic Algorithm Parameters</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Population Size</Label>
                    <span className="text-sm text-slate-600">{populationSize}</span>
                  </div>
                  <Slider
                    value={[populationSize]}
                    onValueChange={(v) => {
                      setPopulationSize(v[0]);
                      if (eliteSize > v[0]) {
                        setEliteSize(v[0]);
                      }
                    }}
                    min={20}
                    max={500}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Generations</Label>
                    <span className="text-sm text-slate-600">{generations}</span>
                  </div>
                  <Slider
                    value={[generations]}
                    onValueChange={(v) => setGenerations(v[0])}
                    min={50}
                    max={1000}
                    step={50}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Mutation Rate</Label>
                    <span className="text-sm text-slate-600">{mutationRate.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[mutationRate * 100]}
                    onValueChange={(v) => setMutationRate(v[0] / 100)}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Elite Size</Label>
                    <span className="text-sm text-slate-600">{eliteSize}</span>
                  </div>
                  <Slider
                    value={[eliteSize]}
                    onValueChange={(v) => setEliteSize(v[0])}
                    min={5}
                    max={Math.min(100, populationSize)}
                    step={5}
                  />
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Problem Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Items:</span>
                  <span className="font-medium">{deliveryItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vehicles:</span>
                  <span className="font-medium">{vehicles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Capacity:</span>
                  <span className="font-medium">
                    {vehicles.reduce((sum, v) => sum + v.capacity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Capacity vs Items:</span>
                  <span className={`font-medium ${
                    vehicles.reduce((sum, v) => sum + v.capacity, 0) >= deliveryItems.length
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {vehicles.reduce((sum, v) => sum + v.capacity, 0) >= deliveryItems.length
                      ? deliveryItems.length === 0 ? 'No items yet' : 'Sufficient'
                      : 'Insufficient'}
                  </span>
                </div>
                {deliveryItems.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Add, generate, or load delivery items before starting optimization.
                  </p>
                )}
                {deliveryItems.length > 0 && vehicles.reduce((sum, v) => sum + v.capacity, 0) < deliveryItems.length && (
                  <p className="text-xs text-orange-600">
                    Total capacity is lower than item count. The backend will maximize delivered items and mark the rest as undelivered.
                  </p>
                )}
              </div>
            </Card>

            {/* Start Button */}
            <Button
              onClick={handleStartOptimization}
              size="lg"
              className="w-full"
              disabled={deliveryItems.length === 0 || vehicles.length === 0}
            >
              Start Optimization
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
