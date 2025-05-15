import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import { useGrantManagement } from '../../hooks/useGrantManagement';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../config/contracts';
import { ethers } from 'ethers';

const NGODashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { isAuthorized, isLoadingAuthorization } = useNGOAccessControl();
  
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
  
  // Filter for NGO's grants only
  const myGrants = grants.filter(grant => 
    grant.ngo.toLowerCase() === (address || '').toLowerCase()
  );
  
  // Active and expired grants
  const activeGrants = myGrants.filter(grant => grant.isActive);
  const expiredGrants = myGrants.filter(grant => !grant.isActive);
  
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

  // Redirect if not authorized
  useEffect(() => {
    if (!isLoadingAuthorization && !isAuthorized && !isAuthorizedNGO) {
      toast({
        title: 'Access Denied',
        description: 'You must be an authorized NGO to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [isAuthorized, isAuthorizedNGO, isLoadingAuthorization, navigate, toast]);
  
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
                <StatNumber>{myGrants.length}</StatNumber>
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
                <StatLabel>Active Grants</StatLabel>
                <StatNumber>{activeGrants.length}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text>Currently accepting applications</Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardBody>
              <Stat>
                <StatLabel>Expired Grants</StatLabel>
                <StatNumber>{expiredGrants.length}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={FaTimesCircle} color="red.500" />
                    <Text>Past deadline</Text>
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
                  {myGrants.reduce((total, grant) => 
                    total + parseFloat(formatEther(BigInt(grant.amount || 0))), 0).toFixed(2)} SONIC
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
        </SimpleGrid>

        {/* Active Grants Section */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">
              Active Grants ({activeGrants.length})
            </Heading>
            <Button 
              size="sm" 
              rightIcon={<ChevronRightIcon />} 
              variant="ghost"
              onClick={() => navigate('/grants')}
            >
              View All
            </Button>
          </Flex>

          {activeGrants.length === 0 ? (
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
              <CardBody textAlign="center" py={10}>
                <Icon as={FaFileAlt} boxSize={10} color="gray.400" mb={4} />
                <Text mb={4}>You don't have any active grants.</Text>
                <Button 
                  leftIcon={<AddIcon />} 
                  colorScheme="blue"
                  onClick={() => navigate('/ngo/create-grant')}
                >
                  Create New Grant
                </Button>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
              {activeGrants.map(grant => {
                const daysRemaining = calculateDaysRemaining(grant.deadline);
                const progress = calculateProgress(grant);
                
                return (
                  <Card 
                    key={grant.id} 
                    bg={cardBg} 
                    boxShadow="sm" 
                    borderRadius="lg"
                    transition="transform 0.2s, box-shadow 0.2s"
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                    overflow="hidden"
                  >
                    <Box bg={headerBg} p={4}>
                      <Flex justify="space-between" align="center">
                        <Heading size="sm" noOfLines={1}>
                          {grant.title}
                        </Heading>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                            size="sm"
                            aria-label="Options"
                          />
                          <MenuList>
                            <MenuItem 
                              icon={<FaEye />} 
                              onClick={() => navigate(`/grants/${grant.id}`)}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem 
                              icon={<FaUsers />}
                              onClick={() => navigate(`/ngo/grants/${grant.id}/applications`)}
                            >
                              View Applications
                            </MenuItem>
                            <MenuItem 
                              icon={<FaExternalLinkAlt />}
                              as="a"
                              href={`https://blazescan.io/address/${CONTRACT_ADDRESSES.accessGrant}`}
                              target="_blank"
                            >
                              View on Explorer
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Box>
                    
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Text noOfLines={2} color={secondaryTextColor} fontSize="sm">
                          {grant.description}
                        </Text>
                        
                        <HStack justify="space-between">
                          <Tag size="sm" colorScheme="green" variant="solid">
                            {formatEther(BigInt(grant.amount))} SONIC
                          </Tag>
                          <Tag size="sm" colorScheme={daysRemaining < 5 ? "red" : "blue"}>
                            <Icon as={FaClock} mr={1} />
                            {daysRemaining} days left
                          </Tag>
                        </HStack>
                        
                        <Box>
                          <Flex justify="space-between" mb={1}>
                            <Text fontSize="xs" color={secondaryTextColor}>Grant Progress</Text>
                            <Text fontSize="xs" color={secondaryTextColor}>{Math.round(progress)}%</Text>
                          </Flex>
                          <Progress value={progress} size="xs" colorScheme="blue" borderRadius="full" />
                        </Box>
                        
                        <Button
                          mt={2}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          width="full"
                          rightIcon={<ExternalLinkIcon />}
                          onClick={() => navigate(`/ngo/grants/${grant.id}/applications`)}
                        >
                          Manage Applications
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </Box>

        {/* Expired Grants Section */}
        {expiredGrants.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Expired Grants ({expiredGrants.length})
            </Heading>
            
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg" overflow="hidden">
              <Table size="sm" variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Grant Name</Th>
                    <Th>Amount</Th>
                    <Th>Deadline</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {expiredGrants.map(grant => (
                    <Tr key={grant.id}>
                      <Td fontWeight="medium">{grant.title}</Td>
                      <Td>{formatEther(BigInt(grant.amount))} SONIC</Td>
                      <Td>{new Date(Number(grant.deadline) * 1000).toLocaleDateString()}</Td>
                      <Td>
                        <Badge colorScheme="red">Expired</Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Grant">
                            <IconButton
                              icon={<FaEye />}
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/grants/${grant.id}`)}
                              aria-label="View Grant"
                            />
                          </Tooltip>
                          <Tooltip label="View Applications">
                            <IconButton
                              icon={<FaUsers />}
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/ngo/grants/${grant.id}/applications`)}
                              aria-label="View Applications"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Card>
          </Box>
        )}

        {/* Quick Actions Card */}
        <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
          <Box bg={headerBg} p={4}>
            <Heading size="md">Quick Actions</Heading>
          </Box>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                variant="outline"
                size="lg"
                height="80px"
                onClick={() => navigate('/ngo/create-grant')}
              >
                Create New Grant
              </Button>
              
              <Button
                leftIcon={<FaUsers />}
                colorScheme="teal"
                variant="outline"
                size="lg"
                height="80px"
                onClick={() => navigate('/grants')}
              >
                View All Grants
              </Button>
              
              <Button
                leftIcon={<FaChartLine />}
                colorScheme="purple"
                variant="outline"
                size="lg"
                height="80px"
                isDisabled // This feature would be implemented in future
              >
                View Analytics
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default NGODashboard;