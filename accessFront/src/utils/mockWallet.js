import { useState, useEffect } from 'react';

// Mock wallet state
let mockWalletState = {
  isConnected: false,
  address: null,
  chainId: 1,
};

// Mock wallet listeners
const listeners = new Set();

// Mock wallet functions
export const mockWallet = {
  connect: async () => {
    mockWalletState = {
      isConnected: true,
      address: "0x" + Math.random().toString(16).slice(2, 42),
      chainId: 1,
    };
    listeners.forEach(listener => listener(mockWalletState));
    return mockWalletState;
  },

  disconnect: () => {
    mockWalletState = {
      isConnected: false,
      address: null,
      chainId: 1,
    };
    listeners.forEach(listener => listener(mockWalletState));
  },

  getState: () => mockWalletState,

  onStateChange: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// Mock hook to replace wagmi hooks
export const useMockAccount = () => {
  const [state, setState] = useState(mockWallet.getState());

  useEffect(() => {
    return mockWallet.onStateChange(setState);
  }, []);

  return {
    address: state.address,
    isConnected: state.isConnected,
    chainId: state.chainId,
  };
};

// Mock connect hook
export const useMockConnect = () => {
  return {
    connect: mockWallet.connect,
    disconnect: mockWallet.disconnect,
  };
}; 