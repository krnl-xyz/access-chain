import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { NGOAccessControlABI, NGOAccessControlAddress } from '../config/contracts';
import { createWalletClient, custom } from 'viem';
import { sonicBlaze } from '../config/chains';

const useAdminAccessControl = () => {
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ngoList, setNgoList] = useState([]);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === 57054; // Sonic Blaze Testnet

  // Function to add a new NGO
  const addNGO = async (ngoAddress) => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error('Please connect your wallet and switch to Sonic Blaze Testnet');
    }

    try {
      // Create wallet client
      const walletClient = createWalletClient({
        chain: sonicBlaze,
        transport: custom(window.ethereum)
      });

      // Prepare transaction
      const { request } = await publicClient.simulateContract({
        address: NGOAccessControlAddress,
        abi: NGOAccessControlABI,
        functionName: 'addNGO',
        args: [ngoAddress],
        account: address,
      });

      // Send transaction
      const hash = await walletClient.writeContract(request);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        // Update NGO list
        const updatedNGOs = [...ngoList, ngoAddress];
        setNgoList(updatedNGOs);
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error adding NGO:', error);
      throw error;
    }
  };

  // Function to fetch NGO list
  const fetchNGOList = async () => {
    try {
      const ngoListData = await publicClient.readContract({
        address: NGOAccessControlAddress,
        abi: NGOAccessControlABI,
        functionName: 'getNGOs',
      });
      setNgoList(Array.isArray(ngoListData) ? ngoListData : []);
    } catch (error) {
      console.error('Error fetching NGO list:', error);
      setNgoList([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("useAdminAccessControl - Initial state:", { 
      address, 
      isConnected,
      contractAddress: NGOAccessControlAddress,
      isAdmin: true,
      chainId,
      isCorrectNetwork
    });

    if (mounted && isConnected && isCorrectNetwork) {
      fetchNGOList();
      setIsAdmin(true);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [address, isConnected, publicClient, chainId, isCorrectNetwork]);

  return { 
    isOwner, 
    isAdmin, 
    isLoading, 
    isCorrectNetwork, 
    ngoList,
    addNGO,
    fetchNGOList
  };
};

export default useAdminAccessControl; 