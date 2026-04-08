import { RouterProvider } from 'react-router';
import { router } from './routes';
import { VRPProvider } from './context/VRPContext';

export default function App() {
  return (
    <VRPProvider>
      <RouterProvider router={router} />
    </VRPProvider>
  );
}