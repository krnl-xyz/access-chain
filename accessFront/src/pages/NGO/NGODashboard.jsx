import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient } from 'wagmi';
import { FaFileAlt, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import { useGrantRequests } from '../../hooks/useGrantRequests';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../config/contracts';
import { ethers } from 'ethers';

const NGODashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { isAuthorized, isLoadingAuthorization } = useNGOAccessControl();
  const {
    grantRequests,
    userRequests,
    isLoadingRequests,
    updateRequestStatus,
    isUpdating,
    isUpdateSuccess,
  } = useGrantRequests();

  const [activeGrants, setActiveGrants] = useState([]);
  const [isLoadingGrants, setIsLoadingGrants] = useState(true);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Fetch NGO's active grants
  useEffect(() => {
    const fetchNGOGrants = async () => {
      if (!address || !publicClient) return;
      
      try {
        setIsLoadingGrants(true);
        
        // In a real implementation, you would fetch grants from the blockchain
        // This is a mock implementation with example data
        const grants = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          functionName: 'getGrants',
        }).catch(() => {
          // If error or function doesn't exist, use mock data
          return [
            {
              id: 1,
              title: 'Clean Water Initiative',
              description: 'Funding for clean water projects in rural areas',
              amount: ethers.parseEther('5000'),
              deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
              ngo: address,
              isActive: true,
              applicationsCount: 3
            },
            {
              id: 2,
              title: 'Renewable Energy Fund',
              description: 'Supporting sustainable energy solutions for communities',
              amount: ethers.parseEther('8000'),
              deadline: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days from now
              ngo: address,
              isActive: true,
              applicationsCount: 1
            }
          ];
        });
        
        // Filter grants created by this NGO
        const ngoGrants = grants.filter(grant => 
          typeof grant.ngo === 'string' && 
          grant.ngo.toLowerCase() === address.toLowerCase()
        );
        
        // Format grants for display
        const formattedGrants = ngoGrants.map(grant => ({
          id: Number(grant.id || 0),
          title: grant.title || 'Untitled Grant',
          description: grant.description || 'No description available',
          amount: grant.amount ? ethers.formatEther(grant.amount.toString()) : '0',
          deadline: new Date(Number(grant.deadline || 0) * 1000).toLocaleDateString(),
          isActive: grant.isActive || false,
          applicationsCount: grant.applicationsCount || 0
        }));
        
        setActiveGrants(formattedGrants);
        
        // Calculate application statistics
        const stats = {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
        
        formattedGrants.forEach(grant => {
          stats.total += grant.applicationsCount || 0;
        });
        
        // In a real app, you would fetch these statistics from the blockchain
        stats.pending = Math.floor(stats.total * 0.6);
        stats.approved = Math.floor(stats.total * 0.3);
        stats.rejected = stats.total - stats.pending - stats.approved;
        
        setApplicationStats(stats);
      } catch (error) {
        console.error('Error fetching NGO grants:', error);
        toast({
          title: 'Error loading grants',
          description: error.message || 'Failed to load your grants',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingGrants(false);
      }
    };

    if (isAuthorized && address && publicClient) {
      fetchNGOGrants();
    }
  }, [isAuthorized, address, publicClient, toast]);

  // Redirect if not authorized
  useEffect(() => {
    if (!isLoadingAuthorization && !isAuthorized) {
      toast({
        title: 'Access Denied',
        description: 'You must be an authorized NGO to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [isAuthorized, isLoadingAuthorization, navigate, toast]);

  // Show success message when request status is updated
  useEffect(() => {
    if (isUpdateSuccess) {
      toast({
        title: 'Status Updated',
        description: 'Grant request status has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [isUpdateSuccess, toast]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateRequestStatus({
        args: [requestId, newStatus],
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update request status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      0: 'gray',
      1: 'blue',
      2: 'green',
      3: 'red',
    };
    const statusLabels = {
      0: 'Pending',
      1: 'Under Review',
      2: 'Approved',
      3: 'Rejected',
    };
    return (
      <Badge colorScheme={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  if (isLoadingAuthorization) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Verifying NGO status...</Text>
      </Container>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg">NGO Dashboard</Heading>
          <Text mt={2} color="gray.600">
            Manage your grants and track applications
          </Text>
        </Box>

        {/* Application Statistics */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card bg={cardBg} boxShadow="md" borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaFileAlt} color="blue.500" mr={2} />
                  <StatLabel>Total Applications</StatLabel>
                </Flex>
                <StatNumber>{applicationStats.total}</StatNumber>
                <StatHelpText>Across all grants</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} boxShadow="md" borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaUsers} color="yellow.500" mr={2} />
                  <StatLabel>Pending Review</StatLabel>
                </Flex>
                <StatNumber>{applicationStats.pending}</StatNumber>
                <StatHelpText>Awaiting decision</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} boxShadow="md" borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaCheckCircle} color="green.500" mr={2} />
                  <StatLabel>Approved</StatLabel>
                </Flex>
                <StatNumber>{applicationStats.approved}</StatNumber>
                <StatHelpText>Ready for funding</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} boxShadow="md" borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <Flex align="center" mb={2}>
                  <Icon as={FaTimesCircle} color="red.500" mr={2} />
                  <StatLabel>Rejected</StatLabel>
                </Flex>
                <StatNumber>{applicationStats.rejected}</StatNumber>
                <StatHelpText>Not approved</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Active Grants with Applications */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Your Active Grants</Heading>
            <Button
              colorScheme="green"
              onClick={() => navigate('/grants/create')}
            >
              Create New Grant
            </Button>
          </HStack>

          {isLoadingGrants ? (
            <Spinner />
          ) : activeGrants.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              You haven't created any grants yet. Create your first grant to start receiving applications.
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {activeGrants.map(grant => (
                <Card 
                  key={grant.id} 
                  bg={cardBg} 
                  boxShadow="md" 
                  borderColor={borderColor} 
                  borderWidth="1px"
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="md" noOfLines={1}>{grant.title}</Heading>
                      
                      <Text noOfLines={2} color="gray.600">{grant.description}</Text>
                      
                      <HStack>
                        <Tag colorScheme="blue" size="md">{grant.amount} SONIC</Tag>
                        <Tag colorScheme="gray" size="md">Deadline: {grant.deadline}</Tag>
                      </HStack>
                      
                      <Divider />
                      
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="medium">
                          {grant.applicationsCount} Application{grant.applicationsCount !== 1 ? 's' : ''}
                        </Text>
                        
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => navigate(`/ngo/grants/${grant.id}/applications`)}
                          isDisabled={grant.applicationsCount === 0}
                        >
                          Manage Applications
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>

        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Your Grant Requests</Heading>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/grant-request')}
            >
              New Grant Request
            </Button>
          </HStack>

          {isLoadingRequests ? (
            <Spinner />
          ) : userRequests?.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              You haven't submitted any grant requests yet.
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Amount</Th>
                    <Th>Category</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {userRequests?.map((request) => (
                    <Tr key={request.id}>
                      <Td>{request.title}</Td>
                      <Td>{request.amount} ACT</Td>
                      <Td>{request.category}</Td>
                      <Td>{getStatusBadge(request.status)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => navigate(`/grant/${request.id}`)}
                          >
                            View
                          </Button>
                          {request.status === 0 && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              isLoading={isUpdating}
                              onClick={() => handleStatusUpdate(request.id, 1)}
                            >
                              Start Review
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            All Grant Requests
          </Heading>
          {isLoadingRequests ? (
            <Spinner />
          ) : grantRequests?.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No grant requests have been submitted yet.
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Amount</Th>
                    <Th>Category</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {grantRequests?.map((request) => (
                    <Tr key={request.id}>
                      <Td>{request.title}</Td>
                      <Td>{request.amount} ACT</Td>
                      <Td>{request.category}</Td>
                      <Td>{getStatusBadge(request.status)}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => navigate(`/grant/${request.id}`)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default NGODashboard;