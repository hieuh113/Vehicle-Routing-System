import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AgentMessage } from '../types';
import { MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

interface AgentCommunicationProps {
  messages: AgentMessage[];
}

export function AgentCommunication({ messages }: AgentCommunicationProps) {
  const getMessageIcon = (type: AgentMessage['type']) => {
    switch (type) {
      case 'REGISTER_CAPACITY':
        return <ArrowRight className="size-4 text-green-500" />;
      case 'ROUTE_ASSIGNMENT':
        return <MessageSquare className="size-4 text-purple-500" />;
      case 'ROUTE_ACK':
        return <CheckCircle className="size-4 text-green-500" />;
      default:
        return <MessageSquare className="size-4 text-gray-500" />;
    }
  };

  const getMessageDescription = (message: AgentMessage) => {
    switch (message.type) {
      case 'REGISTER_CAPACITY':
        return `Register capacity: ${message.payload.capacity}, Max Distance: ${message.payload.maxDistance.toFixed(1)}`;
      case 'ROUTE_ASSIGNMENT':
        return `Route assigned: ${message.payload.route.length} items, Distance: ${message.payload.totalDistance.toFixed(2)}`;
      case 'ROUTE_ACK':
        return `Acknowledged ${message.payload.itemsReceived} items`;
      default:
        return 'Unknown message';
    }
  };

  const getMessageTypeLabel = (type: AgentMessage['type']) => {
    switch (type) {
      case 'REGISTER_CAPACITY':
        return 'Registration';
      case 'ROUTE_ASSIGNMENT':
        return 'Assignment';
      case 'ROUTE_ACK':
        return 'Acknowledgment';
      default:
        return type;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="size-5" />
        Agent Communication
      </h2>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No messages yet. Start optimization to see agent communication.
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-3 space-y-2 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {getMessageIcon(message.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-600">
                        {getMessageTypeLabel(message.type)}
                      </span>
                      <span className="text-xs text-slate-400">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-medium text-blue-600">{message.from}</span>
                      <ArrowRight className="size-3 text-slate-400" />
                      <span className="font-medium text-purple-600">{message.to}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {getMessageDescription(message)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {messages.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-slate-600">
            Total Messages: <span className="font-medium">{messages.length}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
