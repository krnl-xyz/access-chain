import { http, createConfig } from 'wagmi';
import { MetaMaskConnector } from '@wagmi/connectors/metaMask';
import { sonicBlaze } from './chains';

// Configure chains
const chains = [sonicBlaze];

// Create wagmi config
export const config = createConfig({
  chains: [sonicBlaze],
  connectors: [
    new MetaMaskConnector({ chains })
  ],
  transports: {
    [sonicBlaze.id]: http('https://rpc.blaze.soniclabs.com'),
  },
});