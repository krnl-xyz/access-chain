import { useContractRead, useContractWrite } from 'wagmi';
import { useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_FUNCTIONS } from '../config/contracts';

export function useGrantRegistry() {
  // Write functions for grant creation
  const { 
    data: createData, 
    write: createGrant,
    isPending: isCreatePending,
    isError: isCreateError,
    error: createError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.accessGrant,
    abi: CONTRACT_ABIS.accessGrant,
    functionName: CONTRACT_FUNCTIONS.createGrant,
  });

  // Read functions for grants
  const { data: grantList, isLoading: isLoadingGrants, refetch: refetchGrants } = useContractRead({
    address: CONTRACT_ADDRESSES.accessGrant,
    abi: CONTRACT_ABIS.accessGrant,
    functionName: CONTRACT_FUNCTIONS.getGrants,
    watch: true,
  });

  // Transaction status
  const { isLoading: isCreating, isSuccess: isCreateSuccess } = useWaitForTransaction({
    hash: createData?.hash,
  });

  const createNewGrant = async (title, description, amount, deadline) => {
    if (!createGrant) {
      throw new Error('Contract write function not initialized');
    }

    try {
      // Create metadata object
      const metadata = {
        title,
        description,
        amount: amount.toString(),
        deadline: deadline.toString(),
        createdAt: Date.now(),
      };

      // In a production environment, we would upload this to IPFS
      // For demo purposes, we'll use it directly
      const result = await createGrant({ 
        args: [
          title,
          metadata.description,
          amount,
          deadline
        ] 
      });
      return result;
    } catch (error) {
      console.error('Error creating grant:', error);
      throw error;
    }
  };

  return {
    // Write functions
    createNewGrant,
    isCreating: isCreating || isCreatePending,
    isCreateSuccess,
    isCreateError,
    createError,

    // Read functions
    grantList,
    isLoadingGrants,
    refetchGrants,
  };
}