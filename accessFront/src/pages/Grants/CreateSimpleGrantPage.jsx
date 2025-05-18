import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient, useChainId } from 'wagmi';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
  Card,
  CardBody,
  Badge
} from '@chakra-ui/react';
import { WarningIcon, InfoIcon, ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../config/contracts';
import { sonicBlaze } from '../../config/chains';

const CreateSimpleGrantPage = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isAuthorizedNGO, setIsAuthorizedNGO] = useState(false);
  const [checking, setChecking] = useState(true);
  const [networkStatus, setNetworkStatus] = useState({
    isCorrectNetwork: false,
    networkName: ''
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: ''
  });

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check if user is an authorized NGO
  useEffect(() => {
    const checkNGOStatus = async () => {
      if (!isConnected || !address || !publicClient) return;
      
      try {
        setChecking(true);
        const ngoStatus = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.ngoAccessControl,
          abi: CONTRACT_ABIS.ngoAccessControl,
          functionName: 'isAuthorizedNGO',
          args: [address]
        });
        
        setIsAuthorizedNGO(ngoStatus);
      } catch (error) {
        console.error('Error checking NGO status:', error);
        toast({
          title: 'Error',
          description: 'Failed to check NGO authorization status',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setChecking(false);
      }
    };
    
    checkNGOStatus();
  }, [address, isConnected, publicClient, toast]);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      if (!publicClient) return;
      
      try {
        const currentChainId = await publicClient.getChainId();
        setNetworkStatus({
          isCorrectNetwork: currentChainId === sonicBlaze.id,
          networkName: currentChainId === sonicBlaze.id ? 'Sonic Blaze Testnet' : `Unknown (${currentChainId})`
        });
        
        console.log('Network check:', { 
          currentChainId, 
          expectedChainId: sonicBlaze.id, 
          isCorrect: currentChainId === sonicBlaze.id 
        });
      } catch (error) {
        console.error('Error checking network:', error);
      }
    };
    
    checkNetwork();
  }, [publicClient, chainId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!networkStatus.isCorrectNetwork) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to Sonic Blaze Testnet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!isAuthorizedNGO) {
      toast({
        title: 'Error',
        description: 'Only authorized NGOs can create grants',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!walletClient) {
      toast({
        title: 'Error',
        description: 'Wallet client not available',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Validate form data
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: 'Error',
        description: 'Description is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Amount must be a positive number',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!formData.deadline) {
      toast({
        title: 'Error',
        description: 'Deadline is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert deadline to Unix timestamp
      const deadlineDate = new Date(formData.deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
      
      // Convert amount to wei
      const amountInWei = ethers.parseEther(formData.amount.toString());
      
      // Create grant
      toast({
        title: 'Processing',
        description: 'Submitting transaction. Please confirm in your wallet...',
        status: 'info',
        duration: null,
        isClosable: false,
      });
      
      console.log('Creating grant with params:', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: amountInWei.toString(),
        deadline: BigInt(deadlineTimestamp).toString(),
        chainId: sonicBlaze.id,
        account: address,
        contractAddress: CONTRACT_ADDRESSES.accessGrant,
        isAuthorizedNGO,
        connectedAddress: address
      });
      
      // Prepare transaction parameters with chain specified
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'createGrant',
        args: [
          formData.title.trim(),
          formData.description.trim(),
          amountInWei,
          BigInt(deadlineTimestamp)
        ],
        chain: sonicBlaze,
        account: address
      });
      
      console.log('Grant creation transaction submitted:', {
        hash,
        account: address,
        contractAddress: CONTRACT_ADDRESSES.accessGrant
      });
      
      toast.closeAll(); // Close any existing toasts
      
      toast({
        title: 'Success',
        description: 'Grant creation transaction submitted!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        deadline: ''
      });
      
      // Navigate to grants page after a short delay
      setTimeout(() => {
        navigate('/grants');
      }, 2000);
    } catch (error) {
      console.error('Error creating grant:', error);
      
      toast.closeAll(); // Close any existing toasts
      
      // Extract meaningful error messages
      let errorMessage = 'Failed to create grant';
      
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected in your wallet';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 64px)" py={10}>
        <Container maxW="4xl">
          <Card bg={cardBg} borderColor={borderColor} borderWidth={1} p={8}>
            <CardBody>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text fontSize="lg" color="blue.400">Checking NGO authorization status...</Text>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 64px)" py={10}>
        <Container maxW="4xl">
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="xl"
            p={8}
            bg={cardBg}
            borderWidth={1}
            borderColor={borderColor}
          >
            <Icon as={WarningIcon} boxSize={12} color="yellow.400" mb={4} />
            <AlertTitle fontSize="2xl" mb={2}>Wallet Connection Required</AlertTitle>
            <AlertDescription maxW="sm" mb={6}>
              Please connect your wallet to create grants.
            </AlertDescription>
            <Button
              colorScheme="yellow"
              size="lg"
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!isAuthorizedNGO) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 64px)" py={10}>
        <Container maxW="4xl">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="xl"
            p={8}
            bg={cardBg}
            borderWidth={1}
            borderColor={borderColor}
          >
            <Icon as={InfoIcon} boxSize={12} color="red.400" mb={4} />
            <AlertTitle fontSize="2xl" mb={2}>Authorization Required</AlertTitle>
            <AlertDescription maxW="sm" mb={4}>
              Only authorized NGOs can create grants.
            </AlertDescription>
            <Badge
              px={4}
              py={2}
              mb={6}
              borderRadius="lg"
              bg="gray.700"
              color="gray.300"
              fontFamily="mono"
            >
              {address}
            </Badge>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                size="lg"
                leftIcon={<ArrowBackIcon />}
                onClick={() => navigate('/grants')}
              >
                Browse Grants
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </HStack>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={10}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="2xl" mb={2}>Create New Grant</Heading>
            <Text color="gray.500">Provide funding opportunities through your organization</Text>
          </Box>

          {/* Network Status Banner */}
          {!networkStatus.isCorrectNetwork && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Wrong Network</AlertTitle>
                <AlertDescription display="block">
                  Please switch to Sonic Blaze Testnet to create grants. Current network: {networkStatus.networkName}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Grant Title</FormLabel>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="E.g., Community Health Initiative"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the purpose of this grant, requirements, and expected outcomes"
                      size="lg"
                      rows={5}
                    />
                  </FormControl>

                  <HStack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Amount (ETH)</FormLabel>
                      <Input
                        name="amount"
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Deadline</FormLabel>
                      <Input
                        name="deadline"
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        size="lg"
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} pt={6}>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      type="submit"
                      isLoading={loading}
                      loadingText="Creating Grant..."
                      leftIcon={<CheckIcon />}
                      flex={1}
                    >
                      Create Grant
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/grants')}
                      leftIcon={<ArrowBackIcon />}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateSimpleGrantPage;