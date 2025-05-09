import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Card,
  CardBody,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, NGOAccessControlABI } from '../config/contracts';
import { sonicBlaze } from '../config/chains';

const NGOManagement = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const toast = useToast();

  const [ngoAddress, setNgoAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    networkName: '',
    error: null
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Function to call contract with retries
  const callContractWithRetry = useCallback(async (contractCall, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1} for contract call`);
        const result = await contractCall();
        console.log("Contract call successful:", result);
        return result;
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;
        // Wait before retrying (exponential backoff)
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
    throw lastError;
  }, []);

  // Check network connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (!publicClient) {
        setConnectionStatus({
          connected: false,
          networkName: '',
          error: 'Public client not available'
        });
        return;
      }

      try {
        const chainId = await publicClient.getChainId();
        console.log("Current chain ID:", chainId, "Expected:", sonicBlaze.id);
        
        setConnectionStatus({
          connected: true,
          networkName: chainId === sonicBlaze.id ? 'Sonic Blaze Testnet' : `Unknown (${chainId})`,
          error: chainId !== sonicBlaze.id ? 'Wrong network, please connect to Sonic Blaze Testnet' : null
        });
      } catch (error) {
        console.error('Network connection error:', error);
        setConnectionStatus({
          connected: false,
          networkName: '',
          error: `Connection error: ${error.message}`
        });
      }
    };

    checkConnection();
  }, [publicClient]);

  // Check if the current user is the contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (!isConnected || !address || !publicClient) {
        setIsOwner(false);
        setCheckingOwnership(false);
        return;
      }

      try {
        console.log("Checking ownership with address:", CONTRACT_ADDRESSES.NGOAccessControl);
        
        const ownerData = await callContractWithRetry(() => 
          publicClient.readContract({
            address: CONTRACT_ADDRESSES.NGOAccessControl,
            abi: NGOAccessControlABI,
            functionName: 'owner'
          })
        );

        console.log('Owner check successful:', { ownerAddress: ownerData, userAddress: address });
        setIsOwner(ownerData.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error('Error checking ownership:', error);
        toast({
          title: 'Error Checking Ownership',
          description: `Failed to verify contract ownership: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsOwner(false);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [address, isConnected, publicClient, toast, callContractWithRetry]);

  const validateAddress = (address) => {
    if (!address) return 'Address is required';
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) return 'Invalid Ethereum address format';
    return null;
  };

  const handleAddNGO = async (e) => {
    e.preventDefault();
    
    // Input validation
    const validationError = validateAddress(ngoAddress);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!isOwner) {
      toast({
        title: 'Permission Denied',
        description: 'Only the contract owner can add NGOs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Check if address is already an NGO
      const isAlreadyNGO = await callContractWithRetry(() => 
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.NGOAccessControl,
          abi: NGOAccessControlABI,
          functionName: 'isAuthorizedNGO',
          args: [ngoAddress],
        })
      );

      if (isAlreadyNGO) {
        toast({
          title: 'Already Registered',
          description: 'This address is already registered as an NGO',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        setNgoAddress('');
        return;
      }

      // Add NGO
      console.log("Adding NGO with address:", ngoAddress);
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.NGOAccessControl,
        abi: NGOAccessControlABI,
        functionName: 'addNGO',
        args: [ngoAddress],
      });

      toast({
        title: 'Transaction Submitted',
        description: 'Adding NGO transaction has been submitted',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        toast({
          title: 'Success',
          description: 'NGO has been successfully added',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setNgoAddress('');
      }
    } catch (error) {
      console.error('Error adding NGO:', error);
      
      // Handle specific error cases
      if (error.message?.includes('user rejected')) {
        toast({
          title: 'Transaction Rejected',
          description: 'You rejected the transaction in your wallet',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add NGO',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingOwnership) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Alert
        status="warning"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Wallet Not Connected
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Please connect your wallet to manage NGOs
        </AlertDescription>
      </Alert>
    );
  }

  if (connectionStatus.error) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Network Connection Error
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {connectionStatus.error}
          <Text mt={2}>
            Please make sure you're connected to the Sonic Blaze Testnet and try again.
          </Text>
        </AlertDescription>
      </Alert>
    );
  }

  if (!isOwner) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Access Denied
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Only the contract owner can manage NGOs
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Card
        maxW="xl"
        mx="auto"
        bg={cardBg}
        borderColor={borderColor}
        borderWidth={1}
      >
        <CardBody>
          <VStack spacing={6}>
            <Text fontSize="2xl" fontWeight="bold">
              Add New NGO
            </Text>
            
            <Box w="100%">
              <Badge colorScheme={connectionStatus.connected ? 'green' : 'red'}>
                {connectionStatus.connected ? `Connected to ${connectionStatus.networkName}` : 'Not Connected'}
              </Badge>
            </Box>
            
            <form onSubmit={handleAddNGO} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>NGO Wallet Address</FormLabel>
                  <Input
                    value={ngoAddress}
                    onChange={(e) => setNgoAddress(e.target.value)}
                    placeholder="0x..."
                    size="lg"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={loading}
                  loadingText="Adding NGO..."
                  width="100%"
                >
                  Add NGO
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default NGOManagement; 