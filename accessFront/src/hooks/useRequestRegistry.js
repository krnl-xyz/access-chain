import { useContractRead, useContractWrite } from 'wagmi';
import { useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_FUNCTIONS } from '../config/contracts';

// Request status enum
export const RequestStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
};

export function useRequestRegistry() {
  // Read functions
  const { data: requestList, isLoading: isLoadingRequests } = useContractRead({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.getUserRequests,
    watch: true,
  });

  // Write functions
  const { 
    data: updateData, 
    write: updateRequestStatus,
    isPending: isUpdatePending,
    isError: isUpdateError,
    error: updateError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.updateRequestStatus,
  });

  // Transaction status
  const { isLoading: isUpdating, isSuccess: isUpdateSuccess } = useWaitForTransaction({
    hash: updateData?.hash,
    enabled: !!updateData?.hash,
  });

  const updateRequest = async (requestId, newStatus) => {
    try {
      // Check if the write function is available
      if (!updateRequestStatus) {
        throw new Error('Contract write function not initialized');
      }
      
      // Use the write method with proper args
      updateRequestStatus({ 
        args: [requestId, newStatus] 
      });
      
      // Note: In Wagmi v2, write() doesn't return a promise
      // The transaction status will be tracked via the useWaitForTransaction hook
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  };

  return {
    // Read functions
    requestList,
    isLoadingRequests,

    // Write functions
    updateRequest,
    isUpdating: isUpdating || isUpdatePending,
    isUpdateSuccess,
    isUpdateError,
    updateError,
  };
}