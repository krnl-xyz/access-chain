import { useContractRead, useContractWrite } from 'wagmi';
import { useWaitForTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_FUNCTIONS } from '../config/contracts';

export function useAccessToken() {
  const { address } = useAccount();

  // Read functions
  const { data: balance, isLoading: isLoadingBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.accessToken,
    abi: CONTRACT_ABIS.accessToken,
    functionName: CONTRACT_FUNCTIONS.balanceOf,
    args: [address],
    enabled: !!address,
  });

  const { data: totalSupply, isLoading: isLoadingSupply } = useContractRead({
    address: CONTRACT_ADDRESSES.accessToken,
    abi: CONTRACT_ABIS.accessToken,
    functionName: CONTRACT_FUNCTIONS.totalSupply,
  });

  // Write functions
  const { data: transferData, write: transfer } = useContractWrite({
    address: CONTRACT_ADDRESSES.accessToken,
    abi: CONTRACT_ABIS.accessToken,
    functionName: CONTRACT_FUNCTIONS.transfer,
  });

  const { data: mintData, write: mint } = useContractWrite({
    address: CONTRACT_ADDRESSES.accessToken,
    abi: CONTRACT_ABIS.accessToken,
    functionName: CONTRACT_FUNCTIONS.mint,
  });

  // Transaction status
  const { isLoading: isTransferring, isSuccess: isTransferSuccess } = useWaitForTransaction({
    hash: transferData?.hash,
  });

  const { isLoading: isMinting, isSuccess: isMintSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  return {
    // Read functions
    balance,
    totalSupply,
    isLoadingBalance,
    isLoadingSupply,

    // Write functions
    transfer,
    mint,
    isTransferring,
    isTransferSuccess,
    isMinting,
    isMintSuccess,
  };
}