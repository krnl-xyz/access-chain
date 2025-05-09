import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Badge,
  Button,
  Divider,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Flex,
  useColorModeValue,
  Image,
  Stack,
  Avatar,
  AvatarGroup,
  Tooltip,
  Center,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGrantManagement } from '../hooks/useGrantManagement';
import CreateGrantForm from '../components/CreateGrantForm';
import { 
  AddIcon, 
  CheckIcon, 
  TimeIcon, 
  CalendarIcon, 
  ChevronRightIcon,
  WarningTwoIcon,
  InfoIcon,
  StarIcon
} from '@chakra-ui/icons';

const CreateGrantPage = () => {
  const { isConnected } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const {
    grants,
    isLoadingGrants,
    isAuthorizedNGO,
    isCorrectNetwork,
  } = useGrantManagement();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedGrant, setSelectedGrant] = useState(null);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const expiredHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const tabsBg = useColorModeValue('gray.50', 'gray.800');
  const activeBadgeBg = useColorModeValue('green.100', 'green.800');
  const expiredBadgeBg = useColorModeValue('gray.100', 'gray.700');

  // Set the tab index based on the route
  useEffect(() => {
    // If coming from NGO dashboard (route '/ngo/create-grant'), select create tab
    if (location.pathname === '/ngo/create-grant' || location.pathname === '/grants/create') {
      setTabIndex(1); // Index of the Create Grant tab
    }
  }, [location.pathname]);

  // Helper function to format currency
  const formatAmount = (amount) => {
    const amountNumber = Number(amount);
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 5,
    }).format(amountNumber);
  };

  const handleViewGrant = (grant) => {
    setSelectedGrant(grant);
    onOpen();
  };

  const handleApplyForGrant = (grantId) => {
    navigate(`/grants/${grantId}/apply`);
  };

  const handleViewApplications = (grantId) => {
    navigate(`/grants/${grantId}`);
  };

  // Group grants by active status and ownership
  const activeGrants = grants.filter(grant => grant.isActive && !grant.isExpired);
  const expiredGrants = grants.filter(grant => grant.isActive && grant.isExpired);
  const userGrants = grants.filter(grant => grant.isOwnedByCurrentUser);

  // Grant Card Component
  const GrantCard = ({ grant, isOwned = false }) => {
    const isExpired = grant.isExpired;
    const borderTopColor = isExpired ? 'gray.400' : (isOwned ? 'purple.400' : 'blue.400');
    
    return (
      <Card 
        borderRadius="lg" 
        overflow="hidden"
        boxShadow="md"
        borderColor={cardBorder}
        bg={cardBg}
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
        position="relative"
      >
        <Box h="4px" bg={borderTopColor} />
        
        <CardHeader pb={2}>
          <Flex justify="space-between" align="center" mb={2}>
            <Flex gap={2}>
              {!isExpired ? (
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
              
              {isOwned && (
                <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                  Your Grant
                </Badge>
              )}
            </Flex>
            
            <Text fontWeight="medium" fontSize="sm" color="gray.500">
              ID: {grant.id}
            </Text>
          </Flex>
          
          <Heading size="md" mb={1} noOfLines={2}>
            {grant.title}
          </Heading>
        </CardHeader>
        
        <CardBody py={2}>
          <Text noOfLines={3} fontSize="sm" color="gray.600" mb={4}>
            {grant.description}
          </Text>
          
          <HStack mt={2} justify="space-between">
            <Flex align="center">
              <Icon as={InfoIcon} mr={2} color="blue.500" />
              <Text fontWeight="bold">{formatAmount(grant.amount)} SONIC</Text>
            </Flex>
            
            <Flex align="center">
              <Icon as={CalendarIcon} mr={2} color="gray.500" />
              <Text fontSize="sm">
                {new Date(grant.deadlineDate).toLocaleDateString()}
              </Text>
            </Flex>
          </HStack>
        </CardBody>
        
        <Divider />
        
        <CardFooter pt={3}>
          <VStack spacing={2} width="100%">
            {grant.timeLeft && !isExpired && (
              <Flex w="full" justify="center" align="center" color="blue.500">
                <TimeIcon mr={2} />
                <Text fontSize="sm" fontWeight="medium">
                  {grant.timeLeft}
                </Text>
              </Flex>
            )}
            
            <HStack w="full" justify="space-between">
              <Button 
                variant="ghost" 
                size="sm"
                colorScheme="blue"
                onClick={() => handleViewGrant(grant)}
                leftIcon={<InfoIcon />}
              >
                Details
              </Button>
              
              {!isExpired ? (
                isOwned ? (
                  <Button 
                    colorScheme="purple" 
                    size="sm"
                    onClick={() => handleViewApplications(grant.id)}
                    rightIcon={<ChevronRightIcon />}
                  >
                    View Applications
                  </Button>
                ) : (
                  <Button 
                    colorScheme="blue" 
                    size="sm"
                    onClick={() => handleApplyForGrant(grant.id)}
                    rightIcon={<ChevronRightIcon />}
                    isDisabled={!isConnected || !isCorrectNetwork}
                  >
                    Apply Now
                  </Button>
                )
              ) : null}
            </HStack>
          </VStack>
        </CardFooter>
      </Card>
    );
  };

  // Empty state component
  const EmptyState = ({ title, description, action }) => (
    <Center py={12} flexDirection="column" textAlign="center" bg={tabsBg} borderRadius="xl" border="1px dashed" borderColor={cardBorder}>
      <Icon as={InfoIcon} boxSize={12} color="gray.400" mb={4} />
      <Heading size="md" mb={2}>{title}</Heading>
      <Text color="gray.600" maxW="md" mb={6}>{description}</Text>
      {action}
    </Center>
  );

  // Grant detail modal
  const GrantDetailModal = () => {
    if (!selectedGrant) return null;
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="lg" overflow="hidden">
          <Box h="8px" bg={selectedGrant.isExpired ? 'gray.400' : (selectedGrant.isOwnedByCurrentUser ? 'purple.400' : 'blue.400')} />
          
          <ModalHeader pt={4}>
            <Badge 
              mb={2}
              px={2} 
              py={1}
              borderRadius="full"
              colorScheme={selectedGrant.isExpired ? 'gray' : 'green'}
            >
              {selectedGrant.isExpired ? 'Expired' : 'Active'}
            </Badge>
            <Heading size="lg">{selectedGrant.title}</Heading>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <VStack spacing={6} align="start">
              <Box>
                <Text fontWeight="bold" mb={2} color="gray.700">Description</Text>
                <Text>{selectedGrant.description}</Text>
              </Box>
              
              <Divider />
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text fontSize="sm" color="gray.500">Fund Amount</Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {formatAmount(selectedGrant.amount)} SONIC
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.500">Deadline</Text>
                  <Text fontWeight="bold">
                    {new Date(selectedGrant.deadlineDate).toLocaleDateString()}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.500">Status</Text>
                  <Badge 
                    colorScheme={selectedGrant.isExpired ? 'gray' : 'green'}
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {selectedGrant.isExpired ? 'Expired' : 'Active'}
                  </Badge>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.500">Time Remaining</Text>
                  <Text color={selectedGrant.isExpired ? 'gray.500' : 'blue.500'} fontWeight="medium">
                    {selectedGrant.isExpired ? 'Expired' : selectedGrant.timeLeft}
                  </Text>
                </Box>
              </SimpleGrid>
              
              <Divider />
              
              <Box w="full">
                <Text fontWeight="bold" mb={2} color="gray.700">Grant Provider</Text>
                <Flex align="center" gap={2}>
                  <Avatar size="sm" bg="blue.500" />
                  <Text fontSize="sm" fontFamily="mono">
                    {selectedGrant.ngo}
                  </Text>
                </Flex>
              </Box>
              
              {!selectedGrant.isExpired && (
                <>
                  <Divider />
                  
                  <Flex w="full" justify="center">
                    {selectedGrant.isOwnedByCurrentUser ? (
                      <Button 
                        colorScheme="purple" 
                        w="full"
                        onClick={() => {
                          onClose();
                          handleViewApplications(selectedGrant.id);
                        }}
                        rightIcon={<ChevronRightIcon />}
                      >
                        View All Applications
                      </Button>
                    ) : (
                      <Button 
                        colorScheme="blue" 
                        w="full"
                        onClick={() => {
                          onClose();
                          handleApplyForGrant(selectedGrant.id);
                        }}
                        rightIcon={<ChevronRightIcon />}
                        isDisabled={!isConnected || !isCorrectNetwork}
                      >
                        Apply for This Grant
                      </Button>
                    )}
                  </Flex>
                </>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {!isConnected && (
          <Alert status="warning" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Wallet Not Connected</Text>
              <Text fontSize="sm">Please connect your wallet to access all grant features.</Text>
            </Box>
          </Alert>
        )}

        {isConnected && !isCorrectNetwork && (
          <Alert status="warning" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Network Mismatch</Text>
              <Text fontSize="sm">Please switch to Sonic Blaze Testnet to interact with grants.</Text>
            </Box>
          </Alert>
        )}

        <Box>
          <Flex 
            justify="space-between" 
            align={["flex-start", "center"]} 
            direction={["column", "row"]}
            mb={6}
            gap={4}
          >
            <Box>
              <Heading size="xl" mb={1}>Grant Hub</Heading>
              <Text color="gray.600">Manage and create funding opportunities for your organization</Text>
            </Box>
            
            {isAuthorizedNGO && (
              <Button 
                leftIcon={<AddIcon />} 
                colorScheme="blue" 
                size="lg"
                onClick={() => setTabIndex(1)}
                boxShadow="md"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
              >
                Create New Grant
              </Button>
            )}
          </Flex>
          
          <Box 
            borderRadius="lg" 
            overflow="hidden" 
            bg={tabsBg}
            boxShadow="md"
            borderColor={cardBorder}
            borderWidth="1px"
          >
            <Tabs 
              variant="soft-rounded" 
              colorScheme="blue"
              index={tabIndex}
              onChange={(index) => setTabIndex(index)}
              p={4}
            >
              <TabList mb={5} mx={1}>
                <Tab _selected={{ bg: 'blue.100', color: 'blue.800' }}>Available Grants</Tab>
                <Tab _selected={{ bg: 'blue.100', color: 'blue.800' }}>Create Grant</Tab>
                {isAuthorizedNGO && (
                  <Tab _selected={{ bg: 'blue.100', color: 'blue.800' }}>
                    Your Grants
                    {userGrants.length > 0 && (
                      <Badge ml={2} colorScheme="purple" borderRadius="full">
                        {userGrants.length}
                      </Badge>
                    )}
                  </Tab>
                )}
              </TabList>
              
              <TabPanels>
                {/* Available Grants Tab */}
                <TabPanel px={1}>
                  <Box mb={8}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Active Opportunities</Heading>
                      <Badge colorScheme="green" py={1} px={3} borderRadius="full">
                        {activeGrants.length} Available
                      </Badge>
                    </Flex>
                    
                    {isLoadingGrants ? (
                      <Center py={12}>
                        <VStack spacing={4}>
                          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                          <Text color="gray.600">Loading grant opportunities...</Text>
                        </VStack>
                      </Center>
                    ) : activeGrants.length === 0 ? (
                      <EmptyState 
                        title="No Active Grants" 
                        description="There are currently no active grant opportunities available."
                        action={isAuthorizedNGO && (
                          <Button 
                            colorScheme="blue" 
                            leftIcon={<AddIcon />}
                            onClick={() => setTabIndex(1)}
                          >
                            Create Your First Grant
                          </Button>
                        )}
                      />
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {activeGrants.map(grant => (
                          <GrantCard 
                            key={grant.id} 
                            grant={grant} 
                            isOwned={grant.isOwnedByCurrentUser} 
                          />
                        ))}
                      </SimpleGrid>
                    )}
                  </Box>
                  
                  {expiredGrants.length > 0 && (
                    <Box mt={10}>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md" color="gray.600">Past Opportunities</Heading>
                        <Badge colorScheme="gray" py={1} px={3} borderRadius="full">
                          {expiredGrants.length} Expired
                        </Badge>
                      </Flex>
                      
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {expiredGrants.map(grant => (
                          <GrantCard 
                            key={grant.id} 
                            grant={grant} 
                            isOwned={grant.isOwnedByCurrentUser} 
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </TabPanel>
                
                {/* Create Grant Tab */}
                <TabPanel>
                  <Box maxW="4xl" mx="auto">
                    <CreateGrantForm />
                  </Box>
                </TabPanel>
                
                {/* Your Grants Tab (for NGOs) */}
                {isAuthorizedNGO && (
                  <TabPanel px={1}>
                    <Box>
                      <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">Your Created Grants</Heading>
                        <Button 
                          leftIcon={<AddIcon />} 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => setTabIndex(1)}
                        >
                          Create New
                        </Button>
                      </Flex>
                      
                      {isLoadingGrants ? (
                        <Center py={12}>
                          <VStack spacing={4}>
                            <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
                            <Text color="gray.600">Loading your grants...</Text>
                          </VStack>
                        </Center>
                      ) : userGrants.length === 0 ? (
                        <EmptyState 
                          title="No Grants Created" 
                          description="You haven't created any grants yet. Create your first grant to start funding impactful projects."
                          action={
                            <Button 
                              colorScheme="blue" 
                              leftIcon={<AddIcon />}
                              onClick={() => setTabIndex(1)}
                            >
                              Create Your First Grant
                            </Button>
                          }
                        />
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {userGrants.map(grant => (
                            <GrantCard 
                              key={grant.id} 
                              grant={grant} 
                              isOwned={true} 
                            />
                          ))}
                        </SimpleGrid>
                      )}
                    </Box>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </VStack>
      
      {/* Grant Detail Modal */}
      <GrantDetailModal />
    </Container>
  );
};

export default CreateGrantPage;