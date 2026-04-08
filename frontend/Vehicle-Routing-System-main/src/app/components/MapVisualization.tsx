import { useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { DeliveryItem, Location, Vehicle, VRPSolution } from '../types';
import { calculateDistance } from '../utils/distance';

interface MapVisualizationProps {
  warehouse: Location;
  items: DeliveryItem[];
  vehicles: Vehicle[];
  solution: VRPSolution | null;
}

export function MapVisualization({ warehouse, items, vehicles, solution }: MapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system (0-100 maps to canvas size with padding)
    const padding = 40;
    const scale = (canvas.width - 2 * padding) / 100;

    const toCanvasX = (x: number) => padding + x * scale;
    const toCanvasY = (y: number) => canvas.height - (padding + y * scale);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = toCanvasX(i * 10);
      const y = toCanvasY(i * 10);
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw routes first (so they're behind points)
    if (solution) {
      solution.routes.forEach(route => {
        const vehicle = vehicles.find(v => v.id === route.vehicleId);
        if (!vehicle || route.stops.length === 0) return;

        ctx.strokeStyle = vehicle.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        // Draw route
        ctx.beginPath();
        ctx.moveTo(toCanvasX(warehouse.x), toCanvasY(warehouse.y));
        
        route.stops.forEach(stop => {
          ctx.lineTo(toCanvasX(stop.location.x), toCanvasY(stop.location.y));
        });
        
        // Return to warehouse
        ctx.lineTo(toCanvasX(warehouse.x), toCanvasY(warehouse.y));
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrows along the route
        const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
          const angle = Math.atan2(toY - fromY, toX - fromX);
          const arrowLength = 8;
          
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;

          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(
            midX - arrowLength * Math.cos(angle - Math.PI / 6),
            midY - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(midX, midY);
          ctx.lineTo(
            midX - arrowLength * Math.cos(angle + Math.PI / 6),
            midY - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        };

        // Arrow from warehouse to first stop
        if (route.stops.length > 0) {
          drawArrow(
            toCanvasX(warehouse.x),
            toCanvasY(warehouse.y),
            toCanvasX(route.stops[0].location.x),
            toCanvasY(route.stops[0].location.y)
          );
        }

        // Arrows between stops
        for (let i = 0; i < route.stops.length - 1; i++) {
          drawArrow(
            toCanvasX(route.stops[i].location.x),
            toCanvasY(route.stops[i].location.y),
            toCanvasX(route.stops[i + 1].location.x),
            toCanvasY(route.stops[i + 1].location.y)
          );
        }
      });
    }

    // Draw warehouse
    ctx.fillStyle = '#1e40af';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    
    const whX = toCanvasX(warehouse.x);
    const whY = toCanvasY(warehouse.y);
    
    // Draw warehouse as a house shape
    ctx.beginPath();
    ctx.moveTo(whX, whY - 12);
    ctx.lineTo(whX + 10, whY - 2);
    ctx.lineTo(whX + 10, whY + 8);
    ctx.lineTo(whX - 10, whY + 8);
    ctx.lineTo(whX - 10, whY - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Warehouse label
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Warehouse', whX, whY + 22);

    // Draw delivery items
    items.forEach(item => {
      const x = toCanvasX(item.location.x);
      const y = toCanvasY(item.location.y);

      // Check if item is delivered
      const isDelivered = solution?.routes.some(route =>
        route.stops.some(stop => stop.id === item.id)
      );

      const isUndelivered = solution && !isDelivered;

      if (isUndelivered) {
        // Undelivered items - gray with X
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw X
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
      } else if (isDelivered) {
        // Delivered items - colored by vehicle
        const route = solution!.routes.find(r =>
          r.stops.some(s => s.id === item.id)
        );
        const vehicle = vehicles.find(v => v.id === route?.vehicleId);

        ctx.fillStyle = vehicle?.color || '#10b981';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Not yet optimized - default color
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });

    // Draw legend
    const legendX = padding;
    const legendY = padding - 20;
    
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    
    // Warehouse legend
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Warehouse', legendX + 18, legendY + 10);

    if (!solution) {
      // Items to deliver
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(legendX + 100, legendY + 6, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Items', legendX + 110, legendY + 10);
    } else {
      // Delivered items
      vehicles.forEach((vehicle, idx) => {
        const route = solution.routes.find(r => r.vehicleId === vehicle.id);
        if (!route || route.stops.length === 0) return;

        const offsetX = legendX + 100 + idx * 100;
        
        ctx.fillStyle = vehicle.color;
        ctx.beginPath();
        ctx.arc(offsetX, legendY + 6, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#1f2937';
        ctx.fillText(`${vehicle.id} (${route.stops.length})`, offsetX + 10, legendY + 10);
      });

      if (solution.undeliveredItems.length > 0) {
        const offsetX = legendX + 100 + vehicles.length * 100;
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(offsetX, legendY + 6, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.fillText(`Undelivered (${solution.undeliveredItems.length})`, offsetX + 10, legendY + 10);
      }
    }

  }, [warehouse, items, vehicles, solution]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Route Map</h2>
      <div className="bg-white rounded-lg border">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto"
        />
      </div>
    </Card>
  );
}
