import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  Flex,
  useDisclosure,
  Tooltip,
  IconButton,
  InputGroup,
  InputRightElement,
  Switch,
  Divider,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  CheckIcon, 
  CloseIcon, 
  WarningTwoIcon, 
  ExternalLinkIcon, 
  ViewIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { FaUsers, FaUser, FaFileContract, FaLock, FaHandHoldingUsd, FaUserShield } from 'react-icons/fa';
import { useAccount, usePublicClient, useSwitchNetwork } from 'wagmi';
import { formatEther } from 'viem';
import { sonicBlaze } from '../../config/chains';
import { CONTRACT_ADDRESSES } from '../../config/contracts';
import { useNGOAccessControl } from '../../hooks/useNGOAccessControl';
import { useGrantManagement } from '../../hooks/useGrantManagement';
import NGOManagementPanel from '../../components/admin/NGOManagementPanel';

const AdminDashboard = () => {
  const { address, isConnected } = useAccount();
  const { chains, switchNetwork } = useSwitchNetwork();
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const toast = useToast();
  const { isOpen: isAddNGOOpen, onOpen: onAddNGOOpen, onClose: onAddNGOClose } = useDisclosure();

  // State
  const [networkName, setNetworkName] = useState('');
  const [isAddingNGO, setIsAddingNGO] = useState(false);
  const [newNGOAddress, setNewNGOAddress] = useState('');
  const [selectedGrant, setSelectedGrant] = useState(null);
  
  // Use our hooks
  const { 
    isOwner,
    ngoList, 
    isCorrectNetwork,
    addNGO,
    removeNGO,
    isLoadingAuthorization,
  } = useNGOAccessControl();

  const { 
    grants,
    isLoadingGrants,
    chainId,
  } = useGrantManagement();

  // Filter active grants
  const activeGrants = grants.filter(grant => grant.isActive);
  
  // Calculate total funds
  const totalFunds = grants.reduce((total, grant) => 
    total + parseFloat(formatEther(BigInt(grant.amount))), 0
  ).toFixed(2);

  // Pre-compute color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');

  // Get network name when chain changes
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
  }, [publicClient, chainId]);

  // Show wallet connection status
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to access admin features',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isConnected, toast]);
  
  // Check if user is admin
  useEffect(() => {
    if (!isLoadingAuthorization && !isOwner && isConnected) {
      toast({
        title: 'Access Denied',
        description: 'You must be the contract owner to access the admin dashboard',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [isLoadingAuthorization, isOwner, isConnected, toast, navigate]);

  // Validate Ethereum address
  const validateAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Handle adding a new NGO
  const handleAddNGO = async () => {
    if (!validateAddress(newNGOAddress)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsAddingNGO(true);
    
    try {
      await addNGO(newNGOAddress);
      toast({
        title: 'NGO Added Successfully',
        description: `Address ${newNGOAddress} has been authorized as an NGO`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setNewNGOAddress('');
      onAddNGOClose();
    } catch (error) {
      console.error('Error adding NGO:', error);
      toast({
        title: 'Error Adding NGO',
        description: error.message || 'An error occurred while adding the NGO',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAddingNGO(false);
    }
  };
  
  // Handle removing an NGO
  const handleRemoveNGO = async (ngoAddress) => {
    try {
      await removeNGO(ngoAddress);
      toast({
        title: 'NGO Removed',
        description: `Address ${ngoAddress} is no longer authorized`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing NGO:', error);
      toast({
        title: 'Error Removing NGO',
        description: error.message || 'An error occurred while removing the NGO',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Loading state
  if (isLoadingAuthorization) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Checking admin access...</Text>
        </VStack>
      </Box>
    );
  }
  
  // Access denied if not owner
  if (!isOwner && !isLoadingAuthorization) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <Heading mt={4} mb={1} size="md">Access Denied</Heading>
          <Text mb={4}>Only the contract owner can access the admin dashboard</Text>
          <Button colorScheme="blue" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="7xl" py={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl" mb={2}>Admin Dashboard</Heading>
            <Text color={textColor}>
              Manage NGOs, grants, and platform settings
            </Text>
          </Box>
          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={onAddNGOOpen}
          >
            Add New NGO
          </Button>
        </Flex>

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
                onClick={() => switchNetwork({ chainId: sonicBlaze.id })}
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
            boxShadow="md"
          >
            <StatLabel fontSize="sm" fontWeight="medium">
              <HStack>
                <Icon as={FaUsers} />
                <Text>Active NGOs</Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="3xl">{ngoList?.length || 0}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Verified organizations
            </StatHelpText>
          </Stat>

          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontSize="sm" fontWeight="medium">
              <HStack>
                <Icon as={FaFileContract} />
                <Text>Total Grants</Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="3xl">{grants.length}</StatNumber>
            <StatHelpText>
              <HStack>
                <Badge colorScheme="green">{activeGrants.length} active</Badge>
                <Badge colorScheme="red">{grants.length - activeGrants.length} expired</Badge>
              </HStack>
            </StatHelpText>
          </Stat>

          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontSize="sm" fontWeight="medium">
              <HStack>
                <Icon as={FaHandHoldingUsd} />
                <Text>Total Funding</Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="3xl">{totalFunds} SONIC</StatNumber>
            <StatHelpText>
              Across all grants
            </StatHelpText>
          </Stat>

          <Stat
            px={6}
            py={4}
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
          >
            <StatLabel fontSize="sm" fontWeight="medium">
              <HStack>
                <Icon as={FaLock} />
                <Text>Platform Status</Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="3xl">
              <Badge colorScheme="green" fontSize="md" p={1}>
                Active
              </Badge>
            </StatNumber>
            <StatHelpText>
              System is operational
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card
          mb={8}
          boxShadow="md"
          borderRadius="lg"
          overflow="hidden"
        >
          <Box bg={headerBg} p={4}>
            <Heading size="md">Quick Actions</Heading>
          </Box>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => navigate('/admin/ngo-management')}
                leftIcon={<Icon as={FaUsers} />}
                height="80px"
              >
                Manage NGOs
              </Button>
              <Button
                colorScheme="green"
                size="lg"
                onClick={() => navigate('/grants')}
                leftIcon={<Icon as={FaHandHoldingUsd} />}
                height="80px"
              >
                View Grants
              </Button>
              <Button
                colorScheme="purple"
                size="lg"
                onClick={() => onAddNGOOpen()}
                leftIcon={<Icon as={FaUserShield} />}
                height="80px"
              >
                Add New NGO
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>NGO Management</Tab>
            <Tab>Grants Overview</Tab>
            <Tab>System Settings</Tab>
          </TabList>

          <TabPanels>
            {/* NGO Management Tab */}
            <TabPanel>
              <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
                <Box bg={headerBg} p={4}>
                  <Heading size="md">Authorized NGOs</Heading>
                </Box>
                <CardBody>
                  {isLoadingAuthorization ? (
                    <Box textAlign="center" py={10}>
                      <Spinner size="xl" />
                      <Text mt={4}>Loading NGOs...</Text>
                    </Box>
                  ) : ngoList?.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      No NGOs have been authorized yet. Use the "Add New NGO" button to add one.
                    </Alert>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead bg={badgeBg}>
                          <Tr>
                            <Th>Address</Th>
                            <Th isNumeric>Grants Created</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {ngoList?.map((ngo, index) => {
                            // Count grants created by this NGO
                            const ngoGrants = grants.filter(grant => 
                              grant.ngo.toLowerCase() === ngo.toLowerCase()
                            );
                            
                            return (
                              <Tr key={index}>
                                <Td fontFamily="mono" fontSize="sm">
                                  {ngo.substring(0, 8)}...{ngo.substring(ngo.length - 8)}
                                </Td>
                                <Td isNumeric>{ngoGrants.length}</Td>
                                <Td>
                                  <Badge colorScheme="green">Active</Badge>
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <Tooltip label="View NGO Grants">
                                      <IconButton
                                        size="sm"
                                        colorScheme="blue"
                                        icon={<ViewIcon />}
                                        aria-label="View NGO Grants"
                                        onClick={() => navigate('/grants')}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Remove NGO Authorization">
                                      <IconButton
                                        size="sm"
                                        colorScheme="red"
                                        icon={<CloseIcon />}
                                        aria-label="Remove NGO"
                                        onClick={() => handleRemoveNGO(ngo)}
                                      />
                                    </Tooltip>
                                    <Tooltip label="View on Blockchain Explorer">
                                      <IconButton
                                        size="sm"
                                        icon={<ExternalLinkIcon />}
                                        aria-label="View on Explorer"
                                        as="a"
                                        href={`https://blazescan.io/address/${ngo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Grants Overview Tab */}
            <TabPanel>
              <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
                <Box bg={headerBg} p={4}>
                  <Heading size="md">Grant Overview</Heading>
                </Box>
                <CardBody>
                  {isLoadingGrants ? (
                    <Box textAlign="center" py={10}>
                      <Spinner size="xl" />
                      <Text mt={4}>Loading grants...</Text>
                    </Box>
                  ) : grants.length === 0 ? (
                    <Alert status="info">
                      <AlertIcon />
                      No grants have been created yet.
                    </Alert>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead bg={badgeBg}>
                          <Tr>
                            <Th>Grant Name</Th>
                            <Th>NGO</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Deadline</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {grants.slice(0, 10).map((grant) => (
                            <Tr key={grant.id}>
                              <Td fontWeight="medium">{grant.title}</Td>
                              <Td fontFamily="mono" fontSize="sm">
                                {grant.ngo.substring(0, 6)}...{grant.ngo.substring(grant.ngo.length - 4)}
                              </Td>
                              <Td isNumeric>{formatEther(BigInt(grant.amount))} SONIC</Td>
                              <Td>{new Date(grant.deadline * 1000).toLocaleDateString()}</Td>
                              <Td>
                                <Badge colorScheme={grant.isActive ? "green" : "red"}>
                                  {grant.isActive ? "Active" : "Expired"}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View Grant Details">
                                    <IconButton
                                      size="sm"
                                      colorScheme="blue"
                                      icon={<ViewIcon />}
                                      aria-label="View Grant"
                                      onClick={() => navigate(`/grants/${grant.id}`)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="View on Blockchain Explorer">
                                    <IconButton
                                      size="sm"
                                      icon={<ExternalLinkIcon />}
                                      aria-label="View on Explorer"
                                      as="a"
                                      href={`https://blazescan.io/address/${CONTRACT_ADDRESSES.accessGrant}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      {grants.length > 10 && (
                        <Button 
                          mt={4} 
                          colorScheme="blue" 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/grants')}
                          width="full"
                        >
                          View All Grants ({grants.length})
                        </Button>
                      )}
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* System Settings Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
                  <Box bg={headerBg} p={4}>
                    <Heading size="md">Contract Information</Heading>
                  </Box>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>NGO Access Control:</Text>
                        <HStack>
                          <Text fontSize="sm" fontFamily="mono" color={textColor}>
                            {CONTRACT_ADDRESSES.NGOAccessControl}
                          </Text>
                          <IconButton
                            size="xs"
                            icon={<ExternalLinkIcon />}
                            aria-label="View on Explorer"
                            as="a"
                            href={`https://blazescan.io/address/${CONTRACT_ADDRESSES.NGOAccessControl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        </HStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Grant Registry:</Text>
                        <HStack>
                          <Text fontSize="sm" fontFamily="mono" color={textColor}>
                            {CONTRACT_ADDRESSES.accessGrant}
                          </Text>
                          <IconButton
                            size="xs"
                            icon={<ExternalLinkIcon />}
                            aria-label="View on Explorer"
                            as="a"
                            href={`https://blazescan.io/address/${CONTRACT_ADDRESSES.accessGrant}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        </HStack>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Access Request Registry:</Text>
                        <HStack>
                          <Text fontSize="sm" fontFamily="mono" color={textColor}>
                            {CONTRACT_ADDRESSES.requestRegistry || "Not configured"}
                          </Text>
                          {CONTRACT_ADDRESSES.requestRegistry && (
                            <IconButton
                              size="xs"
                              icon={<ExternalLinkIcon />}
                              aria-label="View on Explorer"
                              as="a"
                              href={`https://blazescan.io/address/${CONTRACT_ADDRESSES.requestRegistry}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          )}
                        </HStack>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Text fontWeight="bold" mb={1}>Contract Owner:</Text>
                        <HStack>
                          <Text fontSize="sm" fontFamily="mono" color={textColor}>
                            {address}
                          </Text>
                          <Badge colorScheme="green">You</Badge>
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
                  <Box bg={headerBg} p={4}>
                    <Heading size="md">Network & System Settings</Heading>
                  </Box>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontWeight="bold" mb={1}>Current Network:</Text>
                        <HStack justify="space-between">
                          <Text color={textColor}>{networkName}</Text>
                          <Badge colorScheme={isCorrectNetwork ? 'green' : 'red'}>
                            {isCorrectNetwork ? 'Correct Network' : 'Wrong Network'}
                          </Badge>
                        </HStack>
                      </Box>
                      
                      {!isCorrectNetwork && (
                        <Button
                          colorScheme="blue"
                          leftIcon={<InfoIcon />}
                          onClick={() => switchNetwork({ chainId: sonicBlaze.id })}
                          size="sm"
                        >
                          Switch to Sonic Blaze
                        </Button>
                      )}
                      
                      <Divider />
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="pause-system" mb="0">
                          Pause Grant Applications
                        </FormLabel>
                        <Switch id="pause-system" isDisabled isChecked={false} />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="allow-ngo-registration" mb="0">
                          Allow Public NGO Registration
                        </FormLabel>
                        <Switch id="allow-ngo-registration" isDisabled isChecked={false} />
                      </FormControl>
                      
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Advanced system settings are only available through direct contract interaction.
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      
      {/* Add NGO Modal */}
      <Modal isOpen={isAddNGOOpen} onClose={onAddNGOClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New NGO</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Enter the wallet address to authorize as an NGO.</Text>
              <FormControl>
                <FormLabel>NGO Wallet Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={newNGOAddress}
                  onChange={(e) => setNewNGOAddress(e.target.value)}
                  isInvalid={newNGOAddress && !validateAddress(newNGOAddress)}
                />
                <FormHelperText>
                  This address will be granted NGO privileges on the platform
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddNGOClose} isDisabled={isAddingNGO}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddNGO}
              isLoading={isAddingNGO}
              loadingText="Adding NGO"
              leftIcon={<AddIcon />}
            >
              Add NGO
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;