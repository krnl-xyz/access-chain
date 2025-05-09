import { useEffect, useState } from 'react';
import { useNGOAccessControl } from './useNGOAccessControl';
import { useAccount } from 'wagmi';
import { useToast } from '@chakra-ui/react';

export function useNGOAuth() {
  const { address, isConnected } = useAccount();
  const { 
    isAuthorized, 
    isLoadingAuthorization,
    isCorrectNetwork,
    chainId
  } = useNGOAccessControl();
  
  const toast = useToast();
  const [authState, setAuthState] = useState({
    isReady: false,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!isConnected) {
      setAuthState({
        isReady: true,
        isAuthenticated: false,
        isLoading: false,
        error: 'Wallet not connected'
      });
      return;
    }

    if (!isCorrectNetwork) {
      setAuthState({
        isReady: true,
        isAuthenticated: false,
        isLoading: false,
        error: `Please switch to Sonic Blaze Testnet (Chain ID: 57054). Current chain: ${chainId}`
      });
      return;
    }

    if (isLoadingAuthorization) {
      setAuthState({
        isReady: false,
        isAuthenticated: false,
        isLoading: true,
        error: null
      });
      return;
    }

    setAuthState({
      isReady: true,
      isAuthenticated: isAuthorized,
      isLoading: false,
      error: !isAuthorized ? 'Not authorized as NGO' : null
    });
  }, [isConnected, isCorrectNetwork, chainId, isLoadingAuthorization, isAuthorized]);

  // Show toast for network errors
  useEffect(() => {
    if (authState.error && !authState.isAuthenticated && authState.isReady) {
      toast({
        title: 'Authentication Error',
        description: authState.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [authState, toast]);

  return {
    ...authState,
    address,
    isConnected,
    isCorrectNetwork,
    chainId
  };
} 