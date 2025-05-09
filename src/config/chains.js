export const sonicBlaze = {
  id: 57054,
  name: 'Sonic Blaze Testnet',
  network: 'sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.blaze.soniclabs.com'],
      webSocket: ['wss://rpc.blaze.soniclabs.com/ws'],
    },
    public: {
      http: ['https://rpc.blaze.soniclabs.com'],
      webSocket: ['wss://rpc.blaze.soniclabs.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://explorer.sonic.blaze.testnet',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
  testnet: true,
}; 