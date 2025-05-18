import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Divider,
  HStack,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';
import { sonicBlaze } from '../config/chains';

const GrantReviewPanel = ({ grantId, applicationId }) => {
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isNGO, setIsNGO] = useState(false);
  
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: sonicBlaze.id });
  const { data: walletClient } = useWalletClient({ chainId: sonicBlaze.id });
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check if user is an authorized NGO
  useEffect(() => {
    const checkNGOStatus = async () => {
      if (!address) return;
      
      try {
        const isAuthorized = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.ngoAccessControl,
          abi: CONTRACT_ABIS.ngoAccessControl,
          functionName: 'isAuthorizedNGO',
          args: [address],
        });
        
        setIsNGO(isAuthorized);
      } catch (error) {
        console.error('Error checking NGO status:', error);
      }
    };

    checkNGOStatus();
  }, [address, publicClient]);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      if (!grantId || !applicationId) return;
      
      try {
        setLoading(true);
        // Get application details from contract
        const application = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.accessGrant,
          abi: CONTRACT_ABIS.accessGrant,
          functionName: 'getApplication',
          args: [grantId, applicationId],
        });
        
        setApplication(application);
      } catch (error) {
        console.error('Error fetching application:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application details',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [grantId, applicationId, publicClient, toast]);

  const handleApprove = async () => {
    if (!walletClient || !isNGO) return;
    
    try {
      setLoading(true);
      
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'approveApplication',
        args: [grantId, applicationId],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast({
        title: 'Application Approved',
        description: 'The grant application has been approved successfully',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve application',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!walletClient || !isNGO) return;
    
    try {
      setLoading(true);
      
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.accessGrant,
        abi: CONTRACT_ABIS.accessGrant,
        functionName: 'rejectApplication',
        args: [grantId, applicationId],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast({
        title: 'Application Rejected',
        description: 'The grant application has been rejected',
        status: 'info',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isNGO) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only authorized NGOs can review grant applications.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box p={4}>
        <Text>Loading application details...</Text>
      </Box>
    );
  }

  if (!application) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Application Not Found</AlertTitle>
        <AlertDescription>
          The requested application could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
      <CardHeader>
        <VStack align="stretch" spacing={2}>
          <Heading size="md">Review Grant Application</Heading>
          <HStack>
            <Badge colorScheme={application.status === 'pending' ? 'yellow' : 
                              application.status === 'approved' ? 'green' : 'red'}>
              {application.status}
            </Badge>
            <Text fontSize="sm" color="gray.500">
              Submitted by: {application.applicant}
            </Text>
          </HStack>
        </VStack>
      </CardHeader>

      <CardBody>
        <Tabs>
          <TabList>
            <Tab>Application Details</Tab>
            <Tab>Review Notes</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Project Title</Text>
                  <Text>{application.projectTitle}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Project Summary</Text>
                  <Text>{application.projectSummary}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Implementation Plan</Text>
                  <Text>{application.implementationPlan}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Budget</Text>
                  <Text>{application.budget}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Timeline</Text>
                  <Text>{application.timeline}</Text>
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel>
              <FormControl>
                <FormLabel>Review Notes</FormLabel>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter your review notes here..."
                  rows={6}
                />
                <FormHelperText>
                  Add any notes or feedback about the application
                </FormHelperText>
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>

      <Divider />

      <CardFooter>
        <HStack spacing={4} width="100%" justify="flex-end">
          <Button
            colorScheme="red"
            onClick={handleReject}
            isLoading={loading}
            isDisabled={application.status !== 'pending'}
          >
            Reject
          </Button>
          <Button
            colorScheme="green"
            onClick={handleApprove}
            isLoading={loading}
            isDisabled={application.status !== 'pending'}
          >
            Approve
          </Button>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default GrantReviewPanel; 