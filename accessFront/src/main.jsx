import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { config } from './config/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
);
