import { useContractRead, useWaitForTransaction, useAccount, useChainId, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, NGOAccessControlABI } from '../config/contracts';
import { useState, useCallback } from 'react';
import { createWalletClient, custom } from 'viem';
import { sonicBlaze } from '../config/chains';

export function useNGOAccessControl() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const isCorrectNetwork = chainId === 57054;
  
  // State management
  const [operationState, setOperationState] = useState({
    isPending: false,
    isSuccess: false,
    error: null,
    lastTransactionHash: null,
    operationType: null,
    targetAddress: null,
  });

  // Debug information
  console.log('Contract Address:', CONTRACT_ADDRESSES.ngoAccessControl);
  console.log('Network State:', { chainId, isCorrectNetwork, isConnected });
  console.log('Connected Address:', address);

  // Read NGO List
  const {
    data: ngoListData,
    isLoading: isLoadingNGOs,
    refetch: refetchNGOs,
    error: ngoListError
  } = useContractRead({
    address: CONTRACT_ADDRESSES.ngoAccessControl,
    abi: NGOAccessControlABI,
    functionName: 'getNGOs',
    enabled: isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Error fetching NGO list:', error);
    }
  });

  // Ensure ngoList is always an array
  const ngoList = Array.isArray(ngoListData) ? ngoListData : [];

  // Check NGO Authorization
  const {
    data: isAuthorizedData,
    isLoading: isLoadingAuthorization,
    refetch: refetchAuthorization,
    error: authorizationError
  } = useContractRead({
    address: CONTRACT_ADDRESSES.ngoAccessControl,
    abi: NGOAccessControlABI,
    functionName: 'isAuthorizedNGO',
    args: [address || '0x0000000000000000000000000000000000000000'],
    enabled: Boolean(address) && isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Error checking NGO authorization:', error);
    }
  });

  // Ensure isAuthorized is always a boolean
  const isAuthorized = Boolean(isAuthorizedData);

  // Transaction Status
  useWaitForTransaction({
    hash: operationState.lastTransactionHash,
    enabled: Boolean(operationState.lastTransactionHash),
    onSuccess: () => {
      refetchNGOs();
      refetchAuthorization();
      setOperationState(prev => ({
        ...prev,
        isPending: false,
        isSuccess: true,
      }));
    },
    onError: (err) => {
      console.error('Transaction error:', err);
      setOperationState(prev => ({
        ...prev,
        isPending: false,
        error: err,
      }));
    }
  });

  const checkOwnership = useCallback(async () => {
    try {
      const ownerData = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ngoAccessControl,
        abi: NGOAccessControlABI,
        functionName: 'owner',
      });
      
      if (address?.toLowerCase() !== ownerData.toLowerCase()) {
        throw new Error('Only the contract owner can manage NGOs');
      }
      return true;
    } catch (err) {
      console.error('Error checking ownership:', err);
      throw err;
    }
  }, [address, publicClient]);

  const checkAndRegisterNGO = useCallback(async (ngoAddress) => {
    try {
      if (!isConnected || !isCorrectNetwork) {
        throw new Error('Please connect your wallet and switch to Sonic Blaze Testnet');
      }

      await checkOwnership();

      // Create wallet client
      const walletClient = createWalletClient({
        chain: sonicBlaze,
        transport: custom(window.ethereum)
      });

      // Prepare transaction
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.ngoAccessControl,
        abi: NGOAccessControlABI,
        functionName: 'addNGO',
        args: [ngoAddress],
        account: address,
      });

      // Send transaction
      const hash = await walletClient.writeContract(request);

      setOperationState({
        isPending: true,
        isSuccess: false,
        error: null,
        lastTransactionHash: hash,
        operationType: 'add',
        targetAddress: ngoAddress,
      });

      return { transactionHash: hash };
    } catch (error) {
      console.error('Error registering NGO:', error);
      throw error;
    }
  }, [address, isConnected, isCorrectNetwork, publicClient, checkOwnership]);

  return {
    ngoList,
    isLoadingNGOs,
    isAuthorized,
    isLoadingAuthorization,
    checkAndRegisterNGO,
    isAdding: operationState.isPending && operationState.operationType === 'add',
    isRemoving: operationState.isPending && operationState.operationType === 'remove',
    isCorrectNetwork,
    error: operationState.error || ngoListError || authorizationError,
  };
}