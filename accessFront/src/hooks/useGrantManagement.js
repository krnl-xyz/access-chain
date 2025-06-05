import { useContractRead, useWaitForTransaction, useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { accessGrantAbi } from '../config/grantAbi';
import { ngoAccessControlAbi } from '../config/ngoAbi';
import { useState } from 'react';
import { createWalletClient, custom, parseEther, parseUnits, formatEther } from 'viem';
import { sonicBlaze } from '../config/chains';

export function useGrantManagement() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === 57054;
  const [isPending, setIsPending] = useState(false);
  const [lastTransactionHash, setLastTransactionHash] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [isTransactionComplete, setIsTransactionComplete] = useState(false);

  const publicClient = usePublicClient({ chainId: sonicBlaze.id });
  const { data: walletClient } = useWalletClient({ chainId: sonicBlaze.id });

  // Debug: Log all contract addresses to verify they're correct
  console.log('Contract Addresses:', {
    accessGrant: CONTRACT_ADDRESSES.accessGrant,
    ngoAccessControl: CONTRACT_ADDRESSES.ngoAccessControl,
    requestRegistry: CONTRACT_ADDRESSES.requestRegistry
  });
  
  // Warning if AccessGrant and RequestRegistry have the same address
  if (CONTRACT_ADDRESSES.accessGrant === CONTRACT_ADDRESSES.requestRegistry) {
    console.warn('WARNING: AccessGrant and RequestRegistry have the same contract address. This might cause function conflicts.');
  }

  console.log('Grant Contract Address:', CONTRACT_ADDRESSES.accessGrant);
  console.log('Network State:', { chainId, isCorrectNetwork, isConnected });

  // Check if user is an authorized NGO
  const {
    data: isNgoData,
    isLoading: isLoadingNgoStatus,
    refetch: refetchNgoStatus,
  } = useContractRead({
    address: CONTRACT_ADDRESSES.ngoAccessControl,
    abi: ngoAccessControlAbi,
    functionName: 'isAuthorizedNGO',
    args: [address || '0x0000000000000000000000000000000000000000'],
    enabled: Boolean(address) && isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Error checking NGO status:', error);
    }
  });

  const isAuthorizedNGO = Boolean(isNgoData);

  // Get All Grants
  const {
    data: grantsData,
    isLoading: isLoadingGrants,
    refetch: refetchGrants,
    error: grantsError
  } = useContractRead({
    address: CONTRACT_ADDRESSES.accessGrant,
    abi: accessGrantAbi,
    functionName: 'getGrants',
    enabled: isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Error fetching grants:', error);
    }
  });

  // Ensure grants is always an array and filter by NGO address
  const grants = Array.isArray(grantsData) ? grantsData : [];

  // Transaction Status
  const {
    isLoading: isTransactionPending,
    isSuccess: isTransactionConfirmed
  } = useWaitForTransaction({
    hash: lastTransactionHash,
    enabled: Boolean(lastTransactionHash),
    onSuccess: () => {
      refetchGrants();
      setIsSuccess(true);
      setIsPending(false);
      setIsTransactionComplete(true);
    },
    onError: (err) => {
      console.error('Transaction error:', err);
      setError(err);
      setIsPending(false);
      setIsTransactionComplete(false);
    }
  });

  // Generic contract write function
  const executeContractWrite = async (functionName, args) => {
    console.log(`Executing ${functionName}:`, {
      args,
      isConnected,
      isCorrectNetwork,
      address,
      contractAddress: CONTRACT_ADDRESSES.accessGrant
    });

    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    if (!isCorrectNetwork) {
      throw new Error('Please switch to Sonic Blaze Testnet (Chain ID: 57054)');
    }

    if (!address) {
      throw new Error('No wallet address available');
    }

    setIsPending(true);
    setIsSuccess(false);
    setError(null);

    try {
      // Create a wallet client using the injected provider (MetaMask, etc.)
      const walletClient = createWalletClient({
        chain: sonicBlaze,
        transport: custom(window.ethereum)
      });

      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Execute the contract write function with explicit gas settings
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: accessGrantAbi,
        functionName: functionName,
        args: args,
        account: address,
        // Add chain to ensure proper network connection
        chain: sonicBlaze,
        // Add gas configuration to avoid potential gas errors
        gas: BigInt(3000000), // Explicit gas limit
      });

      console.log(`${functionName} Transaction Hash:`, hash);
      setLastTransactionHash(hash);
      return hash;
    } catch (err) {
      console.error(`${functionName} Error Details:`, {
        message: err.message,
        cause: err.cause,
        code: err.code,
        details: err.details,
        functionName: functionName,
        contractAddress: CONTRACT_ADDRESSES.accessGrant,
        args: args,
      });
      
      // Provide more user-friendly error messages
      let errorMessage = err.message;
      
      if (err.message.includes('Internal JSON-RPC error')) {
        // Extract the specific revert reason if available
        const revertReason = err.message.match(/reverted with reason string '([^']+)'/);
        if (revertReason && revertReason[1]) {
          errorMessage = `Contract error: ${revertReason[1]}`;
        } else {
          errorMessage = 'Contract error: The transaction was rejected by the contract. Check if you have required permissions or if the parameters are valid.';
        }
      } else if (err.message.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected in your wallet.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees. Please add more SONIC to your wallet.';
      }
      
      setError({ ...err, message: errorMessage });
      setIsPending(false);
      throw { ...err, message: errorMessage };
    }
  };

  // Create Grant
  const createGrant = async (grantData) => {
    console.log('Creating Grant:', {
      grantData,
      isAuthorizedNGO,
      isConnected,
      isCorrectNetwork,
      address,
      contractAddress: CONTRACT_ADDRESSES.accessGrant
    });

    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    if (!isCorrectNetwork) {
      throw new Error('Please switch to Sonic Blaze Testnet (Chain ID: 57054)');
    }

    if (!isAuthorizedNGO) {
      throw new Error('Only authorized NGOs can create grants');
    }

    // Validate grant data
    if (!grantData.title || typeof grantData.title !== 'string' || grantData.title.trim() === '') {
      throw new Error('Grant title is required');
    }

    if (!grantData.description || typeof grantData.description !== 'string' || grantData.description.trim() === '') {
      throw new Error('Grant description is required');
    }

    if (!grantData.amount || isNaN(Number(grantData.amount)) || Number(grantData.amount) <= 0) {
      throw new Error('Grant amount must be a positive number');
    }

    if (!grantData.deadline || isNaN(Number(grantData.deadline)) || Number(grantData.deadline) <= Math.floor(Date.now() / 1000)) {
      throw new Error('Grant deadline must be in the future');
    }

    try {
      // Convert amount to Wei (assuming the amount is in Ether)
      let amountInWei;
      try {
        amountInWei = parseEther(grantData.amount.toString());
        console.log('Amount parsed successfully:', {
          original: grantData.amount,
          wei: amountInWei.toString()
        });
      } catch (error) {
        console.error('Error parsing amount to wei:', error);
        throw new Error('Invalid amount format. Please enter a valid number.');
      }

      // Ensure the deadline is properly formatted as BigInt
      const deadlineBigInt = BigInt(grantData.deadline);
      
      // Log the final parameters
      console.log('Final grant parameters:', {
        title: grantData.title,
        description: grantData.description,
        amount: amountInWei.toString(),
        deadline: deadlineBigInt.toString()
      });

      return executeContractWrite('createGrant', [
        grantData.title,
        grantData.description,
        amountInWei,
        deadlineBigInt
      ]);
    } catch (error) {
      console.error('Error preparing grant data:', error);
      throw error;
    }
  };

  // Apply for Grant
  const applyForGrant = async (grantId, proposal) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    if (!isCorrectNetwork) {
      throw new Error('Please switch to Sonic Blaze Testnet (Chain ID: 57054)');
    }

    if (!address) {
      throw new Error('No wallet address available');
    }

    setIsPending(true);
    setError(null);

    try {
      // Create a wallet client using the injected provider (MetaMask, etc.)
      const walletClient = createWalletClient({
        chain: sonicBlaze,
        transport: custom(window.ethereum)
      });

      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Execute the contract write function with explicit gas settings
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: accessGrantAbi,
        functionName: 'applyForGrant',
        args: [grantId, proposal],
        account: address,
        chain: sonicBlaze,
        gas: BigInt(3000000), // Explicit gas limit
      });

      console.log('Apply for Grant Transaction Hash:', hash);
      setLastTransactionHash(hash);
      setIsTransactionLoading(true);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setIsTransactionComplete(true);
      setIsSuccess(true);

      return receipt;
    } catch (err) {
      console.error('Error applying for grant:', err);
      
      // Provide more user-friendly error messages
      let errorMessage = err.message;
      
      if (err.message.includes('Internal JSON-RPC error')) {
        const revertReason = err.message.match(/reverted with reason string '([^']+)'/);
        if (revertReason && revertReason[1]) {
          errorMessage = `Contract error: ${revertReason[1]}`;
        } else {
          errorMessage = 'Contract error: The transaction was rejected by the contract. Check if you have required permissions or if the parameters are valid.';
        }
      } else if (err.message.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected in your wallet.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees. Please add more SONIC to your wallet.';
      }
      
      setError({ ...err, message: errorMessage });
      throw { ...err, message: errorMessage };
    } finally {
      setIsPending(false);
      setIsTransactionLoading(false);
    }
  };

  // Approve Application
  const approveApplication = async (grantId, applicationId) => {
    if (!walletClient) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsPending(true);
      setError(null);

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'approveApplication',
        args: [grantId, applicationId],
        account: walletClient.account.address,
      });

      const hash = await walletClient.writeContract(request);
      setIsTransactionLoading(true);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setIsTransactionComplete(true);
      setIsSuccess(true);

      return receipt;
    } catch (err) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
      throw err;
    } finally {
      setIsPending(false);
      setIsTransactionLoading(false);
    }
  };

  // Reject Application
  const rejectApplication = async (grantId, applicationId) => {
    if (!walletClient) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsPending(true);
      setError(null);

      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'rejectApplication',
        args: [grantId, applicationId],
        account: walletClient.account.address,
      });

      const hash = await walletClient.writeContract(request);
      setIsTransactionLoading(true);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setIsTransactionComplete(true);
      setIsSuccess(true);

      return receipt;
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError(err.message || 'Failed to reject application');
      throw err;
    } finally {
      setIsPending(false);
      setIsTransactionLoading(false);
    }
  };

  // Format grants data for UI with proper NGO filtering
  const formattedGrants = grants.map(grant => {
    // Ensure we have valid data
    if (!grant || !grant.ngo) {
      console.log('Invalid grant data:', grant);
      return null;
    }

    // Format the grant data
    const formattedGrant = {
    id: Number(grant.id),
    title: grant.title,
    description: grant.description,
    amount: grant.amount.toString(),
    deadline: Number(grant.deadline),
      ngo: grant.ngo.toLowerCase(), // Normalize NGO address to lowercase
    isActive: grant.isActive,
    deadlineDate: new Date(Number(grant.deadline) * 1000).toLocaleString(),
    isExpired: Number(grant.deadline) < Math.floor(Date.now() / 1000),
    isOwnedByCurrentUser: grant.ngo.toLowerCase() === (address || '').toLowerCase()
    };

    console.log('Formatted grant:', {
      id: formattedGrant.id,
      ngo: formattedGrant.ngo,
      title: formattedGrant.title,
      isOwnedByCurrentUser: formattedGrant.isOwnedByCurrentUser,
      rawNGO: grant.ngo // Log the raw NGO address for debugging
    });

    return formattedGrant;
  }).filter(Boolean); // Remove any null grants

  // Debug log all grants with their NGO addresses
  console.log('All formatted grants:', formattedGrants.map(g => ({
    id: g.id,
    ngo: g.ngo,
    rawNGO: g.rawNGO,
    title: g.title,
    isOwnedByCurrentUser: g.isOwnedByCurrentUser
  })));

  // Add getNGODonations function to get donation data
  const getNGODonations = async (ngoAddress) => {
    if (!publicClient || !ngoAddress) return { total: "0", transactions: [] };
    
    try {
      console.log("Fetching donations for NGO:", ngoAddress);
      
      // Get the current balance of the NGO address
      const balance = await publicClient.getBalance({
        address: ngoAddress,
      });
      
      // Format the balance to a readable string
      const formattedBalance = formatEther(balance);
      
      // In a real application, you would query transaction history 
      // from an indexer or explorer API to get actual donation transactions
      // For this demo, we'll assume the entire balance came from donations
      
      return {
        total: formattedBalance,
        transactions: [],  // Would contain actual transaction history in a real app
      };
    } catch (error) {
      console.error("Error fetching NGO donations:", error);
      return { total: "0", transactions: [] };
    }
  };

  const getGrantApplications = async (grantId) => {
    try {
      const applications = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'getGrantApplications',
        args: [grantId],
      });

      return applications;
    } catch (err) {
      console.error('Error fetching grant applications:', err);
      setError(err.message || 'Failed to fetch grant applications');
      throw err;
    }
  };

  const getApplicationDetails = async (grantId, applicationId) => {
    try {
      const application = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'getApplication',
        args: [grantId, applicationId],
      });

      return application;
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError(err.message || 'Failed to fetch application details');
      throw err;
    }
  };

  return {
    // Read States
    grants: formattedGrants,
    isLoadingGrants,
    grantsError,
    isAuthorizedNGO,
    isLoadingNgoStatus,

    // Write Functions
    createGrant,
    applyForGrant,
    approveApplication,
    rejectApplication,
    
    // Donation Functions
    getNGODonations,

    // Transaction States
    isPending,
    isSuccess,
    error,
    isTransactionLoading,
    isTransactionPending,
    isTransactionComplete,
    isTransactionConfirmed,

    // Refetch Functions
    refetchGrants,
    refetchNgoStatus,

    // Network State
    isCorrectNetwork,
    chainId,

    // New functions
    getGrantApplications,
    getApplicationDetails
  };
}