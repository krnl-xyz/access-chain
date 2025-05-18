import { defineChain } from 'viem';

export const sonicBlaze = defineChain({
  id: 57054, // Sonic Blaze Testnet chain ID
  name: 'Sonic Blaze Testnet',
  network: 'sonic-blaze',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'SONIC',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.blaze.soniclabs.com',
        'https://rpc.sonic.blaze.testnet',
        'https://blaze.testnet.sonic.explorerswap.com',
        'https://rpc.krnl.xyz',  // KRNL RPC endpoint
      ],
      webSocket: ['wss://ws.blaze.testnet.sonic.explorerswap.com'],
    },
    public: {
      http: [
        'https://rpc.blaze.soniclabs.com',
        'https://rpc.sonic.blaze.testnet',
        'https://blaze.testnet.sonic.explorerswap.com',
      ],
      webSocket: ['wss://ws.blaze.testnet.sonic.explorerswap.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://explorer.sonic.blaze.testnet',
    },
  },
  testnet: true,
  contracts: {
    // Add any known contract addresses here
  },
});

export const sapphireTestnet = {
    id: 23295,
    name: 'Oasis Sapphire Testnet',
    network: 'sapphire-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'TEST',
        symbol: 'TEST',
    },
    rpcUrls: {
        default: {
            http: ['https://testnet.sapphire.oasis.io'],
        },
        public: {
            http: ['https://testnet.sapphire.oasis.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Oasis Explorer',
            url: 'https://explorer.oasis.io/testnet/sapphire',
        },
    },
    testnet: true,
};