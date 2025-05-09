import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAccount, useContractRead, useWalletClient, usePublicClient } from 'wagmi';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  SimpleGrid, 
  VStack, 
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  Divider,
  Icon,
  useColorModeValue,
  Flex,
  Skeleton,
  Center,
  useToast,
  Tooltip,
  Avatar
} from '@chakra-ui/react';
import { AddIcon, ChevronRightIcon, TimeIcon, InfoIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

const GrantListing = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [loading, setLoading] = useState(true);
  const [grants, setGrants] = useState([]);
  const [isNGO, setIsNGO] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Color mode values for UI
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const expiredHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const activeBadgeBg = useColorModeValue('green.100', 'green.800');
  const expiredBadgeBg = useColorModeValue('gray.100', 'gray.700');
  const ownedBadgeBg = useColorModeValue('purple.100', 'purple.800');

  // We'll use these functions instead of the deprecated useContract hook
  const readGrantContract = async (functionName, args = []) => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName,
        args
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  const readNGOContract = async (functionName, args = []) => {
    try {
      return await publicClient.readContract({
        address: CONTRACT_ADDRESSES.ngoAccessControl,
        abi: CONTRACT_ABIS.ngoAccessControl,
        functionName,
        args
      });
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        
        // Get all grants
        const grantsData = await readGrantContract('getGrants');
        
        // Format grant data
        const formattedGrants = grantsData.map(grant => ({
          id: Number(grant.id),
          title: grant.title,
          description: grant.description,
          amount: ethers.formatEther(grant.amount.toString()),
          deadline: new Date(Number(grant.deadline) * 1000).toLocaleDateString(),
          deadlineTimestamp: Number(grant.deadline),
          ngo: grant.ngo,
          isActive: grant.isActive,
          isExpired: Number(grant.deadline) < (Date.now() / 1000),
          isOwnedByCurrentUser: address && grant.ngo.toLowerCase() === address.toLowerCase(),
          timeLeft: calculateTimeLeft(Number(grant.deadline))
        }));
        
        setGrants(formattedGrants);
        
        // Check if the current user is an NGO
        if (address) {
          const ngoStatus = await readNGOContract('isAuthorizedNGO', [address]);
          setIsNGO(ngoStatus);
        }
      } catch (error) {
        console.error('Error fetching grants:', error);
        toast({
          title: "Failed to load grants",
          description: error.message || "Could not retrieve grants data",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
      } finally {
        setLoading(false);
      }
    };

    // Calculate time left for a deadline
    const calculateTimeLeft = (deadline) => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeftSeconds = deadline - now;
      
      if (timeLeftSeconds <= 0) return 'Expired';
      
      const days = Math.floor(timeLeftSeconds / (60 * 60 * 24));
      const hours = Math.floor((timeLeftSeconds % (60 * 60 * 24)) / (60 * 60));
      
      if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''} left`;
      } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} left`;
      } else {
        const minutes = Math.floor((timeLeftSeconds % (60 * 60)) / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
      }
    };

    if (publicClient) {
      fetchGrants();
      
      // Set up event watch for new grants
      try {
        const unwatch = publicClient.watchContractEvent({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          eventName: 'GrantCreated',
          onLogs: () => {
            fetchGrants();
            toast({
              title: "New grant created!",
              description: "The grants list has been updated",
              status: "info",
              duration: 5000,
              isClosable: true,
              position: "top-right"
            });
          }
        });
        
        return () => {
          unwatch?.();
        };
      } catch (error) {
        console.error('Error setting up event watch:', error);
      }
    }
  }, [publicClient, address, toast]);

  const handleCreateGrant = () => {
    navigate('/grants/create');
  };

  const handleViewGrant = (grantId) => {
    navigate(`/grants/${grantId}`);
  };

  // Filter grants based on selected tab
  const activeGrants = grants.filter(grant => grant.isActive && !grant.isExpired);
  const expiredGrants = grants.filter(grant => grant.isExpired);
  const userGrants = grants.filter(grant => grant.isOwnedByCurrentUser);
  
  // Get the grants to display based on current tab
  const getDisplayedGrants = () => {
    switch (tabIndex) {
      case 0: return grants; // All grants
      case 1: return activeGrants; // Active grants
      case 2: return expiredGrants; // Expired grants
      case 3: return userGrants; // My grants (if NGO)
      default: return grants;
    }
  };

  // Grant Card Component
  const GrantCard = ({ grant }) => {
    return (
      <Card 
        direction="column"
        overflow="hidden"
        variant="outline"
        bg={cardBg}
        borderColor={cardBorder}
        borderRadius="xl"
        boxShadow="md"
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        cursor="pointer"
        onClick={() => handleViewGrant(grant.id)}
      >
        <Box h="4px" bg={grant.isExpired ? 'gray.400' : (grant.isOwnedByCurrentUser ? 'purple.400' : 'blue.400')} />
        
        <CardHeader pb={2}>
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Flex gap={2}>
              {grant.isActive && !grant.isExpired ? (
                <Badge bg={activeBadgeBg} color="green.800" px={2} py={1} borderRadius="full" display="flex" alignItems="center">
                  <Box w="8px" h="8px" borderRadius="full" bg="green.500" mr={1} />
                  Active
                </Badge>
              ) : (
                <Badge bg={expiredBadgeBg} color="gray.600" px={2} py={1} borderRadius="full" display="flex" alignItems="center">
                  <Box w="8px" h="8px" borderRadius="full" bg="gray.500" mr={1} />
                  Expired
                </Badge>
              )}
              
              {grant.isOwnedByCurrentUser && (
                <Badge bg={ownedBadgeBg} color="purple.800" px={2} py={1} borderRadius="full" display="flex" alignItems="center">
                  <Icon as={CheckIcon} mr={1} boxSize="10px" />
                  Your Grant
                </Badge>
              )}
            </Flex>
            
            <Text fontWeight="bold" color="gray.500" fontSize="sm">
              ID: {grant.id}
            </Text>
          </Flex>
          
          <Heading size="md" noOfLines={2}>
            {grant.title}
          </Heading>
        </CardHeader>
        
        <CardBody py={2}>
          <Text fontSize="sm" color="gray.600" noOfLines={3} mb={4}>
            {grant.description}
          </Text>
          
          <VStack align="stretch" spacing={2}>
            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.500">Amount:</Text>
              <Text fontSize="sm" fontWeight="bold">{grant.amount} SONIC</Text>
            </Flex>
            
            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.500">Deadline:</Text>
              <Text fontSize="sm">{grant.deadline}</Text>
            </Flex>
            
            {!grant.isExpired && (
              <Flex justify="space-between" color="blue.500">
                <Text fontSize="sm" display="flex" alignItems="center">
                  <TimeIcon mr={1} boxSize="12px" />
                  Remaining:
                </Text>
                <Text fontSize="sm" fontWeight="bold">{grant.timeLeft}</Text>
              </Flex>
            )}
          </VStack>
        </CardBody>
        
        <CardFooter pt={0}>
          <Flex justify="space-between" w="100%" align="center">
            <Tooltip label={`Grant by ${grant.ngo}`} placement="bottom">
              <HStack spacing={1}>
                <Avatar size="xs" bg="blue.500" />
                <Text fontSize="xs" color="gray.500">
                  {`${grant.ngo.substring(0, 6)}...${grant.ngo.substring(grant.ngo.length - 4)}`}
                </Text>
              </HStack>
            </Tooltip>
            
            <Button
              size="sm"
              rightIcon={<ChevronRightIcon />}
              variant="ghost"
              colorScheme="blue"
            >
              View Details
            </Button>
          </Flex>
        </CardFooter>
      </Card>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Skeleton height="36px" width="200px" mb={2} />
            <Skeleton height="20px" width="300px" />
          </Box>
          <Skeleton height="40px" width="150px" />
        </Flex>
        
        <Skeleton height="40px" mb={6} />
        
        <SimpleGrid columns={[1, null, 2, 3]} spacing={6}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Box key={i}>
              <Skeleton height="200px" borderRadius="lg" />
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    );
  }

  // Empty state display
  const EmptyState = ({ type }) => {
    let title, description;
    
    switch (type) {
      case 'active':
        title = 'No Active Grants';
        description = 'There are currently no active grant opportunities available.';
        break;
      case 'expired':
        title = 'No Expired Grants';
        description = 'There are no expired grants in the system.';
        break;
      case 'mine':
        title = 'No Grants Created';
        description = 'You haven\'t created any grants yet.';
        break;
      default:
        title = 'No Grants Available';
        description = 'There are currently no grants in the system.';
    }
    
    return (
      <Center py={12} flexDirection="column" textAlign="center" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
        <Icon as={InfoIcon} boxSize={12} color="gray.400" mb={4} />
        <Heading size="md" mb={2}>{title}</Heading>
        <Text color="gray.600" mb={6}>{description}</Text>
        
        {isNGO && type !== 'expired' && (
          <Button 
            colorScheme="blue" 
            leftIcon={<AddIcon />}
            onClick={handleCreateGrant}
          >
            Create Your First Grant
          </Button>
        )}
      </Center>
    );
  };

  return (
    <Container maxW="6xl" py={8}>
      {/* Header Section */}
      <Flex 
        direction={["column", null, "row"]} 
        justify="space-between" 
        align={["flex-start", null, "center"]}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Grant Opportunities
          </Heading>
          <Text color="gray.600">
            Browse funding opportunities for initiatives that make a difference
          </Text>
        </Box>
        
        {isNGO && (
          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={handleCreateGrant}
            size="lg"
            boxShadow="md"
            _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.3s"
          >
            Create New Grant
          </Button>
        )}
      </Flex>
      
      {/* Tabs */}
      <Tabs 
        colorScheme="blue" 
        mt={4} 
        mb={6}
        onChange={(index) => setTabIndex(index)}
        variant="soft-rounded"
      >
        <TabList>
          <Tab>All Grants</Tab>
          <Tab>
            Active
            {activeGrants.length > 0 && (
              <Badge ml={2} colorScheme="green" borderRadius="full" px={2}>
                {activeGrants.length}
              </Badge>
            )}
          </Tab>
          <Tab>
            Expired
            {expiredGrants.length > 0 && (
              <Badge ml={2} colorScheme="gray" borderRadius="full" px={2}>
                {expiredGrants.length}
              </Badge>
            )}
          </Tab>
          {isNGO && (
            <Tab>
              My Grants
              {userGrants.length > 0 && (
                <Badge ml={2} colorScheme="purple" borderRadius="full" px={2}>
                  {userGrants.length}
                </Badge>
              )}
            </Tab>
          )}
        </TabList>
        
        <TabPanels mt={4}>
          {/* All Grants Tab */}
          <TabPanel px={0}>
            {grants.length === 0 ? (
              <EmptyState type="all" />
            ) : (
              <SimpleGrid columns={[1, null, 2, 3]} spacing={6}>
                {grants.map(grant => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* Active Grants Tab */}
          <TabPanel px={0}>
            {activeGrants.length === 0 ? (
              <EmptyState type="active" />
            ) : (
              <SimpleGrid columns={[1, null, 2, 3]} spacing={6}>
                {activeGrants.map(grant => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* Expired Grants Tab */}
          <TabPanel px={0}>
            {expiredGrants.length === 0 ? (
              <EmptyState type="expired" />
            ) : (
              <SimpleGrid columns={[1, null, 2, 3]} spacing={6}>
                {expiredGrants.map(grant => (
                  <GrantCard key={grant.id} grant={grant} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* My Grants Tab - Only visible if user is NGO */}
          {isNGO && (
            <TabPanel px={0}>
              {userGrants.length === 0 ? (
                <EmptyState type="mine" />
              ) : (
                <SimpleGrid columns={[1, null, 2, 3]} spacing={6}>
                  {userGrants.map(grant => (
                    <GrantCard key={grant.id} grant={grant} />
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      
      {/* Create Grant CTA */}
      {isNGO && grants.length > 0 && (
        <Box mt={12} textAlign="center">
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={<AddIcon />}
            onClick={handleCreateGrant}
            boxShadow="md"
            _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.3s"
          >
            Create Another Grant
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default GrantListing;