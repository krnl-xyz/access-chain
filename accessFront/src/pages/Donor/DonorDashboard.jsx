import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  useToast,
  InputGroup,
  Input,
  InputRightElement,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowForwardIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useAccount, usePublicClient, useBalance, useWalletClient } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from '../../config/contracts';
import { accessGrantAbi } from '../../config/grantAbi';
import { useGrantManagement } from '../../hooks/useGrantManagement';
import { sonicBlaze } from '../../config/chains';

export default function DonorDashboard() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData } = useBalance({
    address,
    watch: true,
    chainId: sonicBlaze.id,
  });
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Use grant management hook
  const { grants, isLoadingGrants, refetchGrants } = useGrantManagement();
  
  const [loading, setLoading] = useState(true);
  const [donorStats, setDonorStats] = useState({
    totalDonations: 0,
    activeGrants: 0,
    totalGrants: 0,
    activeGrantsCount: 0,
  });
  const [donationHistory, setDonationHistory] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    const fetchDonorData = async () => {
      if (!isConnected || !address || !publicClient) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // In a real application, you would fetch donation events from the blockchain
        // or use a subgraph to track all donations from this user
        
        // For now, we'll use a mock implementation that shows active grants
        // In a real implementation, you'd use contract events to get this data
        
        // Get active grants from our grants list
        const activeGrants = grants.filter(grant => grant.isActive);
        
        // Mock donation history based on active grants
        // In a real app, this would come from events on the blockchain
        const mockDonations = activeGrants.slice(0, 3).map((grant, index) => ({
          id: index + 1,
          grantId: grant.id,
          title: grant.title,
          amount: (Math.random() * 5).toFixed(2),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          progress: Math.floor(Math.random() * 85) + 15,
          description: grant.description,
        }));
        
        setDonationHistory(mockDonations);
        
        // Set donor stats
        setDonorStats({
          totalDonations: mockDonations.reduce((total, donation) => total + parseFloat(donation.amount), 0).toFixed(2),
          activeGrants: mockDonations.length,
          totalGrants: grants.length,
          activeGrantsCount: activeGrants.length,
        });
      } catch (error) {
        console.error('Error fetching donor data:', error);
        toast({
          title: 'Error loading data',
          description: error.message || 'Failed to load donor data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (!isLoadingGrants) {
      fetchDonorData();
    }
  }, [address, isConnected, publicClient, grants, isLoadingGrants, toast]);

  const handleDonate = (grant) => {
    setSelectedGrant(grant);
    setDonationAmount('');
    onOpen();
  };
  
  const handleSubmitDonation = async () => {
    if (!donationAmount || isNaN(parseFloat(donationAmount)) || parseFloat(donationAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid donation amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!walletClient || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to make a donation',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert donation amount to wei
      const amountInWei = parseEther(donationAmount);
      
      // Instead of calling donateToGrant which doesn't exist,
      // we'll send tokens directly to the NGO address of the grant
      const hash = await walletClient.sendTransaction({
        to: selectedGrant.ngo,
        value: amountInWei,
        account: address,
        chain: sonicBlaze,
      });
      
      toast({
        title: 'Transaction submitted',
        description: 'Your donation is being processed',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        toast({
          title: 'Donation successful',
          description: `You have successfully donated ${donationAmount} SONIC to ${selectedGrant.title}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Add the donation to history
        const newDonation = {
          id: donationHistory.length + 1,
          grantId: selectedGrant.id,
          title: selectedGrant.title,
          amount: donationAmount,
          date: new Date().toISOString().split('T')[0],
      status: 'active',
          progress: 0,
          description: selectedGrant.description,
        };
        
        setDonationHistory([newDonation, ...donationHistory]);
        
        // Update stats
        setDonorStats({
          ...donorStats,
          totalDonations: (parseFloat(donorStats.totalDonations) + parseFloat(donationAmount)).toFixed(2),
          activeGrants: donorStats.activeGrants + 1,
        });
        
        onClose();
        refetchGrants();
      }
    } catch (error) {
      console.error('Error making donation:', error);
      toast({
        title: 'Donation failed',
        description: error.message || 'There was an error processing your donation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoadingGrants) {
    return (
      <Container maxWidth={'8xl'} py={8}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Loading donor dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  if (!isConnected) {
    return (
      <Container maxWidth={'8xl'} py={8}>
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Wallet Not Connected
          </AlertTitle>
          <Text mb={4}>Please connect your wallet to view your donor dashboard</Text>
          <Button colorScheme="blue" onClick={() => window.scrollTo(0, 0)}>
            Connect Wallet
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={'8xl'} py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>Donor Dashboard</Heading>
          <Text color="gray.600">Track your donations and impact</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Total Donations</StatLabel>
            <StatNumber>{donorStats.totalDonations} SONIC</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Your contribution
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Active Donations</StatLabel>
            <StatNumber>{donorStats.activeGrants}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Grants you've supported
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Wallet Balance</StatLabel>
            <StatNumber>{balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(4) : '0'} SONIC</StatNumber>
            <StatHelpText>
              Available for donations
            </StatHelpText>
          </Stat>

          <Stat
            px={4}
            py={5}
            bg={bgColor}
            shadow="base"
            rounded="lg"
            borderWidth={1}
            borderColor={borderColor}
          >
            <StatLabel>Active Grants</StatLabel>
            <StatNumber>{donorStats.activeGrantsCount}</StatNumber>
            <StatHelpText>
              <Button 
                rightIcon={<ArrowForwardIcon />} 
                colorScheme="blue" 
                variant="link" 
                size="sm"
                onClick={() => navigate('/grants')}
              >
                View All Grants
              </Button>
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box
          bg={bgColor}
          shadow="base"
          rounded="lg"
          borderWidth={1}
          borderColor={borderColor}
          overflow="hidden"
        >
          <Box p={6} bg={headerBg}>
            <Heading size="md">Donation History</Heading>
          </Box>
          
          <VStack spacing={0} align="stretch" divider={<Box borderBottomWidth="1px" borderColor={borderColor} />}>
            {donationHistory.length === 0 ? (
              <Box p={6} textAlign="center">
                <Text mb={4}>You haven't made any donations yet.</Text>
                <Button 
                  as={RouterLink} 
                  to="/grants" 
                  colorScheme="blue"
                  rightIcon={<ArrowForwardIcon />}
                >
                  Browse Grants
                </Button>
              </Box>
            ) : (
              donationHistory.map((donation) => (
              <Box
                key={donation.id}
                  p={6}
                  transition="background-color 0.2s"
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between" wrap="wrap">
                    <VStack align="start" spacing={1}>
                        <Heading size="sm">{donation.title}</Heading>
                        <Text color="gray.600" fontSize="sm">Donated: {donation.amount} SONIC</Text>
                        <Text color="gray.600" fontSize="sm">Date: {donation.date}</Text>
                    </VStack>
                    <Badge
                      colorScheme={donation.status === 'active' ? 'green' : 'yellow'}
                        variant="solid"
                        px={2}
                        py={1}
                        borderRadius="full"
                    >
                        {donation.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                  </HStack>
                    
                  <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">Grant Progress</Text>
                      <Text fontSize="sm" color="gray.600">{donation.progress}%</Text>
                    </HStack>
                    <Progress
                      value={donation.progress}
                      colorScheme="blue"
                      size="sm"
                      rounded="full"
                    />
                  </Box>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      width="full"
                      rightIcon={<ExternalLinkIcon />}
                      as={RouterLink}
                      to={`/grants/${donation.grantId}`}
                    >
                      View Grant Details
                  </Button>
                </VStack>
              </Box>
              ))
            )}
          </VStack>
        </Box>

        <Box
          bg={bgColor}
          shadow="base"
          rounded="lg"
          borderWidth={1}
          borderColor={borderColor}
          overflow="hidden"
        >
          <Box p={6} bg={headerBg}>
            <Heading size="md">Available Grants</Heading>
          </Box>
          
          <VStack spacing={0} align="stretch" divider={<Box borderBottomWidth="1px" borderColor={borderColor} />}>
            {grants.filter(grant => grant.isActive).slice(0, 3).map((grant) => (
              <Box
                key={grant.id}
                p={6}
                transition="background-color 0.2s"
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" wrap="wrap">
                    <VStack align="start" spacing={1} flex={1}>
                      <Heading size="sm">{grant.title}</Heading>
                      <Text color="gray.600" fontSize="sm" noOfLines={2}>
                        {grant.description}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {grant.amount} SONIC
                    </Badge>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">
                    Deadline: {grant.deadlineDate}
            </Text>
                  
                  <HStack spacing={4}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      flex={1}
                      as={RouterLink}
                      to={`/grants/${grant.id}`}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      colorScheme="blue"
                      flex={1}
                      onClick={() => handleDonate(grant)}
                    >
                      Donate
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            ))}
            
            <Box p={6} textAlign="center">
              <Button 
                as={RouterLink} 
                to="/grants" 
                colorScheme="blue"
                rightIcon={<ArrowForwardIcon />}
              >
                View All Grants
              </Button>
              </Box>
          </VStack>
        </Box>
      </VStack>
      
      {/* Donation Modal */}
      {selectedGrant && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Donate to {selectedGrant.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={headerBg} borderRadius="md">
                  <Text fontWeight="bold">Grant Details</Text>
                  <Text fontSize="sm">{selectedGrant.description}</Text>
                </Box>
                
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">Direct NGO Donation</Text>
                    <Text fontSize="sm">
                      Your donation will be sent directly to the NGO's wallet address associated with this grant.
                      The funds will support the NGO's work on this project.
                    </Text>
                  </Box>
                </Alert>
                
                <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" borderWidth="1px">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Recipient NGO:</Text>
                  <Text fontSize="xs" fontFamily="mono">
                    {selectedGrant.ngo}
                  </Text>
                </Box>
                
                <FormControl>
                  <FormLabel>Amount (SONIC)</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                    <InputRightElement width="4.5rem">
                      <Text fontSize="sm" color="gray.500">SONIC</Text>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                {balanceData && (
                  <Text fontSize="sm" color="gray.600">
                    Your balance: {parseFloat(formatEther(balanceData.value)).toFixed(4)} SONIC
                  </Text>
                )}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button mr={3} variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleSubmitDonation}
                isLoading={isSubmitting}
                loadingText="Processing"
              >
                Donate
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
} 