export const sonicBlaze = {
  id: 57054,
  name: 'Sonic Blaze Testnet',
  network: 'sonicBlaze',
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
      ],
    },
    public: {
      http: [
        'https://rpc.blaze.soniclabs.com',
        'https://rpc.sonic.blaze.testnet',
        'https://blaze.testnet.sonic.explorerswap.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://explorer.sonic.blaze.testnet',
    },
  },
  testnet: true,
}; 