import { useAccount, useChainId, useNetwork } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { ngoAccessControlAbi } from '../config/ngoAbi';
import { useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { sonicBlaze } from '../config/chains';

export function useNGOAccessControl() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const chainId = useChainId();
  const isCorrectNetwork = chain?.id === 57054;
  
  // State management
  const [operationState, setOperationState] = useState({
    isPending: false,
    isSuccess: false,
    error: null,
    lastTransactionHash: null,
    operationType: null, // 'add' or 'remove'
    targetAddress: null,
  });

  // Debug information
  console.log('Debug Information:', {
    connectedAddress: address,
    isWalletConnected: isConnected,
    currentChain: chain?.name,
    chainId: chainId,
    isCorrectNetwork: isCorrectNetwork,
    contractAddress: CONTRACT_ADDRESSES.ngoAccessControl,
    isContractOwner: address?.toLowerCase() === '0x1f0bde03ac69da9ab6aa0dc6169b906159ad569c'.toLowerCase()
  });

  // ... rest of the code
} 