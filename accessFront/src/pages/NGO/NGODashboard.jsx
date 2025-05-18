import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  Flex,
  Icon,
  Tag,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
} from '@chakra-ui/react';
import { 
  FaFileAlt, 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPlus, 
  FaEllipsisV,
  FaChartLine,
  FaExternalLinkAlt,
  FaEye,
  FaClock
} from 'react-icons/fa';
import { ChevronRightIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import { useGrantManagement } from '../../hooks/useGrantManagement';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../config/contracts';
import { ethers } from 'ethers';
import { NGOAccessControlABI, NGOAccessControlAddress } from '../../config/contracts';

const NGODashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { isAuthorized, isLoadingAuthorization } = useNGOAccessControl();
  const { ngoAddress } = useParams();
  const location = useLocation();
  const publicClient = usePublicClient();
  
  // Add state for local authorization check
  const [isLocalAuthorized, setIsLocalAuthorized] = useState(false);
  
  // Use the grant management hook
  const {
    grants, 
    isLoadingGrants, 
    isAuthorizedNGO, 
    refetchGrants,
    isCorrectNetwork
  } = useGrantManagement();

  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
        
  // Filter grants for this NGO with proper null checks and debug logging
  const ngoGrants = grants.filter(grant => {
    if (!grant || !grant.ngo || !ngoAddress) {
      console.log('Skipping grant due to missing data:', { 
        grantNGO: grant?.ngo, 
        ngoAddress,
        grantTitle: grant?.title 
      });
      return false;
    }
    
    // Normalize both addresses to lowercase for comparison
    const normalizedGrantNGO = grant.ngo.toLowerCase();
    const normalizedNGOAddress = ngoAddress.toLowerCase();
    
    const isMatch = normalizedGrantNGO === normalizedNGOAddress;
    console.log('Grant comparison:', {
      grantNGO: normalizedGrantNGO,
      ngoAddress: normalizedNGOAddress,
      isMatch,
      grantTitle: grant.title,
      grantId: grant.id,
      rawGrantNGO: grant.ngo, // Log the raw NGO address for debugging
      rawNGOAddress: ngoAddress // Log the raw NGO address for debugging
    });
    return isMatch;
  });

  // Calculate total funds with proper null checks
  const totalFunds = ngoGrants.reduce((total, grant) => {
    if (!grant || !grant.amount) return total;
    try {
      return total + parseFloat(formatEther(BigInt(grant.amount)));
    } catch (error) {
      console.error('Error calculating funds:', error);
      return total;
    }
  }, 0).toFixed(2);

  // Debug information
  console.log('NGO Dashboard State:', {
    ngoAddress,
    totalGrants: grants.length,
    filteredGrants: ngoGrants.length,
    grants: grants.map(g => ({
      ngo: g.ngo,
      rawNGO: g.rawNGO,
      title: g.title,
      amount: g.amount,
      id: g.id
    }))
  });

  // Remove the old myGrants, activeGrants, and expiredGrants variables since we're using ngoGrants
  const activeGrants = ngoGrants.filter(grant => grant.isActive);
  const expiredGrants = ngoGrants.filter(grant => !grant.isActive);
  
  // Calculate days remaining for a grant
  const calculateDaysRemaining = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = deadline - now;
    return Math.max(0, Math.floor(secondsRemaining / (60 * 60 * 24)));
  };
  
  // Calculate progress percentage based on time passed
  const calculateProgress = (grant) => {
    if (!grant.isActive) return 100;
    
    const now = Math.floor(Date.now() / 1000);
    const totalDuration = grant.deadline - grant.createdAt; // This is placeholder, createdAt not in the data yet
    const elapsed = now - grant.createdAt;
    
    // Fallback if createdAt is not available
    if (!grant.createdAt) {
      const daysRemaining = calculateDaysRemaining(grant.deadline);
      // Assume 30 days was the initial period if we don't have createdAt
      return Math.min(100, Math.max(0, 100 - (daysRemaining / 30) * 100));
      }
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  // Check if NGO is authorized
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const isAuthorizedData = await publicClient.readContract({
          address: NGOAccessControlAddress,
          abi: NGOAccessControlABI,
          functionName: 'isAuthorizedNGO',
          args: [ngoAddress],
        });
        setIsLocalAuthorized(Boolean(isAuthorizedData));
        console.log('NGO Authorization Check:', {
          ngoAddress,
          isAuthorized: Boolean(isAuthorizedData)
        });
      } catch (error) {
        console.error('Error checking NGO authorization:', error);
        setIsLocalAuthorized(false);
      }
    };

    if (ngoAddress) {
      checkAuthorization();
    }
  }, [ngoAddress, publicClient]);

  // Update the unauthorized check to use both authorization states
  useEffect(() => {
    if (!isLoadingAuthorization && !isAuthorized && !isAuthorizedNGO && !isLocalAuthorized) {
      toast({
        title: 'Access Denied',
        description: 'You must be an authorized NGO to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [isAuthorized, isAuthorizedNGO, isLocalAuthorized, isLoadingAuthorization, navigate, toast]);

  // Show warning if not on the correct network
  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      toast({
        title: 'Wrong Network',
        description: 'Please connect to the Sonic Blaze Testnet to interact with the app.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isConnected, isCorrectNetwork, toast]);

  // Show welcome message for new NGOs
  useEffect(() => {
    if (location.state?.isNewNGO) {
      toast({
        title: 'Welcome to AccessChain!',
        description: 'Your NGO has been successfully registered. You can now create and manage grants.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [location.state, toast]);

  // Loading state
  if (isLoadingAuthorization || isLoadingGrants) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="center" justify="center" minH="50vh">
          <Spinner size="xl" />
          <Text>Loading dashboard data...</Text>
        </VStack>
      </Container>
    );
  }

  // Unauthorized state
  if (!isAuthorized && !isAuthorizedNGO) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <Heading mt={4} mb={1} size="md">Access Denied</Heading>
          <Text>You must be an authorized NGO to view this dashboard.</Text>
        </Alert>
      </Container>
    );
  }

  // No wallet connected
  if (!isConnected) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="warning" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <Heading mt={4} mb={1} size="md">Wallet Not Connected</Heading>
          <Text mb={4}>Please connect your wallet to view your NGO dashboard.</Text>
          <Button colorScheme="blue" onClick={() => window.scrollTo(0, 0)}>Connect Wallet</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">NGO Dashboard</Heading>
            <Text mt={2} color={secondaryTextColor}>
            Manage your grants and track applications
          </Text>
        </Box>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue"
            onClick={() => navigate('/ngo/create-grant')}
          >
            Create New Grant
          </Button>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardBody>
              <Stat>
                <StatLabel>Total Grants</StatLabel>
                <StatNumber>{ngoGrants.length}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FaFileAlt} />
                    <Text>All your grants</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardBody>
              <Stat>
                <StatLabel>Total Funding</StatLabel>
                <StatNumber>
                  {totalFunds} SONIC
                </StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FaChartLine} color="blue.500" />
                    <Text>All grants combined</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardBody>
              <Stat>
                <StatLabel>Status</StatLabel>
                <StatNumber>
                  <Badge colorScheme="green" fontSize="md" p={1}>
                    Active
                  </Badge>
                </StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text>NGO is authorized</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Grants Table */}
        <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
          <CardBody>
            <Heading size="md" mb={4}>Your Grants</Heading>
            {isLoadingGrants ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" />
                <Text mt={4}>Loading grants...</Text>
              </Box>
            ) : ngoGrants.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No grants have been created yet. Click the button below to create your first grant.
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Grant Name</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Deadline</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {ngoGrants.map((grant) => (
                      <Tr key={grant.id}>
                        <Td fontWeight="medium">{grant.title}</Td>
                        <Td isNumeric>{formatEther(BigInt(grant.amount))} SONIC</Td>
                        <Td>{new Date(grant.deadline * 1000).toLocaleDateString()}</Td>
                        <Td>
                          <Badge colorScheme={grant.isActive ? "green" : "red"}>
                            {grant.isActive ? "Active" : "Expired"}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => navigate(`/grants/${grant.id}`)}
                          >
                            View Details
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Create Grant Button */}
        <Box mt={8} textAlign="center">
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => navigate('/grants/create')}
          >
            Create New Grant
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default NGODashboard;