import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRequestRegistry } from '../hooks/useRequestRegistry';
import { useNGOAccessControl } from '../hooks/useNGOAccessControl';

const ContractContext = createContext();

export function ContractProvider({ children }) {
  const { address, isConnected } = useAccount();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Contract hooks
  const {
    requestDetails,
    userRequests,
    isLoadingRequest,
    isLoadingUserRequests,
    submitRequest,
    updateRequestStatus,
    isSubmitting,
    isSubmitSuccess,
    isUpdating,
    isUpdateSuccess,
  } = useRequestRegistry();

  const {
    isAuthorized,
    ngoList,
    isLoadingAuthorization,
    isLoadingNGOs,
    addNGO,
    removeNGO,
    isAdding,
    isAddSuccess,
    isRemoving,
    isRemoveSuccess,
  } = useNGOAccessControl();

  // Determine user role based on contract state
  useEffect(() => {
    const determineUserRole = async () => {
      if (!isConnected) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is an authorized NGO
        if (isAuthorized) {
          setUserRole('ngo');
        } else {
          // Check if user has any NFTs or tokens to determine if they're a donor
          // This will be implemented when we add the NFT and token hooks
          setUserRole('donor');
        }
      } catch (error) {
        console.error('Error determining user role:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    determineUserRole();
  }, [isConnected, isAuthorized]);

  const value = {
    // User state
    userRole,
    isLoading,

    // Request management
    requestDetails,
    userRequests,
    isLoadingRequest,
    isLoadingUserRequests,
    submitRequest,
    updateRequestStatus,
    isSubmitting,
    isSubmitSuccess,
    isUpdating,
    isUpdateSuccess,

    // NGO management
    isAuthorized,
    ngoList,
    isLoadingAuthorization,
    isLoadingNGOs,
    addNGO,
    removeNGO,
    isAdding,
    isAddSuccess,
    isRemoving,
    isRemoveSuccess,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
} 