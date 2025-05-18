import { useContractRead, useWaitForTransaction, useAccount, useChainId, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, NGOAccessControlABI } from '../config/contracts';
import { useState, useCallback, useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { sonicBlaze } from '../config/chains';
import { useParams } from 'react-router-dom';

export function useNGOAccessControl() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const isCorrectNetwork = chainId === 57054;
  const { ngoAddress } = useParams();
  
  // State management
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingAuthorization, setIsLoadingAuthorization] = useState(true);
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
  console.log('NGO Address:', ngoAddress);

  // Check if the current address is authorized as an NGO
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isConnected || !isCorrectNetwork || !address) {
        setIsAuthorized(false);
        setIsLoadingAuthorization(false);
        return;
      }

      try {
        const isAuthorizedData = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.ngoAccessControl,
          abi: NGOAccessControlABI,
          functionName: 'isAuthorizedNGO',
          args: [address],
        });

        console.log('Authorization check result:', isAuthorizedData);
        setIsAuthorized(Boolean(isAuthorizedData));
      } catch (error) {
        console.error('Error checking NGO authorization:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoadingAuthorization(false);
      }
    };

    checkAuthorization();
  }, [address, isConnected, isCorrectNetwork, publicClient]);

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

  // Transaction Status
  useWaitForTransaction({
    hash: operationState.lastTransactionHash,
    enabled: Boolean(operationState.lastTransactionHash),
    onSuccess: () => {
      refetchNGOs();
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
    isAuthorized,
    isLoadingAuthorization,
    isCorrectNetwork,
    ngoList,
    isLoadingNGOs,
    refetchNGOs,
    ngoListError,
    operationState,
    checkAndRegisterNGO,
    isAdding: operationState.isPending && operationState.operationType === 'add',
    isRemoving: operationState.isPending && operationState.operationType === 'remove',
    error: operationState.error || ngoListError,
  };
}