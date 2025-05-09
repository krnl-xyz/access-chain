import { configureChains, createConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { sonicBlaze } from './chains';
// Comment out Web3Modal import if not using it
// import { createWeb3Modal } from '@web3modal/wagmi/react';

// Configure chains with multiple RPC providers for better reliability
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sonicBlaze],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== sonicBlaze.id) return null;
        return {
          http: 'https://rpc.blaze.soniclabs.com',
          webSocket: 'wss://rpc.blaze.soniclabs.com',
        };
      },
      stallTimeout: 3000,
      priority: 0
    }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
      stallTimeout: 5000,
      priority: 1
    }),
    publicProvider(),
  ]
);

// Create wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Comment out Web3Modal configuration if not using it
// If you want to use Web3Modal, uncomment this and add your projectId
/*
createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [sonicBlaze],
  defaultChain: sonicBlaze,
  featuredWalletIds: [],
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#3182CE',
  },
});
*/