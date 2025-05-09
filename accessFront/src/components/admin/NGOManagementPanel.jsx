import React, { useState } from 'react';
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
  Spinner,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

const NGOManagementPanel = () => {
  const [newNGOAddress, setNewNGOAddress] = useState('');
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  
  const {
    ngoList,
    isLoadingNGOs,
    checkAndRegisterNGO,
    isAdding,
    isCorrectNetwork,
    error: hookError,
  } = useNGOAccessControl();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleAddNGO = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet first',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!isCorrectNetwork) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to Sonic Blaze Testnet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!newNGOAddress || !newNGOAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await checkAndRegisterNGO(newNGOAddress);
      if (result.transactionHash) {
        toast({
          title: 'Transaction Submitted',
          description: 'The NGO registration transaction has been submitted',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setNewNGOAddress('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add NGO',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Network Status */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold">Network Status</Text>
            <Alert status={isCorrectNetwork ? 'success' : 'warning'}>
              <AlertIcon />
              {isCorrectNetwork 
                ? 'Connected to Sonic Blaze Testnet'
                : 'Please switch to Sonic Blaze Testnet in MetaMask'}
            </Alert>
          </VStack>
        </Box>

        {/* Wallet Status */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold">Wallet Status</Text>
            <Alert status={isConnected ? 'success' : 'warning'}>
              <AlertIcon />
              {isConnected 
                ? `Connected: ${address}`
                : 'Please connect your wallet'}
            </Alert>
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              colorScheme={isConnected ? 'red' : 'blue'}
            >
              {isConnected ? 'Disconnect' : 'Connect MetaMask'}
            </Button>
          </VStack>
        </Box>

        {/* Add NGO Form */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <form onSubmit={handleAddNGO}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>NGO Wallet Address</FormLabel>
                <HStack>
                  <Input
                    value={newNGOAddress}
                    onChange={(e) => setNewNGOAddress(e.target.value)}
                    placeholder="0x..."
                    isDisabled={isAdding || !isCorrectNetwork || !isConnected}
                  />
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isAdding}
                    leftIcon={<AddIcon />}
                    isDisabled={!isCorrectNetwork || !isConnected}
                  >
                    Add NGO
                  </Button>
                </HStack>
              </FormControl>
            </VStack>
          </form>
        </Box>

        {/* NGO List */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Registered NGOs
          </Text>
          
          {isLoadingNGOs ? (
            <Box textAlign="center" py={4}>
              <Spinner size="xl" />
            </Box>
          ) : ngoList?.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No NGOs registered yet
            </Alert>
          ) : (
            <VStack align="stretch" spacing={2}>
              {ngoList.map((ngo, index) => (
                <Alert key={index} status="success">
                  <AlertIcon />
                  <Text fontFamily="mono">{ngo}</Text>
                </Alert>
              ))}
            </VStack>
          )}
        </Box>

        {/* Error Display */}
        {hookError && (
          <Alert status="error">
            <AlertIcon />
            {hookError.message || 'An error occurred'}
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default NGOManagementPanel; 