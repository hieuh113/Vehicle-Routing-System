import { createContext, useContext, useState, ReactNode } from 'react';
import { VRPConfig, VRPSolution, Vehicle, DeliveryItem, Location, AgentMessage } from '../types';

interface VRPContextType {
  config: VRPConfig | null;
  setConfig: (config: VRPConfig) => void;
  solution: VRPSolution | null;
  setSolution: (solution: VRPSolution) => void;
  messages: AgentMessage[];
  setMessages: (messages: AgentMessage[]) => void;
  isOptimizing: boolean;
  setIsOptimizing: (value: boolean) => void;
}

const VRPContext = createContext<VRPContextType | undefined>(undefined);

export function VRPProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<VRPConfig | null>(null);
  const [solution, setSolution] = useState<VRPSolution | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  return (
    <VRPContext.Provider
      value={{
        config,
        setConfig,
        solution,
        setSolution,
        messages,
        setMessages,
        isOptimizing,
        setIsOptimizing,
      }}
    >
      {children}
    </VRPContext.Provider>
  );
}

export function useVRP() {
  const context = useContext(VRPContext);
  if (!context) {
    throw new Error('useVRP must be used within VRPProvider');
  }
  return context;
}
