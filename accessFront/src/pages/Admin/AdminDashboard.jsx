import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
} from '@chakra-ui/react';
import { useAccount, usePublicClient, useContractRead, useSwitchNetwork } from 'wagmi';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CONTRACT_FUNCTIONS } from '../../config/contracts';
import { useRequestRegistry, RequestStatus } from '../../hooks/useRequestRegistry';
import NGOManagementPanel from '../../components/admin/NGOManagementPanel';

const AdminDashboard = () => {
  const { address, isConnected } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const publicClient = usePublicClient();
  const toast = useToast();
  const [networkName, setNetworkName] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({
    totalGrants: 0,
    pendingApprovals: 0,
    totalDonations: '0',
    activeNGOs: 0,
  });

  const { 
    ngoList,
    isCorrectNetwork,
  } = useNGOAccessControl();

  const { 
    updateRequest,
    isUpdating,
    isUpdateSuccess,
    isUpdateError,
    updateError
  } = useRequestRegistry();

  // Fetch request data
  const { data: requestList, isLoading: isLoadingRequests } = useContractRead({
    address: CONTRACT_ADDRESSES.requestRegistry,
    abi: CONTRACT_ABIS.requestRegistry,
    functionName: CONTRACT_FUNCTIONS.getUserRequests,
    args: [address],
    watch: true,
  });

  // Update stats when data changes
  useEffect(() => {
    if (ngoList) {
      setStats(prev => ({
        ...prev,
        activeNGOs: ngoList?.length ?? 0
      }));
    }
  }, [ngoList]);

  // Fetch request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!requestList || !publicClient) return;

      try {
        const details = await Promise.all(
          requestList.map(async (requestId) => {
            const [applicant, metadataURI, status] = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.requestRegistry,
              abi: CONTRACT_ABIS.requestRegistry,
              functionName: CONTRACT_FUNCTIONS.getRequestDetails,
              args: [requestId],
            });

            // Fetch metadata from URI
            let metadata = { title: 'Loading...', amount: '0', category: 'unknown' };
            try {
              if (metadataURI.startsWith('http')) {
                const response = await fetch(metadataURI);
                metadata = await response.json();
              }
            } catch (error) {
              console.error('Error fetching metadata:', error);
            }

            return {
              id: requestId.toString(),
              title: metadata.title,
              applicant,
              amount: metadata.amount,
              category: metadata.category,
              status,
              metadataURI,
            };
          })
        );

        const pending = details.filter(req => req.status === 0);
        setPendingRequests(pending);
        setStats(prev => ({
          ...prev,
          totalGrants: details.length,
          pendingApprovals: pending.length,
        }));
      } catch (error) {
        console.error('Error fetching request details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch request details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchRequestDetails();
  }, [requestList, publicClient, toast]);

  // Get network name
  useEffect(() => {
    const getNetworkName = async () => {
      if (publicClient) {
        try {
          const chainId = await publicClient.getChainId();
          const chain = publicClient.chain;
          setNetworkName(chain?.name || `Chain ID: ${chainId}`);
        } catch (error) {
          console.error('Error getting network:', error);
          setNetworkName('Unknown Network');
        }
      }
    };

    getNetworkName();
  }, [publicClient]);

  // Show wallet connection status
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to continue',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isConnected, toast]);

  // Show success/error messages for request updates
  useEffect(() => {
    if (isUpdateSuccess) {
      toast({
        title: 'Request Updated',
        description: 'The grant request has been successfully updated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isUpdateSuccess, toast]);

  useEffect(() => {
    if (isUpdateError) {
      toast({
        title: 'Update Failed',
        description: updateError?.message || 'Failed to update the grant request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isUpdateError, updateError, toast]);

  // Pre-compute color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const handleApproveGrant = async (requestId) => {
    try {
      await updateRequest(requestId, RequestStatus.APPROVED);
      toast({
        title: 'Approving grant...',
        description: 'Please wait while the transaction is being processed',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error approving grant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve grant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRejectGrant = async (requestId) => {
    try {
      await updateRequest(requestId, RequestStatus.REJECTED);
      toast({
        title: 'Rejecting grant...',
        description: 'Please wait while the transaction is being processed',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error rejecting grant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject grant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="7xl" py={8}>
        {/* Header */}
        <Box mb={8}>
          <Heading size="xl" mb={2}>Admin Dashboard</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Manage NGOs, grants, and system settings
          </Text>
        </Box>

        {/* Network Status */}
        <Alert
          status={isCorrectNetwork ? 'success' : 'warning'}
          variant="subtle"
          mb={8}
          borderRadius="lg"
        >
          <AlertIcon />
          <HStack spacing={4} width="100%" justify="space-between">
            <Text>
              Connected to: {networkName}
            </Text>
            {!isCorrectNetwork && (
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => switchNetwork({ chainId: 57054 })}
              >
                Switch to Sonic Blaze
              </Button>
            )}
          </HStack>
        </Alert>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorderColor}
          >
            <StatLabel fontSize="sm" fontWeight="medium">Active NGOs</StatLabel>
            <StatNumber fontSize="3xl">{stats.activeNGOs}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {stats.activeNGOs} verified organizations
            </StatHelpText>
          </Stat>

          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorderColor}
          >
            <StatLabel fontSize="sm" fontWeight="medium">Total Grants</StatLabel>
            <StatNumber fontSize="3xl">{stats.totalGrants}</StatNumber>
            <StatHelpText>
              Active funding opportunities
            </StatHelpText>
          </Stat>

          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorderColor}
          >
            <StatLabel fontSize="sm" fontWeight="medium">Pending Approvals</StatLabel>
            <StatNumber fontSize="3xl">{stats.pendingApprovals}</StatNumber>
            <StatHelpText>
              Requests awaiting review
            </StatHelpText>
          </Stat>

          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={cardBorderColor}
          >
            <StatLabel fontSize="sm" fontWeight="medium">Total Donations</StatLabel>
            <StatNumber fontSize="3xl">{stats.totalDonations} ETH</StatNumber>
            <StatHelpText>
              Funds distributed
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Quick Actions */}
        <Box
          mb={8}
          p={6}
          bg={cardBg}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={cardBorderColor}
        >
          <Heading size="md" mb={4}>Quick Actions</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => window.location.href = '/admin/ngo-management'}
              leftIcon={<Box as="span" className="material-icons">group_add</Box>}
            >
              Manage NGOs
            </Button>
            <Button
              colorScheme="green"
              size="lg"
              onClick={() => window.location.href = '/grants'}
              leftIcon={<Box as="span" className="material-icons">volunteer_activism</Box>}
            >
              View Grants
            </Button>
            <Button
              colorScheme="purple"
              size="lg"
              onClick={() => window.location.href = '/admin/settings'}
              leftIcon={<Box as="span" className="material-icons">settings</Box>}
            >
              System Settings
            </Button>
          </SimpleGrid>
        </Box>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>NGO Management</Tab>
            <Tab>Pending Requests</Tab>
            <Tab>System Overview</Tab>
          </TabList>

          <TabPanels>
            {/* NGO Management Tab */}
            <TabPanel>
              <NGOManagementPanel />
            </TabPanel>

            {/* Pending Requests Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {isLoadingRequests ? (
                  <Box textAlign="center">
                    <Spinner size="xl" />
                  </Box>
                ) : pendingRequests.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    No pending requests to review
                  </Alert>
                ) : (
                  pendingRequests.map((request) => (
                    <Box
                      key={request.id}
                      p={6}
                      bg={cardBg}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={cardBorderColor}
                    >
                      <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={1}>
                          <Heading size="md">{request.title}</Heading>
                          <Text color={textColor}>
                            From: {request.applicant}
                          </Text>
                        </VStack>
                        <Badge colorScheme="yellow">Pending</Badge>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Button
                          colorScheme="green"
                          onClick={() => handleApproveGrant(request.id)}
                          isLoading={isUpdating}
                        >
                          Approve
                        </Button>
                        <Button
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleRejectGrant(request.id)}
                          isLoading={isUpdating}
                        >
                          Reject
                        </Button>
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
            </TabPanel>

            {/* System Overview Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box
                  p={6}
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={cardBorderColor}
                >
                  <Heading size="md" mb={4}>Contract Addresses</Heading>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">NGO Control:</Text>
                      <Text fontSize="sm" fontFamily="mono">
                        {CONTRACT_ADDRESSES.NGOAccessControl}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Grant Registry:</Text>
                      <Text fontSize="sm" fontFamily="mono">
                        {CONTRACT_ADDRESSES.AccessGrant}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box
                  p={6}
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={cardBorderColor}
                >
                  <Heading size="md" mb={4}>Network Status</Heading>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Current Network:</Text>
                      <Text>{networkName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Status:</Text>
                      <Badge colorScheme={isCorrectNetwork ? 'green' : 'red'}>
                        {isCorrectNetwork ? 'Connected' : 'Wrong Network'}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default AdminDashboard;