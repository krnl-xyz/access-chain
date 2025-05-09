import { useContractRead, useContractWrite } from 'wagmi';
import { useWaitForTransaction } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_FUNCTIONS } from '../config/contracts';

export function useGrantRequests() {
  const { address } = useAccount();

  // Read functions
  const { data: grantRequests, isLoading: isLoadingRequests } = useContractRead({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.getAllGrantRequests,
  });

  const { data: userRequests, isLoading: isLoadingUserRequests } = useContractRead({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.getUserRequests,
    args: [address],
    enabled: !!address,
  });

  // Write functions
  const { data: submitData, write: submitRequest } = useContractWrite({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.submitRequest,
  });

  const { data: updateData, write: updateRequestStatus } = useContractWrite({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.updateRequestStatus,
  });

  // Transaction status
  const { isLoading: isSubmitting, isSuccess: isSubmitSuccess } = useWaitForTransaction({
    hash: submitData?.hash,
  });

  const { isLoading: isUpdating, isSuccess: isUpdateSuccess } = useWaitForTransaction({
    hash: updateData?.hash,
  });

  return {
    // Read functions
    grantRequests,
    userRequests,
    isLoadingRequests,
    isLoadingUserRequests,

    // Write functions
    submitRequest,
    updateRequestStatus,
    isSubmitting,
    isSubmitSuccess,
    isUpdating,
    isUpdateSuccess,
  };
}