import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { NGOAccessControlABI, NGOAccessControlAddress } from '../../config/contracts';

const NGOManagement = () => {
  const [newNGOAddress, setNewNGOAddress] = useState('');
  const [ngos, setNGOs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      const ngoCount = await publicClient.readContract({
        address: NGOAccessControlAddress,
        abi: NGOAccessControlABI,
        functionName: 'getNGOCount',
      });

      const ngoList = [];
      for (let i = 0; i < ngoCount; i++) {
        const ngo = await publicClient.readContract({
          address: NGOAccessControlAddress,
          abi: NGOAccessControlABI,
          functionName: 'getNGOByIndex',
          args: [i],
        });
        ngoList.push(ngo);
      }
      setNGOs(ngoList);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch NGOs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addNGO = async () => {
    if (!newNGOAddress) {
      toast({
        title: 'Error',
        description: 'Please enter an NGO address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        address: NGOAccessControlAddress,
        abi: NGOAccessControlABI,
        functionName: 'addNGO',
        args: [newNGOAddress],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });

      toast({
        title: 'Success',
        description: 'NGO added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setNewNGOAddress('');
      fetchNGOs();
    } catch (error) {
      console.error('Error adding NGO:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add NGO',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeNGO = async (ngoAddress) => {
    setIsLoading(true);
    try {
      const { request } = await publicClient.simulateContract({
        address: NGOAccessControlAddress,
        abi: NGOAccessControlABI,
        functionName: 'removeNGO',
        args: [ngoAddress],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });

      toast({
        title: 'Success',
        description: 'NGO removed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchNGOs();
    } catch (error) {
      console.error('Error removing NGO:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove NGO',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">NGO Management</Heading>

        <Box p={6} bg={bgColor} borderRadius="xl" boxShadow="lg">
          <VStack spacing={4}>
            <HStack width="100%">
              <Input
                placeholder="Enter NGO wallet address"
                value={newNGOAddress}
                onChange={(e) => setNewNGOAddress(e.target.value)}
              />
              <Button
                colorScheme="blue"
                onClick={addNGO}
                isLoading={isLoading}
                loadingText="Adding..."
              >
                Add NGO
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Box p={6} bg={bgColor} borderRadius="xl" boxShadow="lg">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>NGO Address</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {ngos.map((ngo) => (
                <Tr key={ngo}>
                  <Td>{ngo}</Td>
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => removeNGO(ngo)}
                      isLoading={isLoading}
                    >
                      Remove
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default NGOManagement; 